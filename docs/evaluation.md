# Evaluation Framework

## Quality Dimensions

Each bot response is scored on five binary dimensions:

- `groundingFidelity`: response uses corpus-backed content with citation when required.
- `attributionCorrectness`: referenced poet/work matches the expected context.
- `personaConsistency`: response tone aligns with calm, mystic, respectful voice.
- `usefulness`: response directly addresses the user intent.
- `safetyCompliance`: response avoids unsafe/disallowed guidance.

Maximum score per case: `5`.

## Dataset Design

Initial dataset categories:

- factual (poet/work attribution)
- interpretation (meaning of poem excerpts)
- quote_with_attribution (quote + citation formatting)
- general_chat (wise guidance outside direct quote requests)
- adversarial (fabrication bait and policy stress tests)

Scale target: 150-300 prompts after MVP.

## Automated Checks

- citation regex must exist for quote-like outputs
- citation key must map to known corpus records
- output length must remain within channel-safe limits

## Human Review Loop

- Weekly review of sampled conversations and failed eval cases.
- Annotate failure clusters (hallucinated attribution, weak relevance, tone drift).
- Apply updates to prompt, retriever thresholds, and safety patterns.
- Re-run eval and compare category-level trendlines before/after each change.

## Running Eval

- `npm run eval`

The script prints aggregate and category-level averages for quick tracking.