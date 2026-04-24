export type NormalizedMessage = {
    channel: "telegram" | "whatsapp";
    messageId: string;
    userId: string;
    text: string;
    raw: unknown;
};
export declare function parseTelegramUpdate(payload: unknown): NormalizedMessage | null;
