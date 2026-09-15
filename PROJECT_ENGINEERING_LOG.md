# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-15 — Worker A sequence 58 closed corrected AB-03.2.4 with green source-tree-equivalent Stage13G evidence and selected the next Content-ingestion compatibility seam by fresh discovery.**

## Durable invariants

- `apps/admin-web` — Super Admin product.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL integrity authority.
- `apps/student-web` frontend implementation remains a separate workstream; Student-facing backend contracts remain owned here.
- Auth/authorization/entitlement/publication/revision/provenance/audit/assessment/offline authority stays server-owned.
- Never weaken tests/security/validation to satisfy a migration.

## Governance

Branch `rebuild/super-admin-foundation`; PR #52 remains Draft. Workers A/B/C use `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` as the serial handoff authority. Never auto-merge or rewrite shared history.

Live `main`: `d43fe2afe29b02093510177b921c0407e21a3de9`; no overlapping Admin/API/PostgreSQL/shared-contract drift is currently proven.

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

AB-03.2.4 corrected executable checkpoint is `045c1e63b7b34121492c2a26b5017aab4ec35055`. Green evidence: Architecture Guard `34908457279`; Frontend Preparation `34908457311`; Admin AI `34908457270`; successor Combined `34909883950`; successor Stage13G/PostgreSQL/Chromium `34909884028`.

### Worker A sequence 58 discovery

Fresh closure inspection found `apps/admin-web/src/admin/content/ContentIngestionWorkspace.tsx` still consuming Content-ingestion transport/types through root compatibility facade `../../content-ingestion-api`. The facade itself only re-exports `features/content/public`; therefore implementation ownership is already correct but compatibility debt remains.

Selected next smallest increment: **AB-03.2.5 — Content ingestion compatibility facade retirement**. Repoint remaining legitimate consumers to `features/content/public`, verify root facade/test consumers, and delete the facade only when unused. No AI implementation belongs in that increment.
