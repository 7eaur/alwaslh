# PROJECT INTEGRATION CONTINUITY — الوسيلة الذكية

> **Purpose:** الذاكرة التشغيلية التفصيلية لأي محادثة هندسية بديلة. يجب أن تستطيع الاستمرار من GitHub فقط بدون Chat history.
>
> **Authority:** current code + PostgreSQL migrations + executable evidence أعلى من هذا الملف. أي شيء غير مفحوص/غير منفذ = `NOT YET VERIFIED`.

Last synchronized: **2026-09-09 — Stage13E selective promotion completed and verified; Stage13F is READY / NOT STARTED.**

## 1. Resume procedure

1. Confirm repository `7eaur/alwaslh`.
2. Read `README.md` → `DOCUMENTATION_INDEX.md` → `PROJECT_HANDOFF.md` → `PROJECT_STATUS.md` → `PROJECT_RESUME_SNAPSHOT.md` → `PROJECT_ENGINEERING_LOG.md` → this file → `PROJECT_EXECUTION_QUEUE.md`.
3. Read `docs/product/CURRENT_PRODUCT_OVERRIDES.md` and `docs/workstreams/SINGLE_OWNER_OPERATING_MODEL.md`.
4. Read latest Issue `#16` comments.
5. Live-check `main`, Actions and current-stage code/tests before changing anything.

Do not depend on earlier Chat. Anything not inspected/executed = `NOT YET VERIFIED`.

## 2. Operating / hosting model

- Single replaceable engineering owner.
- Issue `#16` is sole execution ledger.
- Issues #13/#14/#15 are historical.
- Hosting/deployment fully deferred until VPS + explicit Product Owner reopening.
- Absence of VPS is not a development blocker.
- `main` is development/integration baseline, not deployment authority.

## 3. Stable architecture

- Browser does not own durable canonical business state.
- Full Code = 6 digits; Class Code = 7 digits.
- returning Student = password + registered P-256 device proof.
- Curriculum = Class → Subject Offering → optional Section → Lesson.
- source inventory = provenance, not curriculum hierarchy.
- `media ready != published`; publication = Draft → Review → Published.
- raw AI/provider output never automatic Student/Question Bank authority.
- provider calls stay outside long DB transactions.
- durable AI worker remains separate from Fastify HTTP.
- credentials/raw provider/internal errors stay out of browser contracts.
- no duplicate queue/lifecycle/storage authority.
- durable Admin history is reachable through bounded server pagination.
- historical audit pages never define canonical current review authority.
- coupled Admin AI read models use short repeatable-read snapshots.
- bounded pages must bound expensive DB work where the owning query can do so.
- HTTP pagination offsets must be safely representable end-to-end.
- no test weakening, fake API, auth bypass or sleep-based race hiding.

## 4. Stage13E final Git state

Accepted candidate:

`integration/stage13e-ai-operations @ 72ead8446af237392dc6d953c8e0c2382f468286`

- candidate exact-head verification: **12/12 SUCCESS**;
- PR #24: verification-only Draft, closed unmerged.

Selective promotion:

`integration/stage13e-promotion @ d5ebc7f25a369430387a758c7c0bb89350963d67`

- built from inspected latest main `e304d61286b9ca120db2dad695d29f4f1642e733`;
- exactly one promotion commit containing the accepted 36 Stage13E manifest files;
- no central-doc rollback or divergent candidate history;
- promotion exact-head verification: **12/12 SUCCESS**;
- PR #25: verification-only Draft, closed unmerged;
- `main` fast-forwarded non-force to `d5ebc7f...` after confirming `main` had not moved.

Documentation closure commits after this point can advance `main` while the verified runtime/application SHA remains `d5ebc7f...`.

## 5. Stage13E verified scope

Stage13E provides:

- Admin Jobs/Units/Attempts/Outputs observability;
- server-derived lifecycle progress/actions;
- Stage12 pause/resume/cancel/retry reuse;
- safe provider/model/project telemetry and provenance;
- append-only Stage11-validated review;
- stable-unit review boundary;
- authenticated Admin UI;
- canonical refresh on `409`;
- bounded Jobs/Units/Attempts/Review History pagination;
- independent canonical-latest review authority;
- repeatable-read multi-query snapshots;
- Job-list page-before-aggregation performance shape;
- safe pagination offset bounds;
- deterministic real browser fixtures and responsive coverage.

It does **not** publish to Stage13F Question Bank.

## 6. Findings closure

| ID | Sev | Final state |
|---|---:|---|
| `AI-013E-DB-001` | P1 | FIXED + VERIFIED |
| `AI-013E-REVIEW-002` | P1 | FIXED + VERIFIED |
| `AI-013E-OPS-003` | P1 | FIXED + VERIFIED |
| `AI-013E-OPS-004` | P1 | FIXED + VERIFIED |
| `AI-013E-OPS-005` | P2 | FIXED + VERIFIED |
| `AI-013E-OPS-006` | P2 | FIXED + VERIFIED |
| `AI-013E-PERF-007` | P2 | FIXED + VERIFIED |
| `AI-013E-API-008` | P2 | FIXED + VERIFIED |
| `CI-013E-009` | P1 | FIXED + VERIFIED |

`CI-013E-009` was workflow contract drift: standalone DB assertions were synchronized with current migration/Combined expectations. It was not a product/database defect.

Test-suite state pollution revealed after that fix was resolved in the owning CI isolation layer by resetting/reapplying migrations before Stage12/auth regressions. Production lifecycle behavior was not changed.

## 7. Promotion exact-head evidence

All SUCCESS on `d5ebc7f25a369430387a758c7c0bb89350963d67`:

- Combined Stage13E `34401502463`
- Stage13E standalone `34401549935`
- Stage13E Frontend Prep `34401549849`
- Rebuild `34401550016`
- Stage13 Admin `34401549835`
- Stage9 `34401549851`
- Stage10 `34401549989`
- OCR `34401549910`
- Stage11 `34401549927`
- Stage12 `34401549964`
- Stage13D Content Ingestion `34401550065`
- Stage13D Admin Upload UI `34401549903`

The Combined run executed real API/Admin quality, clean PostgreSQL migrations/contracts, backend authority/review/concurrency, isolated Stage12/auth regressions, real bootstrap/fixtures and real Chromium.

## 8. Historical CI-001

The earlier repository-wide hosted-runner allocation incident is **not currently blocking**. Real runners later executed all candidate and promotion gates successfully.

Exact historical external account/platform cause remains `NOT YET VERIFIED` because no account-side billing/usage/allocation telemetry proved it. Do not speculate or reopen it without new evidence.

## 9. Stage13F handoff boundary

Stage13F is **READY / NOT STARTED**.

Before implementation:

1. inventory actual existing Question Bank / quiz DB, API, Admin UI and tests;
2. classify each area KEEP / IMPROVE / REFACTOR / REBUILD / REMOVE;
3. resolve `AI-011-005` with reviewed Question Bank persistence, never raw provider authority;
4. preserve Stage11 typed validation, Stage12 execution and Stage13E review as existing authorities;
5. define canonical provenance and Draft→Review→Published lifecycle;
6. design Quiz Builder/versioning/regeneration/export without unstable question identity;
7. add PostgreSQL/API/Admin/real Chromium evidence;
8. run same-head wider regression closure.

Anything not inspected during Stage13F discovery = `NOT YET VERIFIED`.

## 10. Open boundaries

- `AI-011-005` P2 — Stage13F reviewed direct Question Bank persistence.
- `AI-012-019` P2 — live provider benchmark/routes/credentials/bootstrap `NOT YET VERIFIED`.
- `CI-001` historical external cause `NOT YET VERIFIED`, nonblocking.
- Stage13G+ remains future ordered work.
- deployment/VPS remains future-only.

## 11. Supporting closure docs

- `PROJECT_STATUS.md`
- `PROJECT_EXECUTION_QUEUE.md`
- `PROJECT_RESUME_SNAPSHOT.md`
- `MASTER_REBUILD_ROADMAP.md`
- `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md`
- `docs/integration/STAGE13E_PROMOTION_MANIFEST.md`
- Stage13E specialized docs under `docs/ai/` and `docs/admin/`
- Issue #16 closure report/current comments
