# Contributing

## Development workflow

1. Create a feature branch from `main`.
2. Keep changes scoped to one concern per pull request.
3. Run local quality checks before opening a PR:
  - `npm run check`
4. Include docs updates when behavior, configuration, or interfaces change.

## Commit style

- Use concise, imperative commit messages.
- Explain the why in the body when the change is non-obvious.

## Pull request checklist

- [ ] Build and typecheck pass.
- [ ] Evaluation script passes.
- [ ] `.env.example` reflects any new environment variables.
- [ ] README/docs are updated for user-facing or operational changes.