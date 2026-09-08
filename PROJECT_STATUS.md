# PROJECT STATUS — الوسيلة الذكية

> الحالة التنفيذية المختصرة. Code/migrations + executable evidence أعلى من prose. للتفاصيل اقرأ `PROJECT_HANDOFF.md`, `PROJECT_ENGINEERING_LOG.md`, `PROJECT_INTEGRATION_CONTINUITY.md`, و`PROJECT_EXECUTION_QUEUE.md`.

Last synchronized: **2026-09-08 — Single Owner mode active; Stage13E static audit completed with two P1 integrity root fixes; executable verification still blocked before checkout.**

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
- Current Stage13E branch HEAD: `integration/stage13e-ai-operations @ 1e19ef06807516ce6869a821dfcbf6fa6ba51bf9`.
- Latest runtime/test candidate beneath the docs head: `6494a0ee232cf646eae693054b129db752aee40e`.

## Product / Architecture

الوسيلة الذكية منصة تعليمية عربية بسطحين مستقلين: Student Web/PWA وSuper Admin Web فوق Fastify API وPostgreSQL. الإدارة تدير المنهج والمحتوى والوسائط وOCR/AI ثم تنشر authority موثوقة؛ الطالب يستهلك فقط المحتوى المصرح والمنشور ويتعلم ويتدرب ويحفظ بياناته حسب المراحل.

Stable boundaries:

- Browser لا يملك auth/entitlements/publication/jobs/trusted scoring أو أي durable canonical business state.
- Full Code = 6 digits; Class Code = 7 digits.
- returning Student = password + registered P-256 device proof.
- Curriculum = Class → Subject Offering → optional Section → Lesson.
- source inventory = provenance, not curriculum hierarchy.
- `media ready != published`.
- Stage13D publication = explicit Draft → Review → Published.
- raw AI/provider output is never automatic Student/Question Bank authority.
- provider calls outside long DB transactions.
- durable AI worker remains separate from Fastify HTTP.
- no duplicate lifecycle/queue/storage authority.
- no test weakening/auth bypass/fake API/sleep-based race hiding.

## Current Definition of Done

A Stage closes only with applicable same-head evidence:

1. code/contracts/architecture review;
2. lint + strict typecheck;
3. unit tests;
4. integration tests;
5. clean PostgreSQL migrations/constraints/concurrency checks where applicable;
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

## Stage13E Current Candidate

Historical source candidates remain evidence only:

- Backend `348c02646d0ff873fd305beff16f41c46d9c0285`.
- Frontend branch `1eb141e950e96c9f53ffd103a386d59166113c16`; Product/Test `7bf2f8c32907032551aace9f3aa27681040c4b0f`.

Combined branch was selectively assembled to avoid stale divergent history, then hardened by static audit:

- `227f4c9dba99e7b8c93d25caebe86e38108d4a5c` — Backend overlay;
- `a60274fedf55fb45b6684743da24b24004339917` — Frontend overlay;
- `4ba77703866762c471257bbb914590b817ecc82e` — deterministic real DB/browser fixtures;
- `807f733838e2fab2620652025b255c3bc404fec1` — combined workflow;
- `730989b8bde404b229544c473bba02b05c7e75b4` — DB reject-reason invariant + redundant-index removal;
- `6589d6e53de7ca8cd82b424e5c1496186eb701f1` — direct PostgreSQL reject-reason regression;
- `bc1bf508897796d0a74d22126094e83180b7ec79` — combined DB contract gate update;
- `083992bc7b0b7edf0c88e0b029cc49e10aeca345` — DB-integrity specialized contract sync;
- `5c03fa27f90cd10df06a9e0b7c5e2c0c768e653a` — bind review authority to stable unit state and lock output+unit together;
- `6494a0ee232cf646eae693054b129db752aee40e` — failed/retrying output regression with zero audit side effects;
- `1e19ef06807516ce6869a821dfcbf6fa6ba51bf9` — specialized contract synchronized with stable-review invariant.

### Static audit results

The actual Stage13E HTTP/service/lifecycle/cancel/retry/output persistence/review/validator/frontend adapter/controller/workspace/migration/fixture/workflow code was inspected.

Two confirmed P1 defects were fixed at their owning layers:

#### AI-013E-DB-001 — durable reject reason missing at PostgreSQL boundary

- HTTP/service already required a nonblank reject reason.
- Original migration allowed a future/direct DB writer to persist `reject` with NULL/blank note.
- Fix: `ai_output_review_events_reject_note_required` DB check.
- Regression directly attempts NULL/blank reject inserts and expects PostgreSQL rejection.
- Redundant latest-review index removed because UNIQUE `(ai_output_id, revision)` already serves latest revision through backward btree scan.

#### AI-013E-REVIEW-002 — stale human review could survive output replacement

- Stage12 can update the same `ai_outputs` row during retry/re-execution.
- Original Stage13E review authority did not gate review by `ai_job_units.status`, while review events remain append-only on the output id.
- Impact: a review decision on a failed/retrying output could remain after Stage12 replaced the generated content.
- Fix: only unit status `completed | review_required` exposes review actions; all other output states remain inspection-only.
- Mutation locks `ai_outputs` + owning `ai_job_units` together and returns `409` before writing an event when execution is not stable.
- Regression creates real failed/retrying units with outputs, asserts `allowedReviewActions=[]`, mutations `409`, and zero review events.

No other confirmed duplicate authority or cross-contract defect was found in the inspected Stage13E surfaces.

All latest fixes remain `NOT YET VERIFIED` until executable gates run.

## Stage13E Browser Contract

Real fixtures:

- `stage13e_e2e_happy`: non-terminal job + open valid review output + queued unit.
- `stage13e_e2e_race`: terminal execution + open valid output to preserve deterministic stale UI for a real out-of-band review mutation.

Chromium suite covers:

- authenticated Admin AI workspace;
- pause/resume from server action authority;
- approve + reload durability;
- real same-BrowserContext session logout/expiry;
- real stale-review `409` + canonical refresh;
- 390px horizontal-overflow regression.

No mock API, route interception, fake 401/409, test-only Backend endpoint, cookie forgery or sleep-based race.

## Latest Executable Attempts

Workflow: `.github/workflows/stage13e-integration.yml`.

Latest runtime/test attempt:

- run `34199202570`;
- head `6494a0ee232cf646eae693054b129db752aee40e`;
- job `101973855894`;
- conclusion `failure`, but no executable steps were allocated (`steps=null` / no checkout).

Latest branch-head documentation attempt:

- run `34199371763`;
- head `1e19ef06807516ce6869a821dfcbf6fa6ba51bf9`;
- job `101974393620`;
- same pre-checkout condition.

Previous post-fix runs `34197944201`, `34197629003`, and earlier combined run `34193380473` attempts 1/2 had the same condition.

Interpretation: **GitHub hosted-runner allocation is the only current executable-verification blocker.** There is still no executed failure attributable to the Stage13E product/migration/tests.

## Immediate Next Work

1. Keep Stage13E outside `main`.
2. Keep the two root-cause fixes; do not churn code to chase runner allocation.
3. When a runner is actually allocated, execute the unchanged combined gate on current candidate HEAD.
4. Fix any executed failure from root cause and retain/add regression coverage.
5. After combined PASS, run the wider Stage9/10/OCR/11/12/13/13D/Full Rebuild matrix required by changed surfaces.
6. Promote accepted Stage13E runtime to `main` while preserving latest central docs.
7. Update Legacy Coverage/Roadmap/central docs and add Stage13E Closure Report to Issue #16.
8. Only then begin Stage13F under current dependency rules.

## Open Boundaries

- `CI-001` P1 — GitHub hosted-runner allocation before checkout; external cause `NOT YET VERIFIED`.
- `AI-013E-DB-001` P1 — fixed in candidate; executable verification pending.
- `AI-013E-REVIEW-002` P1 — fixed in candidate; executable verification pending.
- `AI-011-005` P2 — direct generated-question persistence; Stage13F.
- `AI-012-019` P2 — live provider benchmark/routes/credentials/bootstrap unverified.
- later Admin/Student/assessment/offline/product stages incomplete.
- hosting/VPS is future work and not a development blocker.

## Startup Path

`README.md → DOCUMENTATION_INDEX.md → PROJECT_HANDOFF.md → PROJECT_STATUS.md → PROJECT_ENGINEERING_LOG.md → PROJECT_INTEGRATION_CONTINUITY.md → PROJECT_EXECUTION_QUEUE.md → CURRENT_PRODUCT_OVERRIDES.md → SINGLE_OWNER_OPERATING_MODEL.md → Issue #16 → current stage docs/code/tests`.
