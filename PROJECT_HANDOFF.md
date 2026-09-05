# PROJECT HANDOFF — الوسيلة الذكية

> اقرأ بالترتيب: `PROJECT_STATUS.md` → `PROJECT_ENGINEERING_LOG.md` → `docs/product/PRODUCT_EVOLUTION_REVIEW.md` → `docs/product/PRODUCT_DECISIONS_BATCH_05.md` → `docs/ai/AI_PROVIDER_MODEL_STRATEGY.md` → `PRODUCT_FEATURE_PARITY_MATRIX.md` → `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` → `MASTER_REBUILD_ROADMAP.md`. المستودع وCI هما source of truth؛ لا تعتمد على ذاكرة المحادثة.

## 1. Product direction

**الفكرة الأساسية ثابتة.** الوسيلة الذكية منصة تعليمية عربية للطالب، مع Super Admin لإدارة المنهج والمحتوى والطلاب والوصول والـAI والتشغيل.

التطبيق القديم مرجع شامل للمميزات والسيناريوهات. **لا تُحذف Feature قديمة ذات قيمة بدون قرار صريح من Product Owner.** نعيد تنظيمها/بناءها إذا كانت الطريقة القديمة ضعيفة، لكن لا نسقط النتيجة الوظيفية.

Product Review Batches 01–05 حسمت Core Product بما يكفي لاستئناف التنفيذ. التفاصيل الروتينية تُختار هندسيًا بالأبسط والأصح وفق PED-048؛ لا نعيد فتح النقاش إلا لقرار Business حقيقي.

## 2. Verified engineering baseline

Stages 1–10 verified at documented levels. Final Stage10 head `27c6a2ef1118ee44d2e63471e4f925e1296283e0` passed:
- Stage10 `33302270707` SUCCESS؛
- Stage9 regression `33302270692` SUCCESS؛
- Full Rebuild `33302270695` SUCCESS including Chromium E2E.

Baseline:
- private PostgreSQL behind Backend API؛
- scrypt credentials + opaque HttpOnly sessions؛
- Full Code 6 digits / Class Code 7 digits؛
- transactional/idempotent activation/redemption؛
- Stage9 deterministic source import: 15 roots / 48 docs / 5,552 images / 0 fatal issues؛
- Stage10 Sharp/Poppler deterministic media pipeline with variants/checksums/order/idempotency/cleanup.

## 3. Product decisions — Batches 01–05

### Student entry/account/access
- Welcome before auth.
- `تفعيل جديد` / `لدي حساب بالفعل`.
- two-step activation with one-time verification ticket and atomic final account creation.
- Admin-assisted temporary password + revoke sessions + forced private password change.
- one registered cryptographic application-device key per Student account; lost/different device requires Admin reset/rebind.
- Full Code 6 digits remains core.
- Student can redeem additional 7-digit Class Codes after login and hold multiple class entitlements; Stage7 no-waste/renewal/race/idempotency protections remain.

### Student learning
Preserve/improve all valuable legacy capabilities: curriculum, Reader, summaries, `اختبر نفسك`, full/custom tests, original ministerial models, explanations, question images, versions, filters, resume/restart/attempt history, Notes, Favorites, Needs Review, progress/private achievements and Offline/PWA.

- `اختبر نفسك`: immediate feedback + correct answer + published explanation after each question.
- Full Test/Model: result/review at end.
- Student custom tests use only Admin-reviewed **Published Question Bank**; no live AI generation for Student sessions.
- Original ministerial model stays exact/provenanced; simulated model is a separate future type.
- Notes launch with all useful legacy forms: text, image, capture and audio.
- Favorites and Needs Review are separate semantics.
- Needs Review supports manual add and automatic repeated-error detection; implementation default target = same question wrong twice in independent attempts, configurable later from evidence.
- Progress/weak areas are server-derived from real attempts/practice/history and must require enough evidence before recommending a lesson for review.
- Personal achievements only; no Global Leaderboard.

### Reader / media / search / TTS
- source/original image retained internally as evidence.
- Student receives optimized display/thumbnail/offline variants, not huge originals by default.
- readability of Arabic/formulas/tables must be tested before final quality limits.
- optional approved OCR/published Text View.
- Arabic search to exact lesson/page/source.
- cached/versioned Arabic TTS `استماع للدرس`, generated from approved text, not per Play.
- no independent Highlights currently.

### Notifications / Offline / performance
- Web/PWA Push Notifications required from initial product when supported, with explicit permission.
- gentle study reminders: default max 3/week, never more than 1/day, quiet hours and opt-out.
- useful content/access/Admin messages may also Push; In-App Notification Center remains fallback.
- Lesson + Subject + explicit Book downloads.
- Download Manager with size/progress/retry/cancel/remove.
- account/device-scoped state + delta sync + outbox.
- signed Offline authorization lease max 14 days capped by entitlement expiry.
- avoid repeated full API refetches.

### Curriculum/Admin/UX
- multiple classes and subjects supported.
- target hierarchy: `Class → Subject Offering → optional Unit → Lesson → Content` with explicit ordering.
- no mandatory yearly curriculum version lifecycle; source year/edition only as optional metadata where useful.
- **Admin role = Super Admin only** for current scope.
- upload independent from OCR/AI/TTS.
- contextual in-place instructions required throughout Student/Admin UX.
- Draft → Review → Published.
- Import/Export required.
- unified Design System required: `packages/brand` + shared tokens/components; no page-by-page duplicated Button/Form/Card/Modal/style implementations.

### AI authoring / model strategy
- AI is **provider/model-neutral**, not Gemini-specific.
- canonical strategy: `docs/ai/AI_PROVIDER_MODEL_STRATEGY.md`.
- preserve valuable legacy generation modes/outcomes.
- OCR-text-first + source/page provenance; vision fallback only when required.
- generated-from-book questions cannot Publish without source + page provenance.
- durable high-throughput architecture: OCR reuse, bounded durable units, queue/backpressure, per-provider/model concurrency, health/rate/quota/cooldown, retry/backoff, partial-success persistence, idempotency, cancel/resume/progress, validation/dedupe/provenance and token/cost/latency telemetry.
- model cascade where benchmark supports it: cheap/fast approved model first, escalate only failed/uncertain unit to stronger model.
- free/near-free providers/models may be used when reliability/privacy/quality fit; random free routing is not a production correctness dependency.
- success metric = accepted useful outputs per cost/token/time, not request count.

## 4. Mandatory engineering governance

### Root-cause policy
No patching as final architecture. Before modification understand inputs/outputs/dependencies/callers/side effects/edge cases and fix the root cause.

Not acceptable as final fixes:
- disabling/weaking tests؛
- auth/validation bypass؛
- duplicated alternate implementation؛
- silent catch/fallback that hides bad data؛
- hard-coded production exception؛
- UI workaround hiding a Backend/Data defect.

Temporary Preview workaround is allowed only if documented as Known Issue with impact and removal path.

### Design governance
One coherent visual/product system. Shared tokens/components/states are preferred over repeated page-specific copies. Admin may be denser and Student touch-first, but both share the same brand and component contracts. Duplicate style/component audit is required before Stage13/14 closure.

## 5. Legacy feature coverage gate

`PRODUCT_FEATURE_PARITY_MATRIX.md` + `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` are hard gates before Student/Admin feature completion. Every legacy capability must map to a target flow/module and executable evidence, or explicit Product Owner-approved removal.

## 6. Affected implementation roadmap

1. Finish Product Review documentation/CI closure.
2. Stage10 Preview Sync: apply `0009`, lock down new tables, reconcile Vercel build/routing and verify optimized Student media delivery.
3. Stage6/8 partial reopen: two-step activation + forced password change + registered device challenge/rebind + security/Chromium E2E.
4. OCR Extraction Foundation.
5. Stage11 provider-neutral AI contracts + golden benchmark + provenance/validators.
6. Stage12 durable multi-provider/model high-throughput execution + router/cascade/scheduler.
7. Stage13 Super Admin Product only; no multi-role RBAC.
8. Stage14 Student Product: Reader page/text/search/TTS + all agreed learning features.
9. Stage15 trusted Practice/Test/Model engine using Published Question Bank + repeated-error events.
10. Stage16 mandatory Offline/PWA + 14-day lease.
11. Stage17 Notes/Favorites/Needs Review, including text/image/capture/audio.
12. Stage18 Push/In-App Notifications with gentle reminder policy.
13. Stage19 server-derived progress/weak-area/private achievements.
14. Stage20 Import/Export/Reporting required.
15. Later performance/security/tests/accessibility/content-load/staging/release/production/ops gates unchanged.

## 7. Preview

Temporary only: Supabase `linksoftt`; Vercel `alwaslh` team `wasl15`; preview branch `preview/supabase-vercel` at `1eb623ef0cd3f7b47af7aa6add08c87d88f84f81`; READY and `/api/health` HTTP 200 verified. Preview remains pre-Stage10; Vercel output-dir mismatch and serverless media/Poppler durability remain unresolved/`NOT YET VERIFIED`.

## 8. Mandatory continuation

After every meaningful implementation batch:
- update `PROJECT_STATUS.md`؛
- update `PROJECT_ENGINEERING_LOG.md`؛
- update this Handoff when business/architecture/branch/CI/preview state changes؛
- update relevant Product Decision/AI docs؛
- update parity/coverage evidence as features are implemented؛
- retain exact CI/run/runtime evidence؛
- unexecuted = `NOT YET VERIFIED`؛
- never patch around root causes as final design؛
- never remove a valuable legacy feature without explicit owner approval.
