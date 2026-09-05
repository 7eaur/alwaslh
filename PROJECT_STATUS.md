# PROJECT STATUS

- **Current Phase:** Product Evolution Review checkpoint after verified Stage 10. Stages 1–10 are technically closed at their documented verification levels. Before Stage 11 or broader feature implementation, product/business flows will be re-discussed with the product owner so the legacy app remains a reference, not an unquestioned specification.
- **Verification Policy:** every stage requires executable evidence. Official states: `DESIGN PASS` / `CLI PASS` / `RUNTIME PASS` / `RELEASE PASS`; anything not executed remains `NOT YET VERIFIED`.
- **Continuity Source:** read `PROJECT_HANDOFF.md` first, then this file, `PROJECT_ENGINEERING_LOG.md`, `PRODUCT_FEATURE_PARITY_MATRIX.md`, `MASTER_REBUILD_ROADMAP.md`, `docs/product/PRODUCT_EVOLUTION_REVIEW.md`, stage contracts/DoD, and `docs/engineering/CLI_VERIFICATION_GATES.md`.
- **Planning branch:** `planning/product-evolution-review`, created from verified Stage 10 documentation head `27c6a2ef1118ee44d2e63471e4f925e1296283e0`.
- **Stage 10 branch / PR:** `rebuild/media-pipeline` / PR #11.
- **Final Stage 10 documentation head:** `27c6a2ef1118ee44d2e63471e4f925e1296283e0`.
- **Final Stage 10 Dedicated Verification:** run `33302270707` — **SUCCESS**.
- **Final Stage 9 Regression on same head:** run `33302270692` — **SUCCESS**.
- **Final Full Rebuild Verification on same head:** run `33302270695` — **SUCCESS**, including Chromium E2E.

## Completed

- **Stage 1 Product Contract:** **CLI PASS.** Product/feature inventory, legacy audit and automated parity checks. Its feature catalog is now a review inventory, not a rule that every legacy behavior must survive unchanged.
- **Stage 2 Brand Identity:** **CLI PASS.** Owned teal/open-book identity, canonical assets/tokens/PWA icons and automated brand checks.
- **Stage 3 UX Architecture:** **CLI PASS.** Admin/Student IA, critical flows/states, responsive/accessibility contracts and wireframes. These flows may be revised through the current Product Evolution Review.
- **Stage 4 PostgreSQL Data Platform:** **CLI/RUNTIME PASS on PostgreSQL 16.** Clean-slate private PostgreSQL behind Backend; migrations and relational integrity verified on clean DBs.
- **Stage 5 Engineering Foundation:** **CLI/RUNTIME PASS.** API runtime, DB pool/transactions, migration runner, env validation, logging/error envelope, strict TS, tests, production builds and CI.
- **Stage 6 Auth & Authorization:** **CLI/RUNTIME PASS.** Salted scrypt credentials, opaque sessions, HttpOnly cookies, role isolation, Origin protection, DB lockout, reset-only recovery and explicit Admin bootstrap.
- **Stage 7 Access Codes & Entitlements:** **CLI/RUNTIME PASS.** Secure 6/7-digit codes, Arabic/Persian normalization, transactional/idempotent redemption, renewal, no-waste behavior, revoke/audit, constraints and race tests.
- **Stage 8 Student Activation & Account Flow:** **CLI/RUNTIME/BROWSER E2E PASS.** Atomic activation + returning login + recovery + real Chromium integration.
- **Stage 9 Content Model & deterministic `alwaslh-go` Import:** **CLI/PostgreSQL RUNTIME PASS.** Full pinned inventory, manifest compatibility, deterministic ordering, provenance, repeatable DB import and reconciliation verified.
- **Stage 10 Media Pipeline:** **CLI/PostgreSQL/MEDIA RUNTIME PASS, final documentation head verified.** Server-owned media processing, safe storage abstraction, deterministic ordering/keys, Sharp variants, Poppler PDF extraction, Stage 9 provenance, source-byte-bound idempotency, failure/abort cleanup and full PDF runtime verification.

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
- Exact ready replay verifies stored variant byte size/SHA before returning it.
- `sharp` produces `source`, `display`, `thumbnail`, and `ai` variants with computed dimensions/byte sizes/SHA-256.
- Storage keys are backend-generated deterministic relative keys; traversal is rejected.
- Concurrency is bounded to 1..8 and result/page order is independent from worker completion timing.
- Partial storage failure, metadata failure and abort remove successfully written partial objects and leave observable failed state.
- Poppler is invoked with argument arrays, temporary directories are scoped/cleaned, page count/order is validated, and malformed PDFs fail before media rows are created.
- A real two-page PDF executed end-to-end through extraction → transforms → filesystem storage → PostgreSQL metadata → exact replay; page order remained `1,2` / positions `100,101`.
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
- Stage 10 source of truth: `rebuild/media-pipeline` / PR #11.
- **Current planning source:** `planning/product-evolution-review`.

## Temporary Preview Environment

- Supabase project `linksoftt` is a temporary PostgreSQL/testing host, not the final platform architecture.
- Vercel project `alwaslh` under team `wasl15` exposes the temporary evolving application.
- Preview branch remains `preview/supabase-vercel` at `1eb623ef0cd3f7b47af7aa6add08c87d88f84f81` and has a READY deployment.
- `/api/health` on that READY deployment was rechecked and returned HTTP 200 with `{"status":"ok","service":"alwaslh-api"}`.
- That Preview is still pre-Stage-10. Stage 10 migration/code has **not** been synchronized into it yet.
- Direct Vercel deployments from `rebuild/media-pipeline` currently fail because the Vercel project expects an output directory named `dist`; this is a deployment/configuration mismatch, not a Stage 10 CI/runtime failure.
- Browser access to application tables through Supabase/PostgREST remains intentionally blocked; API remains the data boundary.
- Vercel serverless filesystem is not the final durable media volume and Poppler/media upload runtime on Vercel remains **NOT YET VERIFIED**.

## Product Evolution Review decision

The legacy application is now explicitly treated as:

- a source of product idea, user needs, useful scenarios, content and failure lessons;
- **not** an immutable specification of screens, flows, feature details or business rules.

Every major remaining feature will be discussed with the product owner and classified `KEEP`, `IMPROVE`, `REFACTOR`, `REBUILD`, `REMOVE` or `NEW`. If a new product decision changes an already-implemented Stage 1–10 business rule, the affected stage will be reopened deliberately with impact analysis and executable regression gates instead of silently changing contracts.

## NOT YET VERIFIED / remaining release risks

- Stage 10 schema/code synchronization and deployment verification on the temporary Supabase/Vercel Preview;
- durable media volume/Poppler behavior on the eventual production host and backup/restore/load drills;
- final product decisions for remaining Student/Admin flows and features;
- Gemini prompt contracts, golden tests, durable AI workers/provider failover;
- complete Admin product and live Admin media upload boundary;
- post-auth Student learning product, Practice Engine and trusted scoring;
- account-scoped Offline Sync/PWA/outbox lifecycle;
- complete performance/security/accessibility/device/staging/rollback/release gates.

## Next Action

1. Complete the Product Evolution Review with the product owner across access/account, curriculum/navigation, reader, practice/quizzes, notes/saved, notifications/statistics, offline/PWA, Admin, content/media, AI, exports/operations and any new ideas.
2. Record every decision in `docs/product/PRODUCT_EVOLUTION_REVIEW.md` and revise `PRODUCT_FEATURE_PARITY_MATRIX.md` / `MASTER_REBUILD_ROADMAP.md` where needed.
3. Identify whether any decision requires reopening Stages 1–10.
4. Then synchronize the resulting stable baseline to `linksoftt` + `preview/supabase-vercel`, fix Vercel project routing/build configuration, deploy and verify.
5. Begin the revised next implementation stage only after those gates are satisfied.
