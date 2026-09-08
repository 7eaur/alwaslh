# PROJECT HANDOFF — الوسيلة الذكية

> **Purpose:** أي محادثة هندسية بديلة يجب أن تستطيع استئناف المشروع بالكامل من GitHub بدون ذاكرة Chat سابقة.

Last synchronized: **2026-09-09 — Single Owner active; hosting deferred; Stage13E candidate has four P1 + four P2 fixes, final static audit found no additional proven defect, closure + zero-overlap selective-promotion readiness are prepared, executable verification still blocked before checkout.**

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
- accepted pagination offsets must be safely representable end-to-end; unsafe offsets fail at the HTTP boundary as `400 BAD_REQUEST` before service/DB execution.
- Stage13E progress uses the Stage12 lifecycle calculation; no parallel progress authority.
- no patching/test weakening/auth bypass/fake API/sleep-race masking.

## 4. Current Stage13E — Admin AI Operations / Review

Status: **COMBINED INTEGRATION CANDIDATE / EXECUTION PENDING / NOT YET VERIFIED / OUTSIDE `main`**.

Active candidate/docs HEAD:

`integration/stage13e-ai-operations @ c48d1e597497e6054340f71235c78937082b9371`

Latest runtime/test HEAD below docs:

`d60218b518fb0fe453c21386e77cd35a2228ad07`

Historical source branches are evidence only: Backend `348c02646d0ff873fd305beff16f41c46d9c0285`; Frontend `1eb141e950e96c9f53ffd103a386d59166113c16`; Product/Test `7bf2f8c32907032551aace9f3aa27681040c4b0f`.

Candidate includes Admin Job/Unit/Attempt/Output observability, server-derived progress/actions, Stage12 controls, safe provider telemetry, provenance, append-only Stage11-validated review, stable-unit review boundary, authenticated Admin UI, canonical 409 refresh, bounded Jobs/Units/Attempts/Review History pagination, snapshot-consistent multi-query read models, bounded Job-list Unit aggregation, safe pagination input bounds, and real browser regressions. No Stage13F publication.

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

`listJobs()` previously joined and aggregated Unit rows for the full matching durable Job history before applying its bounded page. Root fix `8501d2e0...` pages Jobs first; `6efce151...` protects the page-before-aggregation invariant. No speculative index/denormalized counter was added without executable plan evidence. Detailed record: `docs/ai/STAGE13E_ADMIN_AI_PERFORMANCE.md`.

### AI-013E-API-008 — P2 safe pagination offset boundary

Stage13E offsets were only validated as non-negative JavaScript integers. Values beyond `Number.MAX_SAFE_INTEGER` could pass validation and reach PostgreSQL pagination as a representation/database error instead of client `400`.

Root fix and regression:

- `887f772df927c8d24df0003b76b9cb7ea0313e15` — shared `PaginationOffsetSchema` bounds all four offsets (`offset`, `unitOffset`, `attemptOffset`, `reviewOffset`) to `0..Number.MAX_SAFE_INTEGER`.
- `d60218b518fb0fe453c21386e77cd35a2228ad07` — `apps/api/tests/ai-admin-pagination-bounds.test.ts` exercises real Fastify route/error handling and proves unsafe values are rejected before service execution while the maximum safe integer remains accepted.
- regression is already part of existing API unit gate (`tests/*.test.ts`); workflow was not weakened or changed.
- detailed record: `docs/ai/STAGE13E_ADMIN_AI_HTTP_VALIDATION.md`.

All four P1 findings and OPS-005/OPS-006/PERF-007/API-008 P2 findings are **FIXED IN CANDIDATE / EXECUTION PENDING**.

Administrative continuity note: `tmp-ignore` was accidentally created on `main` while switching GitHub write method (`5916ac42f1d6ed216e0efe336b20a8f030d1f45e`) and immediately removed (`52fa960155964903290a78657029b3cb950bd6ee`). There is no net file/runtime effect.

## 6. Final static closure audit

Latest static pass checked:

- HTTP/body/query validation vs PostgreSQL schema;
- UUID/status/note/pagination representation boundaries;
- Stage13E progress/status calculation vs Stage12 lifecycle authority;
- review/mutation canonical refresh behavior;
- historical-page/current-authority separation;
- multi-query snapshot consistency;
- Job-list query shape/index use;
- regression inclusion in the Combined Gate.

Result: **no additional proven Stage13E defect after API-008**. Do not add speculative fixes merely because CI does not allocate a runner.

## 7. Real Chromium / executable contract

Fixtures:

- Happy Job = 51 Units + 51 Attempts + 101 append-only review edits.
- Race Job = terminal execution + open output for deterministic real stale-review 409.
- Pagination Marker = deliberately old Job + 30 newer fillers.

Suite contract covers complete Jobs/Units/Attempts/Review History pagination, current-authority isolation while oldest page is viewed, pause/resume + approve + reload, real session expiry, stale-review 409 canonical refresh, and 390px no-horizontal-overflow. No mock API/fake error/test-only Backend endpoint/manual cookie mutation/sleep race.

Workflow: `.github/workflows/stage13e-integration.yml`.

Latest runtime/test-head attempt:

- run `34283353562`;
- head `d60218b518fb0fe453c21386e77cd35a2228ad07`;
- job `102253102885`;
- `steps=[]`; no checkout or repository command executed.

Latest candidate/docs-head attempt:

- run `34283442253`;
- head `c48d1e597497e6054340f71235c78937082b9371`;
- attempt `2`;
- job `102256556365`;
- `runner_id=0`, `runner_name=""`, `steps=[]`;
- no checkout or repository command executed.

This is **not product failure evidence**. `CI-001` remains an external hosted-runner-allocation blocker; exact account/platform cause is `NOT YET VERIFIED`. Do not weaken gates and do not claim PASS.

Local fallback was explicitly checked: `/mnt/data/alwaslh-stage13e` is an empty directory, not a checkout. Node/npm/git exist, but npm registry access times out and no authenticated private-repository checkout is available. No local PASS is claimed.

## 8. Closure + promotion readiness

Prepared while EXEC-004 remains externally blocked:

- `MASTER_REBUILD_ROADMAP.md` records Stage13E as `COMBINED CANDIDATE / EXECUTION PENDING`, not “current next”;
- `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` adds `CANDIDATE / EXECUTION PENDING` and maps candidate evidence without marking unexecuted rows VERIFIED;
- candidate-targeted rows include `LES-A-035/036/037`, `AIRULE-025`, `AI-OPS-012/013/014/015/017`;
- full page-detection batch-save authoring, bulk generation trigger, complete generated/manual editor/delete flows, exports and Stage13F Question Bank publication remain not closed;
- Stage13F remains explicitly blocked until Stage13E combined + wider regression closure.

Promotion readiness is documented in `docs/integration/STAGE13E_PROMOTION_MANIFEST.md`:

- common merge base audited: `1069aabc5a921b38ca6c8e4bb4bf801f83fc2455`;
- candidate changed 36 Stage13E files; audited `main` changed 19 central/workstream/deployment-portability files since the same base;
- **changed-file intersection = 0**;
- do not merge/cherry-pick the candidate's stale 53-commit history;
- after candidate combined + wider PASS, re-check latest heads/overlap, build `integration/stage13e-promotion` from latest `main`, overlay only the manifest's 36 files, then run combined + wider gates again on that exact promotion HEAD before `main` promotion;
- if `main` moves before final promotion, rebuild/reverify rather than carrying stale assumptions.

Do not create the promotion branch now; without executable candidate evidence it would only create another unverified head and failed runner trigger.

## 9. Exact next work

1. keep Stage13E outside `main`;
2. retain all four P1 fixes + OPS-005/OPS-006/PERF-007/API-008 P2 hardenings and regressions;
3. execute unchanged Combined Gate when a real runner starts;
4. any executed failure → root-cause fix + regression;
5. Combined PASS → wider Stage9/10/OCR/11/12/13/13D/Full Rebuild same-head matrix on candidate;
6. follow `docs/integration/STAGE13E_PROMOTION_MANIFEST.md`, assemble/reverify exact promotion HEAD from latest `main`;
7. promotion-head PASS → integrate to `main`, convert only actually proven candidate legacy rows to VERIFIED, update central/closure docs + Closure Report in Issue #16;
8. only then begin Stage13F;
9. hosting remains deferred.

## 10. Open findings

- `CI-001` P1 — runner terminates before checkout; external cause not verified.
- `AI-013E-DB-001` P1 — fixed, execution pending.
- `AI-013E-REVIEW-002` P1 — fixed, execution pending.
- `AI-013E-OPS-003` P1 — fixed, execution pending.
- `AI-013E-OPS-004` P1 — fixed, execution pending.
- `AI-013E-OPS-005` P2 — fixed, execution pending.
- `AI-013E-OPS-006` P2 — fixed, execution pending.
- `AI-013E-PERF-007` P2 — fixed, execution pending.
- `AI-013E-API-008` P2 — fixed, execution pending.
- `AI-011-005` P2 — Stage13F.
- `AI-012-019` P2 — live provider bootstrap unverified.

## 11. End-of-batch continuity rule

After meaningful work update: Queue, Continuity, Status, Engineering Log, specialized docs, Issue #16 report, and Handoff/Index/Roadmap/Legacy Coverage when truth changes. Record exact branch/HEAD/run IDs and explicit `NOT YET VERIFIED`. Never leave continuation-critical information only in chat.
