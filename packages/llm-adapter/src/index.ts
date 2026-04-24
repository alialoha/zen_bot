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

type OpenAIStyleBody = {
  model: string;
  messages: ChatMessage[];
  temperature: number;
  max_tokens: number;
};

class OpenAICompatibleEngine implements LLMEngine {
  constructor(private readonly config: ProviderConfig) {}

  async chat(request: LLMRequest): Promise<string> {
    const endpoint = this.resolveEndpoint();
    const body: OpenAIStyleBody = {
      model: this.config.model,
      messages: request.messages,
      temperature: request.temperature ?? 0.6,
      max_tokens: request.maxTokens ?? 350
    };

    console.log(`[llm] provider=${this.config.provider} model=${this.config.model} sending request`);

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
      console.error(
        `[llm] provider=${this.config.provider} status=${response.status} error=${errorText.slice(0, 300)}`
      );
      throw new Error(`${this.config.provider} request failed: ${response.status} ${errorText}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content?.trim() ?? "";
    console.log(`[llm] provider=${this.config.provider} success chars=${content.length}`);
    return content;
  }

  private resolveEndpoint(): string {
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

export class FallbackLLMEngine implements LLMEngine {
  constructor(private readonly engines: LLMEngine[]) {}

  async chat(request: LLMRequest): Promise<string> {
    let lastError: unknown;
    for (const engine of this.engines) {
      try {
        const response = await engine.chat(request);
        if (response.length > 0) {
          return response;
        }
      } catch (error) {
        lastError = error;
      }
    }
    throw new Error(`All LLM providers failed. Last error: ${String(lastError)}`);
  }
}

export function createEngine(config: ProviderConfig): LLMEngine {
  return new OpenAICompatibleEngine(config);
}

