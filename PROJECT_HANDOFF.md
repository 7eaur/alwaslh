# PROJECT HANDOFF — الوسيلة الذكية

> **Purpose:** هذا الملف هو نقطة البداية لأي محادثة أو مهندس جديد. يجب قراءته قبل تعديل المشروع. إذا تعارض مع افتراض سابق، فالمستودع والـCLI هما المصدر الأعلى للحقيقة.

## 1. What this project is

**الوسيلة الذكية** منصة تعليمية عربية لها تطبيقان منفصلان منطقيًا:

- **Student PWA:** تفعيل/دخول، صفوف ومواد ودروس، قارئ، ملخص، أسئلة تفاعلية، اختبارات، ملاحظات وأسئلة محفوظة، إشعارات، إحصائيات/إنجازات، Offline/PWA.
- **Admin Web:** إدارة المحتوى، الرفع والمعالجة، Gemini/AI generation، الاختبارات والنماذج، الطلاب، أكواد الوصول الكامل وأكواد الصفوف، الإشعارات، التقارير والتصدير والإعدادات.

الهدف هو الحفاظ على **الفكرة والسيناريوهات والنتائج للمستخدم** مع إعادة بناء التنفيذ هندسيًا من الصفر حيث يلزم.

## 2. Source repositories

- `7eaur/alwaslh`: مرجع الفكرة والـBusiness Rules والـUser Flows ومشكلات النظام القديم. **ليس مرجعًا لقاعدة البيانات أو البنية الداخلية الجديدة.**
- `7eaur/alwaslh-go`: مصدر المحتوى/الكتب/الصور/النماذج الوزارية. يدخل لاحقًا عبر deterministic importer؛ لا يُشحن raw داخل frontend.

## 3. Non-negotiable architecture decisions

1. **Self-hosted PostgreSQL** على نفس بيئة استضافة الـBackend، خلف شبكة خاصة.
2. Browser لا يتصل مباشرة بقاعدة البيانات.
3. المشروع Clean-Slate من ناحية schema/data؛ لا نحافظ على Supabase compatibility.
4. Admin وStudent تطبيقان منفصلان في runtime/bundle/UX.
5. Auth/Authorization/Entitlements server-side.
6. لا plaintext/reversible passwords ولا device fingerprint credential.
7. Full access code = **6 digits**. Class access code = **7 digits**.
8. الأكواد والتفعيل transactional + idempotent + race-safe.
9. بعد التفعيل الأول يصبح Full Code ذو 6 أرقام **معرّف حساب الطالب** للدخول اللاحق، لكنه ليس سرًا ولا يكفي للمصادقة دون كلمة المرور.
10. Student offline data account-scoped مع revisions/tombstones لاحقًا.
11. AI jobs durable في backend/workers؛ Gemini keys server-only.
12. `alwaslh-go` Content Source فقط؛ importer يحفظ order/checksum/source metadata.
13. Feature parity تقاس بالنتيجة للمستخدم وليس بطريقة التنفيذ القديمة.
14. لا Stage تُغلق بدون CLI/CI evidence. الحالات: `DESIGN PASS` / `CLI PASS` / `RUNTIME PASS` / `RELEASE PASS`; أي شيء غير منفذ = `NOT YET VERIFIED`.

## 4. Canonical target tree

```text
apps/
  admin-web/
  student-web/
  api/
  workers/              # later AI/background stages
packages/
  brand/
  ui/
  domain/
  data/
  validation/
  ai-contracts/
  testing/
database/
  migrations/
  tests/
  deploy/
content/
  import-contracts/
  manifests/
  tooling/
```

Runtime:

```text
Admin Web ──┐
            ├── Backend API ── PostgreSQL (private, same hosting)
Student PWA ┘       │
                    ├── media/object storage
                    └── AI/background workers
```

## 5. Current verified stage state

Latest full green **Backend Stage 8** verification:

- Branch: `rebuild/student-activation-backend`
- Commit: `a87c7f766481708e018dcaa1ae6e6643c0667fef`
- GitHub Actions run: `33289741640`
- Result: **Stages 1–8 backend jobs SUCCESS** on clean CI, including PostgreSQL 16 runtime/integration tests.

Important distinction: **Stage 8 overall is not yet closed** because the parallel Student Activation UI and combined browser E2E still need verification/integration.

### Stage 1 — Product Contract ✅ CLI PASS
- Repository/product audit done.
- `PRODUCT_FEATURE_PARITY_MATRIX.md` is the feature-preservation contract.
- `scripts/verify-product-contract.py` validates IDs/rows/capability families.

### Stage 2 — Brand Identity ✅ CLI PASS
- Identity evolved from original teal/open-book logo.
- Owned SVG/PNG/PWA assets; no TailAdmin/Miaoda dependency.
- Palette/typography/accessibility tokens are canonical under `packages/brand`.

### Stage 3 — UX Architecture ✅ CLI PASS
- Admin IA, Student mobile IA, critical flows/states, parity mapping, responsive/accessibility contracts and wireframes documented.

### Stage 4 — PostgreSQL Data Platform ✅ CLI/RUNTIME PASS
Canonical migrations currently:
- `0001_core.sql`
- `0002_access.sql`
- `0003_learning.sql`
- `0004_ai_and_sync.sql`
- `0005_auth.sql`
- `0006_access_contract.sql`
- `0007_activation_contract.sql`

CI applies migrations to clean PostgreSQL 16 and validates constraints/indexes/schema behavior.

### Stage 5 — Engineering Foundation ✅ CLI/RUNTIME PASS
- real `apps/api` runtime;
- PostgreSQL pool/transactions/migration runner;
- env validation, logging/public errors;
- lint + strict TypeScript + unit tests + API build;
- isolated Admin and Student production builds;
- clean CI gate.

### Stage 6 — Auth & Authorization ✅ CLI/RUNTIME PASS
- salted `scrypt` password hashes;
- opaque random sessions; SHA-256 token digest persisted;
- HttpOnly cookies;
- Admin/Student role isolation;
- mutation Origin protection;
- PostgreSQL-backed login lockout;
- one-time password reset/recovery; original secret never exposed;
- password reset revokes sessions;
- first Admin via explicit CLI bootstrap only.

Branch/PR: `rebuild/auth-authorization` / PR #3.

### Stage 7 — Access Codes & Entitlements ✅ CLI/RUNTIME PASS
- secure 6-digit Full codes / 7-digit Class codes;
- Arabic/Persian digit normalization;
- transaction + row lock redemption;
- profile-bound idempotency;
- renewal extends benefit;
- no-waste Class redemption if Full access already covers student;
- revoke + audit events;
- concurrency/race integration tests.

Branch/PR: `rebuild/access-entitlements` / PR #4.

### Stage 8 Backend — Student Activation ✅ CLI/RUNTIME PASS
Branch/PR: `rebuild/student-activation-backend` / PR #6.

Canonical contract: `docs/api/STUDENT_ACTIVATION_CONTRACT.md`.

New first-activation endpoint:

```text
POST /v1/student/activate
code(6 digits) + password + idempotencyKey
```

Transaction:

```text
validate + lock Full code
→ create Student profile
→ create scrypt credential (identifier = normalized original Full code)
→ create all-content entitlement
→ bind/mark code redeemed
→ create redemption/idempotency record
→ write access/auth audit events
→ COMMIT
```

After commit, session issuance goes through canonical `AuthService.login`, so even an idempotent replay must prove the password before receiving a fresh session.

Verified Stage 8 backend behaviors:
- Arabic/Persian digit normalization;
- missing/revoked/expired/used code rejection;
- no partial account on failure;
- credential conflict rolls back and leaves code active;
- replay with same idempotency key returns same profile/entitlement;
- wrong password on replay does not receive session;
- same idempotency key cannot be reused for another code;
- returning login uses original six-digit identifier + password;
- two concurrent activation requests for the same code create exactly one account/redemption;
- DB unique indexes enforce one redemption per access code;
- redeemed state requires `redeemed_by_profile_id`;
- `account_activated` audit event added.

Stage 8 first CI run caught only Biome import/format drift and was fixed without weakening lint. A later full run exposed integration suites sharing one DB; Stage 6/Auth, Stage 7/Access and Stage 8/Activation are now run against isolated PostgreSQL databases/tests.

## 6. Current work / parallel coordination

**CURRENT: finish Stage 8; do not start Stage 9 yet.**

Two parallel workstreams exist:

```text
rebuild/student-activation-backend  → Backend PASS
rebuild/student-activation-ui       → parallel Student UI work; verify its branch/PR directly
```

The parallel UI chat was explicitly instructed **not** to modify PostgreSQL migrations, Auth backend or AccessService and **not** to invent endpoints. It should consume `docs/api/STUDENT_ACTIVATION_CONTRACT.md` once available on its integration base.

Stage 8 closes only after:

```text
Backend PASS
+ Student Activation UI PASS
+ integrated lint/typecheck/tests/build
+ activation/login/recovery browser/API E2E PASS
= Stage 8 COMPLETE
```

If the UI branch diverged before the API contract existed, reconcile the UI to the contract rather than changing the verified backend contract casually.

## 7. Stage 8 API contract summary

### First activation
`POST /v1/student/activate`

Input:
- `code`: exactly 6 digits after normalization.
- `password`: 8–128 characters.
- `idempotencyKey`: 12–120 characters, stable only for retrying the same submission.

Fresh success: HTTP `201`; idempotent committed replay: HTTP `200` with `replayed: true`; both establish the normal HttpOnly session only after password proof.

### Returning login
`POST /v1/auth/login` with `identifier = original 6-digit code` + password.

### Session/access
- `GET /v1/student/me`
- `GET /v1/student/access/entitlements`
- `POST /v1/auth/logout`

### Recovery
- Admin issue one-time token: `POST /v1/admin/auth/recovery-token`.
- Reset: `POST /v1/auth/reset-password`.
- Never reveal original password.

### Offline
First activation and returning online login require backend connectivity. Offline trusted-session behavior belongs to the later Offline/PWA stage and must not be faked in Stage 8 UI.

## 8. Business rules that must remain preserved

- Full code: 6 digits.
- Class code: 7 digits.
- Multiple class entitlements can exist where valid.
- Renewal must create real additional benefit; never consume code without extending access.
- Full-access entitlement covers all classes.
- Student cannot forge entitlement/score/achievement/rank from client.
- Recovery resets secret; never reveals original secret.
- Reader must eventually support images, zoom/pan, summary, practice, notes, reader settings and prev/next.
- Notes need text/image/capture/audio parity unless explicitly changed later.
- Quizzes need filters, multi-lesson/version, random/shuffle, explanation/images/bookmark/resume/restart/attempt/offline/achievements parity.
- Admin must retain content CRUD, uploads/PDF/mixed media, AI generation modes, quiz builder, accounts/access codes/class codes, notifications and exports.
- AI rules must preserve Arabic/Fusha, numbers, chemistry/scientific notation, exact Quran/Hadith/source-text rules, explanation/difficulty/source/page/counts/duplicate/version/exact-exam/unknown-answer behavior.

## 9. Next stages after Stage 8 closes

Authoritative next order begins:

1. **Stage 9 — Content Model & deterministic `alwaslh-go` Import.**
2. **Stage 10 — Media Pipeline.**
3. **Stage 11 — Gemini Prompt/Output Contracts.**
4. **Stage 12 — Durable AI Execution.**
5. Admin Product.
6. Student learning product beyond activation.
7. Practice Engine.
8. Offline/PWA.
9. Notes/Saved, Notifications, Statistics/Achievements, Exports.
10. Performance, Security, Automated Tests, Accessibility/Device QA.
11. Initial content load, Staging, Release Gate, Production Cutover, Monitoring.

`MASTER_REBUILD_ROADMAP.md` is the authoritative detailed numbering and must remain synchronized with this file.

## 10. Things explicitly NOT YET VERIFIED

Do not claim these are done merely because schema exists:

- Stage 8 parallel Student UI and combined browser E2E.
- real reverse-proxy/API perimeter activation rate limiting.
- actual production/self-hosted PostgreSQL networking/tuning/load characteristics.
- real-host backup + restore drill.
- object storage/media provider.
- `alwaslh-go` full file integrity/inventory/import.
- Gemini golden tests/provider failover/runtime.
- complete Admin product.
- complete Student learning/PWA product.
- offline isolation/delta/outbox/service-worker lifecycle.
- production security/performance/accessibility/release readiness.

## 11. Canonical documents to read before work

Read in this order:

1. `PROJECT_HANDOFF.md` — current continuation context.
2. `PROJECT_STATUS.md` — concise current stage and last verified build.
3. `PROJECT_ENGINEERING_LOG.md` — decisions/findings/history.
4. `PRODUCT_FEATURE_PARITY_MATRIX.md` — feature preservation contract.
5. `MASTER_REBUILD_ROADMAP.md` — ordered roadmap.
6. `docs/api/STUDENT_ACTIVATION_CONTRACT.md` — current Stage 8 UI/backend contract while Stage 8 is active.
7. `docs/engineering/CLI_VERIFICATION_GATES.md` — mandatory gate policy.
8. `PROJECT_FULL_AUDIT_CATALOG.md` / `PROJECT_DEEP_AUDIT.md` — legacy evidence when needed.

## 12. Handoff update rule

At the end of **every meaningful implementation batch**:

- update `PROJECT_ENGINEERING_LOG.md` with decisions, findings, changes and failures/fixes;
- update `PROJECT_STATUS.md` with current phase, completed, remaining, blockers, last tests/build and next step;
- update `PROJECT_HANDOFF.md` when architecture, business rules, branch/PR, verified baseline or next-stage scope changes;
- record exact CLI/CI commands or workflow jobs and the actual result;
- keep failed checks/fixes as evidence rather than hiding them;
- mark anything not executed as `NOT YET VERIFIED`.

This rule is mandatory so a new conversation can resume from repository evidence without depending on chat memory.
