# CONTENT LANGUAGE RULES — الوسيلة الذكية

Date: **2026-09-12**  
Applies to: Student PWA + Super Admin production UI.

## 1. Core rule

**Every visible string and value must be presentation-ready product content.**

A field does not deserve screen space merely because the API returns it.

Visible information must help the user do at least one of:

- understand where they are;
- understand current state;
- decide what to do;
- perform the task;
- recover from a problem;
- trust a review/operation decision.

Otherwise it should be hidden, moved to advanced diagnostics, or removed.

---

# 2. Student language

Student copy is:

- natural Arabic;
- concise;
- clear;
- educational, not childish;
- action-oriented;
- non-technical;
- calm under failure.

Student copy should answer one of:

- أين أنا؟
- ماذا أتعلم الآن؟
- ما حالتي؟
- ماذا أفعل الآن؟
- ماذا أفعل إذا لم أستطع المتابعة؟

## 2.1 Forbidden Student implementation language

Do not expose by default:

- API route/path names;
- database/table/column names;
- raw enums;
- UUIDs/internal IDs;
- IndexedDB;
- localStorage/sessionStorage;
- Service Worker;
- Cache API;
- SHA-256;
- P-256 / ES256;
- private/public key mechanics;
- signatures/canonical manifest;
- content revision/revision internals;
- sync cursors/tombstones;
- raw network errors/status codes;
- stack traces;
- provider/model internals;
- “الخادم هو السلطة” explanations;
- developer roadmap notes;
- stage numbers;
- TODO/placeholder text.

Security remains enforced internally; hiding implementation detail does not weaken security.

## 2.2 Student status mappings

Preferred product meanings:

| Internal/technical meaning | Student presentation |
|---|---|
| valid offline package/signature/integrity | `متاح بدون إنترنت` |
| downloadable but not saved | `احفظه للتعلم بدون إنترنت` |
| newer valid content exists | `يوجد تحديث للدرس` |
| download failed | `تعذر حفظ الدرس. حاول مرة أخرى.` |
| offline and content not saved | `هذا الدرس غير محفوظ على الجهاز. اتصل بالإنترنت لفتحه.` |
| network request failed | `تعذر الاتصال. تحقق من الإنترنت وحاول مجددًا.` |
| access expired | `انتهت صلاحية الوصول. جدّد الوصول للمتابعة.` |
| not entitled | `هذا المحتوى غير متاح لحسابك.` |
| session expired | `انتهت جلسة الدخول. سجّل الدخول مرة أخرى.` |
| device proof unavailable/invalid | `تعذر التحقق من هذا الجهاز. سجّل الدخول مرة أخرى أو اطلب المساعدة.` |
| browser lacks required security support | `هذا المتصفح لا يدعم الحماية المطلوبة. حدّث المتصفح أو جرّب متصفحًا حديثًا.` |
| lesson not published/available | `هذا الدرس غير متاح حاليًا.` |
| assessment finalization | `تم إنهاء الاختبار.` followed by authoritative result if available |
| server busy/unknown | `تعذر إكمال العملية الآن. حاول مرة أخرى.` |

Do not promise a recovery action that the product does not actually support.

## 2.3 Student buttons

Prefer verb/action labels:

- `ابدأ التعلّم`
- `افتح الدرس`
- `أكمل الدرس`
- `ابدأ التدريب`
- `السؤال التالي`
- `إنهاء الاختبار`
- `حفظ بدون إنترنت`
- `تحديث الدرس`
- `إزالة من الجهاز`
- `إعادة المحاولة`
- `تسجيل الدخول`

Avoid vague labels when a precise action exists:

- `تنفيذ`
- `إرسال` when the actual action is `إنهاء الاختبار`;
- `موافق` for a meaningful destructive/commit action;
- engineering verbs such as `مزامنة الـrevision`.

## 2.4 Student helper text

Use helper text only when it prevents confusion.

Good:

- `استخدم الرمز الذي حصلت عليه من المدرسة.`
- `يمكنك فتح الدروس المحفوظة حتى عند انقطاع الإنترنت.`

Bad:

- explaining where keys are stored;
- explaining server/database authority;
- explaining publication pipelines;
- repeating the heading in longer words.

## 2.5 Student empty states

Structure:

`what is empty → what this means → next action if available`

Examples:

- `لا توجد دروس متاحة في هذه المادة حاليًا.`
- `لم تحفظ أي درس بعد. افتح درسًا واختر «حفظ بدون إنترنت».`
- `لا توجد اختبارات متاحة الآن.`

Do not mention drafts/review states to explain learner-facing emptiness.

## 2.6 Student errors

Structure:

`what happened → what to do next`

Examples:

- `تعذر تحميل الدرس. تحقق من الإنترنت وحاول مجددًا.`
- `انتهت جلسة الدخول. سجّل الدخول مرة أخرى.`
- `تعذر حفظ إجابتك. حاول مرة أخرى قبل المتابعة.`

Never display raw `Error.message` unless it has already been mapped to an approved product message.

---

# 3. Admin language

Admin copy can use real domain terminology because operators need it.

Approved product/domain concepts include:

- المناهج;
- الصفوف;
- المواد;
- الدروس;
- المحتوى;
- الرفع/الاستيراد;
- الوسائط;
- OCR;
- الذكاء الاصطناعي / AI;
- المراجعة البشرية;
- بنك الأسئلة;
- الاختبارات;
- النماذج/الإصدارات when the domain contract requires them;
- النشر;
- الطلاب;
- أكواد الوصول;
- العمليات;
- الإشعارات;
- سجل التدقيق.

## 3.1 Forbidden default Admin implementation language

Do not expose by default:

- `Stage 13G`, `Stage 13E`, roadmap numbers;
- backend route names;
- database/table/column names;
- cache/storage implementation;
- repository/branch/CI commentary;
- DB pool/SSL/cookie SameSite config dumps;
- raw enum/event keys;
- raw UUIDs as primary labels;
- prompt/internal provider keys unless needed for diagnosis;
- stack traces;
- raw provider response;
- internal error payloads;
- parity/closure terminology;
- `Content revision` as a primary product label;
- implementation statements such as “الخادم هو السلطة” in normal operator UI.

Technical evidence may exist under a clearly scoped **diagnostics/advanced details** area only when it supports a real operational decision.

## 3.2 Admin lifecycle labels

Use one consistent Arabic label per canonical domain state.

Exact maps must follow the actual backend enum; examples:

| Domain state | Preferred UI label |
|---|---|
| draft | `مسودة` |
| review/pending_review | `بانتظار المراجعة` |
| approved/ready where approval is not publication | `معتمد للمراجعة التالية` or context-specific approved label |
| published | `منشور` |
| rejected | `مرفوض` |
| archived | `مؤرشف` |
| active | `نشط` |
| inactive | `غير نشط` |
| running | `قيد التنفيذ` |
| paused | `متوقف مؤقتًا` |
| succeeded/completed | `مكتمل` |
| failed | `فشل` |
| revoked | `موقوف` |
| expired | `منتهي` |

Do not merge different business states into one friendly label if the distinction affects available actions.

## 3.3 AI language

AI is not publication authority.

Good language:

- `إنشاء مسودة بالذكاء الاصطناعي`
- `بانتظار المراجعة`
- `راجع الناتج قبل اعتماده`
- `اعتماد للمسودة`
- `رفض الناتج`

Avoid:

- `نُشر بالذكاء الاصطناعي`
- `اعتماد تلقائي`
- any wording implying AI output is automatically Student-visible.

If an operator needs provenance/model metadata for a decision, show the minimum useful value under secondary metadata/diagnostics.

## 3.4 OCR language

Prefer task meaning:

- `نص مستخرج`
- `يحتاج مراجعة`
- `اعتماد النص`
- `إعادة المعالجة` when contract exists

Technical confidence/engine details appear only if useful for the reviewer.

## 3.5 Admin errors

Structure:

`operation → human cause if known → recovery`

Examples:

- `تعذر نشر السؤال لأن حالته تغيّرت منذ فتح الصفحة. حدّث البيانات وراجع الحالة الحالية.`
- `تعذر رفع الملف. تحقق من نوع الملف وحجمه ثم حاول مجددًا.`
- `فشلت مهمة المعالجة. أعد المحاولة أو افتح التفاصيل للتشخيص.`

For conflicts, prefer specific stale/conflict guidance over generic “حدث خطأ”.

Raw diagnostics can be copied/opened from a technical details section where appropriate, not injected into the primary error paragraph.

## 3.6 Admin success feedback

Success feedback confirms what changed and, when useful, what happens next.

Good:

- `تم حفظ بيانات الدرس.`
- `تم إرسال السؤال للمراجعة.`
- `تم نشر السؤال.`
- `بدأت مهمة المعالجة.`

Avoid explaining revision increments, transaction internals or cache invalidation.

---

# 4. Naming consistency

## Student

Use consistently:

- `الرئيسية`
- `التعلّم`
- `المواد`
- `الدرس`
- `التدريب`
- `الاختبار`
- `بدون إنترنت`
- `الحساب`

Do not alternate randomly between “المقرر/المنهج/المادة” for the same Student-level concept. The curriculum hierarchy can be described in detail only where needed.

## Admin

Preferred global names:

- `نظرة عامة`
- `المناهج`
- `المحتوى`
- `الرفع والمعالجة`
- `مراجعة OCR`
- `عمليات AI`
- `مراجعة AI`
- `بنك الأسئلة`
- `الاختبارات`
- `الطلاب`
- `أكواد الوصول`
- `الإشعارات`
- `سجل التدقيق`
- `حالة النظام`

Do not use “الملفات والتقارير” for Access Code import/export/print.

---

# 5. Data-display rules

## IDs

- Hide internal IDs by default.
- Use human title/name/context as the primary identity.
- Technical ID may appear in Admin advanced details with a copy action when needed for support/diagnosis.

## Dates

- Show human localized dates/times appropriate to the task.
- Do not expose raw ISO strings.
- Relative time can supplement exact time but should not erase audit precision where exact timestamps matter.

## File information

- Show filename/type/size when the operator uses that information to select/validate content.
- Hide raw storage paths/keys from normal UI.

## Technical errors

- Map to domain meaning.
- Preserve raw error code only in diagnostic detail when needed.

## Counts and metrics

Display only when the count helps a decision.

Good:

- `12 عنصرًا بانتظار المراجعة`
- `3 مهام فشلت`

Avoid decorative totals with no action.

---

# 6. Destructive actions

Labels state the outcome:

- `إلغاء الوصول`
- `أرشفة السؤال`
- `حذف التنزيل`
- `إزالة ارتباط الجهاز`

Confirmation must explain irreversible or user-impacting consequences.

Do not use generic `تأكيد` as the destructive button when the real action name is known.

---

# 7. Translation / English terms

Arabic is primary.

Keep widely recognized domain abbreviations only when they improve operator recognition, e.g. `OCR` or `AI`, paired with Arabic context where useful.

Student copy should generally avoid English technical abbreviations.

Do not translate backend implementation vocabulary literally into Arabic and expose it as product terminology.

---

# 8. Copy review checklist

Before shipping a changed screen, verify every visible string/value:

1. Is this written for the actual user role?
2. Does it help orientation, learning, decision, action or recovery?
3. Is any implementation detail leaking?
4. Is a raw enum/ID/error being shown accidentally?
5. Is the action label specific?
6. Is status naming consistent with the rest of the product?
7. Does an error provide a real recovery path?
8. Does an empty state explain what happens next?
9. Does AI/review/publication wording preserve the real business lifecycle?
10. Would this text be acceptable in the launched product without a developer present to explain it?

If not, rewrite it before merge.