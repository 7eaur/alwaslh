# PROJECT HANDOFF — الوسيلة الذكية

> **Purpose:** هذا الملف هو نقطة البداية لأي محادثة أو مهندس جديد. يجب قراءته قبل تعديل المشروع. إذا تعارض مع افتراض سابق، فالمستودع والـCLI/CI هما المصدر الأعلى للحقيقة.

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
14. Frontend لا يخترع API contracts. أي flow لا يملك عقدًا موثقًا يبقى `BLOCKED / NOT YET VERIFIED` بدل ربطه بمسار افتراضي.

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

## 5. Verified baseline and current parallel work

### Stages 1–7 baseline

Stages 1–7 remain **CLI/RUNTIME PASS**. A fresh verification was rerun against the Stage 8 Student UI change and all existing stage jobs stayed green:

- GitHub Actions run: `33289552826`
- Result: **Stages 1–7 SUCCESS** on clean CI, including PostgreSQL 16 runtime/integration checks.
- The Stage 8 UI implementation commit verified by that run: `483ddf4926604b87fcbe7199fd426bc52ea80b9d`.

Prior Stage 7 stack remains:
- Foundation: `rebuild/foundation` / PR #2.
- Auth: `rebuild/auth-authorization` / PR #3.
- Access/Entitlements: `rebuild/access-entitlements` / PR #4.

### Stage 8 — Student Activation & Account Flow

**Overall Stage 8 status: NOT COMPLETE.** Backend activation/account orchestration is owned by the main Stage 8 conversation and was deliberately not modified in this parallel UI batch.

Parallel Student UI branch:
- base: `rebuild/access-entitlements`
- branch: `rebuild/student-activation-ui`
- implementation commit: `483ddf4926604b87fcbe7199fd426bc52ea80b9d`
- draft PR: #5
- verification run: `33289552826`
- Student UI sub-scope: **CLI PASS**

Implemented under `apps/student-web` only:
- first-launch server session verification using documented `GET /v1/student/me`;
- returning-student login using documented `POST /v1/auth/login`;
- verified Student role before entering the authenticated Student state;
- logout using documented `POST /v1/auth/logout`;
- entitlement summary using documented `GET /v1/student/access/entitlements`;
- recovery reset using documented `POST /v1/auth/reset-password` when the user already has a valid recovery token;
- dedicated activation/login/recovery UI with clear separation between flows;
- 6-digit activation-code input with Arabic/Persian/English digit normalization matching the backend contract;
- loading, network-unavailable, offline, API-error, empty entitlement and success states;
- no fake offline authentication: cold offline launch does not claim an unverified session;
- responsive RTL-first layout, touch targets, semantic forms/labels, `aria-live` error/status announcements, invalid-state semantics and reduced-motion behavior through brand tokens;
- frontend lint + Vitest scripts wired into `prebuild` so the existing Stage 5 CI build executes them.

### Stage 8 documented API boundary

Documented and used by the Student UI:
- `POST /v1/auth/login`
- `POST /v1/auth/logout`
- `GET /v1/student/me`
- `POST /v1/auth/reset-password`
- `GET /v1/student/access/entitlements`

Documented but **not suitable for first activation**:
- `POST /v1/student/access/redeem` requires an already authenticated Student session.

Explicit blockers:
- **BLOCKED / NOT YET VERIFIED — first-time activation API:** no documented endpoint on `rebuild/access-entitlements` atomically validates a 6-digit full-access code, creates/claims Student account credentials, grants entitlement and establishes a session. The activation UI therefore validates presentation/input only and **does not send or consume the code**.
- **BLOCKED / NOT YET VERIFIED — Student recovery-token issuance:** current documented issuance route is Admin-only. The Student UI can perform reset with an already-issued token but does not invent a self-service issuance endpoint.
- **NOT YET VERIFIED — browser E2E / deployment API routing:** production/reverse-proxy behavior that serves `/v1/*` to the Student web origin has not been browser-tested in this batch; Vite dev proxy behavior was not invented without a documented deployment contract.

### Stage 8 Student UI verification evidence

GitHub Actions run `33289552826`, Stage 5 job `Stage 5 · Engineering foundation`, step `Install and build Student`:

```text
npm run typecheck --prefix apps/student-web
  -> tsc --noEmit                              PASS

npm run build --prefix apps/student-web
  -> prebuild: npm run lint && npm test
     -> eslint . --max-warnings 0              PASS
     -> vitest run                             PASS (5/5 tests)
  -> tsc -b && vite build                      PASS
```

Production build transformed 29 modules and completed successfully. The same workflow run also completed Stage 1, 2, 3, 4, 5, 6 and 7 jobs successfully.

## 6. Current Stage 8 remaining scope

The main Stage 8 implementation still must provide and prove the backend contract for:
- first-time Student activation using an access code;
- atomic account/profile + credential + entitlement creation where relevant;
- no partially-created account if activation/redemption fails;
- invalid/expired/revoked/redeemed code outcomes;
- account identifier generation/normalization contract;
- activation idempotency/race protection;
- session establishment after successful activation;
- Student recovery issuance UX/API contract if self-service recovery is required;
- PostgreSQL integration tests;
- API/E2E flow: activation → authenticated session → entitlement visible.

After the backend contract exists, `apps/student-web` should wire the existing activation/recovery surfaces to that documented contract without changing the established flow semantics.

Stage 8 remains `NOT COMPLETE` until its complete CLI/runtime gate passes.

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

Do not claim these are done merely because schema/UI exists:

- complete Stage 8 first-time activation backend/runtime flow.
- Student self-service recovery-token issuance.
- Student browser E2E and deployed `/v1/*` routing.
- actual production/self-hosted PostgreSQL networking/tuning/load characteristics.
- real-host backup + restore drill.
- object storage/media provider.
- `alwaslh-go` full file integrity/inventory/import.
- Gemini golden tests/provider failover/runtime.
- complete Admin product.
- complete Student PWA product.
- offline isolation/delta/outbox/service-worker lifecycle.
- production security/performance/accessibility/release readiness.

## 10. Canonical documents to read before work

Read in this order:

1. `PROJECT_HANDOFF.md` — current continuation context.
2. `PROJECT_STATUS.md` — concise current stage and last verified build.
3. `PROJECT_ENGINEERING_LOG.md` — decisions/findings/history.
4. `PRODUCT_FEATURE_PARITY_MATRIX.md` — feature preservation contract.
5. `MASTER_REBUILD_ROADMAP.md` — ordered roadmap; newer handoff/status stage numbering governs where historical roadmap text differs.
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
