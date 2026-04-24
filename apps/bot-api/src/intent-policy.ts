export type IntentCategory =
  | "social_opening"
  | "personal_guidance"
  | "quote_request"
  | "meaning_interpretation"
  | "factual_literary"
  | "meta_bot"
  | "unsafe_or_disallowed"
  | "fallback_unclear";

export type CitationMode = "required" | "optional" | "none";

export type ResponsePolicy = {
  category: IntentCategory;
  maxTokens: number;
  maxChars: number;
  temperature: number;
  citationMode: CitationMode;
  personaStyle: "warm" | "mystic" | "factual" | "safety";
  promptDirective: string;
};

const greetingSet = new Set(["hi", "hello", "hey", "hi there", "salam", "سلام"]);

function includesAny(text: string, keywords: string[]): boolean {
  return keywords.some((word) => text.includes(word));
}

export function classifyIntent(input: string): IntentCategory {
  const normalized = input.trim().toLowerCase();
  if (greetingSet.has(normalized)) {
    return "social_opening";
  }

  if (includesAny(normalized, ["build a bomb", "harm someone", "kill", "attack"])) {
    return "unsafe_or_disallowed";
  }

  if (includesAny(normalized, ["max token", "token", "constraint", "limit", "how do you work"])) {
    return "meta_bot";
  }

  if (includesAny(normalized, ["quote", "poem", "verse", "line from"])) {
    return "quote_request";
  }

  if (includesAny(normalized, ["meaning", "interpret", "what does this poem mean"])) {
    return "meaning_interpretation";
  }

  if (includesAny(normalized, ["rumi", "hafiz", "khayyam", "rubai", "ghazal", "who wrote"])) {
    return "factual_literary";
  }

  if (includesAny(normalized, ["job", "anxious", "sad", "future", "relationship", "guidance"])) {
    return "personal_guidance";
  }

  return "fallback_unclear";
}

export const policyByIntent: Record<IntentCategory, ResponsePolicy> = {
  social_opening: {
    category: "social_opening",
    maxTokens: 120,
    maxChars: 320,
    temperature: 0.8,
    citationMode: "none",
    personaStyle: "warm",
    promptDirective:
      "Reply in 2-3 short poetic sentences. End with one gentle invitation question asking what support the user seeks."
  },
  personal_guidance: {
    category: "personal_guidance",
    maxTokens: 220,
    maxChars: 700,
    temperature: 0.7,
    citationMode: "optional",
    personaStyle: "mystic",
    promptDirective: "Offer practical and compassionate guidance in <= 5 sentences."
  },
  quote_request: {
    category: "quote_request",
    maxTokens: 220,
    maxChars: 760,
    temperature: 0.6,
    citationMode: "required",
    personaStyle: "mystic",
    promptDirective: "Provide a grounded quote-oriented response and keep attribution clear."
  },
  meaning_interpretation: {
    category: "meaning_interpretation",
    maxTokens: 240,
    maxChars: 780,
    temperature: 0.6,
    citationMode: "optional",
    personaStyle: "mystic",
    promptDirective: "Explain interpretation clearly and avoid fabricated references."
  },
  factual_literary: {
    category: "factual_literary",
    maxTokens: 200,
    maxChars: 650,
    temperature: 0.4,
    citationMode: "optional",
    personaStyle: "factual",
    promptDirective: "Answer factually and concisely. If unsure, say uncertain."
  },
  meta_bot: {
    category: "meta_bot",
    maxTokens: 140,
    maxChars: 500,
    temperature: 0.2,
    citationMode: "none",
    personaStyle: "factual",
    promptDirective: "Be explicit, technical, and do not invent policy rationales."
  },
  unsafe_or_disallowed: {
    category: "unsafe_or_disallowed",
    maxTokens: 80,
    maxChars: 260,
    temperature: 0.2,
    citationMode: "none",
    personaStyle: "safety",
    promptDirective: "Refuse harmful content briefly and redirect to safe support."
  },
  fallback_unclear: {
    category: "fallback_unclear",
    maxTokens: 180,
    maxChars: 560,
    temperature: 0.6,
    citationMode: "none",
    personaStyle: "warm",
    promptDirective: "Answer briefly and ask one clarifying question if needed."
  }
};

