# FRONTEND / PRODUCT WORKSTREAM — الوسيلة الذكية

> Persistent role document for the Frontend/Product engineering chat. Dynamic commands/reports live in Issue `#15`. Cross-team decisions/blockers go to Team Room `#13`. Integration acceptance belongs to Issue `#16` / Integration Lead.

## 1. Mission

Own the Admin/Student frontend as a Senior Product/Frontend engineer: correctness first, then clarity, UX, RTL, responsive behavior, accessibility, performance, maintainability, API integration and real browser verification.

Browser owns presentation state only. Server/DB remain canonical for business lifecycle, authorization, durable queues/jobs, scoring, publication and review authority.

## 2. Mandatory startup

On every restart:

1. read `README.md`;
2. read `DOCUMENTATION_INDEX.md` and follow its mandatory order;
3. read `docs/workstreams/TEAM_OPERATING_MODEL.md`;
4. read this file;
5. read latest Integration Review / COMMAND / REPORT in Issue `#15`;
6. read Backend Board `#14` for consumed contracts;
7. read Team Room `#13` for shared decisions/blockers;
8. inspect actual code before changing it.

Anything not inspected is `NOT YET VERIFIED`. Chat memory is not an authority.

## 3. Ownership / non-ownership

Frontend normally owns:

- `apps/admin-web`, `apps/student-web`;
- navigation/layout/components/forms/client request state;
- loading/error/empty/success/conflict/offline presentation;
- RTL/responsive/a11y;
- frontend performance;
- unit/component/Chromium tests.

Frontend must not invent or duplicate:

- PostgreSQL schema/business lifecycle;
- authentication/authorization;
- durable AI queue/job authority;
- retry semantics;
- publish/review/business transitions.

If a contract is missing or contradictory, raise it in Team Room instead of creating a fake endpoint/rule.

## 4. Product / UX gates

Priority: `Function → Clarity → UX → Hierarchy → Consistency → Visual Polish`.

Every surface must make clear: current location, current state, available action, effect of the action, and failure/empty recovery.

Avoid generic AI dashboards, unnecessary visual effects, hidden actions, color-only meaning, unbounded polling, duplicate requests, large unpaginated client lists and local optimistic state that overrides server truth.

Before Ready:

- semantic controls and labels;
- keyboard/focus usability;
- RTL correctness;
- 390px no horizontal overflow;
- long Arabic/data wrapping;
- touch targets;
- reduced-motion where applicable;
- lint + strict typecheck + unit + build + real Chromium when the feature crosses API/DB boundaries.

## 5. State / API authority rules

- Do not calculate canonical AI progress in React.
- Do not derive AI action availability from status enums.
- Do not promote/publish locally after a mutation.
- After sensitive mutations use authoritative response/refresh according to the documented contract.
- `409 CONFLICT` means refresh canonical server state; it is not an invitation to force a client-side transition.
- Polling must be bounded and non-overlapping.

## 6. Root-cause requirement

Before Ready, any important failure must be recorded as:

```md
Symptom:
Root cause:
Affected user flow/contract:
Blast radius:
Correct fix location and why:
Regression test:
```

Never solve a product failure by weakening tests, hiding errors, bypassing authorization, inventing duplicate authority, arbitrary sleeps/timeouts or permanent workarounds in the wrong layer.

## 7. Branch / report protocol

Current working branch is defined by the latest Issue `#15` COMMAND. Commits must remain logical (`feat(admin)`, `fix(admin)`, `test(admin)`, `docs(frontend)`).

After every meaningful batch update this file and post a `REPORT` in Issue `#15` containing:

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

Stage/sub-stage closure additionally requires Integration review and same-head evidence.

---

# 8. Current Work — Stage13E Admin AI Operations / Review

**Branch:** `frontend/stage13e-ai-operations`

**Integration-approved base:** `dd8b801103b4ef3f16bd0539f08ab8fd6d51b67c`

**Latest product commit:** `f649a9a73cb44c3a95caec342af6280b87c86a47` — `test(admin): prepare Stage13E Chromium integration flow`

**Latest documentation commits after product head:**

- `20839ae304553233af10286a91aedddbfd075fcd` — `docs(admin): record Stage13E production binding`;
- this workstream handoff commit follows it.

**Backend contract consumed:** `backend/stage13e-ai-operations` @ `348c02646d0ff873fd305beff16f41c46d9c0285`.

Canonical Backend contract: `docs/ai/STAGE13E_ADMIN_AI_OPERATIONS.md`.

## 8.1 Latest Frontend commits

- `79330380e23d0c1941dc750fddd5b854286868a5` — `feat(admin): bind Stage13E AI transport contract`;
- `afad78e8950373a501b67a37fe32c9af2f5cebeb` — `feat(admin): activate Stage13E AI operations`;
- `1582772590443e113a9b7bd24c0499fa06476595` — `fix(admin): harden Stage13E review transport`;
- `f649a9a73cb44c3a95caec342af6280b87c86a47` — `test(admin): prepare Stage13E Chromium integration flow`.

Batch1 preparation history remains in Issue `#15` and commits `aec435e...` through `e259f56...`; this section supersedes its old “Backend API missing” status.

## 8.2 What was inspected

Before binding, Frontend re-read:

- latest Integration Review / COMMAND in Issue `#15`;
- Backend Board `#14` and latest executable Backend branch;
- Team Room `#13` decisions;
- Backend `admin-operations-http.ts`, `admin-operations.ts`, lifecycle/review authorities and Stage13E tests;
- synchronized Backend contract at `348c0264...`;
- existing Admin shell, authenticated transport, Stage13C/D UI/API/E2E patterns;
- Stage11 normalized output contracts and Stage12 lifecycle semantics.

Actual executable evidence established the exact shape that `allowedActions` is nested at `job.allowedActions`, while `allowedReviewActions` is inside output detail.

## 8.3 What was implemented

Production binding is now present in `apps/admin-web`:

- `ai-operations-api.ts`: thin authenticated Admin transport for Stage13E endpoints;
- `ai-operations-adapter.ts`: explicit server DTO → safe view-model mapping;
- `AiOperationsPage.tsx`: request/controller state, selection, bounded polling, mutations and canonical refresh;
- `AiOperationsWorkspace.tsx`: jobs → units → attempts → output review UX;
- `App.tsx`: active `عمليات AI والمراجعة` Admin navigation;
- `ai-operations-review.css`: review editor/history responsive polish;
- transport/view/adapter regression tests;
- `e2e/ai-operations.e2e.spec.mjs`: combined real-server Chromium contract flow.

## 8.4 API contract consumed

Reads:

- `GET /v1/admin/ai/jobs`;
- `GET /v1/admin/ai/jobs/:jobId`;
- `GET /v1/admin/ai/units/:unitId`;
- `GET /v1/admin/ai/outputs/:outputId`.

Controls:

- `POST .../pause`;
- `POST .../resume`;
- `POST .../cancel`;
- `POST .../retry`.

Review:

- `PATCH /v1/admin/ai/outputs/:outputId/review` using the strict discriminated union only.

Authority arrays are consumed exactly from:

- `job.allowedActions`;
- `output.allowedReviewActions`.

No action is derived from enums in the browser.

## 8.5 Security / data-minimization

Frontend no longer models/displays:

- raw provider response;
- credential aliases;
- provider metadata;
- provider/internal error-message text.

It consumes `hasRawResponse`, non-secret observability and safe error codes only. Adapter regressions prove unexpected raw/error fields are discarded.

Stage13E approval is labeled as review approval and does **not** imply Stage13F Question Bank publication.

## 8.6 UX / state / performance behavior

- loading/error/empty/retry for top-level list;
- selected-job and selected-unit loading/error states;
- mutation pending/success/conflict feedback;
- server progress and lifecycle display without recalculation;
- server-authorized pause/resume/cancel/retry only;
- normalized output edit, approve, reason-required reject, review history and provenance;
- raw payload is never shown;
- 5-second polling only for selected non-terminal job, with no overlapping poll ticks;
- canonical refresh after mutation success or `409`;
- existing session expiry reused;
- responsive dense panes and action/editor stacking;
- real 390px overflow assertion prepared.

## 8.7 Tests / exact evidence

Historical preparation evidence (before production binding): GitHub Actions run `34184228250` = PASS: lint, typecheck, 19/19 unit tests, production build.

Current binding heads could not execute repository commands because GitHub hosted runner provisioning failed before checkout:

- `34187450894` @ `79330380...` — job had no steps; rerun same result;
- `34187905811` @ `afad78e...` — `steps=[]`;
- `34188105821` @ `15827725...` — `steps=[]`;
- `34188173087` @ `f649a9a...` — job `101940609263`, `steps=[]`.

Therefore current-head lint/typecheck/unit/build are **NOT YET VERIFIED**. This is not application PASS/FAIL evidence.

Prepared regression coverage includes:

- server progress not recalculated;
- action arrays consumed only from server;
- raw/error-message omission;
- strict edit/approve/reject payloads;
- `quote:null` transport normalization for Stage11 strict schema;
- explicit `409` conflict signal;
- Chromium login → AI workspace → pause/resume → unit/output review approve → reload durability;
- 390px no-horizontal-overflow check.

## 8.8 Failure / root cause record

**Symptom:** all latest Frontend workflow jobs fail immediately before checkout and expose no executable steps.

**Root cause:** GitHub hosted runner provisioning is not allocating an executable runner (`steps=[]`); Backend Stage13E is simultaneously affected by the same infrastructure condition.

**Affected user flow/contract:** verification evidence only; no runtime/product defect has been established by these runs.

**Blast radius:** latest Frontend lint/typecheck/unit/build and real combined Chromium cannot be claimed.

**Correct fix location and why:** hosted-runner infrastructure / unchanged workflow rerun. Weakening or skipping repository gates would hide rather than fix the issue.

**Regression protection:** all quality gates remain unchanged; `STAGE13E_E2E=1` requires an explicit real fixture and fails if the fixture is missing rather than silently skipping.

## 8.9 Open dependencies / NOT YET VERIFIED

Backend action/read/review contract is now consumed; no known contract gap remains.

Still `NOT YET VERIFIED`:

- latest-head Frontend lint/typecheck/unit/build;
- combined Backend+Frontend real Chromium flow;
- browser-level conflict/race/error/permission paths;
- real 390px result on combined fixture;
- same-head Stage13E integration / Stage PASS;
- deployment (out of scope).

**Ready for integration:** **NO** — implementation is production-bound and prepared for Integration, but mandatory executable current-head evidence is blocked by runner infrastructure.

## 8.10 Exact next action

1. Re-run the unchanged Frontend quality workflow when GitHub allocates a hosted runner; fix only real code/test failures if any appear.
2. Integration combines latest accepted Backend `348c0264...` lineage with Frontend product head `f649a9a...` (plus docs as needed).
3. Seed the explicit Stage13E AI fixture and run `STAGE13E_E2E=1` Chromium flow + 390px check.
4. Run same-head Backend/Frontend cross-boundary gates and submit Integration Review; only then can Stage13E be considered for acceptance/closure.
