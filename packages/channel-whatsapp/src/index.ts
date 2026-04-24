export type NormalizedMessage = {
  channel: "telegram" | "whatsapp";
  messageId: string;
  userId: string;
  text: string;
  from?: string;
  to?: string;
  raw: unknown;
};

type WhatsAppPayload = {
  messages?: Array<{
    id?: string;
    from?: string;
    text?: { body?: string };
  }>;
  MessageSid?: string;
  From?: string;
  To?: string;
  Body?: string;
};

export function parseWhatsAppPayload(payload: unknown): NormalizedMessage | null {
  const data = payload as WhatsAppPayload;

  // Twilio WhatsApp webhook payload (form-encoded).
  if (data.MessageSid && data.From && data.Body) {
    return {
      channel: "whatsapp",
      messageId: data.MessageSid,
      userId: data.From,
      text: data.Body,
      from: data.From,
      to: data.To,
      raw: payload
    };
  }

  // Meta-style payload support.
  const message = data.messages?.[0];
  const body = message?.text?.body;
  if (!message?.id || !message.from || !body) {
    return null;
  }

  return {
    channel: "whatsapp",
    messageId: message.id,
    userId: message.from,
    text: body,
    from: message.from,
    raw: payload
  };
}

