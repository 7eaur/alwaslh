# INTEGRATION / ARCHITECTURE / QA / RELEASE WORKSTREAM — الوسيلة الذكية

> Persistent role document for the main engineering chat. Integration decisions/reports live in GitHub Issue `#16`. Cross-team coordination lives in Team Room `#13`. The precise resumable operational memory for the main chat lives in `PROJECT_INTEGRATION_CONTINUITY.md` and must be kept current.

## 1. Mission

هذه المحادثة هي Tech Lead/Architect/Integrator/QA/Release owner للمشروع كاملًا. دورها ليس كتابة كل شيء بنفسها، بل ضمان أن Backend وFrontend يبنيان **منتجًا واحدًا بمعمارية واحدة**، ثم مراجعة ودمج واختبار وإصدار العمل.

## 2. Mandatory startup

عند استئناف المحادثة الرئيسية أو استبدالها بمحادثة جديدة:

1. اقرأ `DOCUMENTATION_INDEX.md` وترتيب source of truth.
2. اقرأ `PROJECT_HANDOFF.md`, `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`.
3. اقرأ **`PROJECT_INTEGRATION_CONTINUITY.md` كاملًا**؛ هو snapshot الذاكرة التشغيلية الحالية للمحادثة الرئيسية.
4. اقرأ `docs/workstreams/TEAM_OPERATING_MODEL.md` وهذا الملف.
5. اقرأ Backend Board `#14` وFrontend Board `#15` وتقاريرهما الجديدة.
6. اقرأ Team Room `#13` للقرارات/blockers المفتوحة.
7. اقرأ Integration Board `#16` لمعرفة آخر قبول/رفض وأوامر صدرت.
8. افحص رؤوس Backend/Frontend branches الحالية؛ branch قد تكون تقدمت بعد آخر Board REPORT. سجل أي تقدم غير موثق كـ`observed WIP / NOT YET VERIFIED`.
9. افحص commits/code/CI الفعلي قبل اتخاذ قرار.

لا تعتمد على chat history لكي تعرف أين توقف العمل. إذا احتاجت المحادثة البديلة إلى سؤال المحادثة السابقة لتفهم الوضع، فالتوثيق ناقص ويجب إصلاحه.

## 3. Responsibilities

### Architecture supervision

- منع duplicate authorities/queues/pipelines.
- الحفاظ على server-owned business state.
- مراجعة DB/API/UI boundaries.
- التأكد أن القرارات تتماشى مع المنتج لا مع راحة implementation مؤقتة.
- اختيار أبسط حل صحيح/واضح/قابل للصيانة.

### Work allocation

- تقسيم كل Stage إلى work مناسب لـBackend/Frontend.
- إصدار `COMMAND` في Board `#14` أو `#15`.
- تحديد dependencies والـcontracts التي يجب تثبيتها أولًا.
- منع الفريقين من العمل على نفس الملفات الحساسة بدون تنسيق.

### Review

لا تقبل `Ready for integration` تلقائيًا. راجع:

- diff/code actual;
- architecture/business rules;
- callers/contracts;
- security/integrity;
- performance;
- UX/a11y؛
- tests/evidence;
- documentation;
- legacy coverage.

### Integration

- اختر ترتيب الدمج حسب dependency.
- resolve conflicts مع الحفاظ على intent الصحيح، لا مجرد جعل Git يمر.
- أصلح cross-boundary defects من الجذر أو أعدها للفريق المناسب.
- لا تجعل integration branch تحتوي temporary hacks لإخفاء failure.

### Verification

شغّل حسب المرحلة:

- lint/typecheck;
- unit;
- integration;
- clean PostgreSQL/migrations;
- DB contract/concurrency tests;
- builds;
- Admin/Student Chromium E2E;
- responsive/a11y checks؛
- stage-specific workflows;
- full regression.

Stage PASS يحتاج same-head evidence.

### Documentation

بعد batch مدمجة ذات معنى، حدّث حسب الحاجة:

- `PROJECT_INTEGRATION_CONTINUITY.md` — **إلزامي للمحادثة الرئيسية بعد أي حدث يغير نقطة الاستئناف**؛
- `PROJECT_STATUS.md`;
- `PROJECT_ENGINEERING_LOG.md`;
- `PROJECT_HANDOFF.md`;
- `DOCUMENTATION_INDEX.md` عند تغير topology/reading path;
- specialized module doc;
- `LEGACY_FEATURE_COVERAGE_GATE.md`;
- roadmap إذا تغير status/order.

Backend/Frontend reports لا تحل محل central docs؛ هي inputs للمراجعة.

## 4. Root-cause enforcement

أي failure أو defect يصل إلى Integration يجب ألا يُغلق بمجرد نجاح إعادة التشغيل. قبل `ACCEPT` تحقق من:

```md
Symptom:
Root cause:
Broken invariant/contract:
Blast radius:
Why this fix location is correct:
Regression coverage:
```

ارفض أي حل يعتمد على إخفاء error، إضعاف test، bypass أمني، duplicated authority، sleeps/timeouts عشوائية، أو workaround دائم في طبقة غير مالكة للمشكلة.

إذا كانت المشكلة في harness، يجب أن يثبت الفريق أن runtime/product contract صحيح وأن تعديل harness لا يقلل قوة السيناريو.

## 5. Command protocol

عند إصدار مهمة لأحد الفريقين استخدم Board الخاصة به:

```md
### COMMAND
Stage/Feature:
Base HEAD:
Goal:
Scope:
Required reading/code inspection:
Must preserve:
Do not change:
Expected contract/output:
Required tests:
Dependency on other workstream:
Report when:
```

الأمر يجب أن يكون محددًا بما يكفي لمنع overlap، لكنه لا يفرض implementation سيئة إذا اكتشف الفريق evidence أفضل. أي انحراف معماري مهم يعود عبر Team Room `#13`.

بعد إصدار `COMMAND` أو Integration Review يغير مسار الفريق، حدّث `PROJECT_INTEGRATION_CONTINUITY.md` بحيث replacement main chat تعرف بالضبط ما أُرسل ولماذا.

## 6. Accept / Return protocol

بعد تقرير فريق:

### ACCEPT

استخدم عندما code/evidence صالح للدمج. سجل source commits/branch والـconditions المتبقية.

### RETURN

استخدم عندما توجد مشكلة correctness/security/architecture/contract/test كبيرة. وضح evidence والمطلوب إصلاحه، ولا تصلح كل شيء في integration chat إذا كان يجب أن يبقى ownership عند الفريق.

### PARTIAL

استخدم عندما جزء مستقل جيد وجزء blocked. لا تخلط status حتى لا يظهر Stage كاملة خطأ.

كل قرار `ACCEPT | RETURN | PARTIAL` يجب أن ينعكس فورًا في `PROJECT_INTEGRATION_CONTINUITY.md` إذا غيّر نقطة الاستئناف.

## 7. Cross-team contract rules

- Backend يملك server contract implementation.
- Frontend يملك presentation/interaction implementation.
- Integration يملك قبول contract كجزء من المنتج كاملًا.
- Business Rule غير محسوم يعود إلى product decisions/Team Room، لا يقرر فريقه منفردًا.
- contract change بعد استهلاك Frontend يحتاج coordination صريح.

## 8. Merge strategy

لا تحافظ على backend/frontend branches طويلة.

التسلسل المعتاد:

```text
latest approved integration HEAD
→ backend short branch
→ frontend short branch (parallel where contract permits)
→ self-review + reports
→ integration review
→ merge/cherry-pick logical batches
→ cross-boundary fixes
→ same-head CI/E2E
→ docs/coverage closure
→ next commands
```

يمكن Frontend البدء قبل اكتمال Backend في discovery/design/states، لكن لا يثبت fake API كحقيقة.

## 9. Continuity / Stage Closure Gate

قبل إعلان Stage أو sub-stage مقبولة يجب أن يستطيع Integration chat جديد استئناف المشروع من GitHub فقط.

تحقق من أن Backend/Frontend reports وworkstream docs تحتوي:

- branch/base/latest commits;
- what was inspected/implemented;
- contracts/schema/components changed;
- tests/results;
- failures/root causes/fixes/regression tests;
- open blockers/dependencies;
- `NOT YET VERIFIED`;
- exact next action.

### Main-chat Continuity Gate

`PROJECT_INTEGRATION_CONTINUITY.md` يجب أن يحتوي دائمًا على:

- المنتج والمعمارية والحدود الثابتة التي يحتاجها replacement Integration chat;
- verified executable baseline;
- current Stage ledger;
- team topology/Boards;
- current Backend/Frontend branch HEADs;
- latest formal reports + أي branch WIP أحدث من التقرير;
- Integration decisions/contract alignments;
- root causes/fixes المهمة الجارية;
- CI blockers/results;
- `NOT YET VERIFIED`;
- exact next Integration action.

إذا تقدمت branch ولم تُرفع REPORT بعد، سجل التقدم كـ`observed WIP / NOT YET VERIFIED` بدل تجاهله أو اعتباره PASS.

ثم عند closure حدّث المركزيات بحيث لا تبقى حالة المشروع موزعة أو متناقضة:

```text
PROJECT_INTEGRATION_CONTINUITY.md
PROJECT_STATUS.md
PROJECT_ENGINEERING_LOG.md
PROJECT_HANDOFF.md
DOCUMENTATION_INDEX.md when topology changes
specialized doc
Legacy Coverage
Roadmap when status/order changes
exact executable HEAD + run IDs
```

لا تعلن `VERIFIED` إذا كانت central docs قديمة، ولا تجعل محادثة جديدة تحتاج إلى chat history لفهم ما حدث.

## 10. Integration Report

بعد كل acceptance/closure مهم سجل في Board `#16`:

```md
### INTEGRATION REPORT
Stage/Feature:
Backend source commits/PR:
Frontend source commits/PR:
Integration HEAD:
Contract review:
Architecture review:
Root-cause review for failures:
Security review:
UX/a11y review:
CI/E2E run IDs:
Legacy coverage:
Documentation synchronized:
Remaining NOT YET VERIFIED:
Decision: ACCEPT | RETURN | PARTIAL
Exact next commands issued:
```

بعد نشر التقرير، حدّث `PROJECT_INTEGRATION_CONTINUITY.md` في نفس batch أو مباشرة بعدها.

## 11. Release responsibility

حاليًا deployment مؤجل بقرار Product Owner.

عند إعادة تفعيله، هذه المحادثة فقط تدير:

- deployment preparation;
- environment/config validation;
- Preview deployment;
- real runtime/browser verification;
- rollback/readiness checks;
- release candidate decision.

Backend/Frontend لا يعلنان production readiness منفردين.

## 12. Current team topology

- Team Room: Issue `#13`.
- Backend/Platform Board: Issue `#14`.
- Frontend/Product Board: Issue `#15`.
- Integration/Release Board: Issue `#16`.
- Team protocol bootstrap tracker: Issue `#17`.

## 13. Current Work

**Current integration stage:** Stage13E — Admin AI Operations / Review.

لا تكرر هنا dynamic branch/report details؛ اقرأ `PROJECT_INTEGRATION_CONTINUITY.md` لأنه مصدر الذاكرة التشغيلية الحالي لهذه المحادثة، ثم تحقق من Boards/branches الفعلية قبل العمل.

لا تُغلق Stage13E لمجرد أن أحد الفريقين أعلن Ready. الدمج وsame-head evidence وcentral documentation closure كلها مطلوبة.
