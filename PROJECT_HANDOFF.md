# PROJECT HANDOFF — الوسيلة الذكية

> **Purpose:** a new engineer/chat should be able to resume the project from this file + `DOCUMENTATION_INDEX.md` without prior conversation memory.

Last synchronized: 2026-09-08.

## 0. Mandatory startup procedure

Before changing code:

1. Confirm repository `7eaur/alwaslh`, branch `planning/product-evolution-review`, Draft PR #12.
2. Read `README.md` and `DOCUMENTATION_INDEX.md`.
3. Read this file, then `PROJECT_STATUS.md` and `PROJECT_ENGINEERING_LOG.md`.
4. Read `docs/product/CURRENT_PRODUCT_OVERRIDES.md` before interpreting older Product Decisions.
5. Read Product Decisions, parity/coverage, Roadmap and specialized current-stage docs listed in the Index.
6. Inspect actual code/callers/migrations/tests for the area to modify. File/folder names alone are not evidence.
7. Check GitHub Actions for the exact HEAD; never infer PASS from chat prose.
8. Anything not inspected/tested = `NOT YET VERIFIED`.

## 1. Repository / Git state

- Repo: `7eaur/alwaslh`
- Working branch: `planning/product-evolution-review`
- Draft PR: #12
- PR base: `rebuild/media-pipeline`
- Latest fully verified executable head: `4eca7de8877ac9e2289b9c7990c912d33c256935`
- Current documentation closure is a docs-only descendant of that executable head.
- Do not force-update refs or rewrite prior history.

## 2. Product idea

**الوسيلة الذكية** is an Arabic educational platform. Its business outcome is not “show PDFs”; it manages trustworthy curriculum/content, controlled student access, learning/practice and review.

### Student Web/PWA — `apps/student-web`

Target outcomes: secure Full-Code activation and returning login; entitlement-filtered curriculum; mobile-first Reader/media/text/search/TTS; Practice/Tests/Models; Notes/Favorites/Needs Review; progress/private achievements; notifications; explicit offline/PWA lifecycle.

### Admin Web — `apps/admin-web`

Target outcomes: curriculum/content authoring; image/PDF/mixed ingestion; media/OCR review; AI operations/review; Question Bank/Quiz Builder/publish; students/codes/recovery/device reset; notifications/import-export/reports/settings/audit.

### Backend API — `apps/api`

Authoritative boundary for Auth/Authorization/Entitlements, curriculum/business data, PostgreSQL mutations, Media/OCR/AI execution/review, and trusted publish/assessment/progress state. Browser never owns those authorities or talks directly to PostgreSQL as the application data path.

## 3. Legacy preservation rule

The legacy product is a **feature/scenario/failure reference**, not target architecture.

Hard gates:

- `PRODUCT_FEATURE_PARITY_MATRIX.md`
- `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md`
- `PROJECT_DEEP_AUDIT.md`
- `PROJECT_FULL_AUDIT_CATALOG.md`

Every valuable legacy capability must end as `KEEP | IMPROVE | REFACTOR | REBUILD | REMOVE(owner-approved)` with implementation + acceptance evidence. Never silently drop a legacy result because the old code was poor.

## 4. Current Product Owner overrides

Read `docs/product/CURRENT_PRODUCT_OVERRIDES.md`.

1. **Deployment/Preview is deferred.** Do not deploy/sync/re-enable auto-deploy without explicit new Product Owner command.
2. **Old database is outside current scope.** Repository/current PostgreSQL/source-reference evidence is sufficient for current work.
3. **Repository documentation is official memory.** New chats read docs, not chat memory.
4. **Root-cause only.** No test/security/business-rule weakening for green CI.

## 5. Stable architecture / boundaries

```text
Student PWA ─┐
             ├── Fastify API ── private PostgreSQL
Admin Web ───┘       │
                     ├── Auth / Access / Curriculum
                     ├── Stage9 source/provenance
                     ├── Stage10 media
                     ├── OCR derived/reviewed text
                     ├── Stage11 AI contracts/validation
                     ├── Stage12 durable AI execution/worker
                     └── Stage13 reviewed Admin publication/operations
```

Stable rules:

- Full Code exactly 6 digits; Class Code exactly 7 digits.
- Student activation verify is non-consuming; final activation is atomic.
- Student returning session requires password + registered ECDSA P-256 device proof.
- Admin login/recovery is separate; temporary-password recovery revokes sessions, forces replacement and supports explicit device rebind.
- Curriculum authority is `Class → Subject Offering(subject_class_links) → optional curriculum_sections → Lesson`.
- Stage9 `alwaslh-go` source import is provenance evidence, not curriculum hierarchy.
- Source folders never silently become Business Rules.
- Stage10 media variants are processing evidence, not automatically Published Lesson content.
- Stage13D makes this explicit: `media ready != published`; only explicit Link→Draft→Review→Published changes Lesson content authority.
- Upload/media success is independent from OCR/AI/TTS.
- OCR is durable derived state over media/checksum; reviewed OCR is preferred downstream evidence.
- AI contracts are provider/model-neutral; Prompt Registry/versioning/validation remain separate from provider selection.
- Exact/extraction AI modes never fabricate unknown answers.
- AI provider calls occur outside long DB transactions; lease/attempt/output writes are stale-worker protected.
- distributed capacity/cooldown/kill/budget controls are DB-coordinated.
- Fastify remains HTTP-only; dedicated bounded AI worker runtime is separate.
- Student ultimately consumes Published Admin-reviewed authority, not raw provider output.

## 6. Verified stage history

- Stages1–10: VERIFIED.
- OCR Foundation: VERIFIED.
- Stage11 provider-neutral AI contracts: VERIFIED.
- Stage12 durable AI execution/runtime: VERIFIED backend/runtime; live production provider routing remains unverified.
- Stage13A Curriculum Structure backend: VERIFIED.
- Stage13B Admin Curriculum Web: VERIFIED incl. Chromium.
- Stage13C Content/Media/OCR Operations: VERIFIED incl. Chromium.
- **Stage13D Upload/Processing History/Publication Linking: VERIFIED incl. Chromium.**

Canonical Stage9 source remains `7eaur/alwaslh-go` pinned at `f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`; verified inventory: 15 roots / 48 documents / 5,552 images / 4,218 JPG / 1,334 WEBP / 86 helpers / 24 manifests / digest `7b6c6e1e79d90cf68a72bc473c12ce23bf39c462708dcd10bc313fd535fbe729`.

### Stage13D closure

Executable closure: `4eca7de8877ac9e2289b9c7990c912d33c256935`.

Implementation authority:

- `database/migrations/0017_content_ingestion_publication.sql`;
- `apps/api/src/content/ingestion-service.ts`;
- `apps/api/src/content/ingestion-http.ts`;
- existing Stage10 `MediaPipelineService` and MediaStorage;
- `apps/admin-web/src/content-ingestion-api.ts`;
- `apps/admin-web/src/ContentIngestionWorkspace.tsx`;
- `apps/admin-web/src/content-ingestion.css`;
- dedicated backend and Admin Chromium workflows.

Verified flow:

```text
Admin Lesson + ordered image/PDF/mixed input
→ durable server task/items
→ Stage10 processing
→ authoritative progress/errors/retry/history
→ media Ready but unpublished
→ explicit Link creates Draft lesson_assets
→ Review
→ explicit Publish
→ history survives reload/archive
```

Backend integration proves image → 2-page PDF → image source positions `[0,1,2,3]`. Admin Chromium proves real mixed upload, processing, Draft link, Review, Publish, reload/history, archive and 390px responsive UX.

Specialized doc: `docs/admin/STAGE13_CONTENT_INGESTION_PUBLICATION.md`.

Legacy `LES-A-010..015` is now VERIFIED. `LES-A-016+` remains NOT YET VERIFIED until later evidence.

## 7. Latest exact verification matrix

Executable head: `4eca7de8877ac9e2289b9c7990c912d33c256935`.

- Stage13D Admin Upload UI `34177369743` — SUCCESS; real mixed upload/publication Chromium + narrow viewport.
- Stage13D Content Ingestion `34177369784` — SUCCESS; clean PostgreSQL + ordering/link/publication/archive integration.
- Stage13 Admin Product `34177369748` — SUCCESS; backend + existing Admin Chromium.
- Stage12 AI Execution `34177369812` — SUCCESS.
- Stage11 AI Contracts `34177369753` — SUCCESS.
- OCR Foundation `34177369750` — SUCCESS.
- Stage10 Media Pipeline `34177369777` — SUCCESS.
- Stage9 Content Import `34177369756` — SUCCESS.
- Full Rebuild `34177369768` — SUCCESS; includes Student Chromium activation/returning-login/recovery.

## 8. Current next work — Stage13E Admin AI Operations / Review

**Do not jump to Question Bank/Stage13F yet.** First inspect the actual Stage12 repositories/services/routes and current Admin patterns, then close Admin AI operations over existing authorities.

Required sequence from Roadmap:

1. Reuse verified `ai_jobs / ai_job_units / attempts / outputs`; no second queue/lifecycle.
2. Expose queued/running/retrying/paused/failed/completed and server-derived progress.
3. Wire retry/cancel/pause/resume to current Stage12 authority.
4. Show provider/model/project observability without credentials/secrets.
5. Review generated summary/question/page-detection outputs with source/page provenance visible.
6. Support edit/reject/approve review outcomes; raw provider output is never auto-published.
7. Live provider routing remains disabled/unverified until benchmark authorization/config exists.
8. Add API/PostgreSQL/unit/integration/Chromium evidence.
9. Only newly proven legacy rows move to VERIFIED; everything else stays NOT YET VERIFIED.
10. Update Status/Engineering Log/Handoff/specialized doc/Legacy Coverage after the isolated batch.

## 9. Remaining major work after Stage13E

- Stage13F Question Bank/Quiz Builder/review/publish/export; resolve `direct` persistence first.
- Stage13G Students/Codes/Recovery/Device Rebind/Notifications/Import-Export/Reports/Settings/Audit.
- Stage14 Student full product/Reader.
- Stage15 Assessment/Practice/Test/Models.
- Stage16 final Offline/PWA.
- Stage17 Notes/Favorites/Needs Review.
- Stage18 Notifications/Push.
- Stage19 Progress/Statistics/private achievements.
- Stage20 Import/Export/Reporting.
- Stages21–29 performance/security/tests/a11y/data/staging/release/cutover/monitoring.

## 10. Open findings / risks to carry forward

- `CONTENT-013-002` P1 — **CLOSED / VERIFIED by Stage13D**; explicit media→Lesson Draft/Review/Published contract now exists.
- `AI-011-005` P2 — `direct` AI question persistence unresolved.
- `AI-012-019` P2 — live provider benchmark/config/routes/bootstrap unverified.
- `LES-A-016..019` page-detection review/save Admin flow NOT YET VERIFIED.
- `LES-A-020..037` Admin AI authoring/operations user flows NOT YET VERIFIED despite Stage11/12 backend foundations.
- TTS runtime/quality unverified.
- hosted runtime unverified due deployment deferral.
- final Offline/PWA and Student learning product incomplete.
- `tmp-unused-do-not-use` branch P3 housekeeping.

All other findings live in `PROJECT_ENGINEERING_LOG.md`.

## 11. What NOT to do

- Do not use old root Supabase architecture as current target.
- Do not re-open old DB work unless Product Owner explicitly asks.
- Do not deploy/re-enable Preview automation.
- Do not create a second Subject Offering/media/OCR/AI lifecycle.
- Do not create a generic recursive curriculum tree.
- Do not make source filenames/folders curriculum authority.
- Do not expose provider credentials/secrets/client-side.
- Do not let browser own job progress or publish authority.
- Do not weaken tests/authorization/business rules to pass CI.
- Do not call a stage VERIFIED without exact executable evidence.

## 12. Documentation rule before ending any future session

Update at minimum `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, `PROJECT_HANDOFF.md`, current specialized doc, Legacy Coverage, Roadmap when phase/state changes, and exact commit/run IDs. Keep `NEXT_CONVERSATION_PROMPT.md` short; actual state belongs in repository docs.