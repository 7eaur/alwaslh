# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-15 — Worker A sequence 73 solved the AB-03.2.5 blocker safely, closed that seam on exact-head green evidence, then implemented an adjacent same-slice direct-owner cleanup now waiting on final exact-head CI.**

## Durable invariants

- `apps/admin-web` — Super Admin product.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL integrity authority.
- `apps/student-web` frontend implementation remains a separate workstream; Student-facing backend contracts remain owned here.
- Auth/authorization/entitlement/publication/revision/provenance/audit/assessment/offline authority stays server-owned.
- Never weaken tests/security/validation to satisfy a migration.

## Governance

Branch `rebuild/super-admin-foundation`; PR #52 remains Draft. Workers A/B/C use `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` as the serial handoff authority. Never auto-merge or rewrite shared history.

Live `main`: `3646a63e36d9d9d967bdeb0c8a97ee65055cd672`. This main contains authoritative offline-content API/PostgreSQL changes; reconciliation is `REQUIRED / DEFERRED` before any overlapping backend/database mutation and before AB-08 final verification.

## AB-00 — DONE
## AB-01 — DONE / EXACT-HEAD VERIFIED
## AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

## AB-03 — ACTIVE

### AB-03.1 Overview + Operations — DONE / EXACT-SOURCE VERIFIED

Final executable source checkpoint: `7eda86fbbd7cbdcd5f2197ef35db7557c0d210dc`.

### AB-03.2 Curriculum + Content + OCR — ACTIVE

- AB-03.2.1 Curriculum frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED.
- AB-03.2.2 Content ingestion frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED.
- AB-03.2.3 Content operations + OCR frontend API ownership — DONE / EXACT-HEAD VERIFIED.
- AB-03.2.4 Content operations compatibility facade retirement — DONE / SOURCE-TREE-EQUIVALENT VERIFIED.
- AB-03.2.5 Content ingestion compatibility facade retirement — **DONE / EXACT-HEAD VERIFIED** at `7f4a07ebd138106e1c7701bc9820bf978c233643`.

### Worker A sequence 73

The prior AB-03.2.5 blocker was tooling-related: the remaining `ContentIngestionWorkspace.tsx` change was one import line, but previous whole-file mutation had caused large unrelated drift. Worker A solved this safely by reconstructing the live file exactly, changing only the Content ingestion import to `features/content/public`, mechanically comparing the diff, correcting even whitespace-only noise, and deleting the root facade only after confirming the existing transport test already consumed the feature public boundary.

AB-03.2.5 exact-head verification at `7f4a07e...` is green across Architecture Guard, Frontend Preparation, Admin AI, Combined Integration, Stage13G PostgreSQL/security/API gates and real Chromium.

The run then continued within the same coherent Curriculum/Content/OCR ownership context. Current source checkpoint `2dd1ca2a94f03b8299bc2f8759f634c56fc10f78` removes current-slice root-facade consumption where safe:

- Curriculum create/structure/UI types now use `features/curriculum/public` directly.
- Lesson authoring uses `shared/api/client` and `features/curriculum/public` directly.
- OCR source preview and lesson publication use `shared/api/client` directly.
- Compare from the last green checkpoint shows six files and import-boundary-only edits; no business/UI/API/PostgreSQL/security behavior change.

Exact-head CI on `2dd1ca2...` at handoff:

- Architecture Guard `34963907236` — SUCCESS.
- Frontend Preparation `34963907292` — SUCCESS.
- Admin AI `34963907259` — PENDING.
- Combined `34963907267` — IN PROGRESS.
- Stage13G/PostgreSQL/Chromium `34963907247` — IN PROGRESS.

Do not close AB-03.2 while these required exact-head gates remain unfinished. After they are green, perform a fresh slice-closure check; `ContentOperationsPage.tsx` still reaches generic `ApiRequestError` / session helpers through root `admin-api.ts`, but its actual Content/OCR transport ownership is already feature-correct. Remove that remaining generic compatibility dependency only if it can be patched mechanically without unsafe whole-file reconstruction.
