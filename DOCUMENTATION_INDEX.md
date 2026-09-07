# DOCUMENTATION INDEX — الوسيلة الذكية

> خريطة التوثيق الرسمية للمشروع. الحالة التنفيذية تؤخذ من `PROJECT_HANDOFF.md` و`PROJECT_STATUS.md` و`PROJECT_ENGINEERING_LOG.md`; أي شيء غير منفذ/مختبر يوسم `NOT YET VERIFIED`.

## 1. ابدأ من هنا دائمًا

اقرأ بالترتيب:

1. `PROJECT_HANDOFF.md` — السياق التنفيذي والحدود المعمارية وآخر exact head/CI evidence.
2. `PROJECT_STATUS.md` — المرحلة الحالية وما اكتمل وما بقي.
3. `PROJECT_ENGINEERING_LOG.md` — التاريخ الهندسي، Architecture Decisions، Audit Findings، Tests/Known Issues.
4. `docs/product/PRODUCT_EVOLUTION_REVIEW.md` + Product Decisions Batches 05–06.
5. `MASTER_REBUILD_ROADMAP.md` — الخطة التنفيذية والمراحل القادمة.
6. `docs/engineering/DEVELOPMENT_RUNTIME_AND_PREVIEW_POLICY.md` — runtime policy؛ قرار Product Owner الحالي بتأجيل النشر أعلى سلطة.
7. `NEXT_CONVERSATION_PROMPT.md` — مساعد للاستئناف فقط.

## 2. Legacy coverage — hard gate

راجع دائمًا:

- `PRODUCT_FEATURE_PARITY_MATRIX.md`;
- `PROJECT_DEEP_AUDIT.md`;
- `PROJECT_FULL_AUDIT_CATALOG.md`;
- `PROJECT_REBUILD_BLUEPRINT.md`;
- `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md`;
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

## 3. Current verified executable baseline

Exact executable head:

`d3e621e6f60cc56ee3838b7df36a86ebafa37524`

Same-head evidence:

- Stage13 Curriculum Verification `34168788666` — SUCCESS including Admin Chromium;
- Stage12 AI Execution `34168788667` — SUCCESS;
- Stage11 AI Contracts `34168788661` — SUCCESS;
- OCR Foundation `34168788704` — SUCCESS;
- Stage10 Media `34168788646` — SUCCESS;
- Stage9 Content Import `34168788663` — SUCCESS;
- Full Rebuild `34168788747` — SUCCESS including Student Chromium.

## 4. Auth / Access / Activation — VERIFIED

Stage6–8 verified scope includes two-step Full Code activation, mandatory password lifecycle, P-256 registered-device challenge, device-bound sessions, temporary-password recovery, Admin reset/rebind and transactional Full/Class Code entitlement rules.

Exact historical heads/tests live in `PROJECT_ENGINEERING_LOG.md`.

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

Stage9 is provenance/evidence, not curriculum hierarchy authority.

## 6. Curriculum Structure — Stage13 backend VERIFIED

Canonical doc: `docs/curriculum/CURRICULUM_STRUCTURE.md`.

```text
Class / Grade
→ Subject Offering (`subject_class_links`)
→ Unit / Section (optional)
→ Lesson
→ Content / pages / resources
```

Do not create parallel Subject Offering authority or recursive Generic Tree without a new product decision. Lesson/section offering scope is PostgreSQL-enforced.

## 7. Admin Curriculum Web — Stage13 VERIFIED

Canonical doc: `docs/admin/STAGE13_ADMIN_CURRICULUM_UI.md`.

Verified scope:

- separate Admin login/session restore/logout;
- real server-backed curriculum counts;
- Class/Subject/Offering/Section/Lesson create/edit/status/order;
- sectioned/unsectioned Lesson movement;
- loading/error/empty/mutation states;
- RTL responsive UI;
- fresh-PostgreSQL Chromium flow and 390px overflow check.

This verified subset does not imply completion of all Admin parity rows.

## 8. Media Pipeline — Stage10 VERIFIED

Relevant docs:

- `docs/media/MEDIA_PIPELINE_ARCHITECTURE.md`;
- `docs/media/MEDIA_STAGE_DOD.md`;
- `database/migrations/0009_media_pipeline.sql`.

Stage10 provides deterministic source/display/thumbnail/ai variants, ordering/checksum/provenance and storage abstraction. `lesson_assets` publication/linking is a separate unresolved contract.

## 9. OCR / AI / TTS

### OCR — VERIFIED backend foundation

Durable lease/retry, checksum/media guards, raw + normalized text, review gates, approved-only downstream search and real Tesseract wiring are verified.

### AI — Stage11 + Stage12 backend lifecycle/runtime VERIFIED

Canonical docs:

- `docs/ai/AI_PROVIDER_MODEL_STRATEGY.md`;
- `docs/ai/STAGE12_JOB_LIFECYCLE.md`;
- `docs/ai/STAGE12_WORKER_RUNTIME.md`.

Still `NOT YET VERIFIED`: authorized live provider adapters/credentials, live benchmark, production routes/models, production provider worker bootstrap, current billing reconciliation and hosted worker runtime.

### TTS — NOT YET VERIFIED

Target remains approved text → cached/versioned audio. No generation per Play.

## 10. Current Stage13 focus — Content / Media / OCR Operations

Next architecture:

```text
Stage9 source document/assets
→ Admin operations read model
→ Stage10 media/variant state
→ OCR extraction/review state
→ Admin extraction detail/review
```

Rules:

- no browser-direct DB or worker execution;
- no second OCR/media queue;
- source class/subject labels are source facets, not curriculum authority;
- media/OCR state is not published lesson content until a verified media→`lesson_assets` contract exists;
- upload/progress/history is a separate explicit workflow if/when implemented.

A specialized Stage13 Content/Media/OCR document must be created with the implementation batch.

## 11. Student product target

`apps/student-web` remains installable Web/PWA and browser-usable. Stage6/8 auth/device foundation is verified; curriculum/Reader/practice/personal-data/offline work continues in later stages.

## 12. Admin product target — Stage13 ACTIVE

```text
Auth/Shell                       VERIFIED
→ Curriculum hierarchy          VERIFIED
→ Content / Media / OCR          CURRENT
→ AI Jobs/Generation             NEXT
→ Question Bank/Review/Publish
→ Students/Codes/Recovery/Device Rebind
→ Notifications
→ Import/Export/Reports
→ Settings/Audit
```

## 13. Deployment / Preview status

**Current decision:** deployment is `DEFERRED BY PRODUCT OWNER`.

Therefore do not auto-sync/deploy, do not re-enable Git auto-deployment, and keep hosted behavior `NOT YET VERIFIED` until explicitly re-enabled and tested.

## 14. Documentation governance

After every meaningful batch:

- update `PROJECT_STATUS.md`;
- update `PROJECT_ENGINEERING_LOG.md`;
- update `PROJECT_HANDOFF.md` when architecture/branch/CI/runtime changes;
- update specialized docs and this index when status changes;
- update parity/coverage evidence;
- record exact commit/run evidence;
- use `NOT YET VERIFIED` for unexecuted work.

Stale `PENDING` documentation after exact-head verification is an engineering defect.
