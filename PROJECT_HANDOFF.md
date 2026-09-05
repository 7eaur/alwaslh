# PROJECT HANDOFF — الوسيلة الذكية

> اقرأ بالترتيب: `PROJECT_STATUS.md` → `PROJECT_ENGINEERING_LOG.md` → `docs/product/PRODUCT_EVOLUTION_REVIEW.md` → `PRODUCT_FEATURE_PARITY_MATRIX.md` → `MASTER_REBUILD_ROADMAP.md`. المستودع وCI هما source of truth؛ لا تعتمد على ذاكرة المحادثة.

## 1. Product direction

**الفكرة الأساسية ثابتة.** الوسيلة الذكية تبقى منصة تعليمية عربية للطالب، مع Admin لإدارة المنهج والمحتوى والطلاب والوصول والـAI والتشغيل.

التطبيق القديم مرجع شامل للمميزات والسيناريوهات والمشكلات، وليس specification للشاشات أو التقنية. القاعدة: **لا تُحذف Feature قديمة ذات قيمة بدون قرار صريح من Product Owner.**

## 2. Verified engineering baseline

Stages 1–10 verified at documented levels. Final Stage10 head `27c6a2ef1118ee44d2e63471e4f925e1296283e0` passed Stage10 `33302270707`, Stage9 regression `33302270692`, and Full Rebuild `33302270695` including Chromium E2E.

Baseline includes private PostgreSQL/API boundary, secure Auth/session primitives, current 6-digit Full / 7-digit Class codes, Stage9 deterministic source import (15 roots / 48 docs / 5,552 images / 0 fatal issues), and Stage10 Sharp/Poppler deterministic media pipeline.

## 3. Product decisions — Batches 01–03

Canonical source: `docs/product/PRODUCT_EVOLUTION_REVIEW.md`.

### Student entry/auth
- Welcome/intro before auth.
- `تفعيل جديد` / `لدي حساب بالفعل`.
- two-step activation with one-time verification ticket and atomic final activation.
- Admin temporary-password recovery + session revocation + forced private password change.
- one registered cryptographic application-device key per account; Admin reset/rebind for different/lost device; no fingerprint/IP/user-agent security proof.

### Learning capabilities
Preserve/improve curriculum, Reader, summaries, `اختبر نفسك`, full/custom tests, original ministerial models, explanations, images, versions, filters, resume/restart/attempts, Notes, Favorites, Needs Review, progress, private achievements and Offline/PWA.

### Reader / Search / TTS
- original page/image remains visual source of truth;
- optional approved OCR/published Text View;
- Arabic-aware search to exact lesson/page/source;
- `استماع للدرس` via Arabic TTS provider abstraction;
- TTS uses approved text and is cached/versioned per published content revision؛
- optional Offline audio download؛
- no separate Highlight system currently.

### Practice / Tests / Models
- Student custom sessions from selected lessons/count/types.
- **All Student questions from Admin-reviewed Published Question Bank only; no live Gemini question generation.**
- original ministerial models exact/provenanced;
- simulation separate future type;
- Practice feedback timing still PENDING.

### Offline
- lesson + subject downloads;
- explicit full-book download when storage budget permits;
- Download Manager؛
- account/device-scoped cache + revisions/delta sync + outbox؛
- maximum signed authorization lease 14 days capped by entitlement expiry.

### Curriculum/Admin/AI
- flexible ordered multiple class/subject hierarchy;
- upload independent from OCR/AI/TTS;
- asynchronous reusable OCR;
- Draft → Review → Published;
- Admin AI review mandatory;
- Admin Import/Export required;
- preserve legacy AI generation outcomes with OCR-text-first inputs and durable server-side scheduling.

## 4. Affected implementation roadmap

1. Stage6/8 partial reopen for activation/device/recovery changes + security/Chromium E2E.
2. Stage10 Preview Sync pending.
3. OCR Extraction Foundation before full AI/search/TTS use.
4. Reader/Student Product: page + text + search + cached TTS + personal data + Offline.
5. Practice Engine: Published Question Bank-only sessions; original/simulation model separation.
6. Offline/PWA: explicit bounded downloads + 14-day lease.
7. Admin Product: flexible curriculum, upload/OCR/TTS derived states, Question Bank/Quiz Builder, AI review/publish, Import/Export.

## 5. Preview

Temporary only: Supabase `linksoftt`; Vercel `alwaslh` team `wasl15`; preview branch `preview/supabase-vercel` at `1eb623ef0cd3f7b47af7aa6add08c87d88f84f81`; READY and `/api/health` HTTP 200 verified. Preview remains pre-Stage10; Vercel output-dir mismatch and serverless media/Poppler durability remain unresolved/`NOT YET VERIFIED`.

## 6. Still pending product decisions

- `اختبر نفسك`: feedback timing + scoring/timing/review semantics.
- curriculum year/version/archive/replacement.
- Admin roles/permissions.
- Quiz Builder/Content QA exact workflow.
- Notes media types/sync conflicts.
- Notifications.
- Student direct AI explanation/chat scope.
- exact reports/import/export scopes/formats.

## 7. Mandatory continuation

After each batch update Product Review, Status, Engineering Log, Handoff and Roadmap as applicable. Never mark unimplemented product decisions as runtime-verified. Never remove valuable legacy features without explicit owner approval.
