class OpenAICompatibleEngine {
    config;
    constructor(config) {
        this.config = config;
    }
    async chat(request) {
        const endpoint = this.resolveEndpoint();
        const body = {
            model: this.config.model,
            messages: request.messages,
            temperature: request.temperature ?? 0.6,
            max_tokens: request.maxTokens ?? 350
        };
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.config.apiKey}`
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`${this.config.provider} request failed: ${response.status} ${errorText}`);
        }
        const data = (await response.json());
        return data.choices?.[0]?.message?.content?.trim() ?? "";
    }
    resolveEndpoint() {
        if (this.config.baseUrl) {
            return this.config.baseUrl;
        }
        switch (this.config.provider) {
            case "groq":
                return "https://api.groq.com/openai/v1/chat/completions";
            case "openrouter":
                return "https://openrouter.ai/api/v1/chat/completions";
            case "huggingface":
                return "https://router.huggingface.co/v1/chat/completions";
            default:
                throw new Error(`Unsupported provider: ${this.config.provider}`);
        }
    }
}
export class FallbackLLMEngine {
    engines;
    constructor(engines) {
        this.engines = engines;
    }
    async chat(request) {
        let lastError;
        for (const engine of this.engines) {
            try {
                const response = await engine.chat(request);
                if (response.length > 0) {
                    return response;
                }
            }
            catch (error) {
                lastError = error;
            }
        }
        throw new Error(`All LLM providers failed. Last error: ${String(lastError)}`);
    }
}
export function createEngine(config) {
    return new OpenAICompatibleEngine(config);
}
