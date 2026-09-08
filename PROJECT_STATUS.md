# PROJECT STATUS — الوسيلة الذكية

> الحالة التنفيذية المختصرة. Code/migrations + executable evidence أعلى من prose. للتفاصيل اقرأ `PROJECT_HANDOFF.md`, `PROJECT_ENGINEERING_LOG.md`, `PROJECT_INTEGRATION_CONTINUITY.md`, و`PROJECT_EXECUTION_QUEUE.md`.

Last synchronized: **2026-09-09 — Single Owner active; Stage13E candidate has four P1 root fixes plus three P2 hardenings, including bounded Job-list aggregation; executable verification still blocked before checkout.**

## Current Position

- Repository: `7eaur/alwaslh`.
- Operating model: **ONE REPLACEABLE ENGINEERING OWNER** for Product/Architecture/Backend/Frontend/UX/Security/Performance/QA/Git/Documentation.
- Sole execution ledger: GitHub Issue `#16`.
- Sole ordered queue: `PROJECT_EXECUTION_QUEUE.md`.
- Issues `#13/#14/#15`: closed historical evidence only.
- `main`: latest Integration-approved **development baseline**, not a deployment branch.
- Hosting/deployment: **FULLY DEFERRED UNTIL VPS** and outside all current Stage gates.
- Legacy pre-rebuild archive: `archive/legacy-main-2026-09-08 @ 5d16c9ae5e4aa84a13c128da34b0e62f4ae28c06`.
- Latest fully executable green application baseline: `4eca7de8877ac9e2289b9c7990c912d33c256935`.
- Current product work: **Stage13E Admin AI Operations / Review — COMBINED CANDIDATE / NOT YET VERIFIED / OUTSIDE `main`**.
- Current Stage13E candidate/docs HEAD: `integration/stage13e-ai-operations @ e9793a5222758a7d17aad08f91993cb7431631b7`.
- Latest Stage13E runtime/test HEAD beneath docs: `6efce1510231de5d569c4b96dbdffa3d4d488b31`.

## Product / Architecture

الوسيلة الذكية منصة تعليمية عربية بسطحين مستقلين: Student Web/PWA وSuper Admin Web فوق Fastify API وPostgreSQL. الإدارة تدير المنهج والمحتوى والوسائط وOCR/AI ثم تنشئ authority تعليمية مراجعة/منشورة؛ الطالب يستهلك فقط المحتوى المصرح والمنشور.

Stable boundaries:

- Browser لا يملك auth/entitlements/publication/jobs/trusted scoring أو durable canonical business state.
- Full Code = 6 digits; Class Code = 7 digits.
- returning Student = password + registered P-256 device proof.
- Curriculum = Class → Subject Offering → optional Section → Lesson.
- source inventory = provenance, not curriculum hierarchy.
- `media ready != published`.
- Stage13D publication = Draft → Review → Published.
- raw AI/provider output is never automatic Student/Question Bank authority.
- provider calls stay outside long DB transactions.
- durable AI worker remains separate from Fastify HTTP.
- no duplicate lifecycle/queue/storage authority.
- no test weakening/auth bypass/fake API/sleep-based race hiding.
- durable Admin operational/audit history must be completely reachable through **bounded server pagination**, never silently truncated or loaded unbounded into browser memory.
- a historical page is **never canonical current authority**; current review state/actions come from the latest durable revision independently of the page being viewed.
- any multi-query Admin AI read model must assemble one response from one short repeatable-read database snapshot; page/total, progress/actions and latest-history authority cannot mix concurrent committed states.
- bounded Admin pages must also bound expensive database aggregation work when query shape can do so directly; do not add speculative indexes before fixing the owning query shape.

## Current Definition of Done

A Stage closes only with applicable same-head evidence:

1. code/contracts/architecture review;
2. lint + strict typecheck;
3. unit tests;
4. integration tests;
5. clean PostgreSQL migrations/constraints/concurrency checks;
6. build;
7. Admin/Student Chromium + responsive/a11y where applicable;
8. security/performance/legacy regression review;
9. wider same-head regressions when changed surfaces require them;
10. central/specialized docs + Legacy Coverage/Roadmap synchronized.

Hosted deployment is not part of Definition of Done until VPS work is explicitly reopened.

## Fully Verified Baseline

Exact executable head: `4eca7de8877ac9e2289b9c7990c912d33c256935`.

| Gate | Run | Result |
|---|---:|---|
| Stage13D Admin Upload UI | `34177369743` | SUCCESS |
| Stage13D Content Ingestion | `34177369784` | SUCCESS |
| Stage13 Admin Product | `34177369748` | SUCCESS |
| Stage12 AI Execution | `34177369812` | SUCCESS |
| Stage11 AI Contracts | `34177369753` | SUCCESS |
| OCR Foundation | `34177369750` | SUCCESS |
| Stage10 Media Pipeline | `34177369777` | SUCCESS |
| Stage9 Content Import | `34177369756` | SUCCESS |
| Full Rebuild | `34177369768` | SUCCESS incl. Student Chromium |

Do not replace this baseline until a newer matrix actually executes green.

## Stage Ledger

| Stage | State |
|---|---|
| Stage1–10 | VERIFIED |
| OCR Foundation | VERIFIED |
| Stage11 Provider-neutral AI Contracts | VERIFIED |
| Stage12 Durable AI Execution/Runtime | VERIFIED backend/runtime; live provider bootstrap unverified |
| Stage13A Curriculum Backend | VERIFIED |
| Stage13B Admin Curriculum UI | VERIFIED incl. Chromium |
| Stage13C Content/Media/OCR | VERIFIED incl. Chromium |
| Stage13D Upload/History/Publication Linking | VERIFIED incl. Chromium |
| Stage13E Admin AI Operations / Review | **COMBINED CANDIDATE / NOT YET VERIFIED** |
| Stage13F Question Bank / Quiz Builder | BLOCKED by Stage13E closure |
| Stage13G Remaining Admin | REQUIRED later |
| Stage14–25 Product/Hardening | REQUIRED later |
| Stage26–29 Staging/Release/Operations | future; deployment reopens only when VPS exists |

## Stage13E Audit Fixes in Candidate

### AI-013E-DB-001 — P1 durable reject reason

PostgreSQL now enforces nonblank reject reason, not only HTTP/service validation. Direct DB regression protects the row-level audit invariant.

### AI-013E-REVIEW-002 — P1 review vs retry integrity

Human review is available only when owning unit is `completed | review_required`. Review transaction locks output + unit together so Stage12 retry cannot replace content beneath an earlier human decision.

### AI-013E-OPS-003 — P1 Jobs / Units / Attempts truncation

Frontend previously exposed only first **30 Jobs / 50 Units / 50 Attempts**. End-to-end bounded server pagination now preserves independent offsets, current-page refresh/polling, responsive navigation, and real fixtures with 51 Units/51 Attempts plus a later Jobs page.

### AI-013E-OPS-004 — P1 Review History truncation + page/current-authority coupling

- Original output detail returned only newest **100** append-only review events with no total/offset.
- Older human audit revisions were unreachable.
- Original service also derived current `reviewStatus`, effective reviewed output and review actions from `history[0]`; a naive offset patch would therefore make an old history page appear current.
- Backend now returns `reviewPagination { total, limit, offset }` and resolves the canonical latest review independently.
- `reviewStatus`, `allowedReviewActions`, and `effectiveReviewedOutput` always come from canonical latest revision, independent of selected historical page.
- Frontend preserves an independent Review History offset alongside Jobs/Units/Attempts offsets and keeps it during polling, refresh and 409 reload.
- Backend regression seeds **105** revisions and proves revision 105 still controls authority while viewing revisions 5..1.
- Real E2E fixture seeds **101** edit revisions. Chromium contract navigates all pages, reaches revision 1, approves while oldest page is displayed, then proves revision 102/current state and reload durability.

### AI-013E-OPS-005 — P2 Output Detail snapshot consistency

Fix `9d59f84fb516db5cfaf89382f548c3eea595e365` moves output/history/count/latest reads into one short `REPEATABLE READ` snapshot. Regression: `apps/api/tests/ai-admin-output-detail-snapshot.test.ts`.

### AI-013E-OPS-006 — P2 Admin multi-query read-model consistency

Fix lineage `6a146c26...` → `f5c5dddf...` → `10f32c72...` generalizes one `readSnapshot()` policy to List Jobs, Job Detail, Unit Detail and Output Detail. Stage12 `allowedActions` is read inside the same Job Detail snapshot. Mutations keep existing write transactions.

### AI-013E-PERF-007 — P2 bounded Job-list aggregation

- `listJobs()` originally performed `ai_jobs LEFT JOIN ai_job_units`, grouped all matching durable history, and only then applied `LIMIT/OFFSET`.
- Fix `8501d2e0317c0e1e4eb83b72c997e321ee79fe81` pages `ai_jobs` first, then computes Unit status counts only for selected Jobs via correlated `LATERAL` aggregation.
- No speculative index/denormalized counter was added; query shape was the root cause.
- Regression `6efce1510231de5d569c4b96dbdffa3d4d488b31`: `apps/api/tests/ai-admin-job-list-query-shape.test.ts` requires page-before-aggregation and rejects the former global-join shape.
- Specialized detail: `docs/ai/STAGE13E_ADMIN_AI_PERFORMANCE.md`.

All four P1 and three P2 findings are **FIXED IN CANDIDATE / EXECUTION PENDING**.

## Stage13E Browser Contract

Real fixtures provide:

- Happy Job: **51 Units**, **51 Attempts**, open stable output with **101 append-only edit review revisions**.
- Race Job: terminal execution + open output for deterministic real stale-review `409`.
- Pagination Marker Job: deliberately old job plus 30 newer fillers, forcing later Jobs page.

Chromium suite contract covers complete Jobs/Units/Attempts/Review History pagination, current-authority isolation, pause/resume + approve + reload, real session expiry, stale-review `409`, and 390px overflow. No mock API/fake errors/test-only endpoint/sleep race.

## Latest Executable Attempts

Workflow: `.github/workflows/stage13e-integration.yml`.

Latest **runtime/test-head** attempt:

- run `34281631521`;
- head `6efce1510231de5d569c4b96dbdffa3d4d488b31`;
- job `102247518121`;
- `steps=[]`; no checkout/repository command executed.

Latest **candidate/docs-head** attempt:

- run `34281764765`;
- head `e9793a5222758a7d17aad08f91993cb7431631b7`;
- attempt `2`;
- job `102250318378`;
- `runner_id=0`, `runner_name=""`, `steps=[]`;
- completed before checkout; no repository command executed.

Interpretation: **current executable blocker is GitHub hosted-runner allocation, not an executed product/test failure.** External account/platform root cause remains `NOT YET VERIFIED` with available permissions.

## Immediate Next Work

1. Keep Stage13E outside `main`.
2. Retain all four P1 fixes plus OPS-005/OPS-006/PERF-007 P2 hardenings and regressions.
3. Re-run the unchanged combined Stage13E gate when a real runner is allocated.
4. Any executed failure → root-cause fix in owning layer + regression.
5. Combined PASS → wider Stage9/10/OCR/11/12/13/13D/Full Rebuild same-head regressions.
6. Wider PASS → promote accepted Stage13E runtime to `main` while preserving latest central docs.
7. Update Legacy Coverage/Roadmap/central docs and add Stage13E Closure Report to Issue #16.
8. Only then begin Stage13F.

## Open Boundaries

- `CI-001` P1 — hosted runner terminates before checkout; external cause `NOT YET VERIFIED`.
- `AI-013E-DB-001` P1 — fixed in candidate; executable verification pending.
- `AI-013E-REVIEW-002` P1 — fixed in candidate; executable verification pending.
- `AI-013E-OPS-003` P1 — fixed in candidate; executable verification pending.
- `AI-013E-OPS-004` P1 — fixed in candidate; executable verification pending.
- `AI-013E-OPS-005` P2 — fixed in candidate; executable verification pending.
- `AI-013E-OPS-006` P2 — fixed in candidate; executable verification pending.
- `AI-013E-PERF-007` P2 — fixed in candidate; executable verification pending.
- `AI-011-005` P2 — direct generated-question persistence; Stage13F.
- `AI-012-019` P2 — live provider benchmark/routes/credentials/bootstrap unverified.
- later Admin/Student/assessment/offline/product stages incomplete.
- hosting/VPS is future work and not a development blocker.

## Startup Path

`README.md → DOCUMENTATION_INDEX.md → PROJECT_HANDOFF.md → PROJECT_STATUS.md → PROJECT_ENGINEERING_LOG.md → PROJECT_INTEGRATION_CONTINUITY.md → PROJECT_EXECUTION_QUEUE.md → CURRENT_PRODUCT_OVERRIDES.md → SINGLE_OWNER_OPERATING_MODEL.md → Issue #16 → current stage docs/code/tests`.
