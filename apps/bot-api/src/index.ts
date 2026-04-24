import express from "express";
import { parseTelegramUpdate } from "../../../packages/channel-telegram/src/index.js";
import { parseWhatsAppPayload } from "../../../packages/channel-whatsapp/src/index.js";
import { createEngine, FallbackLLMEngine, type ChatMessage, type LLMProvider } from "../../../packages/llm-adapter/src/index.js";
import { formatCitation, retrievePoems, type RetrievalResult } from "../../../packages/retrieval/src/index.js";

type NormalizedMessage = {
  channel: "telegram" | "whatsapp";
  messageId: string;
  userId: string;
  text: string;
};

const app = express();
app.use(express.json({ limit: "1mb" }));

const seenMessages = new Set<string>();

function isUnsafePrompt(text: string): boolean {
  const lowered = text.toLowerCase();
  return lowered.includes("build a bomb") || lowered.includes("harm someone");
}

function buildPersonaMessages(input: string, context: string): ChatMessage[] {
  return [
    {
      role: "system",
      content:
        "You are Zen Bot, a calm Persian poet-mystic voice inspired by Rumi, Hafiz, and Khayyam. Prefer grounded statements and never fabricate poem attributions."
    },
    {
      role: "system",
      content: `Context snippets:\n${context}`
    },
    { role: "user", content: input }
  ];
}

function buildEngineFromEnv() {
  const primaryProvider = (process.env.LLM_PROVIDER ?? "groq") as LLMProvider;
  const primaryModel = process.env.LLM_MODEL ?? "llama-3.1-8b-instant";
  const primaryKey = process.env.LLM_API_KEY ?? "";
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

async function handleMessage(message: NormalizedMessage): Promise<string> {
  if (seenMessages.has(message.messageId)) {
    return "Duplicate message ignored.";
  }
  seenMessages.add(message.messageId);

  if (isUnsafePrompt(message.text)) {
    return "I cannot help with harmful requests. I can offer reflective wisdom instead.";
  }

  const retrieved = retrievePoems(message.text, 2);
  const context = retrieved.map((r: RetrievalResult) => `${r.text}\n${formatCitation(r)}`).join("\n\n");

  const engine = buildEngineFromEnv();
  const raw = await engine.chat({
    messages: buildPersonaMessages(message.text, context),
    temperature: 0.7,
    maxTokens: 260
  });

  const citation = retrieved.length > 0 ? `\n\nSource: ${formatCitation(retrieved[0])}` : "";
  return `${raw.trim()}${citation}`.slice(0, 900);
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "zen-bot-api" });
});

app.post("/webhooks/telegram", async (req, res) => {
  const message = parseTelegramUpdate(req.body);
  if (!message) {
    return res.status(400).json({ error: "Invalid Telegram payload" });
  }
  const reply = await handleMessage(message);
  return res.json({ reply, channel: "telegram" });
});

app.post("/webhooks/whatsapp", async (req, res) => {
  const message = parseWhatsAppPayload(req.body);
  if (!message) {
    return res.status(400).json({ error: "Invalid WhatsApp payload" });
  }
  const reply = await handleMessage(message);
  return res.json({ reply, channel: "whatsapp" });
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  // Console log intentionally concise for local hosting visibility.
  console.log(`Zen Bot API listening on port ${port}`);
});

