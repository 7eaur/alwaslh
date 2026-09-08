# PROJECT INTEGRATION CONTINUITY — الوسيلة الذكية

> **Purpose:** الذاكرة التشغيلية التفصيلية لأي محادثة هندسية بديلة. يجب أن تستطيع الاستمرار من GitHub فقط بدون Chat history.
>
> **Authority:** current code + PostgreSQL migrations + executable evidence أعلى من هذا الملف. أي شيء غير مفحوص/غير منفذ = `NOT YET VERIFIED`.

Last synchronized: **2026-09-09 — Single Owner; Stage13E candidate has four P1 root fixes plus three P2 hardenings, including bounded Job-list aggregation; executable runner still unavailable before checkout.**

## 1. Resume procedure

1. Confirm repository `7eaur/alwaslh`.
2. Read `README.md` → `DOCUMENTATION_INDEX.md` → `PROJECT_HANDOFF.md` → `PROJECT_STATUS.md` → `PROJECT_ENGINEERING_LOG.md` → this file → `PROJECT_EXECUTION_QUEUE.md`.
3. Read `docs/product/CURRENT_PRODUCT_OVERRIDES.md`, `docs/workstreams/SINGLE_OWNER_OPERATING_MODEL.md`, latest Issue `#16` comments, and current-stage specialized docs/code/migrations/tests.
4. Live-check `main`, active candidate branch and GitHub Actions before conclusions.

Do not depend on earlier chat. Anything not inspected/executed = `NOT YET VERIFIED`.

## 2. Operating / hosting model

One replaceable engineering conversation owns Product/Architecture/Backend/Frontend/UX/Security/Performance/QA/Git/Documentation. Issue `#16` is the sole active execution ledger; Queue is ordered task authority; #13/#14/#15 are historical.

**Deployment/hosting are fully deferred until Product Owner provides a VPS and explicitly reopens them.** Lack of VPS is not a development blocker.

## 3. Stable product architecture

**الوسيلة الذكية** is an Arabic education platform with Student Web/PWA, Super Admin Web, Fastify API, PostgreSQL, durable media/OCR/AI pipelines and reviewed publication authorities.

Stable rules include:

- Browser does not own durable canonical business state.
- Full Code = 6 digits; Class Code = 7 digits.
- activation verification non-consuming; completion atomic.
- returning Student = password + registered P-256 device proof.
- Curriculum = Class → Subject Offering (`subject_class_links`) → optional Section → Lesson.
- source inventory = provenance, not curriculum hierarchy.
- `media ready != published`; Stage13D publication = Draft → Review → Published.
- raw provider/AI output never becomes automatic Student/Question Bank authority.
- provider calls stay outside long DB transactions; durable AI worker remains separate from Fastify HTTP.
- secrets/credential aliases/provider metadata/internal error text never Frontend contract.
- no duplicate queue/lifecycle/storage authority.
- operational/audit history is reachable through bounded server pagination.
- historical-page selection never defines current authority.
- every Stage13E Admin AI response assembled from multiple PostgreSQL queries uses one short `REPEATABLE READ` snapshot.
- bounded HTTP pagination must also bound expensive DB aggregation where the query can enforce that directly; query-shape root causes are fixed before speculative indexing.

## 4. Verified application baseline

Latest fully executable green head:

`4eca7de8877ac9e2289b9c7990c912d33c256935`

Verified through Stage13D. Same-head runs remain recorded in `PROJECT_STATUS.md`. Never replace this baseline with unexecuted/docs-only heads.

## 5. Git / current stage state

- Stage13E runtime is **not** in `main`.
- active candidate: `integration/stage13e-ai-operations`.
- current candidate/docs HEAD: `e9793a5222758a7d17aad08f91993cb7431631b7`.
- latest runtime/test HEAD below docs: `6efce1510231de5d569c4b96dbdffa3d4d488b31`.
- legacy archive: `archive/legacy-main-2026-09-08 @ 5d16c9ae5e4aa84a13c128da34b0e62f4ae28c06`.

Historical source branches are evidence only: Backend `348c02646d0ff873fd305beff16f41c46d9c0285`; Frontend `1eb141e950e96c9f53ffd103a386d59166113c16`; Product/Test `7bf2f8c32907032551aace9f3aa27681040c4b0f`.

Administrative note: an accidental temporary file `tmp-ignore` was created on `main` in `5916ac42f1d6ed216e0efe336b20a8f030d1f45e` while changing GitHub write method, then removed immediately in `52fa960155964903290a78657029b3cb950bd6ee`. The resulting tree returned to the intended state; no runtime/product file or behavior was affected.

## 6. Stage13E candidate scope

Candidate provides Admin Jobs/Units/Attempts/Outputs read models, server-derived progress/actions, Stage12 pause/resume/cancel/retry reuse, safe provider/model/project telemetry, provenance, append-only Stage11-validated edit/approve/reject review, stable-unit review boundary, authenticated Admin UI, canonical refresh after 409, bounded Jobs/Units/Attempts/Review History pagination, snapshot-consistent read models, bounded Job-list aggregation, and real browser fixtures. It does **not** publish to Stage13F Question Bank.

## 7. Stage13E audit findings

### AI-013E-DB-001 — P1 durable reject-note invariant
Fixed with PostgreSQL nonblank reject constraint + direct insert regression. `FIXED IN CANDIDATE / EXECUTION PENDING`.

### AI-013E-REVIEW-002 — P1 review/retry integrity
Review only for stable `completed | review_required` units; output+unit locked before mutation. Non-stable outputs inspection-only. `FIXED IN CANDIDATE / EXECUTION PENDING`.

### AI-013E-OPS-003 — P1 Jobs/Units/Attempts truncation
Fixed end-to-end bounded pagination with real fixtures proving later Jobs page, Unit 51 and Attempt page 2. `FIXED IN CANDIDATE / EXECUTION PENDING`.

### AI-013E-OPS-004 — P1 Review History completeness / authority isolation
Original Output Detail exposed only latest 100 review events and derived current authority from `history[0]`. Fixed with bounded `reviewLimit/reviewOffset`, `reviewPagination`, independent canonical-latest query, independent Frontend review offset and real >100 Chromium fixture. Historical pages are audit evidence only; current state/actions/effective output come only from latest durable revision. `FIXED IN CANDIDATE / EXECUTION PENDING`.

### AI-013E-OPS-005 — P2 Output Detail snapshot consistency

Original output/page/count/latest reads were separate default snapshots. Fix `9d59f84fb516db5cfaf89382f548c3eea595e365` moves them into one short `REPEATABLE READ` transaction. Regression: `apps/api/tests/ai-admin-output-detail-snapshot.test.ts`.

Status: `FIXED IN CANDIDATE / EXECUTION PENDING`.

### AI-013E-OPS-006 — P2 Admin multi-query read-model consistency

List Jobs, Job Detail and Unit Detail also had multi-query response parts from different committed moments. Fix lineage `6a146c26...` → `f5c5dddf...` → `10f32c72...` generalizes `readSnapshot()` to all multi-query Admin AI reads and proves Stage12 `allowedActions` stays inside the same Job Detail snapshot.

Status: `FIXED IN CANDIDATE / EXECUTION PENDING`.

### AI-013E-PERF-007 — P2 Admin Job-list bounded aggregation

**Original defect:** `listJobs()` performed `ai_jobs LEFT JOIN ai_job_units`, grouped all matching durable Jobs/Units, sorted, then applied `LIMIT/OFFSET`. A bounded 30-row HTTP page could therefore aggregate Unit history for the full matching Job history.

**Root fix:** `8501d2e0317c0e1e4eb83b72c997e321ee79fe81` filters/orders/pages `ai_jobs` first in a `page` CTE. Unit status counts are then computed only for Jobs in that page through a correlated `LATERAL` aggregate. The existing total count stays in the same repeatable-read snapshot. Job ordering and zero-Unit semantics are preserved.

**Why no new index:** query shape was the proven root cause. Existing Job→Unit indexes can serve `u.job_id = p.id`; additional indexes require executable plan/benchmark evidence rather than speculation.

**Regression:** `6efce1510231de5d569c4b96dbdffa3d4d488b31` adds `apps/api/tests/ai-admin-job-list-query-shape.test.ts`, which rejects a global Job→Unit join, requires the page `LIMIT/OFFSET` before Unit aggregation, and preserves parameters/count/snapshot behavior.

**Specialized doc:** `docs/ai/STAGE13E_ADMIN_AI_PERFORMANCE.md`.

Status: `FIXED IN CANDIDATE / EXECUTION PENDING`.

## 8. Browser / executable gate

Real fixtures: Happy Job = 51 Units + 51 Attempts + 101 review edits; Race Job = terminal execution + open output for real stale-review 409; Pagination Marker = old Job + 30 newer fillers.

Chromium contract covers complete Jobs/Units/Attempts/Review History navigation, latest-authority isolation while old page is open, pause/resume, approve/reload, session expiry, stale-review 409, and 390px overflow. No mock/fake API or sleep race.

Workflow: `.github/workflows/stage13e-integration.yml`.

Latest runtime/test-head run:

- `34281631521` on `6efce1510231de5d569c4b96dbdffa3d4d488b31`;
- job `102247518121`;
- `steps=[]`; no checkout or repository command executed.

Latest candidate/docs-head run:

- `34281764765` on `e9793a5222758a7d17aad08f91993cb7431631b7`;
- attempt `2`;
- job `102250318378`;
- `runner_id=0`, `runner_name=""`, `steps=[]`;
- completed before checkout; no repository command executed.

The workflow explicitly runs `npm test --prefix apps/api`, and API `test:unit` is `node --import tsx --test tests/*.test.ts`, so the new `ai-admin-job-list-query-shape.test.ts` is inside the unchanged executable gate rather than orphaned test code.

No executed product/test failure exists on the current candidate. `CI-001` remains P1 external hosted-runner allocation; exact external/account cause is `NOT YET VERIFIED`.

Local fallback check on 2026-09-09 found no repository checkout in the execution container and no DNS access to private GitHub, so no local PASS is claimed.

## 9. Exact next action

1. Keep Stage13E outside `main`.
2. Retain all four P1 fixes plus OPS-005/OPS-006/PERF-007 P2 hardenings and regressions.
3. Execute unchanged Combined Gate when a real runner is allocated.
4. Any command that actually executes and fails → root-cause fix + regression.
5. Combined PASS → wider same-head Stage9/10/OCR/11/12/13/13D/Full Rebuild matrix.
6. Wider PASS → integrate Stage13E runtime into `main`, update Legacy Coverage/Roadmap/closure docs and Issue #16.
7. Only then begin Stage13F.
8. Hosting stays deferred until explicit VPS command.

## 10. Open findings

- `CI-001` P1 — runner terminates before checkout; external cause unverified.
- `AI-013E-DB-001` P1 — fixed, execution pending.
- `AI-013E-REVIEW-002` P1 — fixed, execution pending.
- `AI-013E-OPS-003` P1 — fixed, execution pending.
- `AI-013E-OPS-004` P1 — fixed, execution pending.
- `AI-013E-OPS-005` P2 — fixed, execution pending.
- `AI-013E-OPS-006` P2 — fixed, execution pending.
- `AI-013E-PERF-007` P2 — fixed, execution pending.
- `AI-011-005` P2 — Stage13F direct-question persistence.
- `AI-012-019` P2 — live provider benchmark/routes/credentials/bootstrap unverified.
- remaining later Admin/Student/product stages incomplete.
