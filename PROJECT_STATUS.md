# PROJECT STATUS — الوسيلة الذكية

> الحالة التنفيذية المختصرة. Code/migrations + executable evidence أعلى من prose. للتفاصيل اقرأ `PROJECT_HANDOFF.md`, `PROJECT_ENGINEERING_LOG.md`, `PROJECT_INTEGRATION_CONTINUITY.md`, و`PROJECT_EXECUTION_QUEUE.md`.

Last synchronized: **2026-09-09 — Single Owner active; Stage13E candidate has four P1 root fixes plus four P2 hardenings, including safe HTTP pagination offsets; executable verification still blocked before checkout.**

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

## Stage13E Browser Contract

Real fixtures provide 51 Units, 51 Attempts, 101 review edits, a deterministic stale-review race Job and a later-page marker Job. Chromium covers complete pagination, canonical latest authority, pause/resume, approve/reload, session expiry, stale-review 409 and 390px overflow with no fake API/test-only endpoint/sleep race.

## Latest Executable Attempts

Workflow: `.github/workflows/stage13e-integration.yml`.

Latest runtime/test-head attempt:

- run `34283353562`;
- head `d60218b518fb0fe453c21386e77cd35a2228ad07`;
- job `102253102885`;
- conclusion `failure`, but `steps=[]` and no checkout/repository command executed.

Interpretation: **current executable blocker is GitHub hosted-runner allocation, not an executed product/test failure.** External account/platform root cause remains `NOT YET VERIFIED` with available permissions.

## Immediate Next Work

1. Keep Stage13E outside `main`.
2. Retain all four P1 fixes plus OPS-005/OPS-006/PERF-007/API-008 P2 hardenings and regressions.
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
- `AI-013E-API-008` P2 — fixed in candidate; executable verification pending.
- `AI-011-005` P2 — direct generated-question persistence; Stage13F.
- `AI-012-019` P2 — live provider benchmark/routes/credentials/bootstrap unverified.
- later Admin/Student/assessment/offline/product stages incomplete.
- hosting/VPS is future work and not a development blocker.

## Startup Path

`README.md → DOCUMENTATION_INDEX.md → PROJECT_HANDOFF.md → PROJECT_STATUS.md → PROJECT_ENGINEERING_LOG.md → PROJECT_INTEGRATION_CONTINUITY.md → PROJECT_EXECUTION_QUEUE.md → CURRENT_PRODUCT_OVERRIDES.md → SINGLE_OWNER_OPERATING_MODEL.md → Issue #16 → current stage docs/code/tests`.
