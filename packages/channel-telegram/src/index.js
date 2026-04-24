export function parseTelegramUpdate(payload) {
    const update = payload;
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
