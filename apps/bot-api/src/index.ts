import dotenv from "dotenv";
import express from "express";
import { resolve } from "node:path";
import { parseTelegramUpdate } from "../../../packages/channel-telegram/src/index.js";
import { parseWhatsAppPayload } from "../../../packages/channel-whatsapp/src/index.js";
import { createEngine, FallbackLLMEngine, type ChatMessage, type LLMProvider } from "../../../packages/llm-adapter/src/index.js";
import { formatCitation, retrievePoems, type RetrievalResult } from "../../../packages/retrieval/src/index.js";
import { classifyIntent, policyByIntent, type IntentCategory, type ResponsePolicy } from "./intent-policy.js";

function loadEnv(): void {
  const candidatePaths = [
    resolve(process.cwd(), ".env"),
    resolve(process.cwd(), "../../.env"),
    resolve(process.cwd(), "../../../.env")
  ];

  for (const path of candidatePaths) {
    dotenv.config({ path, override: false });
  }
}

loadEnv();

type NormalizedMessage = {
  channel: "telegram" | "whatsapp";
  messageId: string;
  userId: string;
  text: string;
  chatId?: string;
};

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
const POLICY_VERSION = "v1.0.0";
let lastTwilioError: string | null = null;
let lastTwilioStatus: number | null = null;

const seenMessages = new Set<string>();

function logEvent(event: string, payload: Record<string, unknown>): void {
  console.log(JSON.stringify({ event, ts: new Date().toISOString(), policyVersion: POLICY_VERSION, ...payload }));
}

function mask(value: string | undefined, keepStart = 4, keepEnd = 2): string {
  if (!value) return "(missing)";
  if (value.length <= keepStart + keepEnd) return "*".repeat(value.length);
  return `${value.slice(0, keepStart)}${"*".repeat(value.length - keepStart - keepEnd)}${value.slice(-keepEnd)}`;
}

function logTwilioStartupDiagnostics(): void {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  logEvent("twilio.config.check", {
    sidPrefix: sid?.slice(0, 2) ?? "(missing)",
    sidMasked: mask(sid, 4, 4),
    tokenPresent: Boolean(token),
    from
  });

  if (sid && !sid.startsWith("AC")) {
    console.warn("[twilio] Account SID should usually start with 'AC'.");
  }
  if (from && !from.startsWith("whatsapp:+")) {
    console.warn("[twilio] TWILIO_WHATSAPP_FROM should be formatted like whatsapp:+14155238886.");
  }
}

function buildPersonaMessages(input: string, context: string, policy: ResponsePolicy): ChatMessage[] {
  return [
    {
      role: "system",
      content:
        "You are Zen Bot, a calm Persian poet-mystic voice inspired by Rumi, Hafiz, and Khayyam. Prefer grounded statements and never fabricate poem attributions."
    },
    {
      role: "system",
      content: `Policy category: ${policy.category}. Style: ${policy.personaStyle}. ${policy.promptDirective}`
    },
    {
      role: "system",
      content: `Context snippets:\n${context || "No retrieval context used."}`
    },
    { role: "user", content: input }
  ];
}

function buildEngineFromEnv() {
  const primaryProvider = (process.env.LLM_PROVIDER ?? "groq") as LLMProvider;
  const primaryModel = process.env.LLM_MODEL ?? "llama-3.1-8b-instant";
  const primaryKey = process.env.LLM_API_KEY ?? process.env.GROQ_API_KEY ?? "";
  const fallbackProvider = process.env.LLM_FALLBACK_PROVIDER as LLMProvider | undefined;
  const fallbackModel = process.env.LLM_FALLBACK_MODEL;
  const fallbackKey = process.env.LLM_FALLBACK_API_KEY;

  const engines = [];
  if (primaryKey) {
    engines.push(
      createEngine({
        provider: primaryProvider,
        model: primaryModel,
        apiKey: primaryKey
      })
    );
  }

  if (fallbackProvider && fallbackModel && fallbackKey) {
    engines.push(
      createEngine({
        provider: fallbackProvider,
        model: fallbackModel,
        apiKey: fallbackKey
      })
    );
  }

  if (engines.length === 0) {
    throw new Error("No LLM provider configured. Set LLM_API_KEY in environment.");
  }

  return new FallbackLLMEngine(engines);
}

function buildMetaBotResponse(): string {
  return "Current reply limits are maxTokens=260 for generation and an app-level hard cap of 900 characters on final output.";
}

async function handleMessage(message: NormalizedMessage): Promise<string> {
  if (seenMessages.has(message.messageId)) {
    return "Duplicate message ignored.";
  }
  seenMessages.add(message.messageId);

  const intent: IntentCategory = classifyIntent(message.text);
  const policy = policyByIntent[intent];
  logEvent("message.classified", {
    channel: message.channel,
    messageId: message.messageId,
    intent,
    policy: policy.category
  });

  if (intent === "unsafe_or_disallowed") {
    return "I cannot help with harmful requests. I can offer reflective wisdom instead.";
  }

  if (intent === "meta_bot") {
    return buildMetaBotResponse();
  }

  const retrieved = retrievePoems(message.text, 2);
  const context = retrieved.map((r: RetrievalResult) => `${r.text}\n${formatCitation(r)}`).join("\n\n");

  let raw = "";
  try {
    const engine = buildEngineFromEnv();
    logEvent("llm.request.start", {
      intent,
      provider: process.env.LLM_PROVIDER ?? "groq",
      maxTokens: policy.maxTokens,
      temperature: policy.temperature
    });
    raw = await engine.chat({
      messages: buildPersonaMessages(message.text, context, policy),
      temperature: policy.temperature,
      maxTokens: policy.maxTokens
    });
    logEvent("llm.request.success", { intent, chars: raw.length });
  } catch {
    logEvent("llm.request.failure", { intent });
    raw =
      "In the quiet of this moment, let the heart soften. Even in uncertainty, each breath is a small lantern on the path.";
  }

  const shouldCite =
    (policy.citationMode === "required" || (policy.citationMode === "optional" && retrieved[0])) && retrieved.length > 0;
  const citation = shouldCite ? `\n\nSource: ${formatCitation(retrieved[0])}` : "";
  const finalText = `${raw.trim()}${citation}`.slice(0, policy.maxChars);
  logEvent("message.finalized", { intent, chars: finalText.length, cited: shouldCite });
  return finalText;
}

async function sendTelegramMessage(chatId: string, text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is missing");
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text
    })
  });

  if (!response.ok) {
    throw new Error(`Telegram sendMessage failed with status ${response.status}`);
  }
}

async function sendWhatsAppMessage(to: string, text: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!sid || !token || !from) {
    throw new Error("Twilio WhatsApp env vars missing");
  }

  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const body = new URLSearchParams({
    From: from,
    To: to,
    Body: text
  });

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!response.ok) {
    const errorText = await response.text();
    lastTwilioStatus = response.status;
    lastTwilioError = errorText.slice(0, 500);
    throw new Error(`Twilio send failed ${response.status}: ${errorText}`);
  }

  lastTwilioStatus = response.status;
  lastTwilioError = null;
  logEvent("whatsapp.send.success", { to, status: response.status });
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "zen-bot-api" });
});

app.get("/debug/twilio", (_req, res) => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  return res.json({
    ok: true,
    policyVersion: POLICY_VERSION,
    twilio: {
      sidPrefix: sid?.slice(0, 2) ?? "(missing)",
      sidMasked: mask(sid, 4, 4),
      tokenPresent: Boolean(token),
      from,
      fromFormatValid: Boolean(from?.startsWith("whatsapp:+")),
      lastSendStatus: lastTwilioStatus,
      lastSendError: lastTwilioError
    }
  });
});

app.post("/webhooks/telegram", async (req, res) => {
  try {
    const message = parseTelegramUpdate(req.body);
    if (!message) {
      return res.status(400).json({ error: "Invalid Telegram payload" });
    }
    const reply = await handleMessage(message);
    if (message.chatId) {
      try {
        await sendTelegramMessage(message.chatId, reply);
      } catch (error) {
        console.error("Telegram send error:", error);
      }
    }
    return res.json({ ok: true, channel: "telegram" });
  } catch (error) {
    return res.status(500).json({ error: "Telegram handler failed", detail: String(error) });
  }
});

app.post("/webhooks/whatsapp", async (req, res) => {
  try {
    const message = parseWhatsAppPayload(req.body);
    if (!message) {
      return res.status(400).json({ error: "Invalid WhatsApp payload" });
    }
    const reply = await handleMessage(message);
    try {
      await sendWhatsAppMessage(message.userId, reply);
    } catch (error) {
      logEvent("whatsapp.send.failure", { to: message.userId, error: String(error) });
      console.error("WhatsApp send error:", error);
    }
    return res.json({ ok: true, channel: "whatsapp" });
  } catch (error) {
    return res.status(500).json({ error: "WhatsApp handler failed", detail: String(error) });
  }
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  // Console log intentionally concise for local hosting visibility.
  console.log(`Zen Bot API listening on port ${port}`);
  logTwilioStartupDiagnostics();
});

