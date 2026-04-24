# Operations Runbook

This runbook captures the standard operational workflow for local, tunnel-based, and Cloud Run deployments.

## Local Development

1. Install dependencies: `npm install`
2. Start API: `npm run dev`
3. Verify health: `GET /health`
4. Validate Twilio env: `GET /debug/twilio`

## Stable Domain via Cloudflare Tunnel

1. Ensure tunnel config exists at `C:\Users\Mousa\.cloudflared\config.yml`
2. Start tunnel with explicit config:
   - `cloudflared tunnel --config "C:\Users\Mousa\.cloudflared\config.yml" run zen-bot-tunnel`
3. Verify:
   - `https://bot.<domain>/health`

## Cloud Run Deployment (CLI)

1. Set context:
   - `gcloud config set project <project-id>`
   - `gcloud config set run/region <region>`
2. Deploy:
   - `gcloud run deploy zen-bot-api --source . --allow-unauthenticated`
3. Set environment variables:
   - `gcloud run services update zen-bot-api --set-env-vars "..."`
4. Verify:
   - `gcloud run services describe zen-bot-api --format="value(status.url)"`
   - `GET <service-url>/health`

## Webhooks

- Telegram: `<base-url>/webhooks/telegram`
- WhatsApp (Twilio): `<base-url>/webhooks/whatsapp`

After changing base URL:
1. Re-run Telegram `setWebhook`
2. Update Twilio Sandbox incoming webhook URL
3. Send one test message per channel and confirm logs

## Pre-Push Quality Gate

- `npm run check`
- Confirm `git status` has only intended changes
- Push only after successful Telegram + WhatsApp smoke tests
