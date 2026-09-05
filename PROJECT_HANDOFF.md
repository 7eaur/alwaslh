# PROJECT HANDOFF — الوسيلة الذكية

> اقرأ أولًا: `PROJECT_STATUS.md` → `PROJECT_ENGINEERING_LOG.md` → `docs/product/PRODUCT_EVOLUTION_REVIEW.md` → `PRODUCT_FEATURE_PARITY_MATRIX.md` → `MASTER_REBUILD_ROADMAP.md`. المستودع وCI هما source of truth؛ لا تعتمد على ذاكرة المحادثة.

## Product direction

**الفكرة الأساسية لم تتغير.** الوسيلة الذكية تبقى منصة تعليمية عربية للطالب مع Admin لإدارة المحتوى والوصول والـAI والتشغيل. التطبيق القديم مرجع للفكرة والمميزات والسيناريوهات والمشكلات، وليس مواصفة ملزمة للشاشات أو الـflows أو Business Rules.

كل Feature رئيسية تُصنف بعد النقاش: `KEEP / IMPROVE / REFACTOR / REBUILD / REMOVE / NEW`.

## Verified engineering baseline

Stages 1–10 technically verified at documented levels. Final Stage 10 head:
`27c6a2ef1118ee44d2e63471e4f925e1296283e0`

Final same-head CI:
- Stage 10 `33302270707` — SUCCESS.
- Stage 9 regression `33302270692` — SUCCESS.
- Full rebuild `33302270695` — SUCCESS including Chromium E2E.

Key baseline:
- private PostgreSQL behind Backend API;
- server-owned Auth/Authorization/Entitlements;
- scrypt credentials + opaque sessions + HttpOnly cookie;
- current 6-digit Full Code / 7-digit Class Code;
- deterministic Stage 9 source inventory/import: 15 roots / 48 documents / 5,552 images / 0 fatal issues;
- deterministic Stage 10 Media Pipeline: Sharp images + Poppler PDF + ordered concurrency + checksums + safe storage identities + retry/idempotency/failure cleanup.

## Product Decisions — Batch 01

Canonical decision file: `docs/product/PRODUCT_EVOLUTION_REVIEW.md`.

### PED-001 Same product, better execution
Maintain the original product idea and useful capabilities; redesign weak UX/architecture instead of cloning legacy behavior.

### PED-002 Student Welcome before auth
Student gets an elegant welcome/introduction experience before login/activation. All user-visible copy must be final Product copy; no placeholders/dev text.

### PED-003 Two-step first activation — REOPENS Stage 8 contract
Required UX:

```text
Enter 6-digit Full Code
→ verify eligibility
→ mandatory Create Password screen
→ atomic account + entitlement + redemption + audit
→ authenticated session
```

Engineering invariant: first verification must not create a partial account or permanently consume the code. Use a short-lived one-time activation ticket bound to the code; final account creation remains transactional/race-safe/idempotent.

### PED-004 Admin-assisted password recovery
Student contacts Admin and provides the code/account identifier. Admin can reset access but cannot reveal the old password. Preferred safe model: temporary reset password/credential + `must_change_password` on next login + revoke previous sessions + audit.

### PED-005 Student UX
Student application must be elegant, simple, mobile-first and easy. Preserve useful curriculum, models/quizzes, notes, favorites/saved items, progress/tracking and other valuable features, but reorganize them instead of copying the old dashboard.

### PED-006/PED-010 Admin upload is independent from AI
Admin adds classes/subjects/lessons/content normally. Media upload/process/store must succeed without Gemini. AI quota/failure must never block normal upload.

### PED-007/PED-008 OCR text layer before AI
Target:

```text
page image/source
→ OCR provider abstraction
→ extracted text + page/source provenance + confidence/status/provider metadata
→ persist/reuse OCR text
→ Gemini receives compact text/context for generation
```

Original image remains source of truth. Low-confidence OCR, religious exact text, formulas/chemistry/tables require review/fallback rather than silent trust.

### PED-009 Durable Gemini credential scheduling
Gemini credentials remain server-only. Stage 12 must support configured authorized credential/project pools with health, quota/rate awareness, cooldown, retry/backoff and failover. This is for reliability/load management, not bypassing provider terms/limits.

## Immediate roadmap impact

Before feature-heavy Stage 11+ implementation:

1. Continue Product Evolution Review and settle core Student/Admin/learning decisions.
2. Reopen Stage 8 for the new two-step activation flow with updated API/UI/Chromium E2E.
3. Complete Stage 10 Preview sync and fix Vercel build/routing mismatch.
4. Add an OCR Extraction Layer between Media Pipeline and AI authoring. Upload remains independent; OCR is separate/retryable; AI generation is explicit/on-demand.
5. Stage 11 contracts consume OCR text + source/page provenance and enforce typed structured output + semantic/golden validation.
6. Stage 12 implements durable AI jobs + credential/project scheduler + usage/error telemetry.
7. Admin/Student product stages follow recorded decisions, not legacy screen parity.

## Preview

Temporary only:
- Supabase project `linksoftt`;
- Vercel project `alwaslh`, team `wasl15`;
- preview branch `preview/supabase-vercel` at `1eb623ef0cd3f7b47af7aa6add08c87d88f84f81`;
- READY deployment and `/api/health` HTTP 200 verified;
- Preview still pre-Stage-10;
- direct Stage 10 branch deploy currently fails Vercel output-dir expectation `dist`;
- Vercel serverless filesystem/Poppler durability is NOT YET VERIFIED and is not final production architecture.

## Still pending product decisions

- expiry/renewal/Class Code details;
- Student Home/navigation;
- Reader/search/highlights/settings;
- Practice/quizzes/models/ministerial exams;
- notes/saved/sync;
- progress/achievements/rank;
- notifications;
- Offline/PWA;
- Admin roles/permissions;
- content draft/review/publish/version lifecycle;
- AI generation modes/review workflow;
- Quiz Builder/content QA;
- reports/export;
- search/discovery/support operations.

## Mandatory continuation

After each decision batch:
- update `docs/product/PRODUCT_EVOLUTION_REVIEW.md`;
- update `PROJECT_STATUS.md`;
- update `PROJECT_ENGINEERING_LOG.md`;
- update this handoff when business rules/roadmap/baseline changes;
- later update `PRODUCT_FEATURE_PARITY_MATRIX.md` and `MASTER_REBUILD_ROADMAP.md` from decisions;
- never mark unexecuted work as verified.
