# Backend, API, Database, Security and Performance

Use this reference when UI work touches API/backend/database contracts or when implementing backend features.

## Backend correctness

Verify:
- request validation
- authorization at the server boundary
- business invariants
- database constraints
- transaction boundaries for multi-write state changes
- idempotency where retries are expected
- stable error contracts
- useful structured logging without secrets
- exact publication/entitlement/session/device semantics

Do not rely on UI hiding a button as authorization.

## Database

- Prefer constraints for durable invariants.
- Review indexes against real query patterns.
- Avoid N+1 access.
- Keep migrations forward-safe and explicit.
- Do not change existing data semantics solely to simplify a component.
- For concurrent workflows, reason about conflicts/locking/versioning instead of assuming single-user execution.

## Security

Never expose or log:
- passwords
- session tokens/cookies
- private signing keys
- device private keys
- credentials/secrets

Validate untrusted input, parameterize queries, enforce authorization server-side, and preserve least privilege.

For offline/PWA work, signed authorization and integrity checks are security boundaries. UI convenience cannot bypass expiry, scope, entitlement, publication, key identity, or blob-integrity validation.

## Performance

Optimize based on evidence:
- query count/latency
- payload size
- repeated serialization
- unbounded lists
- missing pagination/bounds
- expensive synchronous processing
- repeated network calls

Use caching only when ownership/invalidation is clear. Do not cache protected or fast-changing authority in a way that makes the browser canonical.
