# PROJECT HANDOFF — الوسيلة الذكية

> اقرأ بالترتيب: `PROJECT_STATUS.md` → `PROJECT_ENGINEERING_LOG.md` → `docs/product/PRODUCT_EVOLUTION_REVIEW.md` → `PRODUCT_FEATURE_PARITY_MATRIX.md` → `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` → `MASTER_REBUILD_ROADMAP.md`. المستودع وCI هما source of truth.

## 1. Product direction

**الفكرة الأساسية ثابتة.** الوسيلة الذكية منصة تعليمية عربية للطالب، مع Super Admin لإدارة المنهج والمحتوى والطلاب والوصول والـAI والتشغيل.

التطبيق القديم مرجع شامل للمميزات والسيناريوهات. **لا تُحذف Feature قديمة ذات قيمة بدون قرار صريح من Product Owner.** نعيد تنظيمها/بناءها إذا كانت الطريقة القديمة ضعيفة، لكن لا نسقط النتيجة الوظيفية.

## 2. Verified engineering baseline

Stages 1–10 verified at documented levels. Final Stage10 head `27c6a2ef1118ee44d2e63471e4f925e1296283e0` passed:
- Stage10 `33302270707` SUCCESS;
- Stage9 regression `33302270692` SUCCESS;
- Full Rebuild `33302270695` SUCCESS including Chromium E2E.

Baseline:
- private PostgreSQL behind Backend API;
- scrypt credentials + opaque HttpOnly sessions;
- Full Code 6 digits / Class Code 7 digits;
- transactional/idempotent activation/redemption;
- Stage9 deterministic source import: 15 roots / 48 docs / 5,552 images / 0 fatal issues;
- Stage10 Sharp/Poppler deterministic media pipeline with variants/checksums/order/idempotency/cleanup.

## 3. Product decisions — Batches 01–04

Canonical source: `docs/product/PRODUCT_EVOLUTION_REVIEW.md`.

### Student entry/account/access
- Welcome before auth.
- `تفعيل جديد` / `لدي حساب بالفعل`.
- two-step activation with one-time verification ticket and atomic final account creation.
- Admin-assisted temporary password + session revocation + forced private password change.
- one registered cryptographic application-device key per Student account; different/lost device requires Admin reset/rebind.
- Full Code 6 digits remains core.
- Student can redeem additional 7-digit Class Codes after login and own multiple class entitlements; Stage7 renewal/no-waste/race protections remain.

### Student learning
Preserve/improve all valuable legacy capabilities: curriculum, Reader, summaries, `اختبر نفسك`, full/custom tests, original ministerial models, explanations, question images, versions, filters, resume/restart/attempt history, Notes, Favorites, Needs Review, progress/private achievements and Offline/PWA.

- `اختبر نفسك`: feedback + correct answer + published explanation immediately after each question.
- Full Test/Model: result/review at end.
- Student custom tests use only Admin-reviewed **Published Question Bank**; no live Gemini generation for Student sessions.
- Original ministerial model stays exact/provenanced; simulated model is a separate future type.

### Reader / media / search / TTS
- original/source image retained internally as evidence;
- Student receives optimized `display`/thumbnail/offline-appropriate variants, not huge originals by default;
- readability of Arabic/formulas/tables must be tested before quality limits are finalized;
- optional OCR/published Text View;
- Arabic search to exact lesson/page;
- cached/versioned Arabic TTS `استماع للدرس`, generated from approved text, not per Play;
- no separate Highlights currently.

### Offline/performance
- Lesson + Subject + explicit Book downloads.
- Download Manager with size/progress/retry/cancel/remove.
- account/device-scoped state + delta sync + outbox.
- signed Offline authorization lease max 14 days capped by entitlement expiry.
- avoid repeated full API refetches.

### Curriculum/Admin
- multiple classes and subjects supported.
- target hierarchy: `Class → Subject Offering → optional Unit → Lesson → Content` with explicit ordering.
- no mandatory yearly curriculum version system; optional source year/edition metadata only where useful.
- **Admin role = Super Admin only** for current product scope.
- upload independent from OCR/AI/TTS.
- contextual in-place instructions required in Student/Admin UX.
- Draft → Review → Published.
- Import/Export required.

### AI authoring / scale
- preserve valuable legacy generation modes/outcomes.
- OCR-text-first + source/page provenance; vision fallback only when required.
- generated-from-book questions cannot be published without source + page provenance.
- durable high-throughput generation architecture:
  - source text reused from OCR cache;
  - large requests split into bounded durable units;
  - queue + backpressure + bounded concurrency;
  - authorized Gemini credential/project scheduler;
  - 429/5xx retry/backoff/cooldown;
  - partial success persisted;
  - idempotency prevents duplicate regeneration;
  - cancel/resume/progress;
  - schema/semantic validation + duplicate detection;
  - Admin review before publish;
  - token/latency/output/error metrics.

Goal: maximize **accepted useful output per token/time** without exhausting server/provider resources.

## 4. Legacy feature coverage gate

`PRODUCT_FEATURE_PARITY_MATRIX.md` + `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` are hard gates before Student/Admin feature completion. Every legacy capability must map to a target flow/module and executable evidence, or explicit Product Owner-approved removal.

## 5. Affected implementation roadmap

1. Stage6/8 partial reopen: two-step activation + forced password change + registered device challenge/rebind + security/Chromium E2E.
2. Stage10 Preview Sync pending, including optimized Student media delivery verification.
3. OCR Extraction Foundation pending.
4. Stage11 AI contracts: generation modes + provenance + validators/golden tests.
5. Stage12 durable high-throughput AI execution per PED-038.
6. Stage13 Super Admin Product only; no multi-role RBAC scope.
7. Stage14 Student Product: Reader page/text/search/TTS + all agreed learning features.
8. Stage15 trusted Practice/Test/Model engine using Published Question Bank.
9. Stage16 mandatory Offline/PWA + 14-day lease.
10. Stage20 Import/Export/Reporting required.

## 6. Preview

Temporary only: Supabase `linksoftt`; Vercel `alwaslh` team `wasl15`; preview branch `preview/supabase-vercel` at `1eb623ef0cd3f7b47af7aa6add08c87d88f84f81`; READY and `/api/health` HTTP 200 verified. Preview remains pre-Stage10; Vercel output-dir mismatch and serverless media/Poppler durability remain unresolved/`NOT YET VERIFIED`.

## 7. Still pending product decisions

- Notes launch scope: text only vs image/capture/audio too.
- Notifications exact categories/channels.
- Progress/mastery/weak-area recommendation rules.
- Quiz Builder exact Admin UX and bulk review workflow.
- exact Import/Export/report scopes/formats.
- Student direct AI explanation/chat scope.

## 8. Mandatory continuation

After each decision/implementation batch update Product Review, Status, Engineering Log, Handoff and Roadmap. Never mark a Product decision as implemented without executable evidence. Never remove a valuable legacy feature without explicit owner approval.
