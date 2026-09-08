# PROJECT STATUS — الوسيلة الذكية

> الحالة التنفيذية المختصرة. Code/migrations + executable evidence أعلى من prose. للتفاصيل اقرأ `PROJECT_HANDOFF.md`, `PROJECT_ENGINEERING_LOG.md`, `PROJECT_INTEGRATION_CONTINUITY.md`, و`PROJECT_EXECUTION_QUEUE.md`.

Last synchronized: **2026-09-09 — Single Owner active; Stage13E has four P1 + four P2 fixes in candidate, final static audit found no additional proven defect, closure + selective-promotion readiness are prepared; CI-001 scope is now verified repository-wide while exact external cause remains unverified.**

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
- Current Stage13E candidate/docs HEAD: `integration/stage13e-ai-operations @ c48d1e597497e6054340f71235c78937082b9371`.
- Latest Stage13E runtime/test HEAD beneath docs: `d60218b518fb0fe453c21386e77cd35a2228ad07`.

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
- accepted pagination offsets must be safely representable end-to-end; invalid/unsafe offsets are rejected at HTTP validation before service/DB execution.
- Stage13E progress semantics reuse the Stage12 lifecycle calculation; no duplicate progress authority exists.

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
| Stage13E Admin AI Operations / Review | **COMBINED CANDIDATE / EXECUTION PENDING / NOT YET VERIFIED** |
| Stage13F Question Bank / Quiz Builder | BLOCKED by Stage13E closure |
| Stage13G Remaining Admin | REQUIRED later |
| Stage14–25 Product/Hardening | REQUIRED later |
| Stage26–29 Staging/Release/Operations | future; deployment reopens only when VPS exists |

## Stage13E Audit Fixes in Candidate

### AI-013E-DB-001 — P1 durable reject reason
PostgreSQL enforces nonblank reject reason; direct DB regression protects audit integrity.

### AI-013E-REVIEW-002 — P1 review vs retry integrity
Human review is available only when owning unit is `completed | review_required`; review locks output+unit together.

### AI-013E-OPS-003 — P1 Jobs / Units / Attempts truncation
Bounded end-to-end pagination makes later Jobs/Units/Attempts reachable and preserves current-page refresh/polling.

### AI-013E-OPS-004 — P1 Review History completeness / authority isolation
Bounded Review History pagination plus independent canonical-latest review prevents historical-page selection from redefining current state/action authority.

### AI-013E-OPS-005 — P2 Output Detail snapshot consistency
`9d59f84f...` moves output/history/count/latest reads into one short `REPEATABLE READ` snapshot.

### AI-013E-OPS-006 — P2 Admin multi-query read-model consistency
`6a146c26...` → `f5c5dddf...` → `10f32c72...` generalizes one snapshot policy to List Jobs, Job Detail, Unit Detail and Output Detail.

### AI-013E-PERF-007 — P2 bounded Job-list aggregation
`8501d2e0...` pages Jobs before Unit aggregation; `6efce151...` regression rejects the old global-join query shape.

### AI-013E-API-008 — P2 safe pagination offset boundary

- Original Stage13E offsets accepted any non-negative JavaScript integer, including integer-looking values beyond the safe-integer range.
- Fix `887f772df927c8d24df0003b76b9cb7ea0313e15` introduces one shared `PaginationOffsetSchema` with `0..Number.MAX_SAFE_INTEGER` for Jobs, Units, Attempts and Review History offsets.
- Invalid unsafe offsets now fail through `parseBody` as `400 BAD_REQUEST` before service/DB execution.
- Final regression `d60218b518fb0fe453c21386e77cd35a2228ad07`: `apps/api/tests/ai-admin-pagination-bounds.test.ts` uses real Fastify routing/error mapping and proves all four unsafe offsets are rejected while `Number.MAX_SAFE_INTEGER` remains accepted.
- The regression is automatically included by `npm test --prefix apps/api`; no workflow weakening/change was required.
- Specialized detail: `docs/ai/STAGE13E_ADMIN_AI_HTTP_VALIDATION.md`.

All four P1 and four P2 findings are **FIXED IN CANDIDATE / EXECUTION PENDING**.

## Stage13E Final Static Closure Audit

Final inspection covered HTTP/body/query validation, UUID/status/note/schema alignment, Stage12 progress authority reuse, mutation/canonical-refresh behavior, Review History/current-authority separation, snapshot consistency, Job-list query shape/index use and regression inclusion in the Combined Gate.

**Result:** no additional proven Stage13E defect after `AI-013E-API-008`. Do not add speculative changes merely because executable CI is unavailable.

## Stage13E Browser Contract

Real fixtures provide 51 Units, 51 Attempts, 101 review edits, a deterministic stale-review race Job and a later-page marker Job. Chromium covers complete pagination, canonical latest authority, pause/resume, approve/reload, session expiry, stale-review 409 and 390px overflow with no fake API/test-only endpoint/sleep race.

## CI-001 — Repository-wide Actions runner incident

`CI-001` is now **scope VERIFIED repository-wide / exact root cause NOT YET VERIFIED**.

Evidence:

- Last known fully executing green run: Full Rebuild `34177369768` on `4eca7de...`, created `2026-09-08T01:39:16Z`, completed SUCCESS `2026-09-08T01:43:19Z`; its jobs executed real `Set up job`, container initialization, `actions/checkout@v4`, setup/install/test/database/browser steps.
- Independent Stage10 Media Pipeline run `34191051851` / job `101949023395` later failed before checkout with `steps=null`.
- Independent Stage11 AI Contract run `34191051835` / job `101949023152` later failed before checkout with `steps=null`.
- Stage13E candidate/docs run `34283442253` was explicitly re-run again as attempt `3`; new job `102266150322` completed `failure` with `steps=[]`, and its log endpoint has no blob because no job log was produced.
- GitHub public status reported **no Actions incident for September 8, 2026**, so this is not classified as a known global outage.
- Repository owner permission is confirmed `admin`, but connected GitHub tooling does not expose account/repository Actions usage, billing, budget, or allocation settings. Those exact account-side causes remain unverified.
- GitHub documentation confirms private repositories consume plan/account GitHub-hosted runner allowance and can be blocked when available usage/payment policy does not allow additional consumption; this is a diagnostic possibility only, not a finding about this account.
- Local fallback is independently unavailable: `/mnt/data/alwaslh-stage13e` is empty/not a checkout, and the execution container currently cannot resolve `github.com` or `registry.npmjs.org`; `git ls-remote` fails at DNS.

Detailed incident record: `docs/integration/GITHUB_ACTIONS_RUNNER_INCIDENT.md`.

Interpretation: **there is no executed Stage13E product/test failure to fix.** Do not alter workflow semantics, weaken gates, or churn runtime code because jobs never acquire a runner.

## Closure + Promotion Readiness

Prepared while EXEC-004 is externally blocked:

- `MASTER_REBUILD_ROADMAP.md` records Stage13E as combined candidate/execution pending and Stage13F as ordered-blocked;
- `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` distinguishes `CANDIDATE / EXECUTION PENDING` from VERIFIED and maps relevant Stage13E legacy rows without overclaiming acceptance;
- candidate-targeted legacy rows include `LES-A-035/036/037`, `AIRULE-025`, `AI-OPS-012/013/014/015/017`;
- complete page-detection batch-save authoring, bulk-generation trigger, full generated/manual editors, exports and Stage13F Question Bank publication remain explicitly not closed;
- promotion audit at merge base `1069aabc5a921b38ca6c8e4bb4bf801f83fc2455` found candidate 53 commits ahead/current audited main 77 commits ahead, but **zero changed-file overlap** between the 36 Stage13E files and the 19 files changed on `main` since that base;
- `docs/integration/STAGE13E_PROMOTION_MANIFEST.md` is the exact 36-file promotion authority;
- after candidate combined + wider PASS, a short-lived promotion branch must be built from latest `main`, only manifest files overlaid, then combined + wider gates rerun on that exact promotion HEAD before `main` promotion.

Do not merge the candidate's stale commit history and do not create the promotion branch before executable candidate evidence exists.

## Immediate Next Work

1. Keep Stage13E outside `main`.
2. Preserve all four P1 fixes plus OPS-005/OPS-006/PERF-007/API-008 P2 hardenings and regressions unchanged.
3. Resolve/restore GitHub-hosted runner allocation through an administrative channel that can inspect Actions usage/budget/payment/settings; do not guess the exact account-side cause from repository code.
4. Re-run the **unchanged** combined Stage13E gate only after real runner allocation is available.
5. A recovery is recognized only when a runner executes setup/checkout. Any command that then fails → root-cause fix in owning layer + regression.
6. Combined PASS → wider Stage9/10/OCR/11/12/13/13D/Full Rebuild same-head regressions on candidate.
7. Follow `docs/integration/STAGE13E_PROMOTION_MANIFEST.md`; build/reverify exact promotion HEAD from latest `main`.
8. Promotion-head PASS → promote to `main`, convert only actually proven candidate legacy rows to VERIFIED, update closure docs and add Stage13E Closure Report to Issue #16.
9. Only then begin Stage13F.

## Open Boundaries

- `CI-001` P1 — **repository-wide scope VERIFIED; exact account/platform runner-allocation cause NOT YET VERIFIED**.
- `AI-013E-DB-001` P1 — fixed in candidate; executable verification pending.
- `AI-013E-REVIEW-002` P1 — fixed in candidate; executable verification pending.
- `AI-013E-OPS-003` P1 — fixed in candidate; executable verification pending.
- `AI-013E-OPS-004` P1 — fixed in candidate; executable verification pending.
- `AI-013E-OPS-005` P2 — fixed in candidate; executable verification pending.
- `AI-013E-OPS-006` P2 — fixed in candidate; executable verification pending.
- `AI-013E-PERF-007` P2 — fixed in candidate; executable verification pending.
- `AI-013E-API-008` P2 — fixed in candidate; executable verification pending.
- `AI-011-005` P2 — direct generated-question persistence; Stage13F.
- `AI-012-019` P2 — live provider benchmark/routes/credentials/bootstrap unverified.
- later Admin/Student/assessment/offline/product stages incomplete.
- hosting/VPS is future work and not a development blocker.

## Startup Path

`README.md → DOCUMENTATION_INDEX.md → PROJECT_HANDOFF.md → PROJECT_STATUS.md → PROJECT_ENGINEERING_LOG.md → PROJECT_INTEGRATION_CONTINUITY.md → PROJECT_EXECUTION_QUEUE.md → CURRENT_PRODUCT_OVERRIDES.md → SINGLE_OWNER_OPERATING_MODEL.md → Issue #16 → current stage docs/code/tests`.
