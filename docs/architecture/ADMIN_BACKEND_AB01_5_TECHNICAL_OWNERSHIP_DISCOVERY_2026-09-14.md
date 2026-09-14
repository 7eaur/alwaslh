# AB-01.5 — Common Backend Technical Ownership Discovery

Date: **2026-09-14**  
Status: **DISCOVERY COMPLETE / ONE BOUNDED CORRECTION SELECTED**

## Purpose

AB-01.5 is intentionally limited to one proven cross-cutting backend technical ownership correction. It must not move business/domain rules into shared infrastructure, reopen broad `app.ts` composition, or manufacture abstractions from the target folder diagram.

## Live-main reconciliation

At discovery start:

- architecture branch starting checkpoint: `5627dabffb06bfc6ad99779e7e45f4ebcb0776ff`;
- live `main`: `258c5bc2c09a049afb57c0593b5b6ca9db532c62`;
- comparison from the prior reconciled `main` checkpoint `3053640cc5bb0699cfa7456cf646e8997f6aa81b` to live `main` contains one merged Student Experience V2 commit;
- no `apps/api`, `apps/admin-web`, or `database/migrations` paths were found in that main-only delta.

Decision: no scoped Admin/API/migration implementation reconciliation is required before this AB-01.5 correction. Student frontend remains isolated.

## Evidence inspected

### Auth HTTP currently owns a generic request-validation adapter

`apps/api/src/auth/http.ts` exports:

```ts
export function parseBody<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  body: unknown,
): z.output<TSchema> {
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new AppError("BAD_REQUEST", "البيانات المرسلة غير صالحة", 400);
  return parsed.data;
}
```

This function does not authenticate, inspect sessions, own cookies, or invoke AuthService. It is a generic HTTP-boundary adapter from Zod parsing failure to the platform public `AppError` contract.

### Non-Auth modules import that private Auth HTTP helper

Current branch evidence:

- `apps/api/src/question-bank/http.ts` imports `parseBody` from `../auth/http.js` and uses it for query/params/body validation;
- `apps/api/src/quiz-builder/http.ts` does the same;
- both files also import `currentProfile` from Auth HTTP, but that helper is materially different because it invokes `AuthService.authenticate(...)` through the session token contract.

This confirms the previously recorded `AB-DEP-105` category: Auth HTTP is acting as a provider of generic HTTP infrastructure for other modules.

## Selected correction — request parsing only

### Current owner

`apps/api/src/auth/http.ts`

### Target owner

`apps/api/src/app/http/request-validation.ts`

### Target public contract

Keep a small function with the existing semantic contract, for example:

```ts
export function parseRequest<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  input: unknown,
): z.output<TSchema>
```

Naming may preserve `parseBody` if changing call sites would add noise; ownership matters more than cosmetic renaming.

The implementation must continue to:

1. call the supplied Zod schema's `safeParse`;
2. return parsed data on success;
3. throw `AppError("BAD_REQUEST", "البيانات المرسلة غير صالحة", 400)` on validation failure;
4. introduce no logging, coercion, authorization, localization framework or schema registry.

### Required consumers for this correction

At minimum migrate the currently verified private cross-module callers:

- Auth HTTP itself;
- Question Bank HTTP;
- Quiz Builder HTTP.

Before implementation, search the current branch for any additional `parseBody` imports/callers and migrate only those real callers.

## Explicit non-goals

This correction does **not** move or redesign:

- `currentProfile`;
- `sessionToken`, cookies or session behavior;
- `AuthService`;
- admin/student authorization rules;
- origin/unsafe-method protection;
- domain schemas;
- `AppError` ownership;
- root `config`, `db` or media/observability infrastructure;
- Question Bank's dependency on the AI question schema (`AB-DEP-104`);
- broad module HTTP composition.

`currentProfile` stays Auth-owned for now because it is an authentication/session adapter, not a generic request parser. Repeated `adminActor` guards are a real later concern, but moving them together with request parsing would turn this bounded correction into an authorization redesign. That belongs to workflow-driven normalization in AB-03/AB-04 unless later evidence justifies a separate common auth boundary.

## Verification required for implementation

The implementation batch must prove:

1. Architecture Guard/self-test green;
2. API lint + strict typecheck + unit tests + build green;
3. existing auth/security regressions green;
4. Question Bank and Quiz Builder integration/contract paths remain green;
5. clean PostgreSQL migration/DB contract gates remain green where exercised by canonical workflows;
6. real API + PostgreSQL + Chromium acceptance green through the canonical combined/Stage13G gates.

A focused unit test for the helper is optional if existing API tests already exercise both success and BAD_REQUEST outcomes; do not add a tautological test merely for file movement. If coverage inspection shows the error mapping is not directly protected, add the smallest meaningful test.

## AB-01.5 stop rule

After this one correction is implemented and exact-head verified, **stop AB-01.5**. Do not continue moving root `config`, `db`, `errors`, media or observability files merely to match a conceptual folder diagram.

Remaining ownership debt stays recorded for AB-03/AB-04 and should be corrected only when a real workflow/module slice supplies evidence and tests.

Next after verified implementation: `AB-01.6 Foundation Closure Gate`.
