# DOCUMENTATION INDEX — الوسيلة الذكية

> هذا الملف هو خريطة التوثيق للمشروع. الهدف أن تستطيع أي محادثة/مهندس استئناف العمل من المستودع نفسه بدون الاعتماد على chat memory.

## 1. ابدأ من هنا دائمًا

اقرأ بالترتيب:

1. `PROJECT_HANDOFF.md` — handoff الحالي والسياق التنفيذي.
2. `PROJECT_STATUS.md` — المرحلة الحالية، ما اكتمل، ما بقي، آخر verification، والخطوة التالية.
3. `PROJECT_ENGINEERING_LOG.md` — التاريخ الهندسي، Architecture Decisions، Audit Findings، Changes/Tests/Known Issues.
4. `docs/product/PRODUCT_EVOLUTION_REVIEW.md` — قرارات المنتج Batches 01–04.
5. `docs/product/PRODUCT_DECISIONS_BATCH_05.md` — Notes/Notifications/AI provider-neutral/root-cause/design-system decisions.
6. `docs/product/PRODUCT_DECISIONS_BATCH_06.md` — Student PWA vs Admin Web، preview deployment policy، legacy/documentation continuity.
7. `MASTER_REBUILD_ROADMAP.md` — الخطة التنفيذية والمراحل القادمة.
8. `docs/engineering/DEVELOPMENT_RUNTIME_AND_PREVIEW_POLICY.md` — Student/Admin/API surfaces + temporary Supabase/Vercel deployment policy.
9. `NEXT_CONVERSATION_PROMPT.md` — Prompt جاهز لمحادثة جديدة.

## 2. مرجع التطبيق القديم — لا تتجاهله

التطبيق القديم مرجع **للفكرة، المميزات، السيناريوهات، المشاكل والدروس**، لكنه ليس specification تقنيًا أو تصميمًا يجب نسخه.

عند تنفيذ أي Student/Admin module راجع حسب الحاجة:

- `PRODUCT_FEATURE_PARITY_MATRIX.md` — inventory شامل للمميزات/السيناريوهات المطلوبة.
- `PROJECT_DEEP_AUDIT.md` — تحليل معمق للمشروع القديم ومشكلاته.
- `PROJECT_FULL_AUDIT_CATALOG.md` — catalog موسع للأدلة والمشكلات والمكونات.
- `PROJECT_REBUILD_BLUEPRINT.md` — blueprint وفهم إعادة البناء.
- `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` — hard gate يمنع ضياع Feature ذات قيمة.
- `OFFLINE_MODE.md` — مرجع Offline القديم/المطلوب.
- `OFFLINE_MODE_README.md` — تفاصيل إضافية عن Offline القديم.

### قاعدة legacy coverage

كل capability قديمة تمر عبر:

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
- `docs/engineering/DEVELOPMENT_RUNTIME_AND_PREVIEW_POLICY.md` — runtime/preview policy.

## 4. Auth / Access / Activation

- راجع `PROJECT_ENGINEERING_LOG.md` و`PROJECT_HANDOFF.md` للـverified Stage6–8 baseline.
- Stage8 baseline verified سابقًا، لكن Product Decisions أعادت فتح جزء منه رسميًا للتفعيل على مرحلتين + forced password change + registered-device challenge/rebind.
- لا تعتبر القرارات الجديدة implemented قبل API/PostgreSQL/security/Chromium gates.

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

Stage10 is verified at CLI + PostgreSQL + MEDIA RUNTIME level.

Relevant docs:

- `docs/media/MEDIA_PIPELINE_ARCHITECTURE.md`.
- `docs/media/MEDIA_STAGE_DOD.md`.
- migration `database/migrations/0009_media_pipeline.sql`.

Final verified Stage10 head:

`27c6a2ef1118ee44d2e63471e4f925e1296283e0`

Final CI:

- Stage10 `33302270707` SUCCESS؛
- Stage9 regression `33302270692` SUCCESS؛
- Full Rebuild `33302270695` SUCCESS including Chromium E2E.

Student browser media quality/delivery tuning is a later runtime gate and remains separate from Stage10 core processing proof.

## 7. AI / OCR / TTS

- `docs/ai/AI_PROVIDER_MODEL_STRATEGY.md` — canonical provider/model-neutral AI strategy.
- Product decisions require OCR-text-first reuse, provider abstraction, source/page provenance, Admin review, durable chunked jobs, bounded concurrency/backpressure, partial success, retries/cooldown, idempotency and benchmark-driven model routing.
- AI is not locked to Gemini.
- free/near-free providers/models may be benchmarked but are never trusted as production dependency without evidence.
- TTS uses approved text and cached/versioned audio; no generation per Play.

Implementation status for OCR/AI/TTS after Product Review: `NOT YET VERIFIED` until their stages execute.

## 8. Student product target

`apps/student-web` is the Student product.

It is:

- Web/PWA؛
- installable like the old product outcome؛
- mobile-first؛
- offline-first where content is synchronized/downloaded؛
- separate from Admin Web؛
- protected by the recorded account/device/auth rules؛
- feature-complete according to legacy coverage + Product Decisions.

Core target includes Welcome, activation/returning login, curriculum, Reader page/text/search/TTS, summaries, `اختبر نفسك`, tests/models, original ministerials, Notes text/image/capture/audio, Favorites, Needs Review, progress/private achievements, Push/In-App notifications, multiple Class Codes/access and Offline downloads.

## 9. Admin product target

`apps/admin-web` is a separate Admin Web surface.

Current product scope = **Super Admin only**.

Core target includes curriculum/classes/subjects/optional units/lessons, upload/media processing, OCR/TTS status, AI generation, Question Bank/QA, Draft→Review→Published, students/accounts/codes/recovery/device rebind, notifications, Import/Export/reports/settings/audit.

Admin and Student share Design System primitives/brand where appropriate but must not share navigation/auth UX or leak functionality between surfaces.

## 10. Preview during development

Canonical policy: `docs/engineering/DEVELOPMENT_RUNTIME_AND_PREVIEW_POLICY.md`.

Current temporary environment:

- Supabase `linksoftt` — temporary PostgreSQL/testing host only.
- Vercel project `alwaslh`, team `wasl15` — temporary web/runtime host.
- integration branch `preview/supabase-vercel`.

Purpose: Product Owner can supervise/test stable work continuously during rebuild.

Rule: validated implementation → Preview sync → deploy → runtime verification → document evidence.

Preview does **not** redefine final Production architecture.

## 11. Documentation governance

After every meaningful batch:

- update `PROJECT_STATUS.md`؛
- update `PROJECT_ENGINEERING_LOG.md`؛
- update `PROJECT_HANDOFF.md` when business/architecture/branch/CI/Preview changes؛
- update specialized docs؛
- update legacy parity/coverage evidence for implemented features؛
- record exact commit/CI/runtime evidence؛
- use `NOT YET VERIFIED` for anything not actually tested.

## 12. Engineering non-negotiables

- no patching around root causes as final architecture؛
- understand inputs/outputs/dependencies/callers/side effects/edge cases before changes؛
- no weakened tests/auth/validation to make CI green؛
- no hidden errors or duplicate alternate implementations؛
- unified Design System/shared components؛
- preserve valuable legacy outcomes unless Product Owner explicitly approves removal؛
- incremental verified changes over blind rewrite.
