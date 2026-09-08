# FRONTEND / PRODUCT WORKSTREAM — الوسيلة الذكية

> Persistent role document for the Frontend/Product engineering workstream. Dynamic commands/reports live in Issue `#15`. Integration acceptance belongs to the Integration Lead.

## 1. Mission

Own Admin/Student frontend as a Senior Product/Frontend engineer: correctness first, then clarity, UX, RTL, responsive behavior, accessibility, performance, maintainability, API integration and real browser verification.

Browser owns presentation state only. Server/DB remain canonical for authorization, durable jobs/queues, lifecycle, progress, review/publication authority and other business state.

## 2. Mandatory restart protocol

On every restart:

1. read repository mandatory documentation order;
2. read this workstream file;
3. read the latest Integration Review / COMMAND / REPORT in Issue `#15`;
4. inspect actual code before changing it;
5. treat anything not inspected as `NOT YET VERIFIED`.

Do not use chat memory as authority.

## 3. Ownership / non-ownership

Frontend owns:

- `apps/admin-web`, `apps/student-web`;
- navigation/layout/components/forms/client request state;
- loading/error/empty/success/conflict/offline presentation;
- RTL/responsive/a11y;
- frontend performance;
- unit/component/Chromium tests.

Frontend must not invent or duplicate:

- PostgreSQL schema/business lifecycle;
- authentication/authorization rules;
- durable AI queue/job authority;
- retry semantics;
- review/publication/business transitions;
- fake/test-only production endpoints.

## 4. Product / quality gates

Priority: `Function → Clarity → UX → Hierarchy → Consistency → Visual Polish`.

Before Ready:

- server authority preserved;
- semantic controls/labels and keyboard/focus usability;
- RTL correctness;
- 390px no horizontal overflow;
- safe long-data wrapping and touch targets;
- no hidden business state or color-only meaning;
- bounded/non-overlapping polling;
- no duplicate/unbounded requests;
- lint + strict typecheck + unit + build + real Chromium where the feature crosses API/DB boundaries.

## 5. State / API authority rules

- Do not calculate canonical AI progress in React.
- Do not derive AI action availability from status enums.
- Do not promote review/publication locally after mutation.
- `409 CONFLICT` requires canonical refresh; never force a client transition.
- Do not expose raw provider payload, credentials or internal provider error text when the server contract omits them.
- No route interception/fake APIs to satisfy production E2E evidence.

## 6. Root-cause requirement

Important failures must be recorded as:

```md
Symptom:
Root cause:
Affected user flow/contract:
Blast radius:
Correct fix location and why:
Regression test:
```

Never solve a product failure by weakening tests, hiding errors, bypassing authorization, arbitrary sleeps/timeouts or permanent workarounds in the wrong layer.

## 7. Report protocol

After every meaningful batch update this file and post a REPORT in Issue `#15` with:

- stage/feature;
- branch/base/latest commits;
- inspected/implemented scope;
- API contracts consumed;
- components/routes/states changed;
- UX/a11y/responsive behavior;
- exact tests/results;
- failures/root causes/fixes;
- blockers/dependencies;
- `NOT YET VERIFIED`;
- Ready YES/NO;
- exact next action.

Stage closure additionally requires same-head Integration evidence.

---

# 8. Current Work — Stage13E Admin AI Operations / Review

**Branch:** `frontend/stage13e-ai-operations`

**Integration-approved base:** `dd8b801103b4ef3f16bd0539f08ab8fd6d51b67c`

**Production binding candidate accepted by Integration:** branch state through `e42644944ca3fcc7e225a263a6e9699bcb70b9f7`.

**Latest bounded browser-regression product HEAD:** `7bf2f8c32907032551aace9f3aa27681040c4b0f`.

## 8.1 Relevant commits

Production binding lineage:

- `79330380e23d0c1941dc750fddd5b854286868a5` — `feat(admin): bind Stage13E AI transport contract`;
- `afad78e8950373a501b67a37fe32c9af2f5cebeb` — `feat(admin): activate Stage13E AI operations`;
- `1582772590443e113a9b7bd24c0499fa06476595` — `fix(admin): harden Stage13E review transport`;
- `f649a9a73cb44c3a95caec342af6280b87c86a47` — `test(admin): prepare Stage13E Chromium integration flow`;
- `20839ae304553233af10286a91aedddbfd075fcd` — `docs(admin): record Stage13E production binding`;
- `e42644944ca3fcc7e225a263a6e9699bcb70b9f7` — `docs(frontend): hand off Stage13E production binding`.

Latest Integration-return browser-regression batch:

- `ab12430acf1fbed6b10577fb2afd66d3286e8b81` — `test(admin): cover Stage13E auth expiry and review conflict`;
- `7bf2f8c32907032551aace9f3aa27681040c4b0f` — `test(admin): add real Stage13E E2E API helper`;
- `0c61338f2859cbf5dd5922c76bf07188b81b04bd` — `docs(admin): record Stage13E browser regression prep`.

## 8.2 Production binding already implemented

Stage13E Admin UI is production-bound using:

- `ai-operations-api.ts` — authenticated transport;
- `ai-operations-adapter.ts` — safe DTO mapping;
- `AiOperationsPage.tsx` — controller, selection, bounded polling, mutations and canonical refresh;
- `AiOperationsWorkspace.tsx` — jobs → units → attempts → output review UX;
- `App.tsx` — active **عمليات AI والمراجعة** navigation;
- transport/view/adapter regression tests;
- real-server Chromium spec.

Server `progressPercent`, `job.allowedActions` and `output.allowedReviewActions` are consumed as authority. Raw provider response/internal error text are not exposed. Review payloads remain strict and Stage13E approval is not Stage13F publication.

## 8.3 Latest Integration Review scope — bounded browser regression only

The latest Integration Review accepted production binding as an Integration Candidate and returned one bounded gap: prepare real-browser session-expiry and 409 conflict paths without mocks/interception or Backend/product changes.

This batch changed only E2E preparation and documentation.

## 8.4 Real session-expiry regression prepared

`apps/admin-web/e2e/ai-operations.e2e.spec.mjs` now includes a real auth-boundary scenario:

1. login through Admin UI;
2. open AI Operations;
3. invalidate the same session through real `POST /v1/auth/logout` using the BrowserContext request client/cookie jar;
4. trigger normal **تحديث الحالة**;
5. assert existing `onSessionExpired` path returns to **دخول المدير** and signed-in AI navigation disappears.

No cookie editing, request interception, fake 401 or test-only endpoint is used.

## 8.5 Real 409 stale-review race prepared

New helper: `apps/admin-web/e2e/stage13e-real-api.mjs`.

New required combined fixture variable:

`STAGE13E_E2E_RACE_JOB_TYPE`

The race fixture must resolve to a real job that:

- is visible in the bounded list/detail page;
- has terminal `executionStatus` (`completed | failed | cancelled`) to prevent polling from erasing the intentionally stale UI state;
- contains an open output whose server `allowedReviewActions` includes `approve`.

The scenario:

1. login;
2. resolve fixture/output through real Stage13E reads using the same browser session;
3. open matching UI unit and capture the server-advertised approve action;
4. use the same BrowserContext/API to terminally reject that output out-of-band through the real review endpoint;
5. click the stale UI approve action;
6. assert real `409` feedback, canonical refresh, terminal **مرفوض** state and no remaining review actions.

The helper hard-fails on missing/misaligned fixture state instead of using sleeps, random timing or silent skip.

## 8.6 Existing Chromium coverage preserved

The original scenarios remain:

- login → AI workspace;
- server-authorized pause/resume;
- review approve;
- reload durability;
- 390×844 horizontal-overflow assertion.

With the bounded batch, prepared Stage13E browser coverage now includes:

1. happy/control/review/reload;
2. session expiry/auth boundary;
3. stale review/real 409 canonical refresh;
4. 390px responsive overflow.

When `STAGE13E_E2E=1`, required fixture data must exist; fixture absence is a hard failure.

## 8.7 E2E fixture contract for Integration

Required environment:

- `STAGE13E_E2E=1`;
- `STAGE13E_E2E_JOB_TYPE` — existing happy/390px fixture;
- `STAGE13E_E2E_RACE_JOB_TYPE` — separate terminal/open-review race fixture.

Optional overrides:

- `STAGE13E_ADMIN_IDENTIFIER`;
- `STAGE13E_ADMIN_PASSWORD`;
- `STAGE13E_E2E_API_BASE_URL` (default `http://127.0.0.1:3000`);
- `STAGE13E_E2E_ADMIN_ORIGIN` (default `http://127.0.0.1:5175`).

No test-only Backend route is required.

## 8.8 Tests / exact evidence

Historical pre-binding evidence only: run `34184228250` passed lint/typecheck/unit/build before production binding.

Latest bounded browser-regression run:

- GitHub Actions run `34189236669` @ `7bf2f8c32907032551aace9f3aa27681040c4b0f`;
- job `101943693820`;
- conclusion: failure before checkout;
- executable steps: none (`steps=null`).

Therefore **no repository command executed** on the latest product HEAD. Current-head lint/typecheck/unit/build are still `NOT YET VERIFIED`; the workflow conclusion is not product-code failure evidence.

A local syntax-only `node --check` of the new `.mjs` real-API helper passed. This is supplementary only and does not replace repository gates/Chromium execution.

## 8.9 Failure / root cause record

**Symptom:** latest Frontend workflow job finishes failure before checkout and has no executable steps.

**Root cause:** GitHub hosted runner provisioning did not allocate an executable runner/job.

**Affected user flow/contract:** verification evidence only; no Stage13E runtime defect is proven.

**Blast radius:** latest lint/typecheck/unit/build plus actual combined Chromium execution cannot be claimed.

**Correct fix location and why:** hosted-runner infrastructure / unchanged-gate rerun. Product/test weakening or fake harnesses would be the wrong layer.

**Regression protection:** session-expiry and 409 race preparation now uses real browser-session/API state with strict fixture preconditions; no mocks, intercepts or random delays.

## 8.10 NOT YET VERIFIED

- latest product-head Frontend lint/typecheck/unit/build;
- execution of the four Stage13E Chromium scenarios on the combined real fixture;
- real session-expiry browser result;
- real 409 stale-review browser result;
- real 390px result;
- same-head Stage13E Integration / Stage PASS.

**Ready for integration:** **NO** — the Integration-requested browser-regression preparation is complete, but executable current-head gates have not run green.

## 8.11 Exact next action

1. Integration seeds both real Stage13E fixtures and enables `STAGE13E_E2E=1`.
2. Re-run unchanged Frontend quality gates when GitHub allocates a runner; fix only a reproducible code/test defect if one appears.
3. Run the combined real Chromium suite including happy/reload, session expiry, stale-review 409 and 390px.
4. Submit same-head evidence to the next Integration Review. Do not declare Stage13E PASS/closure before those gates are green.
