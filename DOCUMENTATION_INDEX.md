# DOCUMENTATION INDEX — الوسيلة الذكية

> خريطة التوثيق الرسمية للمشروع. الهدف أن يستطيع أي مهندس/محادثة استئناف العمل من المستودع نفسه دون الاعتماد على chat memory. الحالة التنفيذية تؤخذ من `PROJECT_HANDOFF.md` و`PROJECT_STATUS.md` و`PROJECT_ENGINEERING_LOG.md`; أي شيء غير منفذ/مختبر يوسم `NOT YET VERIFIED`.

## 1. ابدأ من هنا دائمًا

اقرأ بالترتيب:

1. `PROJECT_HANDOFF.md` — السياق التنفيذي والحدود المعمارية وآخر exact head/CI evidence.
2. `PROJECT_STATUS.md` — المرحلة الحالية وما اكتمل وما بقي.
3. `PROJECT_ENGINEERING_LOG.md` — التاريخ الهندسي، Architecture Decisions، Audit Findings، Tests/Known Issues.
4. `docs/product/PRODUCT_EVOLUTION_REVIEW.md` — قرارات المنتج Batches 01–04، ومنها PED-018 Curriculum hierarchy.
5. `docs/product/PRODUCT_DECISIONS_BATCH_05.md`.
6. `docs/product/PRODUCT_DECISIONS_BATCH_06.md`.
7. `MASTER_REBUILD_ROADMAP.md` — الخطة التنفيذية والمراحل القادمة.
8. `docs/engineering/DEVELOPMENT_RUNTIME_AND_PREVIEW_POLICY.md` — runtime/Preview policy؛ لا تتجاوز قرار Product Owner الحالي بتأجيل النشر.
9. `NEXT_CONVERSATION_PROMPT.md` — مساعد للاستئناف فقط؛ الملفات أعلاه أعلى منه سلطة.

## 2. Legacy coverage — لا تتجاهله

التطبيق القديم مرجع للفكرة والمميزات والسيناريوهات والمشاكل والدروس، وليس specification تقنيًا يجب نسخه.

راجع عند تنفيذ Student/Admin modules:

- `PRODUCT_FEATURE_PARITY_MATRIX.md`؛
- `PROJECT_DEEP_AUDIT.md`؛
- `PROJECT_FULL_AUDIT_CATALOG.md`؛
- `PROJECT_REBUILD_BLUEPRINT.md`؛
- `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md`؛
- `OFFLINE_MODE.md` و`OFFLINE_MODE_README.md`.

قاعدة التغطية:

```text
Legacy capability
→ KEEP / IMPROVE / REFACTOR / REBUILD / REMOVE(owner-approved only)
→ target module/flow
→ implementation evidence
→ test/acceptance evidence
```

لا تُغلق Stage13/14 feature parity قبل اكتمال هذا الربط.

## 3. Foundation / Architecture

- `DATABASE_PLATFORM_ARCHITECTURE.md` — PostgreSQL platform boundaries.
- `PROJECT_REBUILD_BLUEPRINT.md` — target blueprint.
- `MASTER_REBUILD_ROADMAP.md` — execution stages.
- `docs/engineering/CLI_VERIFICATION_GATES.md` — verification policy.
- `docs/engineering/DEVELOPMENT_RUNTIME_AND_PREVIEW_POLICY.md` — runtime/deployment architecture policy.

Browser surfaces never own PostgreSQL/provider secrets or authoritative server state.

## 4. Auth / Access / Activation — VERIFIED

Stage6–8 verified scope includes:

- two-step Full Code activation ticket;
- mandatory password creation/change;
- P-256 registered application-device challenge + device-bound session;
- temporary-password recovery + session revocation + forced private replacement;
- Admin device reset/rebind + historical-key reuse rejection;
- Full/Class Code transactional entitlement rules.

Exact heads/tests live in `PROJECT_ENGINEERING_LOG.md`.

## 5. Content source / import — Stage9 VERIFIED

Canonical `alwaslh-go` revision:

`f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`

Verified inventory:

- 15 subject roots;
- 48 source documents;
- 5,552 images;
- 4,218 JPG;
- 1,334 WEBP;
- 86 recognized helpers;
- 24 manifests;
- 0 fatal inventory issues;
- canonical SHA-256 `7b6c6e1e79d90cf68a72bc473c12ce23bf39c462708dcd10bc313fd535fbe729`.

Important boundary: Stage9 source records are **provenance/evidence**, not curriculum hierarchy authority.

## 6. Curriculum Structure — Stage13 backend foundation VERIFIED

Canonical doc:

- `docs/curriculum/CURRICULUM_STRUCTURE.md`.

Verified executable head:

`6484677dffa80ca0658ce5837750d824e1bb6943`

Verified hierarchy:

```text
Class / Grade
→ Subject Offering (`subject_class_links`)
→ Unit / Section (optional, `curriculum_sections`)
→ Lesson
→ Content / pages / resources
```

Key rules:

- do **not** create a parallel `subject_offerings` table;
- do **not** introduce a recursive Generic Tree without a new product decision;
- `lessons.section_id` is optional;
- PostgreSQL composite FK guarantees lesson and section belong to the same Class/Subject Offering;
- Admin curriculum mutations are audited in `curriculum_events`;
- no destructive Admin DELETE route in the verified foundation;
- filenames/folders do not silently create curriculum hierarchy.

Same-head evidence:

- Stage13 `34092024879` SUCCESS;
- Stage12 `34092024902` SUCCESS;
- Stage11 `34092024875` SUCCESS;
- OCR `34092024895` SUCCESS;
- Stage10 `34092024854` SUCCESS;
- Stage9 `34092024883` SUCCESS;
- Full Rebuild `34092024916` SUCCESS including Chromium.

Current next work: Stage13 Admin Web curriculum/content integration over this API.

## 7. Media Pipeline — Stage10 VERIFIED

Relevant docs:

- `docs/media/MEDIA_PIPELINE_ARCHITECTURE.md`;
- `docs/media/MEDIA_STAGE_DOD.md`;
- `database/migrations/0009_media_pipeline.sql`.

Student browser media quality/delivery tuning remains a later product/runtime gate.

## 8. OCR / AI / TTS

### OCR — VERIFIED

Durable lease/retry, checksum/media guards, review gates, approved-only downstream text and real Tesseract integration are verified.

### AI — Stage11 + Stage12 backend lifecycle/runtime VERIFIED

Canonical docs:

- `docs/ai/AI_PROVIDER_MODEL_STRATEGY.md`;
- `docs/ai/STAGE12_JOB_LIFECYCLE.md`;
- `docs/ai/STAGE12_WORKER_RUNTIME.md`.

Stage12 verified scope: durable jobs/units/leases, bounded retry/cascade, distributed capacity/backpressure, kill/cooldown/Retry-After/budget controls, full route runtime identity, cancellation/partial success, pause/resume/progress, centralized lifecycle ownership and dedicated bounded worker runtime separate from Fastify.

Still `NOT YET VERIFIED` and must not be faked:

- authorized live provider adapters/credentials;
- live provider/model benchmark;
- production routes/models;
- production live-provider worker bootstrap;
- current pricing/actual billing reconciliation;
- hosted AI worker runtime.

### TTS — NOT YET VERIFIED

Target remains approved text → cached/versioned audio. No generation per Play.

## 9. Student product target

`apps/student-web` is installable Web/PWA and browser-usable. Core target includes Welcome/auth, curriculum, Reader, Text/Search/TTS, summaries, Practice/Tests/Models, ministerials, Notes, Favorites, Needs Review, progress/private achievements, notifications, multiple Class Codes and Offline downloads.

Stage6/8 auth/device foundation is verified; later Student work must preserve it.

## 10. Admin product target — Stage13 ACTIVE

`apps/admin-web` is separate Super Admin Web.

Core target:

```text
Auth/Shell
→ Overview
→ Curriculum/Content
→ Media/OCR/TTS state
→ AI Jobs/Generation
→ Question Bank/Review/Publish
→ Students/Codes/Recovery/Device Rebind
→ Notifications
→ Import/Export/Reports
→ Settings/Audit
```

Curriculum backend is now verified. Admin Web must consume `/v1/admin/curriculum` and must not introduce direct DB access, page-local authoritative storage or duplicate curriculum/AI queues.

## 11. Deployment / Preview status

Reference: `docs/engineering/DEVELOPMENT_RUNTIME_AND_PREVIEW_POLICY.md`.

**Current decision:** deployment is `DEFERRED BY PRODUCT OWNER`.

Therefore:

- do not auto-sync/deploy based on older Preview policy;
- do not re-enable Git auto-deployment;
- hosted Student/Admin/API/media/OCR/AI behavior remains `NOT YET VERIFIED` until explicitly re-enabled and tested;
- Preview history does not redefine Production architecture.

## 12. Documentation governance

After every meaningful batch:

- update `PROJECT_STATUS.md`;
- update `PROJECT_ENGINEERING_LOG.md`;
- update `PROJECT_HANDOFF.md` when architecture/branch/CI/runtime changes;
- update specialized docs and this index when status changes;
- update parity/coverage evidence for implemented product features;
- record exact commit/run evidence;
- use `NOT YET VERIFIED` for unexecuted work.

Stale `PENDING` documentation after exact-head verification is an engineering defect.

## 13. Engineering non-negotiables

- Correctness > Cleverness;
- Evidence > Assumptions;
- no patching around root causes as final architecture;
- no weakened tests/auth/validation to make CI green;
- no hidden errors or duplicate authority implementations;
- unified Design System/shared primitives where appropriate;
- preserve valuable legacy outcomes unless Product Owner explicitly approves removal;
- incremental verified changes over blind rewrite;
- deployment/live-provider readiness are evidence boundaries, not states to infer.
