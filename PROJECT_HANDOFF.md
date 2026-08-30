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
9. Student offline data account-scoped مع revisions/tombstones لاحقًا.
10. AI jobs durable في backend/workers؛ Gemini keys server-only.
11. `alwaslh-go` Content Source فقط؛ importer يحفظ order/checksum/source metadata.
12. Feature parity تقاس بالنتيجة للمستخدم وليس بطريقة التنفيذ القديمة.
13. لا Stage تُغلق بدون CLI/CI evidence. الحالات: `DESIGN PASS` / `CLI PASS` / `RUNTIME PASS` / `RELEASE PASS`; أي شيء غير منفذ = `NOT YET VERIFIED`.

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

Latest full green verification on Stage 7 branch:

- Branch: `rebuild/access-entitlements`
- Commit: `0a7929daf2f79baccca31b8110a6c6e372d49024`
- GitHub Actions run: `33288330856`
- Result: **Stages 1–7 SUCCESS** on clean CI, including PostgreSQL 16 runtime tests.

### Stage 1 — Product Contract ✅ CLI PASS
- Repository/product audit done.
- `PRODUCT_FEATURE_PARITY_MATRIX.md` is the feature-preservation contract.
- `scripts/verify-product-contract.py` validates IDs/rows/capability families.

### Stage 2 — Brand Identity ✅ CLI PASS
- Identity evolved from original teal/open-book logo.
- Owned SVG/PNG/PWA assets; no TailAdmin/Miaoda dependency.
- Palette/typography/accessibility tokens are canonical under `packages/brand`.
- `scripts/verify-brand.py` checks assets, SVG parse, PWA dimensions, identity JSON, typography/accessibility tokens.

### Stage 3 — UX Architecture ✅ CLI PASS
- Admin IA, Student mobile IA, critical flows/states, parity mapping, responsive/accessibility contracts and wireframes documented.
- `scripts/verify-ux.py` enforces contracts.

### Stage 4 — PostgreSQL Data Platform ✅ CLI/RUNTIME PASS
Canonical migrations currently:
- `0001_core.sql`
- `0002_access.sql`
- `0003_learning.sql`
- `0004_ai_and_sync.sql`
- `0005_auth.sql`
- `0006_access_contract.sql`

CI applies migrations to clean PostgreSQL 16 with failure-on-error and validates constraints/indexes/schema behavior.

### Stage 5 — Engineering Foundation ✅ CLI/RUNTIME PASS
Implemented:
- `apps/api` runtime.
- PostgreSQL pool/transaction boundary.
- migration runner + idempotent migration tracking.
- environment validation.
- structured public error envelope/logging foundation.
- lint + strict TypeScript + unit tests + production API build.
- Admin production build and Student production build.
- CI clean-run gate.

### Stage 6 — Auth & Authorization ✅ CLI/RUNTIME PASS
Implemented and tested:
- password hashing with salted `scrypt` server-side.
- random opaque sessions; only SHA-256 token digest persisted.
- HttpOnly session cookie.
- Admin/Student role isolation.
- Origin/CSRF-oriented mutation protection.
- PostgreSQL-backed brute-force lockout state.
- recovery is one-time and resets credentials; original password is never exposed.
- password reset invalidates sessions.
- first Admin creation is explicit CLI bootstrap; no public/default-admin bootstrap.
- PostgreSQL integration tests verify login/session/recovery/role isolation/bootstrap refusal on repeat.

Stage 6 branch/PR:
- branch `rebuild/auth-authorization`
- PR #3 stacked on foundation.

### Stage 7 — Access Codes & Entitlements ✅ CLI/RUNTIME PASS
Implemented and tested:
- cryptographically secure 6-digit full-access codes.
- cryptographically secure 7-digit class-access codes.
- Arabic/Persian digit normalization.
- configurable entitlement duration stored with generated code.
- transactional row-locked redemption.
- idempotency keys with advisory transaction locks.
- idempotency result is profile-bound; another student cannot reuse a known key.
- finite renewal extends the existing entitlement rather than creating conflicting grants.
- class code is **not consumed** when active full access already covers the student.
- Admin revoke flow.
- atomic code creation + audit event.
- access audit events.
- active entitlement uniqueness constraints.
- integration tests cover generation, Arabic digits, renewal, idempotency, revoke, no-waste behavior and concurrent redemption race.

Important bugs caught by the Stage 7 gate and fixed:
- Zod/default TypeScript boundary made explicit with `?? 365`.
- PostgreSQL enum/UNION inference in access audit generation was replaced by simpler atomic inserts.
- `jsonb_build_object` duration parameter was explicitly typed as integer.
- code generation + audit event moved into one transaction.
- idempotency lookup was strengthened to include profile ownership.

Stage 7 branch/PR:
- branch `rebuild/access-entitlements`
- PR #4 stacked on Stage 6.

## 6. Current next stage

**NEXT: Stage 8 — Student Activation & Account Flow.**

Do not skip ahead.

Required scope for Stage 8:
- first-time Student activation using an access code.
- returning-student login path.
- atomic account/profile + credential + entitlement creation where relevant.
- no partially-created account if code redemption fails.
- correct handling of invalid/expired/revoked/redeemed codes.
- account identifier generation/normalization.
- activation idempotency/race protection.
- session establishment after successful activation.
- integration tests on clean PostgreSQL.
- E2E/API-level flow: activation → authenticated session → entitlement visible.

Stage 8 must remain `NOT COMPLETE` until its CLI/runtime gate passes.

## 7. Business rules that must remain preserved

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

## 8. Known future stages / major remaining systems

After Stage 8, continue phase-by-phase only:

1. account/admin account management finalization.
2. content model/API and deterministic `alwaslh-go` inventory/import.
3. ordered media/PDF pipeline.
4. Admin content UI.
5. versioned AI contracts and Prompt Registry.
6. durable Gemini jobs/workers, retries, project/key health, cooldown/failover and AI Ops.
7. quiz domain + shared PracticeEngine.
8. Student lesson reader/quizzes/notes/progress/notifications.
9. Offline Sync Engine + PWA/service worker + attempt outbox.
10. Admin access/student/report/export surfaces.
11. design-system completion/shared UI/accessibility.
12. performance/security/observability.
13. staging, real-host DB tuning, backup/restore drill, E2E, load/security/accessibility gates.
14. release only after feature parity and release gates are evidenced.

## 9. Things explicitly NOT YET VERIFIED

Do not claim these are done merely because schema exists:

- actual production/self-hosted PostgreSQL networking/tuning/load characteristics.
- real-host backup + restore drill.
- object storage/media provider.
- `alwaslh-go` full file integrity/inventory/import.
- Gemini golden tests/provider failover/runtime.
- complete Admin product.
- complete Student PWA product.
- browser E2E.
- offline isolation/delta/outbox/service-worker lifecycle.
- production security/performance/accessibility/release readiness.

## 10. Canonical documents to read before work

Read in this order:

1. `PROJECT_HANDOFF.md` — current continuation context.
2. `PROJECT_STATUS.md` — concise current stage and last verified build.
3. `PROJECT_ENGINEERING_LOG.md` — decisions/findings/history.
4. `PRODUCT_FEATURE_PARITY_MATRIX.md` — feature preservation contract.
5. `MASTER_REBUILD_ROADMAP.md` — ordered roadmap.
6. `docs/engineering/CLI_VERIFICATION_GATES.md` — mandatory gate policy.
7. `PROJECT_FULL_AUDIT_CATALOG.md` / `PROJECT_DEEP_AUDIT.md` — legacy evidence when needed.

## 11. Handoff update rule

At the end of **every meaningful implementation batch**:

- update `PROJECT_ENGINEERING_LOG.md` with decisions, findings, changes and failures/fixes;
- update `PROJECT_STATUS.md` with current phase, completed, remaining, blockers, last tests/build and next step;
- update `PROJECT_HANDOFF.md` when architecture, business rules, branch/PR, verified baseline or next-stage scope changes;
- record exact CLI/CI commands or workflow jobs and the actual result;
- keep failed checks/fixes as evidence rather than hiding them;
- mark anything not executed as `NOT YET VERIFIED`.

This rule is mandatory so a new conversation can resume from repository evidence without depending on chat memory.
