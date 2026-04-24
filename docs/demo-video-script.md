# 90-Second Demo Script

## Scene 1 (0:00-0:15) - Problem + Product

"This is `zen_bot`, a Persian poet-mystic assistant available on Telegram and WhatsApp. It answers reflective questions while grounding quote-style responses in curated Rumi, Hafiz, and Khayyam excerpts."

## Scene 2 (0:15-0:35) - Live Chat Example

Show Telegram prompt: "I'm anxious about the future, give me a short reflection."

Narration: "The bot replies in a calm persona and appends citation context when poem material is used."

## Scene 3 (0:35-0:55) - Multi-Channel Reuse

Show WhatsApp prompt with similar intent.

Narration: "Both channels use one normalized router, so business logic is shared and only parsing is channel-specific."

## Scene 4 (0:55-1:15) - Engineering Depth

Show project tree and `apps/bot-api/src/index.ts`.

Narration: "The system combines retrieval grounding, an LLM fallback adapter for free-tier providers, safety checks, and idempotency guardrails."

## Scene 5 (1:15-1:30) - Evaluation + Outcome

Show `npm run eval` output and `docs/eval-baseline.md`.

Narration: "Quality is measured with a repeatable evaluation rubric across factual, interpretation, attribution, and adversarial categories."
