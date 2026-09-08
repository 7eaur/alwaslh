# PROJECT HANDOFF — الوسيلة الذكية

> **Purpose:** أي محادثة هندسية بديلة يجب أن تستطيع استئناف المشروع بالكامل من GitHub بدون ذاكرة Chat سابقة.

Last synchronized: **2026-09-09 — Single Owner active; hosting deferred; Stage13E candidate hardened by four P1 root fixes plus three P2 fixes including bounded Job-list aggregation; executable verification still pending.**

## 0. Mandatory startup

Before changing code:

1. confirm repo `7eaur/alwaslh`;
2. treat `main` as latest Integration-approved development baseline;
3. read `README.md` → `DOCUMENTATION_INDEX.md` → this file → `PROJECT_STATUS.md` → `PROJECT_ENGINEERING_LOG.md` → `PROJECT_INTEGRATION_CONTINUITY.md` → `PROJECT_EXECUTION_QUEUE.md`;
4. read `docs/product/CURRENT_PRODUCT_OVERRIDES.md` and `docs/workstreams/SINGLE_OWNER_OPERATING_MODEL.md`;
5. read latest comments in Issue `#16`;
6. read current Stage docs + actual code/migrations/tests;
7. live-check `main`, active branch HEADs and Actions.

Anything not inspected/executed = `NOT YET VERIFIED`. If repository docs are insufficient to resume, fix documentation before feature work.

## 1. Operating / deployment model

One replaceable engineering conversation owns Product/Architecture/Backend/Frontend/UX/Security/Performance/QA/Git/Documentation. Issue `#16` is sole active Project Execution Board; Queue is ordered task authority; Continuity is detailed current memory. Issues #13/#14/#15 and former workstream docs are historical only.

**Hosting/deployment are fully deferred until Product Owner provides a VPS and explicitly reopens deployment.** No hosted-runtime/cutover/provider-hosting work now.

## 2. Repository / verified state

- Repository: `7eaur/alwaslh`.
- `main`: Integration-approved development baseline; central docs may advance independently of candidate runtime.
- Legacy archive: `archive/legacy-main-2026-09-08 @ 5d16c9ae5e4aa84a13c128da34b0e62f4ae28c06`.
- Latest fully executable green product baseline: `4eca7de8877ac9e2289b9c7990c912d33c256935`.
- Verified through Stage13D including Chromium where applicable.

Do not replace verified baseline with docs-only/unexecuted heads.

## 3. Stable architecture / business rules

- Browser owns presentation/session UX, not durable canonical business state.
- Full Code = 6 digits; Class Code = 7 digits.
- activation verification non-consuming; finalization atomic.
- returning Student = password + registered P-256 device proof.
- Curriculum = Class → Subject Offering (`subject_class_links`) → optional Section → Lesson.
- source inventory = provenance, not curriculum hierarchy.
- `media ready != published`; Stage13D publication = Draft → Review → Published.
- raw AI/provider output never becomes automatic Student/Question Bank authority.
- provider calls stay outside long DB transactions; durable workers remain separate from HTTP polling.
- credentials/provider metadata/internal provider errors never Frontend contract.
- no duplicate queue/pipeline/state authority.
- durable Admin operational/audit history is reachable through bounded server pagination.
- historical page selection never defines canonical current review authority.
- all multi-query Stage13E Admin AI read responses are snapshot-consistent.
- bounded Admin pages also bound expensive DB aggregation when query shape owns the cost; do not add speculative indexes before fixing query shape.
- no patching/test weakening/auth bypass/fake API/sleep-race masking.

## 4. Current Stage13E — Admin AI Operations / Review

Status: **COMBINED INTEGRATION CANDIDATE / NOT YET VERIFIED / OUTSIDE `main`**.

Active candidate/docs HEAD:

`integration/stage13e-ai-operations @ e9793a5222758a7d17aad08f91993cb7431631b7`

Latest runtime/test HEAD below docs:

`6efce1510231de5d569c4b96dbdffa3d4d488b31`

Historical source branches are evidence only: Backend `348c02646d0ff873fd305beff16f41c46d9c0285`; Frontend `1eb141e950e96c9f53ffd103a386d59166113c16`; Product/Test `7bf2f8c32907032551aace9f3aa27681040c4b0f`.

Candidate includes Admin Job/Unit/Attempt/Output observability, server-derived progress/actions, Stage12 controls, safe provider telemetry, provenance, append-only Stage11-validated review, stable-unit review boundary, authenticated Admin UI, canonical 409 refresh, bounded Jobs/Units/Attempts/Review History pagination, snapshot-consistent multi-query read models, bounded Job-list Unit aggregation, and real browser regressions. No Stage13F publication.

## 5. Stage13E audit fixes

### AI-013E-DB-001 — P1 durable reject reason
DB enforces nonblank reject reason; direct NULL/blank insert regression protects audit integrity.

### AI-013E-REVIEW-002 — P1 human review vs retry replacement
Review actions exist only for stable `completed | review_required` units. Review transaction locks output+unit before decision; non-stable outputs are inspection-only.

### AI-013E-OPS-003 — P1 Jobs/Units/Attempts pagination
Fixed first-page-only Admin history with bounded server pagination and real Jobs page 2 / Unit 51 / Attempt page 2 fixtures.

### AI-013E-OPS-004 — P1 Review History completeness / current-authority isolation
Fixed latest-100-only audit plus `history[0]` authority coupling with bounded Review History pagination and a separate canonical-latest review. Backend regression uses 105 revisions; real Chromium fixture uses 101 edits and proves old-page navigation cannot redefine current authority.

### AI-013E-OPS-005 — P2 Output Detail snapshot consistency
Fix `9d59f84fb516db5cfaf89382f548c3eea595e365` moves output/history/count/latest reads into one short `REPEATABLE READ` transaction. Regression: `apps/api/tests/ai-admin-output-detail-snapshot.test.ts`.

### AI-013E-OPS-006 — P2 Admin multi-query read-model consistency
Fix lineage `6a146c26...` → `f5c5dddf...` → `10f32c72...` generalizes one `readSnapshot()` policy to List Jobs, Job Detail, Unit Detail and Output Detail. Stage12 `allowedActions` is read inside the same Job Detail snapshot. Mutations keep existing write transactions.

### AI-013E-PERF-007 — P2 Admin Job-list bounded aggregation

`listJobs()` previously joined and aggregated Unit rows for the full matching durable Job history before applying its bounded page. A request for 30 Jobs could therefore perform work proportional to all matching Jobs/Units.

Root fix:

- `8501d2e0317c0e1e4eb83b72c997e321ee79fe81` — filter/order/page `ai_jobs` first, then correlated `LATERAL` Unit status counts only for selected Jobs; total count stays in the same repeatable-read snapshot.
- no new index or denormalized counter was added without executable plan evidence.
- `6efce1510231de5d569c4b96dbdffa3d4d488b31` — `apps/api/tests/ai-admin-job-list-query-shape.test.ts` protects the page-before-aggregation invariant and rejects the former global join shape.
- detailed record: `docs/ai/STAGE13E_ADMIN_AI_PERFORMANCE.md`.

All four P1 findings and OPS-005/OPS-006/PERF-007 P2 are **FIXED IN CANDIDATE / EXECUTION PENDING**.

Administrative continuity note: `tmp-ignore` was accidentally created on `main` while switching GitHub write method (`5916ac42f1d6ed216e0efe336b20a8f030d1f45e`) and immediately removed (`52fa960155964903290a78657029b3cb950bd6ee`). There is no net file/runtime effect.

## 6. Real Chromium / executable contract

Fixtures:

- Happy Job = 51 Units + 51 Attempts + 101 append-only review edits.
- Race Job = terminal execution + open output for deterministic real stale-review 409.
- Pagination Marker = deliberately old Job + 30 newer fillers.

Suite contract covers complete Jobs/Units/Attempts/Review History pagination, current-authority isolation while oldest page is viewed, pause/resume + approve + reload, real session expiry, stale-review 409 canonical refresh, and 390px no-horizontal-overflow. No mock API/fake error/test-only Backend endpoint/manual cookie mutation/sleep race.

Workflow: `.github/workflows/stage13e-integration.yml`.

Latest runtime/test-head attempt:

- run `34281631521`;
- head `6efce1510231de5d569c4b96dbdffa3d4d488b31`;
- job `102247518121`;
- `steps=[]`; no checkout or repository command executed.

Latest candidate/docs-head attempt:

- run `34281764765`;
- head `e9793a5222758a7d17aad08f91993cb7431631b7`;
- job `102247948380`;
- `steps=[]`; no repository command executed.

This is **not product failure evidence**. `CI-001` remains an external hosted-runner-allocation blocker; exact account/platform cause is `NOT YET VERIFIED`. Do not weaken gates and do not claim PASS.

## 7. Exact next work

1. keep Stage13E outside `main`;
2. retain all four P1 fixes + OPS-005/OPS-006/PERF-007 P2 hardenings and regressions;
3. execute unchanged Combined Gate when a real runner starts;
4. any executed failure → root-cause fix + regression;
5. Combined PASS → wider Stage9/10/OCR/11/12/13/13D/Full Rebuild same-head matrix;
6. wider PASS → integrate Stage13E runtime to `main`, update Legacy Coverage/Roadmap/central docs + Closure Report in Issue #16;
7. only then begin Stage13F;
8. hosting remains deferred.

## 8. Open findings

- `CI-001` P1 — runner terminates before checkout; external cause not verified.
- `AI-013E-DB-001` P1 — fixed, execution pending.
- `AI-013E-REVIEW-002` P1 — fixed, execution pending.
- `AI-013E-OPS-003` P1 — fixed, execution pending.
- `AI-013E-OPS-004` P1 — fixed, execution pending.
- `AI-013E-OPS-005` P2 — fixed, execution pending.
- `AI-013E-OPS-006` P2 — fixed, execution pending.
- `AI-013E-PERF-007` P2 — fixed, execution pending.
- `AI-011-005` P2 — Stage13F.
- `AI-012-019` P2 — live provider bootstrap unverified.

## 9. End-of-batch continuity rule

After meaningful work update: Queue, Continuity, Status, Engineering Log, specialized docs, Issue #16 report, and Handoff/Index/Roadmap/Legacy Coverage when truth changes. Record exact branch/HEAD/run IDs and explicit `NOT YET VERIFIED`. Never leave continuation-critical information only in chat.
