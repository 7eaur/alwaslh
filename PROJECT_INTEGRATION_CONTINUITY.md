# PROJECT INTEGRATION CONTINUITY — الوسيلة الذكية

> **Purpose:** هذا هو ملف الذاكرة التشغيلية الثابت للمحادثة الرئيسية (Integration / Architecture / QA / Release). يجب أن تستطيع محادثة بديلة أن تقرأ هذا الملف + `DOCUMENTATION_INDEX.md` + ملفات الحالة المركزية + GitHub Boards ثم تكمل من نفس النقطة بدون أي ذاكرة Chat سابقة.
>
> **Important:** هذا الملف لا يتقدم على الكود أو PostgreSQL migrations أو executable CI evidence. هو snapshot تشغيلي مفصل يربط Source of Truth مع العمل الجاري بين التقارير. أي ادعاء بلا evidence يبقى `NOT YET VERIFIED`.

Last synchronized: **2026-09-08 07:20 +03:00**.

---

## 1. كيف تستخدمه محادثة Integration بديلة

قبل أي تعديل أو دمج:

1. افتح `README.md` ثم `DOCUMENTATION_INDEX.md` واتبع Source of Truth precedence.
2. اقرأ `PROJECT_HANDOFF.md`, `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`.
3. اقرأ هذا الملف كاملًا.
4. اقرأ `docs/workstreams/TEAM_OPERATING_MODEL.md` و`docs/workstreams/INTEGRATION_WORKSTREAM.md`.
5. اقرأ آخر التقارير/الأوامر في:
   - Team Room: Issue `#13`;
   - Backend Board: Issue `#14`;
   - Frontend Board: Issue `#15`;
   - Integration Board: Issue `#16`.
6. تحقق من رؤوس branches الحالية وGitHub Actions بنفسك؛ branch قد تتقدم بعد آخر Board REPORT.
7. افحص commits/code الفعلي قبل `ACCEPT | RETURN | PARTIAL`.
8. أي شيء لم تفحصه أو لم يعمل على same-head evidence = `NOT YET VERIFIED`.

**قاعدة الاستمرارية:** لا تعتمد على النص الموجود في محادثة Chat بوصفه حالة رسمية. GitHub + هذا الملف + central docs هي الذاكرة.

---

## 2. دوري كـIntegration Lead

المحادثة الرئيسية تمثل:

- Tech Lead / Software Architect;
- cross-team contract owner;
- Integration Engineer;
- QA / regression owner;
- Security/Performance/UX cross-boundary reviewer;
- Release owner عند إعادة تفعيل deployment;
- owner للـcentral documentation synchronization.

لا أكتب كل Backend/Frontend بنفسي ما دام الإصلاح في ownership واضح؛ أراجع عمل الفريقين، أعيد defect إلى طبقته المالكة عند الحاجة، أدمج بعد evidence، ثم أبني same-head verification.

لا تصبح Stage `VERIFIED` لمجرد `Backend Ready` أو `Frontend Ready`.

---

## 3. فكرة المنتج التي يجب الحفاظ عليها

**الوسيلة الذكية** منصة تعليمية عربية لها سطحان مستقلان:

### Student Web/PWA — `apps/student-web`

الهدف النهائي:

- secure activation / returning login / recovery/device proof;
- entitlement-filtered curriculum;
- Reader ومحتوى موثوق ومراجع;
- Practice / Tests / Models;
- Notes / Favorites / Needs Review;
- progress/private achievements;
- notifications;
- explicit Offline/PWA lifecycle.

### Super Admin Web — `apps/admin-web`

الهدف النهائي:

- curriculum/content authoring;
- image/PDF/mixed ingestion;
- media/OCR review;
- AI operations/review;
- Question Bank / Quiz Builder / publish;
- students/codes/recovery/device reset;
- notifications/import-export/reports/settings/audit.

### Backend — `apps/api` + PostgreSQL

هو authority لـ:

- Auth / Authorization / Entitlements;
- curriculum/business data;
- durable content/media/OCR/AI state;
- review/publication;
- trusted assessment/scoring/progress state;
- audit/security-sensitive mutations.

Browser presentation state فقط؛ لا يملك durable business authority.

---

## 4. المعمارية الحالية المستقرة

```text
Student Web/PWA ─┐
                 ├── Fastify API ── private PostgreSQL
Admin Web ───────┘       │
                         ├── Auth / Access / Curriculum
                         ├── Stage9 source provenance
                         ├── Stage10 media pipeline
                         ├── OCR durable derived/reviewed text
                         ├── Stage11 provider-neutral AI contracts
                         ├── Stage12 durable AI execution/worker
                         └── Stage13 Admin review/publication/operations
```

مبادئ لا تُكسر:

- Correctness > Cleverness.
- Clarity > Complexity.
- Evidence > Assumptions.
- لا duplicate queue/lifecycle/pipeline لمجرد سهولة feature جديدة.
- provider/network calls خارج long DB transactions.
- durable jobs/progress/review/publication server/PostgreSQL-owned.
- Frontend لا يستنتج business permissions إذا Backend authority تستطيع توفيرها.
- `media ready != published`.
- AI raw output != published student content.
- Stage13E AI approval != Stage13F Question Bank publication.
- Exact/extraction AI modes لا تخترع unknown answers.
- test weakening / auth bypass / hidden catch / arbitrary timeout ليست إصلاحًا.
- كل defect مهم: Symptom → Root Cause → Broken invariant → Blast radius → Correct owning layer → Regression.

---

## 5. Business / Security boundaries الثابتة

- Full Code = exactly 6 digits.
- Class Code = exactly 7 digits.
- Student activation verify non-consuming؛ final activation atomic.
- Returning Student: password + registered ECDSA P-256 device proof.
- Admin auth/recovery مستقل؛ temp-password recovery/session revoke/forced replacement/device rebind تبقى intact.
- Curriculum authority: `Class → Subject Offering → optional Section → Lesson`.
- Stage9 Git/source import provenance فقط، وليس curriculum authority.
- source folders/file names لا تصبح Business Rule صامتة.
- Upload/media success مستقل عن OCR/AI/TTS.
- reviewed OCR هو downstream evidence المفضل عندما متاح.
- AI contracts provider/model-neutral؛ provider selection منفصل.
- DB-coordinated AI capacity/cooldown/kill/budget controls تبقى authority.
- Fastify HTTP process منفصل عن dedicated AI worker runtime.
- لا secrets/credential aliases/raw provider internals إلى Admin/Student browser.

---

## 6. Repository / Git / Release state

Repository: `7eaur/alwaslh`.

Main integration/planning branch:

`planning/product-evolution-review`

Draft PR:

`#12` → base `rebuild/media-pipeline`.

Current planning branch HEAD before this continuity-file commit:

`7f4d8421e134978a5c115897a106095833f7a371`

PR body is stale and still describes old Stage10→Stage6/8 sequencing. Metadata cleanup is optional and must not be confused with product work.

Deployment / Preview:

**`DEFERRED BY PRODUCT OWNER`**.

Do not deploy to Vercel/Supabase or re-enable auto-deploy until explicit new Product Owner instruction.

Old database work:

**OUT OF CURRENT SCOPE** unless explicitly reopened.

---

## 7. Canonical executable baseline

Latest fully verified runtime/executable head remains:

`4eca7de8877ac9e2289b9c7990c912d33c256935`

Same-head SUCCESS evidence:

- Stage13D Admin Upload UI — `34177369743`;
- Stage13D Content Ingestion — `34177369784`;
- Stage13 Admin Product — `34177369748`;
- Stage12 AI Execution — `34177369812`;
- Stage11 AI Contracts — `34177369753`;
- OCR Foundation — `34177369750`;
- Stage10 Media Pipeline — `34177369777`;
- Stage9 Content Import — `34177369756`;
- Full Rebuild — `34177369768` incl. Student Chromium.

Docs/governance descendants لا تستبدل هذا runtime baseline حتى توجد full same-head executable matrix جديدة.

---

## 8. Stage ledger

VERIFIED:

- Stage1 Product Inventory/Contract;
- Stage2 Brand;
- Stage3 UX Architecture baseline;
- Stage4 PostgreSQL Platform;
- Stage5 Engineering Foundation;
- Stage6 Auth/Authorization;
- Stage7 Access Codes/Entitlements;
- Stage8 Student Activation / Returning Login / Recovery / Device incl. Chromium;
- Stage9 Canonical Source Import;
- Stage10 Media Pipeline;
- OCR Foundation;
- Stage11 Provider-neutral AI Contracts;
- Stage12 Durable AI Execution/Capacity/Controls/Worker runtime backend;
- Stage13A Curriculum Backend;
- Stage13B Admin Curriculum UI incl. Chromium;
- Stage13C Admin Content/Media/OCR Operations incl. Chromium;
- Stage13D Upload/Processing History/Publication Linking incl. Chromium.

Current:

- **Stage13E Admin AI Operations / Review — IN PROGRESS / NOT YET VERIFIED.**

Later:

- Stage13F Question Bank / Quiz Builder / Review / Publish;
- Stage13G Remaining Admin modules;
- Stage14 Student full product/Reader;
- Stage15 Assessment;
- Stage16 Offline/PWA;
- Stage17 Personal Learning Data;
- Stage18 Notifications;
- Stage19 Progress/Statistics;
- Stage20 Import/Export/Reporting;
- Stage21–29 hardening/release/cutover/operations.

Do not jump to Stage13F before Stage13E closure.

---

## 9. Permanent team topology

### Team Room — Issue #13

Cross-team contracts, blockers, architecture decisions.

### Backend / Platform — Issue #14

Persistent chat role + short branches. Current Stage13E branch:

`backend/stage13e-ai-operations`

### Frontend / Product — Issue #15

Persistent chat role + short branches. Current Stage13E branch:

`frontend/stage13e-ai-operations`

### Integration / Architecture / QA / Release — Issue #16

Main chat acceptance/return/merge/verification/central-doc decisions.

Latest `COMMAND`/Integration Review in each Board governs that workstream.

---

## 10. Current Stage13E — Backend state

Branch:

`backend/stage13e-ai-operations`

Current branch HEAD at this synchronization:

`348c02646d0ff873fd305beff16f41c46d9c0285`

Latest Backend REPORT:

Issue #14 comment `5579330147`.

Latest Integration return that Backend followed:

Issue #14 comment `5579170754`.

### Backend implementation now present

Stage13E reuses existing Stage11/12 authority; no second queue.

Implemented server functionality includes:

- Admin-only jobs list/detail;
- durable units/attempts/output detail;
- server-derived progress/status;
- pause/resume/cancel/retry over existing Stage12 lifecycle;
- provider/model/project/route/benchmark/token/cost/latency observability without secrets;
- source/page/checksum/OCR/content-source provenance;
- append-only review authority `edit | approve | reject`;
- row locking / unique revision protection;
- Stage11 semantic validation reused for Admin edits/approval;
- raw/normalized provider output remains immutable;
- Stage13E review never publishes directly into Stage13F Question Bank.

Migration:

`database/migrations/0018_ai_admin_review.sql`

Adds append-only `ai_output_review_events` and review action enum/audit constraints.

Admin endpoints:

- `GET /v1/admin/ai/jobs`
- `GET /v1/admin/ai/jobs/:jobId`
- `GET /v1/admin/ai/units/:unitId`
- `GET /v1/admin/ai/outputs/:outputId`
- `POST /v1/admin/ai/jobs/:jobId/pause`
- `POST /v1/admin/ai/jobs/:jobId/resume`
- `POST /v1/admin/ai/jobs/:jobId/cancel`
- `POST /v1/admin/ai/jobs/:jobId/retry`
- `PATCH /v1/admin/ai/outputs/:outputId/review`

Canonical Frontend-facing contract on Backend branch:

`docs/ai/STAGE13E_ADMIN_AI_OPERATIONS.md`

### Important root-cause fixes already made

1. **Nonexistent job failure columns**
   - Initial implementation referenced unverified `ai_jobs.failure_code/failure_message`.
   - Removed instead of adding duplicate authority; unit/attempt error fields remain owner.

2. **Admin retry budget**
   - Retry grants one explicit extra attempt per failed unit.
   - Hard attempt ceiling 20.
   - Attempt history preserved.

3. **Stage11 semantic-review bypass**
   - Structural schema alone was insufficient.
   - Review now reuses Stage11 semantic validator against canonical unit input while output row is locked.

4. **Paused cancellation invariant**
   - `AiExecutionRepository.requestCancel` now clears `paused_at` at the owning Stage12 repository layer.
   - Regression added for `pause → cancel` durable state.

5. **Ambiguous review HTTP body**
   - Review body is now a strict discriminated union.
   - `approve + editedOutput`, edit missing output, blank reject reason, unknown fields are invalid.

6. **Cross-team action authority gap**
   - Backend now returns server-derived action arrays, avoiding a drifting Frontend permission matrix.

### Latest Integration-return batch commits

Accepted pre-return fixes:

- `96d5f993d5fcef142dac037d4b11bb208c25cd2f` — clear pause in cancellation authority;
- `74a3781e754a76b441f93aedb19afd348c1cb779` — paused-cancel regression;
- `27da24b84d6769d673ab1bcb91f22a9829c0e64a` — strict review payload boundary.

Return batch:

- `e8f27e37e5563a85ce3747f0515b67f11102298c` — derive Admin job action availability;
- `20a36eacdf6516339f68ff38f3ced8c339b29c0c` — review action authority;
- `9056fd44dda3285e561d787833593c77d5380f8f` — expose server-derived action availability;
- `5a9062c227132a3305d393aadd0dc91c1b875ede` — exact AI review union;
- `1f2e26789989e43a92b790a212ea108727a5f87e` — Stage13E action-authority regressions;
- `37559d2a0492dfc4dd10faa78bc984d03960a43f` — workflow includes new regression;
- `846169609d344d01a6056a22fc7634c86fcb31fb` — sync contract docs;
- `348c02646d0ff873fd305beff16f41c46d9c0285` — Backend resumable report/doc state.

### Server-derived action availability

Job Detail returns:

`allowedActions: Array<"pause" | "resume" | "cancel" | "retry">`

Output Detail returns:

`allowedReviewActions: Array<"edit" | "approve" | "reject">`

Mutation endpoint remains final authority; stale/race conflict may still return `409`, and UI must refresh canonical state.

### Strict review contract

```ts
type ReviewRequest =
  | { action: "edit"; editedOutput: AiGenerationOutput; note?: string }
  | { action: "approve"; note?: string }
  | { action: "reject"; note: string };
```

Security boundary:

- no raw provider response to browser; only `hasRawResponse`;
- no provider/internal error message text; expose safe `errorCode`/`lastErrorCode` only;
- no `credential_alias`;
- no provider raw metadata.

### Backend CI state

Latest reported Stage13E run:

`34187606304` @ `348c02646d0ff873fd305beff16f41c46d9c0285`

Result:

- completed/failure before checkout;
- `runner_id=0`;
- empty runner name;
- `steps=[]`;
- no repository command executed.

Therefore this is **CI infrastructure allocation evidence, not application PASS/FAIL**.

Backend current-head lint/typecheck/unit/build/clean PostgreSQL/Stage13E integration/Stage12 regressions/auth regression are still `NOT YET VERIFIED` until runner allocation executes them.

Backend Ready for integration: **NO** solely because mandatory current-head executable gate has not run.

Backend exact next action:

1. rerun/observe unchanged Stage13E workflow when hosted runner allocation works;
2. if a real code/test failure appears, fix root cause at owning layer;
3. require all gates green on exact same latest HEAD;
4. update Backend workstream + Issue #14;
5. emit Stage13E Closure Report with `Ready for integration: YES` only after full PASS.

---

## 11. Current Stage13E — Frontend state

Branch:

`frontend/stage13e-ai-operations`

Last formal Frontend REPORT accepted as partial:

Issue #15 comment `5578788108` @ `e259f567a3bd5c3ef578d90e4b3e6bed6ad89c87`.

Integration continue command:

Issue #15 comment `5579174441`.

Current branch HEAD observed after that command:

`afad78e8950373a501b67a37fe32c9af2f5cebeb`

**Important continuity fact:** Frontend branch has advanced beyond its last formal Board REPORT. Treat commits after `e259f567...` as **work in progress / NOT YET VERIFIED until Frontend posts exact report/tests**.

Observed two commits since the accepted partial batch:

- `79330380e23d0c1941dc750fddd5b854286868a5` — `feat(admin): bind Stage13E AI transport contract`;
- `afad78e8950373a501b67a37fe32c9af2f5cebeb` — `feat(admin): activate Stage13E AI operations`.

Observed changed files include:

- `apps/admin-web/src/ai-operations-api.ts` + tests;
- `apps/admin-web/src/ai-operations-adapter.ts` + tests;
- `apps/admin-web/src/AiOperationsPage.tsx`;
- `apps/admin-web/src/AiOperationsWorkspace.tsx`;
- `apps/admin-web/src/ai-operations-view-model.ts` + tests;
- `apps/admin-web/src/App.tsx`.

From inspected commit content, current WIP is implementing:

- real Stage13E API transport;
- adapters from Backend read models to UI model;
- Admin page/navigation activation;
- canonical refresh after mutations/conflicts;
- bounded polling (5s) only for selected non-terminal job, with in-flight guard and cleanup;
- real review mutation integration.

This is promising but **not accepted yet** because no post-command Frontend REPORT/current-head quality evidence has been recorded at this synchronization.

### Frontend contract corrections Integration already required

1. Remove production `rawOutput` dependence and raw JSON diagnostic disclosure.
   - Backend intentionally exposes only `hasRawResponse`.

2. Remove provider/internal `errorMessage`/`lastErrorMessage` dependence.
   - Backend intentionally exposes safe codes only.

3. Consume Backend `allowedActions` and `allowedReviewActions`.
   - Never derive permissions from lifecycle/review enums.

4. On mutation `409`, show safe feedback and refresh canonical state; no optimistic lifecycle promotion.

5. Review payloads must match Backend strict union.

6. Stage13E approved AI output must remain visually/semantically distinct from Question Bank publication.

### Frontend previous verified prep evidence

Run `34184228250` @ `a54625a6f533d32cd4448765573649fab3700f61`:

- lint PASS;
- typecheck PASS;
- 19 unit tests PASS, incl. 6 Stage13E prep tests;
- build PASS.

This evidence predates current real transport/wiring commits and therefore **does not verify `afad78e...`**.

### Frontend exact next action

Frontend must:

1. finish current binding batch against amended Backend contract;
2. self-review raw/error/action authority/security boundaries;
3. run current-head lint/typecheck/unit/build;
4. add/confirm transport mapping, secret omission, strict review payload, action-array, `409` refresh regressions;
5. prepare real Chromium scenarios (jobs/detail/control/review/reload/permission/error/390px);
6. if cross-branch real Backend is required, mark Chromium `NOT YET VERIFIED` for Integration combined branch rather than fake production transport;
7. update `docs/workstreams/FRONTEND_WORKSTREAM.md` and Issue #15 with exact current HEAD/tests;
8. request Integration only when `Ready for integration: YES` is evidence-backed.

---

## 12. Cross-team Stage13E decisions already settled

These decisions are Integration-owned and should not be reopened casually:

- no second Stage12 queue/lifecycle;
- PostgreSQL/Backend owns jobs/progress/review;
- Frontend receives, not derives, action availability;
- raw provider response stays server-internal;
- internal provider error messages stay server-internal;
- safe error codes may be displayed/mapped;
- output provenance source/page/checksum must be visible;
- review events append-only/audited;
- terminal approve/reject blocks later review mutation;
- `review_required` may be human-approved; semantic `invalid` may not;
- edit/approve candidates reuse Stage11 semantic validator;
- cancellation clears paused state at owning repository layer;
- mutation conflict `409` means refresh canonical server state;
- Stage13E approval is not Stage13F publication.

Team Room decisions/handoffs relevant to this stage include comments:

- `5578975107` Backend contract handoff;
- `5579019837` semantic-review correction;
- `5579176219` Integration cross-team contract/security alignment;
- `5579322581` Backend amended contract handoff.

---

## 13. Current Stage13E Integration decision

**Do not merge yet.**

Reason:

- Backend implementation/contract is structurally ready for final verification but same-head executable gate is blocked before runner allocation.
- Frontend current WIP has advanced beyond its last Board report and still needs current-head quality evidence/Closure readiness.

Integration must continue with `PARTIAL/RETURN` semantics; no Stage PASS claim.

---

## 14. Exact next Integration actions

When this main conversation resumes/replaces:

### A. Immediately re-read branches and Boards

1. Backend #14: check whether a new current-head CI run/Closure Report exists after `348c026...`.
2. Frontend #15: check for report after `afad78e...` and compare actual branch HEAD if newer.
3. Team Room #13: inspect any contract/blocker decisions newer than those listed above.
4. Integration #16: read latest acceptance/return record.

### B. Backend acceptance gate

Do not accept Backend until:

- a hosted runner actually executes repository steps;
- lint/typecheck/unit/build pass;
- clean migration incl. `0018` passes;
- Stage13E auth/secret/provenance/review-race/action/retry/control tests pass;
- Stage12 regressions pass;
- auth security regression passes;
- all on exact same current Backend HEAD.

### C. Frontend acceptance gate

Review current WIP for:

- exact Backend contract mapping;
- no raw response/internal message leak;
- server-provided action arrays;
- correct strict review bodies;
- safe bounded polling without overlaps/storms;
- cleanup/unmount/stale request protection;
- `409` refresh behavior;
- Admin shell consistency;
- RTL/a11y/390px.

Require current-head lint/typecheck/unit/build and Board REPORT.

### D. Integration merge only after both are ready

Create/use a short integration branch from latest approved planning HEAD and combine logical Backend + Frontend batches while preserving ownership intent.

Then run same-head:

- API lint/typecheck/unit/build;
- Admin lint/typecheck/unit/build;
- clean PostgreSQL migrations;
- Stage13E Backend integration;
- Stage12 regressions;
- auth regression;
- Stage13 Admin regression;
- real Chromium Stage13E jobs/detail/control/review/reload/error/permission;
- 390px overflow/a11y;
- Stage13D regression;
- OCR/Stage11/Stage12/Full Rebuild as required by current matrix.

No fake transport in final browser gate.

### E. Closure docs after executable PASS

Update:

- this file;
- `PROJECT_STATUS.md`;
- `PROJECT_ENGINEERING_LOG.md`;
- `PROJECT_HANDOFF.md`;
- `DOCUMENTATION_INDEX.md` if doc topology changes;
- Stage13E specialized docs;
- `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md`;
- `MASTER_REBUILD_ROADMAP.md` when Stage13E becomes VERIFIED;
- `NEXT_CONVERSATION_PROMPT.md` only as launcher if startup sequence changes.

Record exact integrated HEAD + run IDs.

Only then issue next Stage13F commands.

---

## 15. Known open risks after Stage13E

Carry these forward explicitly:

- `AI-011-005` P2 — `direct` AI question persistence into Question Bank unresolved; Stage13F owns decision.
- `AI-012-019` P2 — live provider/model benchmark/config/routes/bootstrap NOT YET VERIFIED.
- `LES-A-016..019` page-detection/review/save flows not yet fully verified unless Stage13E evidence later closes a subset.
- `LES-A-020..037` Admin AI generation/review operations require user-flow evidence before Legacy VERIFIED.
- TTS production runtime/quality unverified.
- full Student curriculum/read product later.
- final Offline/PWA later.
- hosted deployment unverified because deployment deferred.
- `tmp-unused-do-not-use` is P3 repo housekeeping only.

---

## 16. Root-cause / no-patching gate

Any team/integration failure must record:

```md
Symptom:
Root cause:
Broken invariant/contract:
Blast radius:
Correct owning layer:
Why this fix is correct:
Regression evidence:
Remaining NOT YET VERIFIED:
```

Reject final fixes based on:

- test weakening;
- auth/security bypass;
- hidden catch/swallowed error;
- random sleep/timeout increase;
- duplicate authority;
- wrong-layer permanent workaround;
- fake production API;
- client-derived business state that server owns.

---

## 17. Update policy for THIS file

The Integration/main chat must update `PROJECT_INTEGRATION_CONTINUITY.md` after every meaningful event that changes what a replacement chat needs to know, including:

- new Backend/Frontend REPORT;
- `ACCEPT | RETURN | PARTIAL` decision;
- branch/head change that materially advances work;
- cross-team contract decision;
- discovered root cause/fix;
- CI outcome/blocker;
- integration merge;
- Stage transition;
- deployment policy change;
- important open risk change.

Do not wait until the end of a Stage.

When a branch advances without a Board report, record it here as **observed WIP / NOT YET VERIFIED**, never as completed work.

Permanent historical detail still belongs in `PROJECT_ENGINEERING_LOG.md`; concise project-level handoff belongs in `PROJECT_HANDOFF.md`; executable state belongs in `PROJECT_STATUS.md`. This file connects all three into a precise **current Integration memory**.

---

## 18. If this file conflicts with another source

Use precedence:

1. current code/migrations + actual GitHub Actions evidence;
2. Current Product Overrides;
3. central status/handoff/engineering log;
4. current specialized module contracts;
5. this operational snapshot for current work coordination;
6. Boards for dynamic commands/reports;
7. older planning/legacy docs.

Then update this file immediately so it no longer conflicts.
