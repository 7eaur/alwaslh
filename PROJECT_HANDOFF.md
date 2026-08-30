# PROJECT HANDOFF — الوسيلة الذكية

> **Purpose:** نقطة البداية الإلزامية لأي محادثة/مهندس جديد. اقرأ هذا الملف قبل أي تعديل، ثم `PROJECT_STATUS.md` و`PROJECT_ENGINEERING_LOG.md` و`PRODUCT_FEATURE_PARITY_MATRIX.md` و`MASTER_REBUILD_ROADMAP.md`. المستودع ونتائج CLI/CI هي المصدر الأعلى للحقيقة.

## 1. Product

**الوسيلة الذكية** منصة تعليمية عربية بمنتجين منفصلين منطقيًا:

- **Student PWA:** تفعيل/دخول، صفوف ومواد ودروس، قارئ، ملخص/Practice، اختبارات، ملاحظات وأسئلة محفوظة، إشعارات، إحصائيات/إنجازات، Offline/PWA.
- **Admin Web:** محتوى ورفع ومعالجة، Gemini/AI generation، Quiz Builder، الطلاب، Full/Class access codes، الإشعارات، التقارير، التصدير والإعدادات.

الهدف: **نفس الفكرة والسيناريوهات والنتائج للمستخدم، بتنفيذ أقوى وأوضح وأكثر أمانًا وقابلية للصيانة.** Feature parity تقاس بالنتيجة وليس بطريقة التنفيذ القديمة.

## 2. Source repositories

- `7eaur/alwaslh`: مرجع Business Rules / User Flows / legacy behavior والمشكلات التي يجب ألا تتكرر. ليس مرجعًا للبنية الداخلية أو DB الجديدة.
- `7eaur/alwaslh-go`: مصدر curriculum/books/images/government exams. يدخل عبر deterministic content importer؛ لا يُشحن raw إلى frontend.

## 3. Non-negotiable architecture decisions

1. PostgreSQL ذاتية الاستضافة، خاصة، خلف Backend API.
2. Browser لا يتصل مباشرة بقاعدة البيانات.
3. Clean-slate schema/data؛ Supabase ليست Target Platform ولا نطابق RLS/IDs القديمة.
4. Admin وStudent تطبيقان منفصلان في runtime/bundle/UX.
5. Auth/Authorization/Entitlements server-side.
6. لا plaintext/reversible passwords ولا device fingerprint كدليل مصادقة.
7. Full access code = **6 digits**؛ Class access code = **7 digits**.
8. Redemption/activation transactional + idempotent + race-safe.
9. بعد أول تفعيل، الـFull Code نفسه يصبح **معرّف حساب الطالب** للدخول اللاحق؛ ليس سرًا ولا يكفي بدون كلمة المرور.
10. Recovery = reset، ولا يعرض السر الأصلي.
11. Student offline data لاحقًا account-scoped مع revisions/tombstones/outbox.
12. Gemini keys server-only؛ AI jobs durable في backend/workers.
13. `alwaslh-go` Content Source فقط؛ importer يحفظ source/order/checksum metadata.
14. لا Stage تُغلق بلا دليل executable. الحالات الرسمية: `DESIGN PASS` / `CLI PASS` / `RUNTIME PASS` / `RELEASE PASS`؛ غير المنفذ = `NOT YET VERIFIED`.
15. لا نبدأ Stage التالية قبل إغلاق Integration Gate للمرحلة الحالية.

## 4. Target tree

```text
apps/
  admin-web/
  student-web/
  api/
  workers/
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
            ├── Backend API ── PostgreSQL (private)
Student PWA ┘       │
                    ├── media/object storage
                    └── background / AI workers
```

## 5. Latest verified baseline

**Stages 1–8 are now closed.**

- Branch: `rebuild/student-activation-integration`
- Commit: `829af003156f4c57ceea1cba2ebca12a4309177a`
- GitHub Actions run: `33292329935`
- Result: **SUCCESS**
- Environment: GitHub Actions Ubuntu + Node 22 + clean PostgreSQL 16 + Chromium Playwright.
- Verified jobs: Stages 1–8, including live API + built Student Web browser E2E.

### Stage 1 — Product Contract ✅ CLI PASS
`PRODUCT_FEATURE_PARITY_MATRIX.md` + automated product contract checks.

### Stage 2 — Brand Identity ✅ CLI PASS
Owned teal/open-book identity under `packages/brand`; no TailAdmin/Miaoda production identity dependency.

### Stage 3 — UX Architecture ✅ CLI PASS
Admin/Student IA, critical flows/states, responsive/accessibility contracts and wireframes.

### Stage 4 — PostgreSQL Data Platform ✅ CLI/RUNTIME PASS
Canonical migrations currently:

- `0001_core.sql`
- `0002_access.sql`
- `0003_learning.sql`
- `0004_ai_and_sync.sql`
- `0005_auth.sql`
- `0006_access_contract.sql`
- `0007_activation_contract.sql`

Clean PostgreSQL 16 application and schema contracts are tested in CI.

### Stage 5 — Engineering Foundation ✅ CLI/RUNTIME PASS
Implemented/verified:

- real `apps/api` runtime;
- bounded PostgreSQL pool + transaction boundary;
- migration runner + idempotent migration tracking;
- env validation + structured public errors/logging;
- strict TypeScript/lint/unit/build;
- isolated Admin/Student production builds;
- CI stage gates;
- production API build separated from tests through `apps/api/tsconfig.build.json`, producing `dist/server.js` that matches `npm start`.

### Stage 6 — Auth & Authorization ✅ CLI/RUNTIME PASS
- salted `scrypt` credentials;
- opaque random sessions; only SHA-256 token digest persisted;
- HttpOnly session cookie;
- Student/Admin role isolation;
- mutation Origin protection;
- DB-backed login lockout;
- one-time reset-only recovery;
- password reset revokes existing sessions;
- explicit first Admin CLI bootstrap only.

### Stage 7 — Access Codes & Entitlements ✅ CLI/RUNTIME PASS
- crypto-secure 6-digit Full / 7-digit Class codes;
- Arabic/Persian digit normalization;
- row-locked transactional redemption;
- profile-bound idempotency;
- renewal extends real benefit;
- no-waste Class redemption when active Full access already covers student;
- revoke/audit;
- DB uniqueness + concurrent race tests.

### Stage 8 — Student Activation & Account Flow ✅ CLI/RUNTIME/BROWSER E2E PASS
Canonical API contract: `docs/api/STUDENT_ACTIVATION_CONTRACT.md`.

First activation:

```text
POST /v1/student/activate
6-digit Full Code + password + stable idempotencyKey
```

Atomic flow:

```text
validate + lock code
→ create Student profile
→ create scrypt credential (identifier = normalized Full Code)
→ create all-content entitlement
→ bind/mark code redeemed
→ create redemption/idempotency record
→ audit events
→ COMMIT
→ canonical Auth login
→ HttpOnly session
```

Verified behaviors:

- invalid/expired/revoked/used code handling;
- Arabic/Persian normalization;
- rollback with no partial account;
- idempotent replay bound to the same activation;
- replay still requires correct password before new session;
- concurrent same-code activation creates one account only;
- returning login uses original six-digit identifier + password;
- Student Web shows verified entitlement after activation;
- logout + returning login;
- one-time recovery token → password reset;
- old password rejected, new password succeeds;
- loading/error/offline states;
- RTL/mobile responsive flow;
- Chromium E2E with live built API and built Student Web via same-origin proxy.

## 6. Bugs caught by gates and fixed

Do not erase these from engineering history:

- legacy root PostCSS/Tailwind leaked into new app builds → isolated app config.
- Auth strict TS/scrypt typing defects → fixed at source.
- Stage 7 duration/enum/JSONB typing defects → fixed at SQL/TS boundary.
- code creation + audit was not fully atomic → moved into one transaction.
- idempotency lookup could cross profiles → bound to profile ownership.
- Stage 8 formatter/lint drift → source formatted, lint not weakened.
- Auth/Access/Activation integration suites were interfering on one shared DB → stage-specific isolated PostgreSQL DB/suites.
- Vitest collected Playwright E2E file → Unit suite scoped to `src`.
- API production build emitted `dist/src/server.js` while `npm start` expected `dist/server.js` → introduced runtime-only `tsconfig.build.json`.

## 7. Current branch / PR coordination

Existing stack:

- `rebuild/foundation` / PR #2
- `rebuild/auth-authorization` / PR #3
- `rebuild/access-entitlements` / PR #4
- `rebuild/student-activation-ui` / PR #5
- `rebuild/student-activation-backend` / PR #6
- **Integrated Stage 8 source of truth:** `rebuild/student-activation-integration` / PR #7

PR #7 contains the verified Backend + Student Activation UI integration and should be treated as the continuation base for Stage 9 unless branch-stack cleanup is intentionally performed.

## 8. Business rules that must remain preserved

- Full code exactly 6 digits; Class code exactly 7 digits.
- Multiple class entitlements where valid.
- Renewal must add real benefit; never consume a code without extending access.
- Full access covers all classes.
- Student cannot forge entitlement/score/achievement/rank from browser.
- Recovery resets secret and never reveals original password.
- Reader must later preserve images/zoom-pan/summary/practice/notes/settings/prev-next.
- Notes parity includes text/image/capture/audio unless later explicitly changed.
- Quiz parity includes filters, multi-lesson/version, shuffle/random, explanation/images/bookmark/resume/restart/attempt/offline/achievements.
- Admin parity includes content CRUD, PDF/image/mixed upload, AI generation modes, Quiz Builder, students/access codes/class codes, notifications and exports.
- AI rules preserve Arabic/Fusha, numerals, chemistry/scientific notation, exact Quran/Hadith/source text, correct options/explanation/method/difficulty/source/page/counts/duplicates/versions/exact-exam/unknown-answer behavior.

## 9. CURRENT: Stage 9 — Content Model & deterministic `alwaslh-go` Import

**This is the next and only active roadmap stage. Do not jump to Media/AI/Admin/Student learning work before Stage 9 gate closes.**

Required Stage 9 work:

```text
alwaslh-go
→ complete repository discovery/inventory
→ read real manifests/helper files and naming patterns
→ canonical source taxonomy
→ normalize class/subject/book/exam/year/page
→ deterministic order
→ checksums + duplicate detection
→ canonical import manifest
→ repeatable importer/import batches
→ reporting: expected/imported/missing/duplicate/order errors
→ CLI/runtime verification
```

Important constraints:

- inspect actual files; do not infer from folder names only;
- raw repository is never frontend payload;
- ordering must be source-derived and deterministic, never async completion order;
- imported rows/assets must preserve source provenance/checksum/order;
- repeated import must be deterministic/idempotent or explicitly reconcile changes;
- anything not inspected = `NOT YET VERIFIED`.

## 10. Later roadmap order

After Stage 9 closes:

1. Stage 10 Media Pipeline.
2. Stage 11 Gemini Prompt/Output Contracts.
3. Stage 12 Durable AI Execution.
4. Stage 13 Admin Product.
5. Stage 14 Student Learning Product.
6. Stage 15 Practice Engine.
7. Stage 16 Offline/PWA.
8. Stage 17 Notes & Saved Questions.
9. Stage 18 Notifications.
10. Stage 19 Statistics/Achievements.
11. Stage 20 Export System.
12. Stage 21 Performance.
13. Stage 22 Security Hardening.
14. Stage 23 Automated Tests/CI expansion.
15. Stage 24 Accessibility/Device QA.
16. Stage 25 Initial Content Load.
17. Stage 26 Staging.
18. Stage 27 Release Gate.
19. Stage 28 Production Cutover.
20. Stage 29 Monitoring & Operations.

See `MASTER_REBUILD_ROADMAP.md` for detailed gates.

## 11. NOT YET VERIFIED / remaining release risk

- production-host PostgreSQL network/pool/load tuning;
- real-host backup + restore drill;
- reverse-proxy/API perimeter rate limiting and final security audit;
- object/media storage runtime;
- complete `alwaslh-go` inventory/import;
- media/PDF processing pipeline;
- Gemini prompt/golden/failover/worker runtime;
- complete Admin product;
- post-auth Student learning product;
- Practice Engine/trusted scoring;
- Offline replica/outbox/service-worker lifecycle;
- production performance/security/accessibility/device/staging/rollback/release gates.

## 12. Mandatory continuation protocol

At every meaningful batch:

- update `PROJECT_ENGINEERING_LOG.md` with decisions/findings/changes/failures/fixes;
- update `PROJECT_STATUS.md` with current stage, completed/remaining work, blockers, last verification and next step;
- update this handoff when verified baseline, architecture/business rules, branches/PRs or active stage changes;
- keep exact run/commit evidence;
- never represent an unexecuted check as PASS.
