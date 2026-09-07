# DOCUMENTATION INDEX — الوسيلة الذكية

> هذا الملف هو خريطة التوثيق للمشروع. الهدف أن يستطيع أي مهندس أو محادثة استئناف العمل من المستودع نفسه بدون الاعتماد على chat memory. الحالة التنفيذية الحالية تؤخذ من `PROJECT_HANDOFF.md` و`PROJECT_STATUS.md` و`PROJECT_ENGINEERING_LOG.md`، وأي شيء غير منفذ/مختبر يوسم `NOT YET VERIFIED`.

## 1. ابدأ من هنا دائمًا

اقرأ بالترتيب:

1. `PROJECT_HANDOFF.md` — handoff الحالي، الحدود المعمارية، آخر exact head والـCI evidence.
2. `PROJECT_STATUS.md` — المرحلة الحالية، ما اكتمل، ما بقي، آخر verification، والخطوة التالية.
3. `PROJECT_ENGINEERING_LOG.md` — التاريخ الهندسي المتسلسل، Architecture Decisions، Audit Findings، Changes/Tests/Known Issues.
4. `docs/product/PRODUCT_EVOLUTION_REVIEW.md` — قرارات المنتج Batches 01–04.
5. `docs/product/PRODUCT_DECISIONS_BATCH_05.md` — Notes/Notifications/AI provider-neutral/root-cause/design-system decisions.
6. `docs/product/PRODUCT_DECISIONS_BATCH_06.md` — Student PWA vs Admin Web، deployment policy، legacy/documentation continuity.
7. `MASTER_REBUILD_ROADMAP.md` — الخطة التنفيذية والمراحل القادمة.
8. `docs/engineering/DEVELOPMENT_RUNTIME_AND_PREVIEW_POLICY.md` — runtime/Preview architecture policy؛ لا تتجاوز قرار Product Owner الحالي بتأجيل النشر.
9. `NEXT_CONVERSATION_PROMPT.md` — Prompt جاهز لمحادثة جديدة، لكن الملفات أعلاه تظل المصدر الأعلى.

## 2. مرجع التطبيق القديم — لا تتجاهله

التطبيق القديم مرجع **للفكرة، المميزات، السيناريوهات، المشاكل والدروس**، لكنه ليس specification تقنيًا أو تصميمًا يجب نسخه.

عند تنفيذ أي Student/Admin module راجع حسب الحاجة:

- `PRODUCT_FEATURE_PARITY_MATRIX.md` — inventory شامل للمميزات/السيناريوهات المطلوبة.
- `PROJECT_DEEP_AUDIT.md` — تحليل معمق للمشروع القديم ومشكلاته.
- `PROJECT_FULL_AUDIT_CATALOG.md` — catalog موسع للأدلة والمشكلات والمكونات.
- `PROJECT_REBUILD_BLUEPRINT.md` — blueprint وفهم إعادة البناء.
- `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` — hard gate يمنع ضياع Feature ذات قيمة.
- `OFFLINE_MODE.md` و`OFFLINE_MODE_README.md` — مرجع Offline القديم/المطلوب.

### قاعدة legacy coverage

```text
Legacy capability
→ KEEP / IMPROVE / REFACTOR / REBUILD / REMOVE(owner-approved only)
→ target module/flow
→ implementation evidence
→ test/acceptance evidence
```

لا تُغلق Stage13/14 feature parity قبل إكمال هذا الربط.

## 3. Architecture / Foundation

- `DATABASE_PLATFORM_ARCHITECTURE.md` — منصة PostgreSQL والحدود.
- `PROJECT_REBUILD_BLUEPRINT.md` — blueprint العام.
- `MASTER_REBUILD_ROADMAP.md` — مراحل التنفيذ.
- `docs/engineering/CLI_VERIFICATION_GATES.md` — verification policy/gates.
- `docs/engineering/DEVELOPMENT_RUNTIME_AND_PREVIEW_POLICY.md` — runtime/preview architecture policy.

Current foundation through Stage12 is verified on the exact executable head recorded in Status/Handoff/Log. Browser surfaces never own PostgreSQL/provider secrets or authoritative server state.

## 4. Auth / Access / Activation

Stage6–8 target refactor is **VERIFIED**, including:

- two-step Full Code activation ticket flow;
- mandatory password creation/change behavior;
- registered P-256 device challenge + device-bound session;
- temporary-password recovery + session revocation + forced private replacement;
- Admin device reset/rebind + historical-key reuse rejection;
- Full/Class Code transactional entitlement rules.

Use `PROJECT_ENGINEERING_LOG.md` for exact closure heads, tests and findings. Do not resurrect the older password-only/device-bypass behavior.

## 5. Content source / import

Canonical `alwaslh-go` source revision:

`f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`

Stage9 verified facts:

- 15 subject roots؛
- 48 source documents؛
- 5,552 images؛
- 4,218 JPG؛
- 1,334 WEBP؛
- 86 recognized helpers؛
- 24 manifests؛
- 0 fatal inventory issues؛
- canonical inventory SHA-256 `7b6c6e1e79d90cf68a72bc473c12ce23bf39c462708dcd10bc313fd535fbe729`.

Relevant docs/contracts/tooling live under `content/` and content sections of `PROJECT_ENGINEERING_LOG.md`.

## 6. Media Pipeline

Stage10 is **VERIFIED** at CLI + PostgreSQL + media runtime level.

Relevant docs:

- `docs/media/MEDIA_PIPELINE_ARCHITECTURE.md`.
- `docs/media/MEDIA_STAGE_DOD.md`.
- migration `database/migrations/0009_media_pipeline.sql`.

Student browser media quality/delivery tuning is a later product/runtime gate and remains separate from core processing proof.

## 7. OCR / AI / TTS

### OCR — VERIFIED

OCR Foundation is verified with durable lease/retry, checksum/media guards, review gates, approved-only downstream text and real Tesseract Arabic/English integration evidence. Exact heads/runs are in `PROJECT_ENGINEERING_LOG.md`.

### AI — Stage11 + Stage12 backend lifecycle/runtime VERIFIED

Canonical docs:

- `docs/ai/AI_PROVIDER_MODEL_STRATEGY.md` — provider/model-neutral strategy, benchmark/routing/evidence boundaries.
- `docs/ai/STAGE12_JOB_LIFECYCLE.md` — explicit pause/resume/progress, claim locking and expired-lease recovery.
- `docs/ai/STAGE12_WORKER_RUNTIME.md` — bounded worker slots/polling, graceful drain and fail-fast process behavior.

Latest fully verified executable AI/backend head:

`45a902eb94cf574ebbcf29e1d0e9b2ca0ae6f894`

Same-head evidence:

- Stage12 `34089764278` SUCCESS؛
- Stage11 `34089764339` SUCCESS؛
- OCR `34089764349` SUCCESS؛
- Stage10 `34089764277` SUCCESS؛
- Stage9 `34089764344` SUCCESS؛
- Full Rebuild `34089764467` SUCCESS including Chromium.

Verified Stage12 scope includes durable plans/units/leases, bounded retry/cascade, distributed capacity/backpressure, kill switches, Retry-After/health cooldown, conservative budgets, full route runtime identity, cancellation/partial success, explicit pause/resume/progress, centralized claim/lease-recovery ownership and a dedicated bounded worker lifecycle separate from Fastify.

Still **NOT YET VERIFIED** and must not be faked:

- authorized live provider adapters/credentials;
- live cross-provider/model benchmark;
- production route/model defaults;
- production live-provider `worker.ts` bootstrap;
- current pricing / actual provider billing reconciliation;
- hosted AI worker runtime while deployment is deferred.

AI remains provider-neutral and is not locked to Gemini or any provider. Free/near-free routes can be benchmark candidates but cannot become production dependencies without evidence.

### TTS — NOT YET VERIFIED

Target rule remains approved text → cached/versioned audio. Do not generate on every Play. TTS implementation/runtime is a later stage and must not be inferred from OCR/AI completion.

## 8. Student product target

`apps/student-web` is the Student product: installable Web/PWA, browser-usable, mobile-first and eventually offline-first for synchronized/downloaded content.

Core target includes Welcome, verified activation/returning login, curriculum, Reader page/text/search/TTS, summaries, `اختبر نفسك`, tests/models, original ministerials, Notes text/image/capture/audio, Favorites, Needs Review, progress/private achievements, Push/In-App notifications, multiple Class Codes/access and Offline downloads.

Auth/device backend foundations are verified; later Student product features must preserve those contracts.

## 9. Admin product target

`apps/admin-web` is a separate Super Admin Web surface.

Core target includes curriculum/classes/subjects/optional units/lessons, upload/media processing, OCR/TTS status, AI generation/jobs, Question Bank/QA, Draft→Review→Published, students/accounts/codes/recovery/device rebind, notifications, Import/Export/reports/settings/audit.

Stage13/Admin AI operations must consume the verified Stage12 backend contracts rather than introducing a new queue, client-owned progress or direct provider calls.

Admin and Student share Design System primitives/brand where appropriate but must not share navigation/auth UX or leak functionality between surfaces.

## 10. Deployment / Preview status

Architecture/policy reference: `docs/engineering/DEVELOPMENT_RUNTIME_AND_PREVIEW_POLICY.md`.

**Current operational decision:** deployment is `DEFERRED BY PRODUCT OWNER`.

Therefore:

- do not auto-sync stable branches to Preview merely because older policy described that flow;
- do not re-enable Git auto-deployment;
- hosted Student/Admin/API/media/OCR/AI worker behavior remains `NOT YET VERIFIED` unless deployment is explicitly re-enabled and runtime evidence is recorded;
- Preview history does not redefine final Production architecture.

## 11. Documentation governance

After every meaningful batch:

- update `PROJECT_STATUS.md`؛
- update `PROJECT_ENGINEERING_LOG.md`؛
- update `PROJECT_HANDOFF.md` when architecture/branch/CI/runtime state changes؛
- update specialized docs and this index when their status changes؛
- update legacy parity/coverage evidence for implemented product features؛
- record exact commit/CI/runtime evidence؛
- use `NOT YET VERIFIED` for anything not actually tested.

Do not let a specialized document remain `PENDING` after its exact executable head is verified; stale documentation is treated as an engineering defect.

## 12. Engineering non-negotiables

- no patching around root causes as final architecture؛
- understand inputs/outputs/dependencies/callers/side effects/edge cases before changes؛
- no weakened tests/auth/validation to make CI green؛
- no hidden errors or duplicate alternate implementations؛
- unified Design System/shared components where appropriate؛
- preserve valuable legacy outcomes unless Product Owner explicitly approves removal؛
- incremental verified changes over blind rewrite؛
- Evidence > Assumptions؛
- deployment state and live-provider readiness are evidence boundaries, not labels to infer.
