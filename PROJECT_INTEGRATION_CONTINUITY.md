# PROJECT INTEGRATION CONTINUITY — الوسيلة الذكية

> **Purpose:** الذاكرة التشغيلية التفصيلية لأي محادثة هندسية بديلة. يجب أن تستطيع الاستمرار من GitHub فقط بدون Chat history.
>
> **Authority:** current code + PostgreSQL migrations + executable evidence أعلى من هذا الملف. أي شيء غير مفحوص/غير منفذ = `NOT YET VERIFIED`.

Last synchronized: **2026-09-08 — Single Owner; Stage13E combined candidate hardened for DB review integrity, review/retry integrity, and complete durable-history pagination; executable runner still unavailable before checkout.**

## 1. Resume procedure

1. Confirm repository `7eaur/alwaslh`.
2. Read `README.md`.
3. Read `DOCUMENTATION_INDEX.md`.
4. Read `PROJECT_HANDOFF.md`.
5. Read `PROJECT_STATUS.md`.
6. Read `PROJECT_ENGINEERING_LOG.md`.
7. Read this file.
8. Read `PROJECT_EXECUTION_QUEUE.md`.
9. Read `docs/product/CURRENT_PRODUCT_OVERRIDES.md`.
10. Read `docs/workstreams/SINGLE_OWNER_OPERATING_MODEL.md`.
11. Read latest comments in active Issue `#16`.
12. Read current-stage specialized docs + actual code/migrations/tests.
13. Live-check `main`, active branch HEADs and Actions before conclusions.

Do not depend on earlier chat memory. If this path is insufficient, documentation is defective and must be corrected before feature work continues.

## 2. Operating model

- Product Owner retired separate Backend/Frontend/Integration chats.
- One replaceable engineering conversation owns Product/Architecture/Backend/Frontend/UX/Security/Performance/QA/Git/Documentation.
- Issue `#16` is the sole active Project Execution Board.
- `PROJECT_EXECUTION_QUEUE.md` is the ordered task authority.
- Issues #13/#14/#15 and former workstream docs are historical evidence only.
- Root-cause only; no test weakening, auth bypass, fake APIs, hidden catches, duplicate authority or timeout masking.

## 3. Hosting policy

`DEPLOYMENT / HOSTING FULLY DEFERRED UNTIL VPS IS AVAILABLE`.

No Render/Vercel/Railway/Supabase hosting work, hosted smoke gate or provider cutover now. VPS absence is not a development blocker. Deployment resumes only after explicit Product Owner command.

## 4. Product / stable architecture

**الوسيلة الذكية** Arabic education platform:

- Student Web/PWA — secure activation/login, entitled curriculum, Reader, assessment, personal data, notifications/offline in roadmap stages.
- Super Admin — curriculum/content/media/OCR/AI, Question Bank, students/codes/recovery, reports/settings/audit.
- Backend — Fastify + PostgreSQL authority for auth/access/business data/media/OCR/AI/review/publication/trusted scoring/sync.

Stable rules:

- Browser never owns durable canonical business state.
- Full Code = 6 digits; Class Code = 7 digits.
- activation verification non-consuming; completion atomic.
- returning Student requires password + registered P-256 device proof.
- Curriculum = Class → Subject Offering (`subject_class_links`) → optional Section → Lesson.
- source inventory = provenance, not curriculum hierarchy.
- `media ready != published`.
- Stage13D publication = Draft → Review → Published.
- raw provider/AI output never becomes automatic Student/Question Bank authority.
- provider/network calls outside long DB transactions.
- durable worker lifecycle remains separate from Fastify HTTP.
- secrets/credential aliases/raw provider metadata/internal provider errors never Frontend contract.
- no duplicate queue/lifecycle/storage authority.
- operational history is server-owned and must remain completely reachable through bounded pagination.

## 5. Verified application baseline

Latest fully executable green head:

`4eca7de8877ac9e2289b9c7990c912d33c256935`

Same-head SUCCESS:

- Stage13D Admin `34177369743`;
- Stage13D Backend `34177369784`;
- Stage13 Admin `34177369748`;
- Stage12 `34177369812`;
- Stage11 `34177369753`;
- OCR `34177369750`;
- Stage10 `34177369777`;
- Stage9 `34177369756`;
- Full Rebuild `34177369768` incl. Student Chromium.

Verified through Stage13D. Never replace this baseline with docs-only/unexecuted heads.

## 6. Git / current stage

- `main`: latest Integration-approved development baseline; live-check before edits.
- Legacy archive: `archive/legacy-main-2026-09-08 @ 5d16c9ae5e4aa84a13c128da34b0e62f4ae28c06`.
- Active stage: **Stage13E — Admin AI Operations / Review**.
- Stage13E runtime is not in `main`.
- Combined branch: `integration/stage13e-ai-operations`.
- Current candidate HEAD: `70f6fe218124498ccb6667e3aefa2e8dd21599a4`.
- Latest runtime/test HEAD below that docs commit: `ae772db53e218037a2b140e9dc08e6528f1a1ac8`.

Historical source branches are evidence only:

- Backend `348c02646d0ff873fd305beff16f41c46d9c0285`.
- Frontend `1eb141e950e96c9f53ffd103a386d59166113c16`; Product/Test `7bf2f8c32907032551aace9f3aa27681040c4b0f`.

## 7. Stage13E combined architecture

Candidate provides:

- Admin-only Jobs/Units/Attempts/Outputs read models;
- server-derived progress and allowed job/review actions;
- Stage12 pause/resume/cancel/retry reuse;
- bounded retry + preserved attempt history;
- provider/model/project observability without secrets/raw metadata;
- source/page/checksum provenance;
- append-only review audit;
- Stage11 semantic validation inside review authority;
- strict review HTTP union;
- row-lock concurrency protection;
- authenticated Admin UI + canonical refresh after mutation/409;
- bounded polling of selected non-terminal Job;
- complete durable history browsing via bounded Jobs/Units/Attempts pagination;
- real Chromium coverage preparation;
- no Stage13F Question Bank publication.

## 8. Root fixes in Stage13E

### AI-013E-DB-001 — P1 Data/Audit Integrity

**Problem:** reject reason required by HTTP/service but not PostgreSQL.

**Root cause:** durable terminal audit invariant lived only at caller validation.

**Fix:** PostgreSQL constraint `ai_output_review_events_reject_note_required`; direct DB NULL/blank regressions; redundant latest-review index removed.

Commits: `730989b8...`, `6589d6e5...`, workflow DB check `bc1bf508...`.

Status: **FIXED IN CANDIDATE / EXECUTION PENDING**.

### AI-013E-REVIEW-002 — P1 Data/Review Integrity

**Problem:** Stage12 can update the same `ai_outputs` row during retry/re-execution while review events remain append-only.

**Root cause:** human review authority was not tied to execution stability.

**Fix:** review available only for unit state `completed | review_required`; non-stable outputs inspection-only; transaction locks output+unit and returns `409` before any event for other states.

Commits: `5c03fa27...`, regression `6494a0ee...`, specialized contract `1e19ef06...`.

Status: **FIXED IN CANDIDATE / EXECUTION PENDING**.

### AI-013E-OPS-003 — P1 Admin Operations / Durable History Accessibility

**Problem:** Backend already returned pagination metadata, but Frontend only exposed first 30 Jobs / 50 Units / 50 Attempts and discarded `total/limit/offset`.

**Evidence:** Stage12 allows up to 5,000 units per plan; API contracts already support Job/Unit/Attempt offsets.

**Impact:** durable Jobs/Units/Attempts could exist in PostgreSQL yet be unreachable from Admin UI, including reviewable Unit 51+ or older diagnostic attempt history.

**Fix:** preserve bounded server pagination end-to-end; accessible Previous/Next controls at all three levels; parent-page changes clear only lower-level selection; refresh/poll retain current offsets; no unbounded browser loading.

Implementation commits:

- `92f4d0f8...` view contract/helpers;
- `8b932faa...` adapter pagination;
- `0974142f...` controller offsets;
- `3411c1fd...` Workspace controls;
- `38272670...` responsive pagination CSS.

Regression commits:

- `3ab137c9...` helper boundaries;
- `27de2d6f...` adapter metadata;
- `8dd1d712...` attempt transport;
- `66ac7bd3...` / `ae772db5...` real PostgreSQL pagination fixtures;
- `a9e97e34...` workflow fixture invariants;
- `c3420181...` real Chromium Jobs/Units/Attempts pagination;
- `70f6fe21...` specialized Admin documentation.

Status: **FIXED IN CANDIDATE / EXECUTION PENDING**.

## 9. Real browser authority / fixtures

Fixture utility: `apps/api/tests/fixtures/stage13e-e2e-seed.ts`.

Variables:

- `STAGE13E_E2E_JOB_TYPE=stage13e_e2e_happy`;
- `STAGE13E_E2E_RACE_JOB_TYPE=stage13e_e2e_race`;
- `STAGE13E_E2E_PAGINATION_JOB_TYPE=stage13e_e2e_pagination_marker`.

Fixture shapes:

- Happy: active Job with 51 Units; Unit 1 has open valid review output + 51 durable Attempt records; remaining 50 Units queued.
- Race: execution-terminal completed Job with open valid output and no initial review event.
- Pagination marker: deliberately old completed Job plus 30 newer filler Jobs so the marker is only reachable from a later Jobs page.

Browser suite uses real same BrowserContext session/API and now covers:

1. Jobs page 2 → old marker reachable;
2. Happy Job Units page 2 → Unit 51 reachable;
3. Attempt page 2 → Attempt 1 reachable;
4. pause/resume;
5. approve + reload durability;
6. real session logout/expiry;
7. real stale-review `409` and canonical refresh;
8. 390px no-horizontal-overflow.

No route interception/mock/fake 401/409/test-only endpoint/manual cookie mutation/sleep race.

## 10. Combined executable gate

Workflow: `.github/workflows/stage13e-integration.yml`.

Expected execution:

1. API lint/typecheck/unit/build;
2. Admin lint/typecheck/unit/build;
3. clean PostgreSQL migrations + Stage13E constraints;
4. Stage13E auth/action/review/concurrency/DB-integrity/stable-review tests;
5. Stage12 execution/capacity/control/lifecycle regressions;
6. auth regression;
7. fresh DB reset;
8. real Admin bootstrap;
9. real Stage13E fixture seed/assertions;
10. real Chromium durable-history pagination;
11. real Chromium happy/session-expiry/stale-409/390px paths.

Latest runtime/test run:

- run `34249182219`;
- head `ae772db53e218037a2b140e9dc08e6528f1a1ac8`;
- job `102138902680`;
- `runner_id=0`, `runner_name=""`, `runner_group_id=0`, `steps=[]`;
- no checkout or repository command executed.

Earlier Stage13E runs show the same pre-checkout condition.

## 11. CI-001 interpretation

- Severity P1 verification infrastructure.
- GitHub hosted job allocation terminates before checkout.
- Available connector can read Actions runs/jobs but not Billing/Actions account administration, so external root cause remains `NOT YET VERIFIED`.
- This is not product failure evidence.
- Do not weaken tests or churn code only because the job never starts.
- No local PASS is claimed.

## 12. Exact next action

1. Read `PROJECT_EXECUTION_QUEUE.md` first.
2. Keep Stage13E outside `main`.
3. Retain all three P1 fixes/regressions.
4. When GitHub allocates a real runner, run the current combined gate unchanged.
5. Any executed failure → root-cause fix in owning layer + regression.
6. Combined PASS → wider Stage9/10/OCR/11/12/13/13D/Full Rebuild regressions.
7. Wider PASS → integrate Stage13E to `main` while preserving central docs.
8. Update Legacy Coverage/Roadmap/central docs and write Stage13E Closure Report in Issue #16.
9. Only then start Stage13F.

## 13. Open work / risks

- `CI-001` P1 — runner allocation before checkout.
- `AI-013E-DB-001` P1 — fixed, execution pending.
- `AI-013E-REVIEW-002` P1 — fixed, execution pending.
- `AI-013E-OPS-003` P1 — fixed, execution pending.
- `AI-011-005` P2 — direct generated-question persistence; Stage13F owns resolution.
- `AI-012-019` P2 — live provider benchmark/routes/credentials/bootstrap unverified.
- later Admin/Student/assessment/offline stages incomplete.
- VPS/deployment future work only.

## 14. Administrative history

- Issues #13/#14/#15 are closed historical workstream evidence.
- Issue #16 is sole current execution ledger.
- Accidental placeholder Issues #18/#19/#20/#23 are not command/acceptance authority.

## 15. Update policy

After meaningful work update:

- `PROJECT_EXECUTION_QUEUE.md`;
- this file;
- `PROJECT_STATUS.md`;
- `PROJECT_ENGINEERING_LOG.md`;
- affected specialized docs;
- Issue #16 `EXECUTION REPORT`;
- Handoff/Index/Roadmap/Legacy Coverage whenever their truth changes.

Never leave continuation-critical information only in chat.
