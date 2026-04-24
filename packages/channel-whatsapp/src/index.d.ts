export type NormalizedMessage = {
    channel: "telegram" | "whatsapp";
    messageId: string;
    userId: string;
    text: string;
    raw: unknown;
};
export declare function parseWhatsAppPayload(payload: unknown): NormalizedMessage | null;
