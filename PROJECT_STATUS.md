# PROJECT STATUS — الوسيلة الذكية

> الحالة التنفيذية المختصرة. Code/migrations + executable evidence أعلى من prose. للتفاصيل اقرأ `PROJECT_HANDOFF.md`, `PROJECT_ENGINEERING_LOG.md`, `PROJECT_INTEGRATION_CONTINUITY.md`, و`PROJECT_EXECUTION_QUEUE.md`.

Last synchronized: **2026-09-08 — Single Owner mode active; Stage13E audit fixed three P1 defects including durable-history pagination; executable verification still blocked before checkout.**

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
- Current Stage13E branch HEAD: `integration/stage13e-ai-operations @ 70f6fe218124498ccb6667e3aefa2e8dd21599a4`.
- Latest Stage13E runtime/test HEAD beneath that docs commit: `ae772db53e218037a2b140e9dc08e6528f1a1ac8`.

## Product / Architecture

الوسيلة الذكية منصة تعليمية عربية بسطحين مستقلين: Student Web/PWA وSuper Admin Web فوق Fastify API وPostgreSQL. الإدارة تدير المنهج والمحتوى والوسائط وOCR/AI ثم تنشئ authority تعليمية مراجعة/منشورة؛ الطالب يستهلك فقط المحتوى المصرح والمنشور ويتعلم ويتدرب ويحفظ بياناته حسب المراحل.

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
- Admin operational history must be completely reachable through **bounded server pagination**, never silently truncated or loaded unbounded into browser memory.

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

Combined branch was selectively assembled to avoid stale divergent history, then hardened by Single Owner audit.

### P1 root fixes in candidate

#### AI-013E-DB-001 — durable reject reason

- Product/HTTP required a reject reason but DB did not.
- Fix: `ai_output_review_events_reject_note_required` PostgreSQL constraint.
- Direct DB regressions verify NULL/blank rejection is forbidden.
- Redundant latest-review index removed because UNIQUE `(ai_output_id, revision)` already serves reverse latest lookup.

Key commits: `730989b8...`, `6589d6e5...`, `bc1bf508...`.

#### AI-013E-REVIEW-002 — review vs retry integrity

- Stage12 can replace the same `ai_outputs` row during retry/re-execution.
- Review events are append-only, so human review cannot be allowed while output is replaceable.
- Only `completed | review_required` units expose review actions.
- Review transaction locks output + owning unit together and rechecks execution stability before any event write.
- Failed/retrying/in-flight/cancelled outputs remain inspection-only.

Key commits: `5c03fa27...`, `6494a0ee...`, specialized contract `1e19ef06...`.

#### AI-013E-OPS-003 — durable operational history truncation

- Backend already supports bounded pagination, but Frontend previously showed only first **30 Jobs / 50 Units / 50 Attempts** and discarded `total/limit/offset`.
- Stage12 supports plans up to **5,000 units**, so valid durable operational records could become unreachable from the Admin product.
- Fix preserves server pagination end-to-end through adapter/view-model/controller/UI.
- Changing a parent page clears only lower-level selection; canonical refresh/polling remains on the current server pages.
- No unbounded browser loading was introduced.
- Accessible Previous/Next navigation added for Jobs, Units and Attempts, including responsive 390px behavior.

Implementation/testing commits:

- `92f4d0f8...` pagination contract/helpers;
- `8b932faa...` adapter metadata;
- `0974142f...` controller offsets and canonical refresh;
- `3411c1fd...` navigation UI;
- `38272670...` responsive CSS;
- `3ab137c9...`, `27de2d6f...`, `8dd1d712...` unit/adapter/transport regressions;
- `66ac7bd3...` / `ae772db5...` real PostgreSQL pagination fixture;
- `a9e97e34...` workflow fixture assertions;
- `c3420181...` real Chromium Jobs/Units/Attempts navigation;
- `70f6fe21...` specialized Admin documentation.

## Stage13E Browser Contract

Real fixture variables:

- `STAGE13E_E2E_JOB_TYPE=stage13e_e2e_happy`;
- `STAGE13E_E2E_RACE_JOB_TYPE=stage13e_e2e_race`;
- `STAGE13E_E2E_PAGINATION_JOB_TYPE=stage13e_e2e_pagination_marker`.

Fixture shapes:

- Happy: active Job with **51 units**, open review output, and **51 durable attempt rows** on the review unit.
- Race: terminal execution + open review output for deterministic real `409` race.
- Pagination marker: deliberately old Job plus 30 newer filler Jobs, guaranteeing the marker is only on a later Jobs page.

Chromium suite now covers:

1. complete durable Jobs/Units/Attempts history pagination;
2. authenticated Admin AI workspace;
3. pause/resume from server action authority;
4. approve + reload durability;
5. real same-BrowserContext session logout/expiry;
6. real stale-review `409` + canonical refresh;
7. 390px horizontal-overflow regression.

No mock API, route interception, fake 401/409, test-only Backend endpoint, cookie forgery or sleep-based race.

## Latest Executable Attempt

Workflow: `.github/workflows/stage13e-integration.yml`.

Latest runtime/test attempt after pagination hardening:

- run `34249182219`;
- head `ae772db53e218037a2b140e9dc08e6528f1a1ac8`;
- job `102138902680`;
- conclusion `failure`, but `runner_id=0`, `runner_name=""`, `steps=[]`;
- no checkout or repository command executed.

Earlier Stage13E runs show the same pre-checkout condition.

Interpretation: **current executable blocker is GitHub hosted-runner allocation, not an executed product/test failure.** External account/platform root cause remains `NOT YET VERIFIED` with available permissions.

## Immediate Next Work

1. Keep Stage13E outside `main`.
2. Retain all three P1 fixes and regressions.
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
- `AI-011-005` P2 — direct generated-question persistence; Stage13F.
- `AI-012-019` P2 — live provider benchmark/routes/credentials/bootstrap unverified.
- later Admin/Student/assessment/offline/product stages incomplete.
- hosting/VPS is future work and not a development blocker.

## Startup Path

`README.md → DOCUMENTATION_INDEX.md → PROJECT_HANDOFF.md → PROJECT_STATUS.md → PROJECT_ENGINEERING_LOG.md → PROJECT_INTEGRATION_CONTINUITY.md → PROJECT_EXECUTION_QUEUE.md → CURRENT_PRODUCT_OVERRIDES.md → SINGLE_OWNER_OPERATING_MODEL.md → Issue #16 → current stage docs/code/tests`.
