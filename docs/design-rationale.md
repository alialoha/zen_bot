# Zen Bot Design Rationale (Interview Version)

## Why this architecture

Zen Bot uses a policy-driven pipeline to avoid brittle one-off prompt hacks and to support safe, measurable iteration:

1. classify intent
2. apply response policy
3. generate response with retrieval context
4. enforce output controls
5. emit structured telemetry

This mirrors common production patterns in large engineering orgs.

## Core decisions

- **Intent taxonomy over ad-hoc rules:** response behavior is driven by stable categories (`social_opening`, `quote_request`, `meta_bot`, etc.).
- **Central policy table:** token/char limits, temperature, citation mode, and style are configured per intent.
- **Grounding with retrieval:** poem excerpts are retrieved first, then injected into generation context.
- **Post-generation controls:** max character caps and citation logic are applied consistently.
- **Reliability defaults:** duplicate protection, guarded webhook handling, and safe fallback response if LLM fails.

## Observability and governance

- Structured logs include:
  - `policyVersion`
  - message classification
  - LLM request start/success/failure
  - response finalization metadata
- Policy versioning enables rollbacks and A/B style comparisons.
- Evaluation reports include both user-facing categories and intent-category slices.

## Trade-offs and next steps

- Current intent classifier is lexical for simplicity; next step is model-assisted classification with confidence thresholds.
- Retrieval is token-overlap based; next step is embedding search with relevance thresholding.
- Webhook tunnel is currently ephemeral; next step is stable deployment endpoint (cloud VM/container).

## How to defend this in interviews

- Emphasize the move from ad-hoc behavior to a policy-governed control plane.
- Show how observability and offline eval reduce regression risk.
- Explain that product behavior is changed by configuration and measured outcomes, not scattered code edits.
