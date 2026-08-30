# PROJECT STATUS

- **Current Phase:** Stage 9 Content Model & deterministic `alwaslh-go` Import is **COMPLETE / CLI + PostgreSQL RUNTIME PASS**. Stage 10 Media Pipeline is next, but must not begin until CI passes again on this documentation head.
- **Verification Policy:** every stage requires executable evidence. Official states: `DESIGN PASS` / `CLI PASS` / `RUNTIME PASS` / `RELEASE PASS`; anything not executed remains `NOT YET VERIFIED`.
- **Continuity Source:** read `PROJECT_HANDOFF.md` first, then this file, `PROJECT_ENGINEERING_LOG.md`, `PRODUCT_FEATURE_PARITY_MATRIX.md`, and `MASTER_REBUILD_ROADMAP.md`.
- **Latest Verified Stage 9 Code Baseline:** branch `rebuild/content-import`, commit `30d12d24be93bf306a9da5fffcfb45ea9317a186`.
- **Stage 9 Dedicated Verification:** GitHub Actions run `33294631418` — **SUCCESS**.
- **Full Regression Verification on same commit:** GitHub Actions run `33294631419` — **SUCCESS** across the complete rebuild verification workflow.

## Completed

- **Stage 1 Product Contract:** **CLI PASS.** Feature-preservation contract and automated parity checks.
- **Stage 2 Brand Identity:** **CLI PASS.** Owned teal/open-book identity, canonical assets/tokens/PWA icons and automated brand checks.
- **Stage 3 UX Architecture:** **CLI PASS.** Admin/Student IA, critical flows/states, responsive/accessibility contracts and wireframes.
- **Stage 4 PostgreSQL Data Platform:** **CLI/RUNTIME PASS on PostgreSQL 16.** Clean-slate private PostgreSQL behind Backend; migrations and relational integrity verified on clean DBs.
- **Stage 5 Engineering Foundation:** **CLI/RUNTIME PASS.** API runtime, DB pool/transactions, migration runner, env validation, logging/error envelope, strict TS, tests, production builds and CI.
- **Stage 6 Auth & Authorization:** **CLI/RUNTIME PASS.** Salted scrypt credentials, opaque sessions, HttpOnly cookies, role isolation, Origin protection, DB lockout, reset-only recovery and explicit Admin bootstrap.
- **Stage 7 Access Codes & Entitlements:** **CLI/RUNTIME PASS.** Secure 6/7-digit codes, Arabic/Persian normalization, transactional/idempotent redemption, renewal, no-waste behavior, revoke/audit, constraints and race tests.
- **Stage 8 Student Activation & Account Flow:** **CLI/RUNTIME/BROWSER E2E PASS.** Atomic activation + returning login + recovery + real Chromium integration.
- **Stage 9 Content Model & deterministic `alwaslh-go` Import:** **CLI/PostgreSQL RUNTIME PASS.** Full pinned inventory, manifest compatibility, deterministic ordering, provenance, repeatable DB import and reconciliation verified.

## Stage 9 verified source/import facts

Pinned source: `7eaur/alwaslh-go@f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`.

```text
15 subject roots
48 source documents
5,552 source images
4,218 JPG
1,334 WEBP
86 recognized helper files
24 manifest.json files
0 fatal inventory issues
0 manifest errors
0 order errors
0 unmapped images
0 unparsed assets
0 classification errors
0 expected-count errors
```

Canonical inventory SHA-256:

`7b6c6e1e79d90cf68a72bc473c12ce23bf39c462708dcd10bc313fd535fbe729`

The inventory reports **100 duplicate Git-blob groups covering 201 paths**. They are retained as review evidence, not auto-rejected, because repeated educational pages can be intentional.

### Runtime import proof

Clean PostgreSQL 16 applied `0001_core.sql` through `0008_content_source_import.sql`.

First import:

```json
{"replayed":false,"documents":48,"assets":5552}
```

Identical re-import:

```json
{"replayed":true,"documents":48,"assets":5552}
```

Runtime assertions proved exactly one import run, 48 present source documents, 5,552 present assets, zero absent rows and no duplicate present `(document_id, position)` pairs.

## Canonical database migrations

`0001_core.sql` → `0002_access.sql` → `0003_learning.sql` → `0004_ai_and_sync.sql` → `0005_auth.sql` → `0006_access_contract.sql` → `0007_activation_contract.sql` → `0008_content_source_import.sql`.

## Current branch / PR stack

- Foundation: `rebuild/foundation` / PR #2.
- Auth: `rebuild/auth-authorization` / PR #3.
- Access/Entitlements: `rebuild/access-entitlements` / PR #4.
- Student Activation UI: `rebuild/student-activation-ui` / PR #5.
- Student Activation Backend: `rebuild/student-activation-backend` / PR #6.
- Stage 8 integrated source: `rebuild/student-activation-integration` / PR #7.
- **Stage 9 source of truth:** `rebuild/content-import` / PR #8.
- Parallel Stage 9 source audit: `rebuild/content-source-audit` / PR #9; audit-only evidence, not importer ownership.

## Critical defects caught and fixed by gates

- Legacy root PostCSS/Tailwind leakage into new apps.
- Auth strict-TypeScript/scrypt boundary defects.
- Stage 7 PostgreSQL enum/JSONB/default typing defects, audit atomicity and idempotency ownership weakness.
- Stage 8 test isolation/discovery defects and production API build/start mismatch.
- Stage 9 audit found eight Arabic-key manifests that would have omitted **772 images** despite a correct top-level Git image count; parser support + payload-count invariant added.
- Stage 9 helper expectation drift corrected from 76 to the observed/recognized 86 helpers.
- Stage 9 found a third real manifest shape (`filename` + `pdf_page` + `book_page`) in `كتاب القراءة`; explicit compatibility support and regression tests added.
- Stage 9 first real DB import exposed Python/JavaScript numeric JSON digest drift (`9.0` vs `9`); canonical integral-number normalization fixed the cross-language digest contract.

## Important decisions

- PostgreSQL is self-hosted/private behind Backend; browser never connects directly.
- Supabase is not the target platform and legacy DB data/schema are not compatibility targets.
- Full access code = exactly 6 digits; Class access code = exactly 7 digits.
- Full Code becomes the returning Student identifier only after activation; password remains the authentication secret.
- Recovery resets the secret; it never reveals the original password.
- `alwaslh-go` is a canonical source input. Raw repository assets never ship as a frontend bundle.
- Stage 9 preserves source documents/assets/order/provenance and **does not infer Lesson entities from filenames**.
- Duplicate source blobs remain reportable review evidence unless a later semantic rule proves them invalid.
- Legacy application remains **NO-GO** for production until final parity/release gates pass.

## NOT YET VERIFIED / remaining release risks

- final CI on the documentation-only Stage 9 closure head;
- actual production-host PostgreSQL networking, pool tuning, load behavior and backup/restore drill;
- API/reverse-proxy perimeter rate limiting and final security hardening;
- object/media storage runtime and ordered PDF/media processing;
- Gemini prompt contracts, golden tests, durable workers, multi-project/key failover and runtime;
- complete Admin product;
- post-auth Student learning product, Practice Engine and trusted scoring;
- account-scoped Offline Sync/PWA/outbox lifecycle;
- full performance/security/accessibility/device/staging/rollback/release gates.

## Next Action

**Closure gate:** wait for both Stage 9 dedicated CI and the full regression workflow to pass on this documentation head. If green, Stage 9 is fully closed and the next implementation stage is **Stage 10 — Media Pipeline**.
