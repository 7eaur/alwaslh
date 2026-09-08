# DEVELOPMENT RUNTIME & DEPLOYMENT POLICY — الوسيلة الذكية

> Current operational policy. Historical Preview decisions remain in Product Decision files, but the current Product Owner override controls deployment behavior.

Last updated: 2026-09-08.

## 1. Runtime surfaces

The rebuilt product has three explicit surfaces:

```text
Student Web/PWA    apps/student-web
Admin Web          apps/admin-web
Backend API        apps/api
```

### Student Web/PWA

- Student only;
- browser + installable PWA target;
- mobile-first, RTL, offline-first according to later verified contracts;
- does not contain Admin navigation/privileged code paths;
- owns local UX/private offline storage only, not server authority.

### Admin Web

- Super Admin only;
- independent from Student app;
- manages curriculum/content/media/OCR/AI/Question Bank/accounts/codes/operations as stages are implemented;
- uses Backend API, never direct PostgreSQL application access.

### Backend API / workers

- Fastify API is authoritative HTTP boundary;
- private PostgreSQL owns canonical business state;
- Auth/Authorization/Entitlements/assessment/publish decisions are server-owned;
- Media/OCR/AI/TTS/background work stays behind backend/worker boundaries;
- dedicated worker polling is separate from Fastify when required.

## 2. Current deployment decision

**`DEFERRED BY PRODUCT OWNER`**.

Until Product Owner explicitly changes this decision:

- do not deploy Student/Admin/API;
- do not sync to Vercel/Supabase Preview;
- do not re-enable Git auto-deployment;
- do not treat a previously deployed Preview as current product evidence;
- hosted runtime is `NOT YET VERIFIED`;
- continue development through repository CI, PostgreSQL integration and Chromium E2E.

This current instruction operationally pauses the historical PED-051 “stable batch → live Preview” cadence.

## 3. Current stable-batch gate

During deployment deferral:

```text
repository discovery
→ implementation
→ lint/typecheck/unit
→ PostgreSQL/integration
→ browser E2E where relevant
→ same-head regression matrix
→ documentation closure
→ next isolated batch
```

No stage is considered PASS because it builds locally or because an old hosted URL exists.

## 4. When deployment is explicitly re-enabled

Only after a new Product Owner instruction, reintroduce a deployment gate similar to:

```text
verified executable head
→ choose/confirm environment
→ apply safe migrations/config
→ deploy Backend/workers/storage
→ deploy Admin/Student
→ health/readiness
→ feature-specific smoke/E2E
→ logs/observability
→ record exact runtime evidence
```

Do not assume previous temporary Supabase/Vercel projects are still the correct hosts; verify current environment and credentials first.

## 5. Hosted verification requirements

Depending on the feature, hosted verification may require deployment/build status, API `/health` and `/ready`, real DB connectivity, Admin and Student route loading, auth/session/cookie behavior, media durable storage, PDF/Poppler worker suitability, OCR provider/runtime, AI worker/provider connectivity, PWA/Service Worker/HTTPS behavior, offline/download behavior, and browser logs/errors.

Anything impossible to verify in the chosen host remains `NOT YET VERIFIED`; do not fake a production behavior to satisfy Preview.

## 6. Temporary-platform principle

Any future Preview provider is an integration environment, not domain architecture.

- Provider-specific wrappers must not leak into business rules.
- Serverless ephemeral filesystem must never be treated as durable media storage without evidence.
- Database direct anon/auth access is not the application path; API remains authority.
- Worker/storage/provider limitations must be measured explicitly.

## 7. Secrets

- no API keys/passwords/DB URLs/service-role tokens in Git;
- no provider credentials in Student/Admin bundles;
- environment secrets stay in approved hosting/provider secret stores;
- docs record variable names/contracts only, not values;
- secrets pasted into chat should not be copied into source or documentation.

## 8. No-patching policy

A temporary hosting workaround is acceptable only when all are true:

1. defect is environment-specific, not domain correctness;
2. Known Issue is documented;
3. impact is bounded;
4. removal/exit path exists;
5. no authorization/validation/business rule is weakened;
6. it does not become the production architecture accidentally.

If architecture/domain/contract is wrong, fix source root cause and rerun gates.

## 9. Documentation after future deployment

If deployment is re-enabled, update `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, `PROJECT_HANDOFF.md`, the environment/runbook doc under `docs/preview/`, exact executable commit + deployment identifier + runtime evidence, and Known Issues/remaining `NOT YET VERIFIED` items.

## 10. Production target

Final production hosting remains a future Stage26–29 decision/execution concern. The architecture is intentionally designed so changing temporary hosts should not require rewriting business logic.