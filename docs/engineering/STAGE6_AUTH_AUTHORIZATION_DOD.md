# Stage 6 — Auth & Authorization Definition of Done

Stage 6 closes only after the implementation and PostgreSQL integration gates pass.

## Credential security

- [x] Application database stores only a one-way password hash, never plaintext/reversible credentials.
- [x] Password hashing uses server-side scrypt with random salt and fixed reviewed parameters.
- [x] Account identifiers are normalized centrally, including Arabic digit forms.
- [x] Generic login errors do not reveal whether an identifier exists.
- [x] Login brute-force protection is persisted in PostgreSQL and works across API processes.

## Session security

- [x] Session tokens are cryptographically random opaque values.
- [x] PostgreSQL stores only SHA-256 hashes of session tokens.
- [x] Browser session delivery uses HttpOnly cookies.
- [x] Production cookies are Secure and SameSite=Lax.
- [x] Sessions have explicit expiry and revocation state.
- [x] Logout revokes the server session.
- [x] Password reset revokes existing sessions.

## Authorization

- [x] Student/Admin role comes from the canonical profile on the server.
- [x] Admin-only routes reject Student sessions.
- [x] Student-only routes reject Admin sessions.
- [x] Disabled/archived profiles cannot authenticate through an active session.
- [x] Browser never supplies a trusted role.
- [x] State-changing `/v1` requests enforce configured Origin policy; production rejects missing Origin.

## Recovery / bootstrap

- [x] Original passwords are never revealed.
- [x] Recovery uses a short-lived one-time opaque reset token stored only as a hash.
- [x] Only an authenticated Admin may issue a Student recovery token.
- [x] Reusing a recovery token is rejected.
- [x] First Admin creation is an explicit CLI operation, not a public HTTP endpoint.
- [x] Bootstrap CLI refuses to create another bootstrap Admin after one Admin exists.
- [x] No default Admin username/password exists in source.

## Required CLI/CI verification

- [ ] Migration `0005_auth.sql` applies to clean PostgreSQL 16.
- [ ] API lint PASS.
- [ ] API strict TypeScript PASS.
- [ ] Unit crypto/auth tests PASS.
- [ ] First-admin bootstrap PASS and second bootstrap refusal PASS.
- [ ] PostgreSQL integration test: valid login/session PASS.
- [ ] PostgreSQL integration test: session token not stored in plaintext PASS.
- [ ] PostgreSQL integration test: role isolation PASS.
- [ ] PostgreSQL integration test: brute-force lockout PASS.
- [ ] PostgreSQL integration test: Origin enforcement PASS.
- [ ] PostgreSQL integration test: recovery/password reset PASS.
- [ ] PostgreSQL integration test: old sessions revoked after reset PASS.
- [ ] Stages 1–5 remain green on the same branch head.

## Gate result

**PENDING CI. Stage 7 Entitlement & Activation Codes must not begin until all unchecked items pass.**
