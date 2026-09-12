# Project Guardrails

## Source of truth

Use this precedence when deciding what is true:

1. live `main`
2. actual repository code
3. PostgreSQL migrations and integrity constraints
4. executable GitHub Actions/tests
5. merged PRs and exact commits
6. verified Railway runtime/log evidence
7. Issue #16
8. project prose/docs

Treat lower-priority disagreement as documentation drift until reconciled.

## Stable product contracts

Preserve unless a concrete defect is proven:

- API + PostgreSQL are canonical durable business authority.
- Browser state is presentation/resilience state, not canonical authority.
- Returning Student authentication remains password + registered device proof where the current contract requires it.
- `media ready != published`.
- Student content visibility requires publication plus entitlement.
- Protected Reader/media must not expose raw storage authority.
- AI output does not auto-publish content or Student questions.
- Assessment scoring/finalization remains server-owned.
- `/v1` must not become Service Worker Cache API authority.
- Offline browser storage must not contain password, session token, private signing key, or device private key.
- Hosting configuration must not become business logic.

## Current project position

Normal roadmap execution is intentionally paused while Student/Admin UX foundations are remediated.

Preserve all verified Stage1–15 work and completed Stage16 authority work.

Do not redo `STUDENT-016H`.

After UX/UI refoundation, resume normal roadmap from `STUDENT-016I`, then 016R, 016S, conditional 016O, Stage16 closure, then Stage17.

## Change discipline

Before changing a subsystem, identify inputs, outputs, callers, dependencies, side effects, edge cases, tests, and persistence/security boundaries.

Prefer:
- KEEP when behavior and structure are already strong.
- IMPROVE for small localized fixes.
- REFACTOR when structure is weak but behavior/contracts are correct.
- REBUILD only when evidence shows the current foundation blocks correctness or maintainability.
- REMOVE only when unused, duplicated, harmful, or superseded.

Do not perform a cross-layer rewrite merely because the UI is being redesigned.

For contract changes, create an explicit architecture decision and verify all affected clients/tests.
