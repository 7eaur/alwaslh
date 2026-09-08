# Stage13E — Admin AI HTTP Validation Hardening

Status: **FIXED IN CANDIDATE / EXECUTION PENDING**.

## AI-013E-API-008 — P2 Input Validation

### Problem

Stage13E Admin pagination offsets (`offset`, `unitOffset`, `attemptOffset`, `reviewOffset`) were validated as non-negative JavaScript integers but had no upper bound.

JavaScript can represent integer-looking values beyond its safe-integer range. Such values could pass the HTTP Zod integer check and then reach PostgreSQL `OFFSET`, where representation/coercion can fail as a database error rather than being rejected as invalid client input.

### Root cause

Pagination validation bounded page size (`limit <= 100`) but treated every non-negative JavaScript integer as a valid offset. The HTTP boundary therefore did not guarantee that an accepted pagination value was safely representable end-to-end.

### Correct fix

`apps/api/src/ai/admin-operations-http.ts` now uses one shared schema:

```ts
const PaginationOffsetSchema = z.coerce
  .number()
  .int()
  .min(0)
  .max(Number.MAX_SAFE_INTEGER);
```

The schema owns all four Stage13E offsets. This is a representation/integrity bound, not an arbitrary product paging cap.

- valid offsets remain `0..Number.MAX_SAFE_INTEGER`;
- unsafe integer values are rejected by `parseBody` as `400 BAD_REQUEST`;
- no service/database call occurs for rejected offsets;
- page sizes remain independently bounded to `1..100`.

### Regression

`apps/api/tests/ai-admin-pagination-bounds.test.ts` runs inside the existing API unit gate (`npm test --prefix apps/api`). It uses real Fastify routing/error mapping with an Admin auth stub and service-call spy to prove:

1. unsafe offsets are rejected for Jobs, Job Detail Units, Unit Detail Attempts and Output Review History;
2. all return `400 BAD_REQUEST` before service execution;
3. `Number.MAX_SAFE_INTEGER` remains accepted so the fix does not introduce a smaller undocumented business limit.

An initial PostgreSQL integration-test version was intentionally removed because adding it to the workflow would have required rewriting a workflow file containing a fixed browser-test credential; the repository safety layer rejected that write. No workflow weakening occurred. The final regression is stronger for this boundary because it tests the exact HTTP validation point and is already included in the unchanged API unit gate.

### Commits

- `887f772df927c8d24df0003b76b9cb7ea0313e15` — shared safe offset schema.
- `7e3377991b3e2298a4e58bd86aa76611a918036a` — initial integration regression (superseded).
- `6b04c9f50256d96fda9b2f1c322775ddf682aa9f` — remove superseded integration test.
- `d60218b518fb0fe453c21386e77cd35a2228ad07` — final Fastify unit regression included by existing gate.

### Verification

Latest candidate run after the final regression:

- run `34283353562`;
- job `102253102885`;
- job ended before checkout with no executable steps.

Therefore this finding is **FIXED IN CANDIDATE / NOT YET VERIFIED EXECUTIONALLY**. It is not evidence of a product/test failure.
