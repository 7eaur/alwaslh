# Stage13E — Admin AI HTTP Validation Hardening

Status: **FIXED + VERIFIED / PROMOTED**.

Verified runtime/application SHA: `d5ebc7f25a369430387a758c7c0bb89350963d67`.

## AI-013E-API-008 — P2 Input Validation

### Problem

Stage13E Admin pagination offsets (`offset`, `unitOffset`, `attemptOffset`, `reviewOffset`) were originally validated as non-negative JavaScript integers without an end-to-end representation bound. Integer-looking values outside JavaScript's safe-integer range could therefore escape caller validation and fail later in PostgreSQL/coercion paths.

### Root fix

`apps/api/src/ai/admin-operations-http.ts` owns one shared schema:

```ts
const PaginationOffsetSchema = z.coerce
  .number()
  .int()
  .min(0)
  .max(Number.MAX_SAFE_INTEGER);
```

The same schema owns all four Stage13E offsets. Page sizes remain independently bounded to `1..100`.

This is a representation/integrity boundary, not an arbitrary product paging cap.

### Regression

`apps/api/tests/ai-admin-pagination-bounds.test.ts` uses real Fastify routing/error mapping with Admin auth and a service-call spy to prove:

1. unsafe offsets are rejected for Jobs, Job Detail Units, Unit Detail Attempts and Output Review History;
2. rejection is `400 BAD_REQUEST` before service/database execution;
3. `Number.MAX_SAFE_INTEGER` remains accepted.

A superseded PostgreSQL integration-test attempt was removed rather than forcing an unrelated workflow rewrite. The final regression tests the exact owning HTTP boundary and runs in the normal API unit gate.

### Executable verification

Accepted candidate `72ead8446af237392dc6d953c8e0c2382f468286` passed the complete required candidate matrix.

Selective promotion `d5ebc7f25a369430387a758c7c0bb89350963d67` passed **12/12** required workflows, including:

- Combined Stage13E `34401502463` — SUCCESS;
- Stage13E standalone `34401549935` — SUCCESS;
- Rebuild `34401550016` — SUCCESS;
- Stage11/12/13 and Stage9/10/OCR/13D regressions — SUCCESS on the same SHA.

Therefore `AI-013E-API-008` is **FIXED + VERIFIED**.

## Carry-forward policy

- every HTTP value accepted for database pagination must be safely representable end-to-end;
- page-size bounded-work policy remains separate from numeric representation validation;
- caller input errors remain `400`, not database/internal failures;
- no Frontend-only clamp may substitute for authoritative Backend validation.
