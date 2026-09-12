# Backend, API, Database, Security & Performance

Use this reference when UX work crosses into backend contracts or when backend work is requested directly.

## Authority

Canonical business authority remains server/PostgreSQL unless an explicit verified contract says otherwise.

Do not move validation, authorization, publication, entitlement, scoring, AI approval, or offline authority into browser state for convenience.

## API

- Preserve established route/contracts whenever possible.
- Validate inputs at the boundary.
- Return stable domain-oriented responses, not accidental database shapes.
- Keep authorization explicit and server-owned.
- Distinguish validation/auth/not-found/conflict/server failures.
- Avoid exposing secrets, storage keys, implementation stack details, or unnecessary internal identifiers.

## Presentation boundary

An API response may contain fields needed by implementation without making those fields user-facing.

Frontend/UI work must map backend state to presentation-ready labels/messages/data. Do not treat raw API objects as screen specifications.

If the UI needs a new human-facing state, first determine whether it is purely presentation mapping or a real missing domain contract. Do not add backend fields only to avoid doing proper presentation modeling.

## Database

- Respect migrations as integrity contracts.
- Avoid ad-hoc runtime schema assumptions.
- Use transactions for multi-step consistency where required.
- Check indexes/query shape before performance rewrites.
- Prevent N+1/repeated query patterns where evidence shows them.

## Security

Never weaken:
- session/device verification;
- entitlements/access checks;
- publication checks;
- assessment finalization/scoring authority;
- AI human-review publication boundary;
- signed offline authorization/integrity checks.

Do not expose internal security mechanics to ordinary Student/Admin UI simply to explain why a request was denied. Present the meaningful user state and recovery action while preserving detailed evidence in logs/operations where appropriate.

No secrets in browser bundles, logs, docs, screenshots, or test fixtures committed to the repository.

## Performance

Measure or identify a concrete bottleneck before adding complexity.

Check:
- query count/shape;
- request duplication;
- payload size;
- media/image transformations;
- cache eligibility;
- long-running job boundaries;
- frontend bundle/render cost.

Correctness and authorization outrank caching shortcuts.
