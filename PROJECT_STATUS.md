# PROJECT STATUS

- **Current Phase:** Stage 10 Media Pipeline is **CODE COMPLETE / CLI + PostgreSQL + MEDIA RUNTIME PASS**. Documentation closure CI is running next; after it is green, sync the stable Stage 10 schema/code to the temporary Supabase/Vercel Preview and verify that deployment before beginning Stage 11.
- **Verification Policy:** every stage requires executable evidence. Official states: `DESIGN PASS` / `CLI PASS` / `RUNTIME PASS` / `RELEASE PASS`; anything not executed remains `NOT YET VERIFIED`.
- **Continuity Source:** read `PROJECT_HANDOFF.md` first, then this file, `PROJECT_ENGINEERING_LOG.md`, `PRODUCT_FEATURE_PARITY_MATRIX.md`, `MASTER_REBUILD_ROADMAP.md`, stage contracts/DoD, and `docs/engineering/CLI_VERIFICATION_GATES.md`.
- **Stage 10 branch / PR:** `rebuild/media-pipeline` / PR #11.
- **Latest Verified Stage 10 Code Baseline:** `f9f58ed4b9cf599d992a08b9c9eb33d3ae1a17c3`.
- **Stage 10 Dedicated Verification:** run `33302062208` — **SUCCESS**.
- **Stage 9 Regression on same code head:** run `33302062209` — **SUCCESS**.
- **Full Regression Verification on same code head:** run `33302062216` — **SUCCESS**, including Chromium E2E.

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
- **Stage 10 Media Pipeline:** **CLI/PostgreSQL/MEDIA RUNTIME PASS on code head.** Server-owned media processing, safe storage abstraction, deterministic ordering/keys, Sharp variants, Poppler PDF extraction, Stage 9 provenance, source-byte-bound idempotency, failure/abort cleanup and full PDF runtime verification.

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
```

Canonical inventory SHA-256:
`7b6c6e1e79d90cf68a72bc473c12ce23bf39c462708dcd10bc313fd535fbe729`

## Stage 10 verified media facts

- `0009_media_pipeline.sql` introduces `media_assets` and `media_variants` with source checksum/byte identity, processing state, attempt/error evidence and unique variant/storage identities.
- Imported media can reference `content_source_assets`; Stage 9 inventory is not mutated into Lesson entities.
- Media idempotency is owned by exact source identity + SHA-256 + byte size; reusing the key for different source data is rejected.
- Exact ready replay verifies the stored variant byte size/SHA before returning it.
- `sharp` produces `source`, `display`, `thumbnail`, and `ai` variants with computed dimensions/byte sizes/SHA-256.
- Storage keys are backend-generated deterministic relative keys; traversal is rejected.
- Concurrency is bounded to 1..8 and result/page order is independent from worker completion timing.
- Partial storage failure, metadata failure and abort remove successfully written partial objects and leave observable failed state.
- Poppler is invoked with argument arrays, temporary directories are scoped/cleaned, page count/order is validated, and malformed PDFs fail before media rows are created.
- A real two-page PDF was executed end-to-end through extraction → transforms → filesystem storage → PostgreSQL metadata → exact replay; page order remained `1,2` / positions `100,101`.
- Display output from the real PDF stayed within the tested long-edge quality window `1200..1800` pixels.

## Canonical database migrations

`0001_core.sql` → `0002_access.sql` → `0003_learning.sql` → `0004_ai_and_sync.sql` → `0005_auth.sql` → `0006_access_contract.sql` → `0007_activation_contract.sql` → `0008_content_source_import.sql` → `0009_media_pipeline.sql`.

## Current branch / PR stack

- Foundation: `rebuild/foundation` / PR #2.
- Auth: `rebuild/auth-authorization` / PR #3.
- Access/Entitlements: `rebuild/access-entitlements` / PR #4.
- Student Activation UI: `rebuild/student-activation-ui` / PR #5.
- Student Activation Backend: `rebuild/student-activation-backend` / PR #6.
- Stage 8 integrated source: `rebuild/student-activation-integration` / PR #7.
- Stage 9 source of truth: `rebuild/content-import` / PR #8.
- Parallel Stage 9 source audit: `rebuild/content-source-audit` / PR #9; audit-only evidence.
- Temporary test deployment: `preview/supabase-vercel` / PR #10.
- **Stage 10 source of truth:** `rebuild/media-pipeline` / PR #11.

## Temporary Preview Environment

- Supabase project `linksoftt` is a temporary PostgreSQL/testing host, not the final platform architecture.
- Vercel project `alwaslh` exposes Student `/`, Admin `/admin`, API `/api/*` from `preview/supabase-vercel`.
- Browser access to application tables through Supabase/PostgREST is intentionally blocked; API remains the data boundary.
- The Preview must be synchronized after each stable stage before the next stage proceeds.
- Vercel serverless filesystem is not the final durable media volume and Poppler/media upload runtime on Vercel is currently **NOT YET VERIFIED**.

## Critical defects caught and fixed by gates

- Legacy root PostCSS/Tailwind leakage into new apps.
- Auth strict-TypeScript/scrypt boundary defects.
- Stage 7 PostgreSQL enum/JSONB/default typing defects, audit atomicity and idempotency ownership weakness.
- Stage 8 test isolation/discovery defects and production API build/start mismatch.
- Stage 9 Arabic-key/third-shape manifest omissions, helper baseline drift and Python/JavaScript canonical digest drift.
- Stage 10 first gate caught formatting and strict optional-property defects before runtime.
- Stage 10 review caught weak idempotency ownership and changed it to bind the key to exact source bytes/provenance before retry mutation.
- Stage 10 failure-injection gates prove partial filesystem objects are cleaned on storage failure, metadata failure and abort.
- Stage 10 final DoD added direct assertions for no temp-file residue and malformed-PDF/no-metadata behavior rather than relying on inference.

## NOT YET VERIFIED / remaining release risks

- Stage 10 workflows on the final documentation head;
- Stage 10 schema/code synchronization and deployment verification on the temporary Supabase/Vercel Preview;
- durable media volume/Poppler behavior on the eventual production host and backup/restore/load drills;
- Gemini prompt contracts, golden tests, durable AI workers/provider failover;
- complete Admin product and live Admin media upload boundary;
- post-auth Student learning product, Practice Engine and trusted scoring;
- account-scoped Offline Sync/PWA/outbox lifecycle;
- complete performance/security/accessibility/device/staging/rollback/release gates.

## Next Action

1. Run Stage 10 dedicated + Stage 9 regression + complete rebuild verification on this documentation head.
2. If green, apply `0009_media_pipeline.sql` and new-table Supabase lockdown to temporary `linksoftt`, mirror stable Stage 10 code into `preview/supabase-vercel`, deploy and verify Vercel health/readiness/build.
3. Only after Preview sync evidence, begin **Stage 11 — Gemini Prompt/Output Contracts**.
