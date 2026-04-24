export function parseWhatsAppPayload(payload) {
    const data = payload;
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
