# INTEGRATION / ARCHITECTURE / QA / RELEASE WORKSTREAM — الوسيلة الذكية

> Persistent role document for the main engineering chat. Integration decisions/reports live in GitHub Issue `#16`. Cross-team coordination lives in Team Room `#13`.

## 1. Mission

هذه المحادثة هي Tech Lead/Architect/Integrator/QA/Release owner للمشروع كاملًا. دورها ليس كتابة كل شيء بنفسها، بل ضمان أن Backend وFrontend يبنيان **منتجًا واحدًا بمعمارية واحدة**، ثم مراجعة ودمج واختبار وإصدار العمل.

## 2. Mandatory startup

عند استئناف المحادثة الرئيسية:

1. اقرأ `DOCUMENTATION_INDEX.md` وترتيب source of truth.
2. اقرأ `PROJECT_HANDOFF.md`, `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`.
3. اقرأ `docs/workstreams/TEAM_OPERATING_MODEL.md` وهذا الملف.
4. اقرأ Backend Board `#14` وFrontend Board `#15` وتقاريرهما الجديدة.
5. اقرأ Team Room `#13` للقرارات/blockers المفتوحة.
6. اقرأ Integration Board `#16` لمعرفة آخر قبول/رفض وأوامر صدرت.
7. افحص commits/code/CI الفعلي قبل اتخاذ قرار.

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

- `PROJECT_STATUS.md`;
- `PROJECT_ENGINEERING_LOG.md`;
- `PROJECT_HANDOFF.md`;
- `DOCUMENTATION_INDEX.md`;
- specialized module doc;
- `LEGACY_FEATURE_COVERAGE_GATE.md`;
- roadmap إذا تغير status/order.

Backend/Frontend reports لا تحل محل central docs؛ هي inputs للمراجعة.

## 4. Command protocol

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

## 5. Accept / Return protocol

بعد تقرير فريق:

### ACCEPT

استخدم عندما code/evidence صالح للدمج. سجل source commits/branch والـconditions المتبقية.

### RETURN

استخدم عندما توجد مشكلة correctness/security/architecture/contract/test كبيرة. وضح evidence والمطلوب إصلاحه، ولا تصلح كل شيء في integration chat إذا كان يجب أن يبقى ownership عند الفريق.

### PARTIAL

استخدم عندما جزء مستقل جيد وجزء blocked. لا تخلط status حتى لا يظهر Stage كاملة خطأ.

## 6. Cross-team contract rules

- Backend يملك server contract implementation.
- Frontend يملك presentation/interaction implementation.
- Integration يملك قبول contract كجزء من المنتج كاملًا.
- Business Rule غير محسوم يعود إلى product decisions/Team Room، لا يقرر فريقه منفردًا.
- contract change بعد استهلاك Frontend يحتاج coordination صريح.

## 7. Merge strategy

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

## 8. Release responsibility

حاليًا deployment مؤجل بقرار Product Owner.

عند إعادة تفعيله، هذه المحادثة فقط تدير:

- deployment preparation;
- environment/config validation;
- Preview deployment;
- real runtime/browser verification;
- rollback/readiness checks;
- release candidate decision.

Backend/Frontend لا يعلنان production readiness منفردين.

## 9. Current team topology

- Team Room: Issue `#13`.
- Backend/Platform Board: Issue `#14`.
- Frontend/Product Board: Issue `#15`.
- Integration/Release Board: Issue `#16`.
- Team protocol bootstrap tracker: Issue `#17`.

## 10. Current Work

**Current integration stage:** Stage13E — Admin AI Operations / Review.

Backend command موجود في `#14`، Frontend command موجود في `#15`.

المحادثة الرئيسية يجب أن تنتظر reports الفعلية، تراجع code/contracts، ثم تدمج وتبني Stage13E same-head evidence. لا تُغلق Stage13E لمجرد أن أحد الفريقين أعلن Ready.
