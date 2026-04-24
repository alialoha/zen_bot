export type NormalizedMessage = {
  channel: "telegram" | "whatsapp";
  messageId: string;
  userId: string;
  text: string;
  raw: unknown;
};

type TelegramUpdate = {
  update_id?: number;
  message?: {
    message_id?: number;
    text?: string;
    from?: { id?: number | string };
  };
};

export function parseTelegramUpdate(payload: unknown): NormalizedMessage | null {
  const update = payload as TelegramUpdate;
  const message = update.message;
  if (!message?.text || !message?.message_id || !message.from?.id) {
    return null;
  }

  return {
    channel: "telegram",
    messageId: String(message.message_id),
    userId: String(message.from.id),
    text: message.text,
    raw: payload
  };
}

