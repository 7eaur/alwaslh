# DOCUMENTATION INDEX — الوسيلة الذكية

> هذه هي خريطة ذاكرة المشروع الرسمية. أي محادثة/مهندس جديد يجب أن يبدأ هنا ولا يعتمد على chat memory.

## 1. Source of Truth precedence

عند وجود اختلاف بين ملفين، استخدم الترتيب التالي:

1. **الكود الحالي + PostgreSQL migrations + GitHub Actions executable evidence**.
2. `docs/product/CURRENT_PRODUCT_OVERRIDES.md` للقرارات الحالية الصريحة التي تتقدم على سياسات أقدم.
3. `PROJECT_HANDOFF.md` + `PROJECT_STATUS.md` + `PROJECT_ENGINEERING_LOG.md` للحالة التنفيذية الحالية والسجل.
4. Product Decisions (`PRODUCT_EVOLUTION_REVIEW` ثم Batches 05/06) للـBusiness/Product rules.
5. الوثائق المتخصصة لكل Stage/Module.
6. `PRODUCT_FEATURE_PARITY_MATRIX.md` + `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` لضمان عدم ضياع Legacy capabilities.
7. `MASTER_REBUILD_ROADMAP.md` للترتيب المستهدف.
8. Legacy audits/PRD/TODO/root legacy code كأدلة تاريخية فقط.

إذا لم يوجد executable evidence لادعاء ما، حالته `NOT YET VERIFIED` حتى لو كانت الوثيقة تصفه كهدف.

## 2. ترتيب القراءة الإلزامي لمحادثة جديدة

1. `README.md` — تعريف المنتج والمعمارية الحالية.
2. `DOCUMENTATION_INDEX.md` — هذا الملف.
3. `PROJECT_HANDOFF.md` — handoff تنفيذي قابل للاستئناف.
4. `PROJECT_STATUS.md` — المرحلة الحالية وما اكتمل وما بقي.
5. `PROJECT_ENGINEERING_LOG.md` — التاريخ، القرارات المعمارية، findings، tests/evidence.
6. `docs/workstreams/TEAM_OPERATING_MODEL.md` — طريقة عمل الفريق الدائم والتنسيق عبر GitHub.
7. ملف workstream الخاص بالمحادثة: `BACKEND_WORKSTREAM.md` أو `FRONTEND_WORKSTREAM.md` أو `INTEGRATION_WORKSTREAM.md`.
8. GitHub Command Board الخاص بالـworkstream ثم Team Room عند وجود نقاش مشترك.
9. `docs/product/CURRENT_PRODUCT_OVERRIDES.md` — قرارات Product Owner الحالية.
10. `docs/product/PRODUCT_EVOLUTION_REVIEW.md` — Product Decisions الأساسية.
11. `docs/product/PRODUCT_DECISIONS_BATCH_05.md`.
12. `docs/product/PRODUCT_DECISIONS_BATCH_06.md` — اقرأه تاريخيًا مع تطبيق Current Overrides على PED-051.
13. `PRODUCT_FEATURE_PARITY_MATRIX.md`.
14. `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md`.
15. `MASTER_REBUILD_ROADMAP.md`.
16. الوثائق المتخصصة للمرحلة الحالية والمرحلة التالية.
17. Legacy audit docs عند تنفيذ Module له سلوك قديم يجب مقارنته.

`NEXT_CONVERSATION_PROMPT.md` هو Launcher مختصر فقط؛ يوجّهك إلى هذه القائمة ولا يكرر الحالة.

## 3. ملفات الحالة والحوكمة

| File | Authority / Purpose |
|---|---|
| `PROJECT_HANDOFF.md` | أفضل ملف للاستئناف: branch/PR/head، الفكرة، boundaries، verified stages، current next work، known issues |
| `PROJECT_STATUS.md` | ملخص الحالة الحالية، exact CI، blockers والمتبقي بالترتيب |
| `PROJECT_ENGINEERING_LOG.md` | سجل زمني تراكمي، Architecture Decisions، Findings P0–P3، Changes، Verification، Known Issues |
| `docs/workstreams/TEAM_OPERATING_MODEL.md` | نظام الفريق الدائم: ownership، commands/reports، branch/contract/integration rules |
| `docs/workstreams/BACKEND_WORKSTREAM.md` | مسؤوليات Backend/Platform وطريقة self-review/reporting والعمل الحالي |
| `docs/workstreams/FRONTEND_WORKSTREAM.md` | مسؤوليات Frontend/Product وUX/a11y/API-integration والعمل الحالي |
| `docs/workstreams/INTEGRATION_WORKSTREAM.md` | مسؤوليات Architecture/Integration/QA/Release وقواعد القبول والدمج |
| `MASTER_REBUILD_ROADMAP.md` | الخطة من المراحل الحالية حتى release/cutover؛ لا يحل محل evidence |
| `NEXT_CONVERSATION_PROMPT.md` | Prompt قصير لمحادثة جديدة؛ ليس Source of Truth بذاته |
| `TODO.md` | Legacy/Historical only؛ لا تستخدمه كقائمة العمل الحالية |

### GitHub Team Coordination

- Issue `#13` — **TEAM ROOM**: contracts/blockers/architecture decisions المشتركة.
- Issue `#14` — **Backend / Platform Command Board**: أوامر Backend وتقاريره.
- Issue `#15` — **Frontend / Product Command Board**: أوامر Frontend وتقاريره.
- Issue `#16` — **Integration / Architecture / QA / Release Board**: قرارات القبول/الدمج/evidence.

آخر `COMMAND` في Board الفريق هو scope الحالي. بعد كل batch يرفع الفريق `REPORT` في Board الخاصة به ويحدّث ملف workstream. لا يوجد تنسيق رسمي يعتمد على chat memory فقط.

## 4. فهم المنتج وLegacy parity

| File | Purpose |
|---|---|
| `PRODUCT_FEATURE_PARITY_MATRIX.md` | inventory الإلزامي لكل capability/scenario قديم ذي قيمة |
| `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` | يربط legacy capability → disposition → implementation → test evidence |
| `docs/product/PRODUCT_EVOLUTION_REVIEW.md` | القرارات المنتجية الأساسية PED-* |
| `docs/product/PRODUCT_DECISIONS_BATCH_05.md` | Notes/Needs Review/AI multi-provider/root-cause/design governance وغيرها |
| `docs/product/PRODUCT_DECISIONS_BATCH_06.md` | Student/Admin split/PWA/documentation governance وسياسة Preview التاريخية |
| `docs/product/CURRENT_PRODUCT_OVERRIDES.md` | override حالي صريح: deployment deferred، old DB خارج scope، repo docs هي الذاكرة الرسمية |
| `PROJECT_DEEP_AUDIT.md` | Deep audit للتطبيق القديم؛ historical evidence |
| `PROJECT_FULL_AUDIT_CATALOG.md` | Catalog موسع للأدلة والمشكلات القديمة |
| `PROJECT_REBUILD_BLUEPRINT.md` | blueprint/synthesis تاريخي؛ لا يتقدم على القرارات الأحدث |
| `docs/prd.md` | PRD legacy/reference؛ ليس وصف runtime الحالي |
| `docs/SOURCE_INVENTORY.md` | inventory تاريخي للمستودع القديم |

## 5. Data / Curriculum / Content

| File | Purpose / Current State |
|---|---|
| `DATABASE_PLATFORM_ARCHITECTURE.md` | PostgreSQL platform authority/constraints |
| `docs/curriculum/CURRICULUM_STRUCTURE.md` | Stage13 Curriculum contract: Class → Offering → optional Section → Lesson |
| `docs/admin/STAGE13_ADMIN_CURRICULUM_UI.md` | Admin curriculum Web behavior + E2E evidence |
| `docs/admin/STAGE13_CONTENT_MEDIA_OCR_OPERATIONS.md` | **Stage13C VERIFIED** operations/read-review contract over Stage9→10→OCR |
| `docs/admin/STAGE13_CONTENT_INGESTION_PUBLICATION.md` | **Stage13D VERIFIED** image/PDF/mixed upload, durable task history, explicit Lesson linking and Draft→Review→Published evidence |
| `docs/media/MEDIA_PIPELINE_ARCHITECTURE.md` | Stage10 media architecture |
| `docs/media/MEDIA_STAGE_DOD.md` | media definition of done/evidence |
| `database/migrations/0008_content_source_import.sql` | Stage9 source/provenance schema |
| `database/migrations/0009_media_pipeline.sql` | Stage10 media schema |
| `database/migrations/0011_ocr_foundation.sql` | OCR durable schema |
| `database/migrations/0017_content_ingestion_publication.sql` | Stage13D durable ingestion/publication schema |

Stage9 source import details and inventory evidence are preserved in `PROJECT_ENGINEERING_LOG.md`, Stage9 CI, import tests/reports and canonical source repository `7eaur/alwaslh-go`.

Canonical content source inventory remains `7eaur/alwaslh-go` pinned by Stage9 evidence. Source folder names are provenance/facets, not curriculum business hierarchy.

Stage13D explicitly separates media processing from curriculum publication. A ready media asset is not student-visible Lesson content until it is linked as Draft, reviewed and explicitly Published.

## 6. Auth / Access / Student activation

Relevant implementation lives under `apps/api/src/auth`, `activation`, `access` plus migrations and integration tests.

Read specialized API/access docs under `docs/api/` when modifying those contracts. Stable verified principles:

- server sessions + role isolation;
- Full Code 6 digits / Class Code 7 digits;
- non-consuming activation verify → activation ticket → atomic finalization;
- Student password + registered P-256 device challenge;
- Admin temporary-password recovery + session revoke + forced password change;
- explicit device rebind/reset.

Do not weaken these boundaries during later UI work.

## 7. OCR / AI

| File | Purpose |
|---|---|
| `docs/ai/AI_PROVIDER_MODEL_STRATEGY.md` | provider/model-neutral strategy, benchmark requirement |
| `docs/ai/STAGE11_GENERATION_CONTRACTS.md` | typed modes, Prompt Registry, validators, golden dataset |
| `docs/ai/STAGE12_JOB_LIFECYCLE.md` | durable job/unit/attempt lifecycle, pause/resume/progress |
| `docs/ai/STAGE12_WORKER_RUNTIME.md` | dedicated bounded worker process/graceful drain |
| `database/migrations/0011_ocr_foundation.sql` + OCR code/tests | canonical OCR lifecycle/review/search evidence |

Important open boundary: live provider adapters/credentials/benchmark/production AI routing remain `NOT YET VERIFIED`; do not claim a provider is production-ready without measured evidence.

**Current engineering stage is Stage13E — Admin AI Operations / Review.** It must reuse Stage12 durable jobs/units/attempts and must not introduce a browser-owned queue or second AI lifecycle.

## 8. UX / Brand / Offline

- `packages/brand/` — canonical brand tokens/primitives.
- `docs/ux/` — UX architecture/contracts from earlier stages.
- `OFFLINE_MODE.md` + `OFFLINE_MODE_README.md` — Offline legacy/reference and rebuild requirements.
- `docs/engineering/DEVELOPMENT_RUNTIME_AND_PREVIEW_POLICY.md` — current runtime/deployment policy; deployment currently deferred.

## 9. Current verified baseline

Executable head:

`4eca7de8877ac9e2289b9c7990c912d33c256935`

Same-head SUCCESS evidence:

- Stage13D Admin Upload UI `34177369743` — API/Admin quality gates + clean migrations + real Chromium mixed upload/publication/history + narrow viewport;
- Stage13D Content Ingestion `34177369784` — backend integration/schema verification;
- Stage13 Admin Product `34177369748` — Backend + Admin Chromium regression;
- Stage12 AI Execution `34177369812`;
- Stage11 AI Contracts `34177369753`;
- OCR Foundation `34177369750`;
- Stage10 Media Pipeline `34177369777`;
- Stage9 Content Import `34177369756`;
- Full Rebuild `34177369768` — includes Student Chromium.

Stage13D Upload / Processing History / Publication Linking is therefore **VERIFIED**. Legacy `LES-A-010..015` is closed by executable evidence. Documentation commits after this executable head are docs descendants and do not replace it as runtime evidence.

## 10. Current implementation sequence

```text
VERIFIED through Stage13D
→ Stage13E Admin AI Operations / Review
→ Stage13F Question Bank / Review / Publish
→ Stage13G Students / Codes / Recovery / Notifications / Import-Export / Reports / Settings / Audit
→ Stage14 Student Web/PWA product
→ Stage15 Assessment
→ Stage16 Offline/PWA
→ Stage17 Personal Learning Data
→ Stage18 Notifications
→ Stage19 Progress/Statistics
→ Stage20 Import/Export/Reporting
→ Stages21–29 hardening/release/cutover/operations
```

See `MASTER_REBUILD_ROADMAP.md` for details.

## 11. Superseded / historical warnings

- Old root Supabase frontend/backend architecture is **legacy reference**, not rebuild runtime.
- `TODO.md` is historical and must never determine current work.
- PED-051 Preview cadence is historical policy; a later Product Owner instruction currently sets deployment to `DEFERRED BY PRODUCT OWNER`. See `CURRENT_PRODUCT_OVERRIDES.md`.
- The old database is not required for current development/import decisions unless Product Owner explicitly reopens that work.

## 12. Documentation maintenance rule

After every meaningful batch:

1. record exact executable HEAD and GitHub Actions run IDs;
2. update `PROJECT_STATUS.md`;
3. append/update `PROJECT_ENGINEERING_LOG.md` with changes, ADs, findings and evidence;
4. update `PROJECT_HANDOFF.md` when current stage/boundary/branch/CI changes;
5. update the specialized module doc;
6. update Legacy Coverage evidence for newly implemented legacy capabilities;
7. update parity notes where a legacy capability moves to VERIFIED;
8. update Roadmap only when stage status/order changes;
9. never mark PASS from prose or Build alone—use executable evidence;
10. leave unverified items explicitly `NOT YET VERIFIED`.

Workstream chats additionally update their own workstream file + Command Board report. Integration Lead owns synchronization of central status/log/handoff after accepting work.

This convention exists specifically so a new conversation can continue from the repository without knowing prior chat history.
