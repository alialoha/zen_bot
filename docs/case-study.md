# Zen Bot Case Study

## Objective

Build a culturally differentiated AI assistant that can run across Telegram and WhatsApp, while minimizing hallucinated poetic attributions.

## What Was Built

- Unified webhook backend with channel-specific parsers.
- Retrieval layer over curated poem excerpts and metadata.
- Pluggable LLM adapter with free-tier-first provider strategy and fallback.
- Safety and duplication protections in request handling.
- Evaluation package with rubric-based scoring and baseline report.

## Key Trade-offs

- Started with lexical retrieval for speed; planned migration path to embedding-backed retrieval.
- Prioritized adapter portability over provider-specific optimizations.
- Began with a small smoke-test eval set to establish CI-friendly checks quickly.

## Failure Patterns Found Early

- Some quote requests can return generic reflective language with weak poet specificity.
- Adversarial prompts require stronger refusal patterns and citation validation logic.

## Next Improvements

- Expand corpus and add parallel Persian/English source metadata.
- Add model-graded and human-reviewed eval subsets.
- Add persistent event storage and dashboarded trend tracking.