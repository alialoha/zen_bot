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
- `docs/design-rationale.md`: interview-grade architecture rationale
- `docs/operations-runbook.md`: deployment and webhook operations checklist
- `docs/whatsapp-sandbox-onboarding.md`: reusable "how to join" message for users

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
6. Run full quality gate (same checks as CI):
  - `npm run check`

## Channel Setup

- **Telegram**
  - Set `TELEGRAM_BOT_TOKEN` in `.env`.
  - Configure webhook to `POST /webhooks/telegram` on your public HTTPS URL.
- **WhatsApp (Twilio Sandbox)**
  - Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_WHATSAPP_FROM`.
  - In Twilio Sandbox, set "When a message comes in" to `POST /webhooks/whatsapp` on your public HTTPS URL.
  - Use `GET /debug/twilio` to confirm sender format and latest send status/error.

## Deployment Targets

- **Local development:** `npm run dev` with `.env` in repo root.
- **Stable domain via Cloudflare Tunnel:** map `bot.<domain>` to `http://localhost:3000`.
- **Production hosting:** deploy on Cloud Run and point Telegram/Twilio webhooks to the Cloud Run or custom domain URL.

## Webhook Endpoints

- `POST /webhooks/telegram`
- `POST /webhooks/whatsapp`
- `GET /health`
- `GET /debug/twilio`

## Suggested CV Bullets

- Built a multi-channel AI assistant (Telegram + WhatsApp) with a unified webhook router and fallback LLM provider abstraction.
- Implemented retrieval-grounded poetic responses with citation checks to reduce hallucinations and improve answer trust.
- Added reliability controls (idempotency, retry policy, structured logs) and an evaluation suite to track quality over time.