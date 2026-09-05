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

Baseline includes:
- private PostgreSQL behind Backend API;
- scrypt credentials + opaque sessions + HttpOnly cookies;
- server-owned Auth/Authorization/Entitlements;
- current Full Code 6 digits / Class Code 7 digits;
- Stage9 deterministic source import: 15 roots / 48 docs / 5,552 images / 0 fatal inventory issues;
- Stage10 server-owned Media Pipeline: Sharp + Poppler + deterministic order/storage/checksums/idempotency/failure cleanup.

## 3. Product decisions — Batches 01–03

Canonical source: `docs/product/PRODUCT_EVOLUTION_REVIEW.md`.

### Student entry/auth

- Welcome/intro before auth; only Product-ready visible copy.
- Entry options: `تفعيل جديد` and `لدي حساب بالفعل`.
- Activation:

```text
6-digit Full Code verification
→ short-lived one-time activation ticket
→ mandatory Create Password
→ atomic account + credential + entitlement + redemption + audit
→ authenticated session
```

- Admin-assisted recovery: temporary password; revoke old sessions; `must_change_password`; Student creates new private password.
- **Single registered device policy:** first activation registers a cryptographic application-device public key. Returning online login requires valid password + proof of registered private key. Different/lost device requires Admin reset/rebind. Browser fingerprint/IP/user-agent are not security proof. In Web/PWA this is app-device-key binding, not unbreakable hardware identity.

### Student learning capabilities

Preserve/improve valuable legacy capabilities:
- curriculum/classes/subjects/lessons;
- Reader;
- summaries;
- `اختبر نفسك` / quick practice;
- full tests;
- models/ministerial exams;
- filters/multi-lesson/versions/randomization/shuffle;
- explanations/question images;
- resume/restart/attempt history;
- notes;
- favorites;
- `Needs Review`;
- progress/tracking;
- private achievements;
- Offline/PWA.

Summary, Self Practice and Full Test/Model are separate product concepts. Notes/Favorites/Needs Review remain separate. No Global Leaderboard requirement.

### Reader / search / TTS

- Original page/image view remains visual source of truth.
- Add optional OCR/published **Text View**; mobile toggle and optional side-by-side on wide screens.
- Add Arabic-aware search inside book/lesson; every result maps back to exact lesson/page/source position.
- Add **استماع للدرس** through provider-abstracted Arabic TTS/voice service.
- TTS uses approved/published text, not low-confidence raw OCR.
- Generated audio is cached/versioned by published content revision and reused; never regenerate on every Play.
- Audio may be downloaded through Offline Download Manager.
- No separate Highlight feature in current scope; Notes/Favorites/Needs Review cover personal organization.

### Practice / tests / models

- Student may create a custom test/practice using available subject/lesson(s), question count and question types.
- **Every Student question comes only from the Admin-reviewed Published Question Bank.** No live Gemini generation for Student sessions.
- Practice Engine stores exact question/version/session identity and safe deterministic randomization/shuffle.
- Original ministerial models remain exact/source-provenanced and separate from generated content.
- Future `Simulation Model` is a separate clearly labeled type and must never be presented as original.
- `اختبر نفسك` feedback timing is still PENDING: after each question vs end of practice set.

### Offline/performance

Offline is a **core requirement**:
- account/device-scoped local data;
- app shell/static caching;
- explicit download of lesson and subject;
- full-book download allowed explicitly when size/storage budget permits;
- no automatic full-curriculum download;
- Download Manager shows size/progress and supports retry/cancel/remove;
- revision/delta sync instead of repeated full refetch;
- local outbox for mutable Student data;
- no generic authenticated API-response caching in Service Worker;
- server remains authority for final score/redemption/publishing.

**Offline authorization lease:** maximum 14 days and always capped by real entitlement expiry:
`valid_until = min(now + 14 days, entitlement_expiry)`.

### Curriculum/Admin

- Admin can add multiple classes/grades and multiple subjects with flexible ordering.
- Direction: `Curriculum/Year → Class → Subject Offering → optional Unit/Section → Lesson → Content`; year/version/archive schema still pending.
- Upload/process/store independent of AI/OCR availability.
- OCR is asynchronous/provider-abstracted and reusable.
- TTS derived audio is separate from upload and tied to published text revisions.
- Admin Import/Export remains required with explicit module scopes and validation.
- Content lifecycle: `Draft → Review → Published`; AI outputs are Draft and require Admin review.

### AI authoring

Preserve old generation outcomes/modes, rebuilt safely:
- summaries;
- general/source question generation;
- MCQ;
- True/False;
- mixed sets;
- extraction/source-based;
- selected page/image generation;
- regenerate;
- alternate versions;
- exam/model generation;
- exact/replica modes where applicable;
- bulk generation;
- answer/explanation/method/difficulty/source/page metadata where applicable.

Default input: OCR text + source/page provenance. Vision fallback only when required. Each mode has versioned prompt/input/output contract, semantic validation and golden tests. Gemini credentials/projects server-only with scheduler/health/rate/quota/cooldown/retry/failover.

## 4. Stages explicitly affected by review

1. **Stage 6/8 partial reopen:** two-step activation + forced password change + device registry/challenge + reset/rebind + security/Chromium E2E.
2. **Stage 10 Preview Sync:** still pending.
3. **OCR Extraction Foundation:** required before full AI authoring; must not block normal upload.
4. **Reader/Student Product:** original page + text view + search + cached/versioned TTS + notes/favorites + Offline downloads.
5. **Stage 11 AI Contracts:** preserve agreed generation modes, text-first/provenance-aware.
6. **Stage 12 Durable AI:** jobs/scheduler/retries/cooldown/failover/metrics/idempotency.
7. **Admin Product:** flexible curriculum, upload/OCR/TTS states, Draft/Review/Published, AI review, import/export.
8. **Practice Engine:** custom sessions from Published Question Bank only; original models exact; simulation separate later.
9. **Offline/PWA:** mandatory, account/device-scoped, explicit bounded downloads and 14-day authorization lease.

## 5. Preview

Temporary only:
- Supabase `linksoftt`;
- Vercel project `alwaslh`, team `wasl15`;
- preview branch `preview/supabase-vercel` at `1eb623ef0cd3f7b47af7aa6add08c87d88f84f81`;
- READY deployment and `/api/health` HTTP 200 verified;
- Preview still pre-Stage-10;
- direct Stage10 branch deploy has Vercel output-dir `dist` configuration mismatch;
- Vercel filesystem/Poppler durability is `NOT YET VERIFIED` and is not final production architecture.

## 6. Still pending product decisions

- `اختبر نفسك`: correction/explanation after each question or after practice set.
- Practice/Test scoring, timing, result/review semantics.
- curriculum year/version/archive/replacement semantics.
- Admin roles/permissions.
- Quiz Builder/Content QA exact workflow.
- Notes media types/sync conflicts.
- notifications exact categories/channels.
- Student direct AI explanation/chat scope, if any.
- exact reports/import/export scopes/formats.

## 7. Mandatory continuation

After each meaningful batch:
- update `docs/product/PRODUCT_EVOLUTION_REVIEW.md`;
- update `PROJECT_STATUS.md`;
- update `PROJECT_ENGINEERING_LOG.md`;
- update this handoff when product/business/roadmap/baseline changes;
- update `PRODUCT_FEATURE_PARITY_MATRIX.md` and `MASTER_REBUILD_ROADMAP.md` as decisions settle;
- do not mark unexecuted work verified;
- do not remove valuable legacy features without explicit owner approval.
