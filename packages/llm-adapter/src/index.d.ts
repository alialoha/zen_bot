export type ChatMessage = {
    role: "system" | "user" | "assistant";
    content: string;
};
export type LLMRequest = {
    messages: ChatMessage[];
    temperature?: number;
    maxTokens?: number;
};
export type LLMProvider = "groq" | "openrouter" | "huggingface";
export type ProviderConfig = {
    provider: LLMProvider;
    apiKey: string;
    model: string;
    baseUrl?: string;
};
export interface LLMEngine {
    chat(request: LLMRequest): Promise<string>;
}
export declare class FallbackLLMEngine implements LLMEngine {
    private readonly engines;
    constructor(engines: LLMEngine[]);
    chat(request: LLMRequest): Promise<string>;
}
export declare function createEngine(config: ProviderConfig): LLMEngine;
