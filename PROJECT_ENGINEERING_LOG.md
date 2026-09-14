# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-15 — Worker B sequence 56 corrected AB-03.2.4 test ownership after exact-head typecheck exposed a stale root dependency; corrected verification is running.**

## Durable invariants

- `apps/admin-web` — Super Admin product.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL integrity authority.
- `apps/student-web` frontend implementation remains a separate workstream; Student-facing backend contracts remain owned here.
- Auth/authorization/entitlement/publication/revision/provenance/audit/assessment/offline authority stays server-owned.
- Never weaken tests/security/validation to satisfy a migration.

## Governance

Branch `rebuild/super-admin-foundation`; PR #52 remains Draft. Workers A/B/C use `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` as the serial handoff authority. Never auto-merge or rewrite shared history.

Live `main` latest observation: `d43fe2afe29b02093510177b921c0407e21a3de9`. Current drift remains Student frontend/PWA work, with no discovered overlapping Admin/API/PostgreSQL/shared-contract implementation change for the current AB-03.2 work.

## AB-00 — DONE

Architecture baseline, inventories, guardrails and readiness are closed.

## AB-01 — DONE / EXACT-HEAD VERIFIED

Admin transport/session/product-state foundations, bounded backend app-composition seams and shared request-validation ownership are closed.

## AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Global shell, inner routing, lazy workflow boundaries and auth login presentation ownership are closed.

## AB-03 — ACTIVE

Canonical record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

### AB-03.1 Overview + Operations — DONE / EXACT-SOURCE VERIFIED

Final executable source checkpoint: `7eda86fbbd7cbdcd5f2197ef35db7557c0d210dc`.

### AB-03.2 Curriculum + Content + OCR — ACTIVE

#### AB-03.2.1 Curriculum frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Curriculum implementation ownership is under `features/curriculum`; corrected executable checkpoint `4cd3daf2408d91c5bafaaec559220d402ee169bb` is covered by green Architecture Guard `34887051028`, Frontend Preparation `34887051091`, Admin AI `34887416193`, Combined `34887416088`, and Stage13G `34887416108`.

#### AB-03.2.2 Content ingestion frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Content ingestion implementation ownership is under `features/content/api/content-ingestion-api.ts`; corrected source checkpoint `4ba7106f910098841a7026114dcfa2f2cd1f83bf` is covered by green Architecture Guard `34891198234`, Admin AI `34892857039`, Combined `34892857011`, and Stage13G `34892857278`.

#### AB-03.2.3 Content operations + OCR frontend API ownership — DONE / EXACT-HEAD VERIFIED

Implementation/types live in `apps/admin-web/src/features/content/api/content-operations-api.ts` and are exposed through `apps/admin-web/src/features/content/public`. Executable/source checkpoint `866912f4640aa4696b896a1d897bff7ad67024f4` is covered by Architecture Guard `34898665849`, Frontend Preparation `34898665740`, Admin AI Operations `34898665783`, Combined Integration `34898665724`, and Stage13G Admin Operations / PostgreSQL / Chromium `34898665675`, all SUCCESS.

#### AB-03.2.4 Content operations compatibility facade retirement — CORRECTED / WAITING_FOR_CI

Worker A sequence 55 repointed `ContentOperationsPage.tsx` to `features/content/public` and deleted root `apps/admin-web/src/content-operations-api.ts`. Exact-head Frontend Preparation `34906963113` then failed Admin typecheck with TS2307 because the root test still imported the deleted facade.

Worker B sequence 56 fixed the root ownership issue without restoring compatibility code: `apps/admin-web/src/content-operations-api.test.ts` was moved unchanged to `apps/admin-web/src/features/content/api/content-operations-api.test.ts`, beside the transport implementation it verifies. No production API/PostgreSQL/security/UI/Student contract changed.

Corrected executable/source checkpoint: `045c1e63b7b34121492c2a26b5017aab4ec35055`.

Verification evidence so far: Architecture Guard `34908457279` — SUCCESS; Frontend Preparation `34908457311` — SUCCESS; Admin AI `34908457270` — IN PROGRESS; Combined `34908457265` — IN PROGRESS; Stage13G Admin Operations / PostgreSQL / Chromium `34908457306` — IN PROGRESS.

AB-03.2.4 remains open until remaining required gates finish green. The next worker must verify these exact-source runs or source-tree-equivalent successors before starting another seam.
