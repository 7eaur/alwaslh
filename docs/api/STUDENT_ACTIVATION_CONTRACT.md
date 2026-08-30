# Student Activation API Contract — Stage 8

> This document is the UI/backend contract for Student first activation and returning login. UI code must not invent endpoints outside this contract.

## Product rule

The original **6-digit full-access code becomes the student's account identifier after successful first activation**.

It is **not a password or secret**. The credential secret is the student's password, stored only as a salted `scrypt` hash. Returning login therefore uses:

```text
account identifier (the original 6-digit code) + password
```

Arabic/Persian digits are normalized server-side.

## First activation

### `POST /v1/student/activate`

Request:

```json
{
  "code": "123456",
  "password": "student-password",
  "idempotencyKey": "client-generated-stable-request-key"
}
```

Rules:

- `code`: full-access code only; exactly 6 digits after Arabic/Persian digit normalization.
- `password`: 8–128 characters.
- `idempotencyKey`: 12–120 characters; generated once for one activation submit and reused only when retrying that exact request after timeout/network uncertainty.
- production browser mutations must satisfy the global allowed-Origin policy.

Successful new activation: **HTTP 201**.

```json
{
  "profile": {
    "id": "uuid",
    "role": "student",
    "displayName": null
  },
  "entitlement": {
    "id": "uuid",
    "scope": "all_content",
    "classId": null,
    "status": "active",
    "startsAt": "timestamp",
    "expiresAt": "timestamp"
  },
  "accountIdentifier": "123456",
  "replayed": false
}
```

The response also sets the normal HttpOnly session cookie.

Successful retry of the **same committed activation** with the same code + idempotency key + correct password: **HTTP 200**, with `replayed: true`, the same profile/entitlement, and a fresh authenticated session.

A retry with the correct idempotency key but wrong password does **not** receive a session; normal Auth login protection applies.

## Atomicity

The following are one PostgreSQL transaction:

```text
lock/validate full code
→ create student profile
→ create hashed credential
→ create all-content entitlement
→ mark code redeemed + bind student
→ create redemption/idempotency record
→ write access/auth audit events
→ COMMIT
```

If any step fails, profile/credential/entitlement/redemption/code mutation all roll back.

The session is established immediately after the account transaction through the canonical Auth login path. If a response is lost, the activation request can be replayed with its idempotency key or the student can use returning login.

## Returning student login

### `POST /v1/auth/login`

Request:

```json
{
  "identifier": "123456",
  "password": "student-password"
}
```

Arabic/Persian digits in `identifier` are normalized.

Success: **HTTP 200** and the normal HttpOnly session cookie.

```json
{
  "profile": {
    "id": "uuid",
    "role": "student",
    "displayName": null
  }
}
```

After login the Student application may verify the role with:

### `GET /v1/student/me`

and read current access with:

### `GET /v1/student/access/entitlements`

## Logout

### `POST /v1/auth/logout`

Revokes the current server session and clears its cookie.

## Recovery

Stage 6 already provides the safe recovery mechanism:

- Admin issues one-time recovery token: `POST /v1/admin/auth/recovery-token`.
- Student resets secret: `POST /v1/auth/reset-password`.
- Original passwords are never retrievable or displayed.
- A successful password reset revokes active sessions.

UI recovery copy must say **reset password**, never “show/recover original password”.

## Error contract

All API errors use the shared envelope:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Arabic public message"
  }
}
```

Important activation statuses:

- `400 BAD_REQUEST`: malformed code/password/idempotency request.
- `404 NOT_FOUND`: activation code does not exist.
- `409 CONFLICT`: code already used/revoked/not active, expired/not-yet-valid, idempotency key belongs to another operation, or account-identifier integrity conflict.
- `401 UNAUTHORIZED`: replay/returning login supplied a wrong password.
- `429 RATE_LIMITED`: Auth login lockout is active.

The UI must not treat all failures as “wrong code”; show a generic safe message mapped by error code/status and retain the user's form state where appropriate.

## Offline behavior

**First activation and returning online login require backend connectivity.**

Offline launch after a previously verified session is a later Offline/PWA stage and must not be faked by the activation UI. If activation/login cannot reach the backend, show an offline/retry state and do not claim success.

## Security boundaries

- Never store the password in localStorage/IndexedDB.
- Never use device fingerprint as authentication proof.
- Never treat the 6-digit identifier itself as authentication.
- Never call PostgreSQL from the browser.
- Never mark activation complete until the HTTP request succeeds and a session is established.
