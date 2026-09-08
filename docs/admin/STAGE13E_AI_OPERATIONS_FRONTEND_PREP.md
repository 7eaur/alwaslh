# Stage13E — Admin AI Operations / Review Frontend Preparation

**Status:** Frontend presentation/state architecture prepared; production API binding is **BLOCKED / NOT YET VERIFIED** until Backend Board `#14` publishes the stabilized Stage13E contract.

**Branch:** `frontend/stage13e-ai-operations`

## 1. Purpose

This document records the Frontend/Product preparation that is safe to build before the Stage13E Admin API is stabilized. It is intentionally explicit about what is a UI adapter contract versus a server/network contract.

`apps/admin-web/src/ai-operations-view-model.ts` is a **frontend-only view model**. It is not an endpoint request/response schema and must not be copied into Backend as an implied API contract.

`apps/admin-web/src/AiOperationsWorkspace.tsx` is currently a reusable presentation workspace. It is deliberately **not wired into `App.tsx` / Admin navigation** and has no fake transport.

## 2. Evidence inspected before implementation

Frontend inspected the actual Stage11/12 implementation and current Admin patterns, including:

- `apps/api/src/ai/contracts.ts`;
- `apps/api/src/ai/validators.ts`;
- `apps/api/src/ai/job-lifecycle.ts`;
- `apps/api/src/ai/execution-repository.ts`;
- `database/migrations/0004_ai_and_sync.sql`;
- `database/migrations/0012_ai_execution.sql`;
- `docs/ai/STAGE11_GENERATION_CONTRACTS.md`;
- `docs/ai/STAGE12_JOB_LIFECYCLE.md`;
- `docs/ai/STAGE12_WORKER_RUNTIME.md`;
- Stage13C/D Admin workspaces, API clients, CSS and Chromium test patterns.

Backend Board `#14` was rechecked and, at the time of this batch, contains no stabilized frontend-facing Stage13E API REPORT/contract.

## 3. Server-owned facts represented by the UI

The view architecture mirrors already verified facts only:

- job execution statuses: `queued | running | retrying | completed | failed | cancelled`;
- effective lifecycle adds `paused` without replacing the underlying execution status;
- unit statuses include `review_required`;
- `AiJobProgress` values are server-derived, including `progressPercent`, settled/remaining and per-status counts;
- Stage11 generation modes and normalized output kinds are represented using their actual names;
- validation remains `valid | invalid | review_required` plus persisted `pending` state where applicable;
- attempts may display provider key, model, project alias, benchmark version, latency, token usage, estimated cost and errors;
- credential aliases/secrets are intentionally absent from the frontend view model;
- normalized output review supports summary, question sets, comprehensive lesson content, multi-version quizzes and page detection;
- source evidence exposes page/media/OCR identity and leaves checksum available for the future server read-model join required by the Stage13E command;
- raw provider output is visually separated as diagnostic material and is never presented as published lesson content.

## 4. Authority rule for actions

The browser does **not** derive pause/resume/cancel/retry availability from lifecycle enums.

The UI accepts action availability + an optional disabled reason from its future server adapter and renders exactly that state. This is deliberate because Stage12 internal transition behavior does not substitute for a documented Admin HTTP permission/transition contract.

The same rule applies to review intents (`edit`, `approve`, `reject`). The current component emits only a UI intent callback. It does not define a request body, persistence transition or publication effect.

## 5. UX/state architecture prepared

The presentation surface covers:

- loading, error/retry and initial empty states;
- refresh-in-progress and mutation feedback surfaces;
- job list + selected job detail;
- authoritative progress bar and progress breakdown;
- explicit effective status versus underlying execution status;
- disabled action reasons;
- unit list + selected unit detail;
- attempt observability without credentials;
- last execution errors;
- validator issues with severity/path/code/message;
- normalized output review for all Stage11 output shapes;
- page/media/OCR/checksum provenance display;
- raw output in a diagnostic `<details>` disclosure;
- RTL-safe logical CSS, long identifier wrapping, touch targets and visible semantic labels;
- responsive collapse for dense panes and action rows down to narrow mobile layouts;
- reduced-motion compatibility (no motion-dependent feedback).

## 6. Intentionally not implemented before Backend contract

The following are **NOT YET VERIFIED** and must not be guessed:

- Admin Stage13E endpoint paths/methods;
- list pagination/filter/query semantics;
- exact response envelope/read-model shape;
- polling/refetch cadence and stale-data contract;
- HTTP/auth/conflict/error mapping;
- server representation of allowed actions and disabled reasons;
- retry target semantics (job versus unit versus failed subset);
- edit/reject/approve persistence schema and lifecycle;
- review concurrency/version-conflict semantics;
- final linkage from reviewed AI output into Stage13F Question Bank/content persistence;
- real Chromium end-to-end AI Operations flow;
- 390px browser verification against the real Stage13E server contract.

## 7. Cross-team blocker

Frontend raised Team Room `#13` blocker comment `5578649045` requesting the stabilized Backend read/control/review contract. Frontend must consume that contract before enabling the AI navigation item or implementing transport/polling/mutations.

## 8. Safe next step

After Backend publishes the contract:

1. inspect the Backend REPORT and changed API/server files rather than relying only on prose;
2. build a thin authenticated `ai-operations-api.ts` adapter matching the exact contract;
3. map the server read model into the prepared frontend view model without recomputing authoritative lifecycle/progress;
4. wire the workspace into the existing Admin shell;
5. implement bounded refresh/polling only as documented;
6. add mutation pending/error/conflict handling for server-authorized controls/review;
7. run lint/typecheck/unit/build plus real Chromium happy/error/permission/reload and 390px overflow/a11y checks.
