export type NormalizedMessage = {
  channel: "telegram" | "whatsapp";
  messageId: string;
  userId: string;
  text: string;
  raw: unknown;
};

type WhatsAppPayload = {
  messages?: Array<{
    id?: string;
    from?: string;
    text?: { body?: string };
  }>;
};

export function parseWhatsAppPayload(payload: unknown): NormalizedMessage | null {
  const data = payload as WhatsAppPayload;
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
    raw: payload
  };
}

