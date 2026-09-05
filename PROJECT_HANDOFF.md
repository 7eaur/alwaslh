# PROJECT HANDOFF — الوسيلة الذكية

> اقرأ بالترتيب: `PROJECT_STATUS.md` → `PROJECT_ENGINEERING_LOG.md` → `docs/product/PRODUCT_EVOLUTION_REVIEW.md` → `PRODUCT_FEATURE_PARITY_MATRIX.md` → `MASTER_REBUILD_ROADMAP.md`. المستودع وCI هما source of truth؛ لا تعتمد على ذاكرة المحادثة.

## 1. Product direction

**الفكرة الأساسية ثابتة.** الوسيلة الذكية تبقى منصة تعليمية عربية للطالب، مع Admin لإدارة المنهج والمحتوى والطلاب والوصول والـAI والتشغيل.

التطبيق القديم مرجع شامل للمميزات والسيناريوهات والمشكلات، وليس specification للشاشات أو التقنية. القاعدة: **لا تُحذف Feature قديمة ذات قيمة بدون قرار صريح من Product Owner.** يمكن إعادة تنظيم/دمج آليات مكررة إذا بقيت النتيجة الوظيفية كاملة.

## 2. Verified engineering baseline

Stages 1–10 verified at documented levels.

Final Stage 10 head:
`27c6a2ef1118ee44d2e63471e4f925e1296283e0`

Final same-head CI:
- Stage10 `33302270707` — SUCCESS.
- Stage9 regression `33302270692` — SUCCESS.
- Full rebuild `33302270695` — SUCCESS including Chromium E2E.

Baseline includes private PostgreSQL/API boundary, secure Auth/session primitives, current 6-digit Full / 7-digit Class codes, deterministic Stage9 source import (15 roots / 48 docs / 5,552 images / 0 fatal issues), and deterministic Stage10 Sharp/Poppler media pipeline.

## 3. Product decisions — Batches 01–03

Canonical source: `docs/product/PRODUCT_EVOLUTION_REVIEW.md`.

### Student entry/auth
- Welcome/intro before auth with Product-ready copy.
- `تفعيل جديد` and `لدي حساب بالفعل`.
- New activation: code verification → one-time ticket → mandatory password → atomic account/entitlement/redemption/audit → registered device → session.
- Admin-assisted temporary-password recovery + old-session revocation + forced private password change.
- One registered cryptographic application-device key per Student account; different/lost device requires Admin reset/rebind. Fingerprint/IP/user-agent are not security proof.

### Learning capabilities
Preserve/improve curriculum, Reader, summaries, `اختبر نفسك`, full/custom tests, original ministerial models, explanations, images, versions, filters, resume/restart/attempts, Notes, Favorites, Needs Review, progress, private achievements and Offline/PWA. No useful legacy feature is removed silently.

### Reader / Search / TTS
- Original page/image remains visual source of truth.
- Optional approved OCR/published Text View.
- Arabic-aware search maps results to exact lesson/page/source.
- `استماع للدرس` through Arabic TTS provider abstraction.
- TTS consumes approved/published text and is generated/cached by content revision; playback does not regenerate speech.
- Optional Offline audio download.
- No separate Highlight feature currently.

### Practice / Tests / Models
- Student can choose available subject/lesson(s), question count and types for custom sessions.
- **All Student session questions come from Admin-reviewed Published Question Bank only. No live Gemini generation for Student tests.**
- Original ministerial models stay exact/provenanced.
- Simulation is a separate future type and clearly labeled.
- `اختبر نفسك` feedback timing remains PENDING.

### Offline
- Explicit lesson + subject downloads.
- Explicit full-book download when size/storage budget permits.
- No automatic full curriculum download.
- Download Manager with size/progress/retry/cancel/remove.
- account/device-scoped cache + revisions/delta sync + outbox.
- **maximum 14-day signed authorization lease, capped by entitlement expiry**.
- no generic authenticated API-response SW caching.

### Curriculum/Admin/AI
- Multiple classes/grades/subjects with flexible ordered hierarchy direction `Curriculum/Year → Class → Subject Offering → optional Unit → Lesson → Content`.
- Upload independent from OCR/AI/TTS.
- OCR asynchronous/provider-abstracted/reusable.
- Draft → Review → Published; Admin reviews AI output before publish.
- Admin Import/Export required.
- Preserve legacy AI generation outcomes, with OCR-text-first inputs, versioned schemas/validators/golden tests and server-side credential scheduling.

## 4. Affected implementation roadmap

1. Stage 6/8 partial reopen: two-step activation, forced password change, device key/challenge/rebind, security + Chromium E2E.
2. Stage10 Preview Sync still pending.
3. OCR Extraction Foundation required before full AI/search/TTS use.
4. Reader/Student Product: original page + Text View + search + cached/versioned TTS + notes/favorites + Offline downloads.
5. Practice Engine: Published Question Bank-only Student sessions; original ministerial type separate from future simulation type.
6. Offline/PWA: account/device-scoped sync/download manager + 14-day entitlement lease.
7. Admin Product: flexible curriculum, upload/OCR/TTS states, Question Bank/Quiz Builder, AI review/publish, Import/Export.

## 5. Preview

Temporary only:
- Supabase `linksoftt`;
- Vercel project `alwaslh`, team `wasl15`;
- preview branch `preview/supabase-vercel` at `1eb623ef0cd3f7b47af7aa6add08c87d88f84f81`;
- READY deployment and `/api/health` HTTP 200 verified;
- Preview still pre-Stage10;
- Vercel Stage10 direct-build output-dir mismatch remains open;
- Vercel filesystem/Poppler durability is `NOT YET VERIFIED` and not final architecture.

## 6. Still pending product decisions

- `اختبر نفسك`: feedback after each question vs end of set; scoring/timing/review semantics.
- curriculum year/version/archive/replacement semantics.
- Admin roles/permissions.
- Quiz Builder/Content QA exact workflow.
- Notes media types/sync conflicts.
- notifications categories/channels.
- Student direct AI explanation/chat scope, if any.
- exact reports/import/export scopes/formats.

## 7. Mandatory continuation

After each meaningful batch update Product Review, Status, Engineering Log, Handoff and Roadmap as applicable. Never mark unimplemented product decisions as runtime-verified, and never remove valuable legacy features without explicit owner approval.
