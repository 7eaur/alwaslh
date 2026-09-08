# PROJECT STATUS — الوسيلة الذكية

> الحالة التنفيذية المختصرة. Code/migrations + executable evidence أعلى من prose. للتفاصيل اقرأ `PROJECT_HANDOFF.md`, `PROJECT_ENGINEERING_LOG.md`, `PROJECT_INTEGRATION_CONTINUITY.md`, و`PROJECT_EXECUTION_QUEUE.md`.

Last synchronized: **2026-09-08 — Single Owner active; Stage13E candidate has four P1 root fixes plus one P2 snapshot-consistency hardening; executable verification still blocked before checkout.**

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
- Current Stage13E candidate/docs HEAD: `integration/stage13e-ai-operations @ bbefe54eb2d0bc6e4323df05c04e7b138f75ae72`.
- Latest Stage13E runtime/test HEAD beneath docs: `9d59f84fb516db5cfaf89382f548c3eea595e365`.

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
- one Output Detail response must come from one consistent database snapshot; audit page/count/latest/actor timestamps cannot be mixed across concurrent commits.

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

Key lineage: `d242e054...`, `f04fe2be...`, `e33d43c1...`, `9c18826a...`, `2c82e879...`, `72711ec8...`, `de3a9dc2...`, `bf782c92...`, `d7830d18...`, `f64419fa...`, `a1ef3d7a...`, `f95c1a9e...`, `6a9e9df0...`.

Architecture rule: paginated historical data is navigable evidence only; it never becomes canonical current lifecycle/review authority.

### AI-013E-OPS-005 — P2 Output Detail snapshot consistency

- After OPS-004, output row, requested audit page, total count and canonical latest revision were still separate top-level reads under PostgreSQL `READ COMMITTED`.
- A concurrent review commit between reads could produce an internally mixed response, e.g. newer `reviewStatus` with older `reviewedByProfileId/reviewedAt` or page/total metadata.
- No durable corruption occurs, but audit/read-model correctness is weakened.
- Fix `9d59f84fb516db5cfaf89382f548c3eea595e365`: all four reads execute inside one short `REPEATABLE READ` transaction; mapping/parsing happens after commit; no write locks or provider calls are introduced.
- Regression `apps/api/tests/ai-admin-output-detail-snapshot.test.ts` rejects any output-detail query outside the snapshot and asserts the isolation command is first while preserving approved state/actor/time/pagination mapping.

Status: **FIXED IN CANDIDATE / EXECUTION PENDING**.

## Stage13E Browser Contract

Real fixtures provide:

- Happy Job: **51 Units**, **51 Attempts**, open stable output with **101 append-only edit review revisions**.
- Race Job: terminal execution + open output for deterministic real stale-review `409`.
- Pagination Marker Job: deliberately old job plus 30 newer fillers, forcing later Jobs page.

Chromium suite contract covers:

1. complete Jobs/Units/Attempts pagination;
2. complete Review History >100 pagination;
3. latest-review authority while viewing oldest audit page;
4. pause/resume + approve + reload durability;
5. real session expiry;
6. real stale-review `409` canonical refresh;
7. 390px horizontal-overflow regression.

No mock API, route interception, fake 401/409, test-only endpoint, cookie forgery, or sleep-based race.

## Latest Executable Attempts

Workflow: `.github/workflows/stage13e-integration.yml`.

Latest **runtime/test-head** attempt:

- run `34277281675`;
- head `9d59f84fb516db5cfaf89382f548c3eea595e365`;
- job `102233304479`;
- conclusion `failure`, but `runner_id=0`, `runner_name=""`, `steps=[]`;
- no checkout or repository command executed.

Latest **candidate/docs-head** attempt:

- run `34277419491`;
- head `bbefe54eb2d0bc6e4323df05c04e7b138f75ae72`;
- job `102233751450`;
- conclusion `failure`, `runner_id=0`, `runner_name=""`, `steps=[]`.

The immediately previous candidate run `34275641643` was explicitly re-run unchanged; attempt 2 job `102231252401` also ended with `runner_id=0`, `steps=[]` before checkout.

Interpretation: **current executable blocker is GitHub hosted-runner allocation, not an executed product/test failure.** External account/platform root cause remains `NOT YET VERIFIED` with available permissions.

## Immediate Next Work

1. Keep Stage13E outside `main`.
2. Retain all four P1 fixes plus OPS-005 P2 snapshot hardening and regressions.
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
- `AI-011-005` P2 — direct generated-question persistence; Stage13F.
- `AI-012-019` P2 — live provider benchmark/routes/credentials/bootstrap unverified.
- later Admin/Student/assessment/offline/product stages incomplete.
- hosting/VPS is future work and not a development blocker.

## Startup Path

`README.md → DOCUMENTATION_INDEX.md → PROJECT_HANDOFF.md → PROJECT_STATUS.md → PROJECT_ENGINEERING_LOG.md → PROJECT_INTEGRATION_CONTINUITY.md → PROJECT_EXECUTION_QUEUE.md → CURRENT_PRODUCT_OVERRIDES.md → SINGLE_OWNER_OPERATING_MODEL.md → Issue #16 → current stage docs/code/tests`.
