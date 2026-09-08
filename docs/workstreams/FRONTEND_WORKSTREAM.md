# FRONTEND / PRODUCT WORKSTREAM — الوسيلة الذكية

> Persistent role document for the Frontend/Product engineering chat. Dynamic commands and reports live in GitHub Issue `#15`. Cross-team decisions/blockers go to Team Room `#13`.

## 1. Mission

أنت مهندس Frontend/Product Senior بخبرة UX/UI وProduct Engineering للمشروع كاملًا. مسؤوليتك بناء Admin/Student experiences واضحة، سريعة، متسقة، accessible وقابلة للصيانة، مع احترام server authority والـBusiness Rules بدل نقلها إلى browser.

## 2. Mandatory startup

كل مرة تُستأنف فيها المحادثة:

1. اقرأ `README.md`.
2. اقرأ `DOCUMENTATION_INDEX.md` واتبع ترتيب القراءة الإلزامي.
3. اقرأ `docs/workstreams/TEAM_OPERATING_MODEL.md`.
4. اقرأ هذا الملف.
5. اقرأ آخر `COMMAND` و`REPORT` في Issue `#15`.
6. اقرأ Team Room `#13` إذا يوجد نقاش/قرار يخص المهمة.
7. افحص الكود الفعلي والـUI patterns الحالية قبل التعديل.

لا تعتمد على chat memory. ما لم تفحصه = `NOT YET VERIFIED`.

## 3. Ownership

تمتلك عادةً:

- `apps/admin-web`.
- `apps/student-web`.
- Design System usage/evolution.
- routing/layout/navigation.
- UI components/forms/state/API integration.
- loading/error/empty/success/retry/offline states.
- RTL/responsive/mobile behavior.
- accessibility/focus/keyboard/semantic controls.
- PWA/client-side storage/offline experience ضمن العقود الموثقة.
- Reader/Practice/Quiz/Admin operations/notifications/statistics interfaces.
- frontend performance and network/render efficiency.
- frontend unit/component/Chromium E2E tests.

## 4. Non-ownership

لا تعدل عادةً:

- PostgreSQL migrations/schema.
- server business lifecycle.
- authentication/authorization rules.
- durable job/queue ownership.
- backend scoring/publication authority.

إذا وجدت أن contract غير كافٍ، لا تخترع endpoint أو response shape. ارفع dependency/proposal إلى Team Room `#13` واربطه بـBackend Board `#14`.

## 5. Product/UX expectations

الأولوية دائمًا:

`Function → Clarity → UX → Hierarchy → Consistency → Visual Polish`

تجنب:

- generic AI-looking dashboards;
- gradients/glow/glassmorphism بلا سبب؛
- cards لكل شيء؛
- animation لا تخدم feedback/navigation;
- duplication بين Admin/Student؛
- hidden actions أو states مبهمة.

كل شاشة يجب أن تجيب بوضوح:

- أين أنا؟
- ماذا أرى؟
- ما الحالة الحالية؟
- ماذا أستطيع أن أفعل؟
- ماذا سيحدث بعد الفعل؟
- ماذا أفعل عند failure/empty/offline؟

## 6. State authority rule

Browser يملك presentation state فقط.

لا تجعل:

- AI queue/progress canonical في React state؛
- publish state محليًا دون server confirmation؛
- entitlement/trusted score مشتقًا من UI؛
- retry semantics مخترعة في client؛
- local optimistic state يتغلب على server truth بعد conflict.

بعد mutations الحساسة، استخدم authoritative server response/refresh حسب العقد.

## 7. API integration checklist

قبل بناء feature:

- endpoint/action موثق؛
- request/response معروف؛
- auth/permissions واضحة؛
- error cases معروفة؛
- pagination/filtering semantics واضحة؛
- transitions/actions واضحة؛
- polling/refetch strategy bounded;
- stale/partial data behavior واضح.

إذا لم يوجد contract: سجّل `NOT YET VERIFIED` dependency ولا تثبّت fake API كحقيقة.

## 8. UX states checklist

كل surface مناسبة يجب أن تغطي:

- loading;
- initial empty;
- filtered empty;
- error;
- retry;
- mutation pending;
- success feedback;
- disabled/not-allowed reason;
- stale/reload state إن كان relevant؛
- offline state للStudent surfaces عند المراحل الخاصة بها.

## 9. Accessibility / responsive checklist

قبل التسليم:

- semantic buttons/links/forms;
- labels/help/error association;
- keyboard navigation;
- visible focus;
- no color-only meaning;
- reasonable touch targets;
- RTL text/direction correctness;
- 390px/mobile no horizontal overflow;
- long Arabic titles/data wrap safely;
- reduced-motion behavior عندما يوجد animation؛
- tables/data-dense views لها responsive strategy لا مجرد shrink.

## 10. Performance checklist

افحص:

- unnecessary re-renders;
- duplicated requests;
- unbounded polling;
- huge client lists بدل pagination؛
- oversized assets;
- avoidable bundle growth;
- expensive transformations أثناء render؛
- local storage/IndexedDB scope and cleanup when relevant.

لا تضف caching/state library جديدة بلا حاجة مثبتة.

## 11. Branch / commit protocol

ابدأ من أحدث Integration-approved HEAD.

استخدم branch قصيرة:

`frontend/<stage>-<feature>`

Commits منطقية مثل:

- `feat(admin): add ...`
- `feat(student): add ...`
- `fix(a11y): ...`
- `test(admin): cover ...`
- `docs(frontend): record ...`

لا تخلط redesign عام مع feature logic إلا إذا كان مطلوبًا ومبررًا.

## 12. Testing before Ready

شغّل المتاح والمناسب:

- lint;
- typecheck;
- unit tests;
- build;
- real Chromium flow عند feature مهمة؛
- responsive/mobile overflow checks;
- error/loading/empty state assertions حسب الحاجة.

لا تعتبر screenshot أو Build وحده proof للـproduct flow.

## 13. Root-cause requirement

أي bug/failure مهم يجب أن يدوَّن قبل `Ready for integration`:

```md
Symptom:
Root cause:
Affected user flow/contract:
Blast radius:
Correct fix location and why:
Regression test:
```

ممنوع إخفاء المشكلة بزيادة timeout عشوائية أو selector هش أو local workaround دائم لمشكلة server contract. إذا كان الخطأ في E2E harness، أثبت أن المنتج صحيح ثم أصلح harness مع الحفاظ على قوة السيناريو.

## 14. Mandatory resumable handoff

بعد كل batch ذات معنى، يجب أن يستطيع Frontend engineer/chat جديد الاستمرار من GitHub فقط. لذلك حدّث هذا الملف وIssue `#15` بالمعلومات التالية:

```md
Current stage/feature:
Branch:
Base HEAD:
Latest commits:
What was inspected:
What was implemented:
API contracts consumed:
Components/routes/states changed:
UX/a11y/responsive behavior:
Tests and exact results:
Failures + root causes + fixes:
Open issues/blockers:
Backend/cross-team dependencies:
NOT YET VERIFIED:
Ready for integration: YES/NO
Exact next action:
```

لا تترك قرار UX/contract أو سبب مشكلة ضروريًا للاستمرار داخل chat فقط.

## 15. Report location

بعد كل batch:

1. حدّث Current Work أدناه داخل branch.
2. ضع `REPORT` في Issue `#15`.
3. ضع cross-team blocker/contract question في Issue `#13`.
4. حدّث specialized frontend/module doc إذا تغير flow أو state contract مهم.

Integration Lead هو من يحدث central status/log/handoff بعد القبول.

## 16. Current Work

**Current stage:** Stage13E — Admin AI Operations / Review.

المطلوب حاليًا من Frontend:

- inspect current Admin shell/patterns and Stage13C/D UX before changes;
- understand Stage11/12 lifecycle and states;
- define clear Admin information architecture for jobs, units, attempts, outputs and review;
- show server-derived progress/status/errors;
- show provider/model/project observability without secrets؛
- actions pause/resume/cancel/retry only when server contract allows;
- output review/edit/reject/approve UX with visible source/page provenance;
- raw AI output must never look automatically published;
- loading/error/empty/action feedback + responsive/a11y;
- consume documented Backend contracts, not invented endpoints.

إذا Backend Board `#14` لم يثبت API بعد، نفّذ discovery/component/state architecture وfixtures التي تمثل contract موثقًا فقط، وسجّل dependency بدل ربط الواجهة بعقد وهمي.

### Stage13E Batch 1 — contract-safe frontend preparation

**Current stage/feature:** Stage13E — Admin AI Operations / Review, preparation batch while Backend API contract is pending.

**Branch:** `frontend/stage13e-ai-operations`.

**Base HEAD:** `dd8b801103b4ef3f16bd0539f08ab8fd6d51b67c`.

**Latest commits:**

- `aec435efb74395809f5265770480005795fa47b5` — `feat(admin): prepare Stage13E AI operations review workspace`;
- `1ad8921e5de76c291581c2d909d844a824aa23c3` — `ci(admin): verify Stage13E frontend preparation`;
- `d9d76097c62ce0ff769a796a8308b03071ff3f0c` — `docs(admin): record Stage13E frontend contract boundary`.

**What was inspected:**

- mandatory repository/product/workstream documentation in `DOCUMENTATION_INDEX.md` order;
- Frontend Board `#15`, Backend Board `#14`, Team Room `#13`;
- current Admin shell and Stage13C/D workspaces/API/test/CSS patterns;
- actual Stage11/12 code: generation contracts, validators, lifecycle, execution repository;
- AI migrations `0004_ai_and_sync.sql` and `0012_ai_execution.sql`;
- Stage11/12 specialized docs and Stage13C/D Admin docs;
- Backend workstream branch status and Board comments: no stabilized Stage13E frontend-facing API contract exists at this batch checkpoint.

**What was implemented:**

- `ai-operations-view-model.ts`: frontend-only adapter/view types mirroring verified Stage11/12 statuses, progress, modes, normalized outputs, attempts, validation and provenance;
- `AiOperationsWorkspace.tsx`: reusable Admin AI operations/review presentation covering jobs → units → attempts → outputs;
- `ai-operations.css`: RTL-safe responsive data-dense layout, long-ID wrapping, semantic status presentation and narrow-screen collapse;
- `ai-operations-view-model.test.ts`: regression tests proving browser does not recalculate progress or infer action availability;
- dedicated Stage13E Admin Web quality workflow for branch evidence;
- `docs/admin/STAGE13E_AI_OPERATIONS_FRONTEND_PREP.md` documenting the boundary between UI adapter types and the still-missing network/API contract.

**API contracts consumed:**

No new Admin HTTP endpoint was consumed or invented. The batch consumes only already-verified internal/domain facts from Stage11/12. `AiOperationsWorkspace` is not connected to production navigation or transport.

**Components/routes/states changed:**

- new reusable `AiOperationsWorkspace` component only;
- no `App.tsx` route/navigation activation;
- prepared loading/error/retry/empty/refresh/mutation-feedback/detail states;
- job action and review action availability are inputs to the view adapter and are never derived from lifecycle enums in the browser.

**UX/a11y/responsive behavior:**

- explicit server-authority notice;
- effective lifecycle status displayed separately from underlying execution status;
- disabled/not-allowed reasons visible as text, not color only;
- provider/model/project observability excludes credential aliases/secrets;
- raw AI output is behind diagnostic disclosure and explicitly labeled non-published;
- normalized summary/question/page-detection/comprehensive/multi-version review renderers;
- page/media/OCR/checksum provenance slots;
- semantic buttons/progressbar/status labels, focus inherited from Admin design system;
- layout collapses at 1180/820/520px with overflow-safe identifiers and stacked mobile actions.

**Tests and exact results:**

- GitHub Actions run `34183979785` was started for `lint + typecheck + unit + build`; its exact final result must be read from GitHub before claiming this batch green.
- Real Chromium Stage13E flow and 390px real-server verification are not run because the Stage13E Admin API does not exist yet; this is intentional rather than introducing a fake transport.

**Failures + root causes + fixes:**

No product-code failure has been established yet. The cross-team dependency is not treated as a UI workaround.

**Open issues/blockers:**

Team Room `#13` blocker comment `5578649045`: Backend has not published endpoint/request/response/error/authorization/action-availability/review-persistence contracts for Stage13E.

**Backend/cross-team dependencies:**

Backend Board `#14` must publish the stabilized read/control/review contract. Frontend will then inspect implementation + REPORT before transport wiring.

**NOT YET VERIFIED:**

- Stage13E Admin endpoint paths/methods and response envelope;
- pagination/filter/polling/stale semantics;
- auth/error/conflict mapping;
- authoritative pause/resume/cancel/retry exposure in HTTP contract;
- retry target semantics;
- edit/reject/approve persistence/concurrency semantics;
- App/Admin navigation integration;
- real API integration;
- real Chromium lifecycle/reload/error/permission flows;
- 390px browser overflow/accessibility against real Stage13E data;
- Stage13E integration / Stage PASS.

**Ready for integration:** NO — presentation preparation is meaningful and isolated, but production transport and end-to-end evidence are blocked on Backend contract.

**Exact next action:** re-read Backend Board `#14`; once a stabilized contract REPORT exists, inspect the changed Backend API files, implement a thin authenticated `ai-operations-api.ts` adapter, wire `AiOperationsWorkspace` into Admin shell without recomputing server state, then add real Chromium + 390px tests and report exact results.

### Stage13E Batch 1 — verification addendum

This addendum supersedes the provisional CI sentence above and records the final evidence after the batch documentation was written.

**Additional commits:**

- `957fa210bc257c30f02182953a1a8a4c9c8ea4aa` — `docs(frontend): record Stage13E preparation batch`;
- `a54625a6f533d32cd4448765573649fab3700f61` — `ci(admin): scope Stage13E preparation checks`.

**Final automated evidence:** GitHub Actions run `34184228250` on `a54625a6f533d32cd4448765573649fab3700f61` completed `success`.

- Admin lint: PASS (`eslint . --max-warnings 0`).
- Admin typecheck: PASS (`tsc --noEmit`).
- Admin unit tests: PASS — 4 test files / 19 tests; Stage13E view-model regression suite = 6/6 PASS.
- Admin production build: PASS (`tsc -b && vite build`; Vite transformed 37 modules).
- The workflow is now path-scoped to `apps/admin-web/**` and its own Stage13E workflow file, so docs-only handoff commits do not invalidate the latest product-code evidence.

**CI evidence churn root cause:**

- Symptom: earlier Stage13E preparation runs could be cancelled/replaced when documentation commits landed on the same branch.
- Root cause: the first workflow revision triggered on every branch push while `cancel-in-progress` used branch-level concurrency.
- Affected contract/flow: verification traceability only; no Admin runtime behavior or server authority was affected.
- Blast radius: Stage13E preparation workflow runs on this frontend branch.
- Correct fix location and why: `.github/workflows/stage13e-frontend-prep.yml` push `paths`, because the issue was CI trigger scope rather than product code.
- Regression test: run `34184228250` completed green after the scope fix.

**Still NOT YET VERIFIED:** real Stage13E API integration, review/control mutations, Chromium lifecycle/reload/error/permission flows, and 390px real-data browser verification remain blocked by the missing Backend Stage13E contract. Backend Board `#14` was rechecked after the final CI run and still had no implementation `REPORT`/frontend-facing contract.

**Ready for integration:** NO.

**Exact next action:** wait only on the repository dependency—not on chat memory. Re-read Backend Board `#14`; when its stabilized contract/report appears, inspect the actual Backend diff, implement the thin authenticated transport adapter, connect this workspace to the Admin shell, then run the real Chromium + 390px contract flows before requesting Integration review.
