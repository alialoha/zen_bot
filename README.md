# zen_bot

`zen_bot` is a portfolio-grade Telegram + WhatsApp assistant with the persona of a Persian poet and mystic, grounded in curated Rumi/Hafiz/Khayyam excerpts.

## Highlights

- Multi-channel webhook architecture with a unified message router.
- Retrieval-grounded responses with explicit poem citations.
- Swappable LLM adapter with free-tier-first strategy (Groq/OpenRouter/Hugging Face).
- Reliability controls: retries, idempotency, and structured logging.
- Evaluation package with dataset, rubric, and scoring script.

## Monorepo Layout

- `apps/bot-api`: webhook server and orchestration layer
- `packages/channel-telegram`: Telegram payload parsing
- `packages/channel-whatsapp`: WhatsApp payload parsing
- `packages/retrieval`: corpus, retriever, and ingestion pipeline
- `packages/llm-adapter`: provider abstraction and fallback chain
- `packages/evaluation`: evaluation dataset and scoring logic
- `docs/architecture.md`: architecture rationale and flow
- `docs/evaluation.md`: quality framework and review process
- `docs/eval-baseline.md`: current baseline scores and gaps
- `docs/demo-video-script.md`: portfolio demo narration
- `docs/case-study.md`: hiring-manager-ready project write-up

## Quick Start

1. Copy `.env.example` to `.env` and set one or more LLM API keys.
2. Install dependencies:
   - `npm install`
3. Build all packages:
   - `npm run build`
4. Start API:
   - `npm run dev`
5. Run evaluation:
   - `npm run eval`

## Webhook Endpoints

- `POST /webhooks/telegram`
- `POST /webhooks/whatsapp`
- `GET /health`

## Suggested CV Bullets

- Built a multi-channel AI assistant (Telegram + WhatsApp) with a unified webhook router and fallback LLM provider abstraction.
- Implemented retrieval-grounded poetic responses with citation checks to reduce hallucinations and improve answer trust.
- Added reliability controls (idempotency, retry policy, structured logs) and an evaluation suite to track quality over time.

