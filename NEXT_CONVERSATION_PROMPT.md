# NEXT CONVERSATION PROMPT

هذا Launcher فقط. الحالة الفعلية في GitHub والمستودع، وأحدث نقطة استئناف تفصيلية هي `docs/workstreams/STAGE16_STUDENT_HANDOFF.md`.

```text
اعمل كالمسؤول الهندسي والتصميمي الكامل عن Student Product Track في مستودع:

7eaur/alwaslh

لا تعتمد على ذاكرة أي محادثة سابقة. المستودع، GitHub Actions، Issue #16 والتوثيق داخله هم Source of Truth.

اعمل فقط على الفرع:
parallel/stage14-student-product

لا تنقل العمل إلى main ولا إلى فرع Track A من نفسك.

قبل أي تعديل اقرأ بالترتيب:
1) README.md
2) DOCUMENTATION_INDEX.md
3) docs/workstreams/STAGE14_PLUS_STUDENT_TRACK.md
4) docs/workstreams/STUDENT_PRODUCT_TRACK_STATUS.md
5) docs/workstreams/STAGE16_STUDENT_HANDOFF.md
6) PROJECT_HANDOFF.md
7) PROJECT_STATUS.md
8) PROJECT_RESUME_SNAPSHOT.md
9) PROJECT_ENGINEERING_LOG.md
10) PROJECT_INTEGRATION_CONTINUITY.md
11) PROJECT_EXECUTION_QUEUE.md
12) docs/product/CURRENT_PRODUCT_OVERRIDES.md
13) MASTER_REBUILD_ROADMAP.md — Stage16
14) آخر body/comments في GitHub Issue #16
15) live branch HEAD + main + GitHub Actions
16) actual Stage16 code/tests/workflows before editing

قاعدة الحقيقة:
Code + migrations + executable CI evidence > prose.
أي شيء لم تفحصه أو تختبره = NOT YET VERIFIED.

الوضع الموثق عند handoff:
- Stage14 Student: CLOSED / VERIFIED @ ac55f1435d232cadff334816407f1182125dda90
- Stage13F canonical main: 3aeca598759e31b4eddc5cb3535e00c11fc0f7d2
- Stage13F→Student integration: 4a476e1f29cb605fce294d7c34fd68e8218a32e8
- Stage15 Student: CLOSED / VERIFIED @ 9a787b7c0f6bd3ed12f24de92546c33fcc21e26d
- Stage16 Batch 1 safe PWA shell: VERIFIED @ c1ae86036d4d302b8ca8c411227f41c37b4063ef, run 34430284173 SUCCESS
- Stage16 server-issued bounded lease + PWA boundary: VERIFIED @ 5b71aa2a3bfbf2a9b7d1c6ec7a3762033ac9cacd
  - Stage16 run 34430915847 SUCCESS
  - API Regression 34430915786 SUCCESS

آخر code checkpoint قبل توثيق handoff:
2c44a363638221ee2985ecb6b8fb71c3e757a333

هذا الرأس NOT VERIFIED بسبب فشل واحد محدد:
src/offline-store.ts(85,38): TS18047 — evaluation.estimatedServerTimeMs is possibly null.

أدلة مهمة على نفس الرأس:
- ESLint PASS
- Vitest 22/22 PASS
- PostgreSQL bounded lease contract PASS
- Stage14 Student Product run 34431220808 فشل عند strict typecheck، ثم Chromium skipped
- Stage16 run 34431220827 فشل لأن Student build اصطدم بنفس TS18047؛ PostgreSQL lease job داخله SUCCESS، Chromium لم يبدأ

أول مهمة لك ليست إعادة تصميم Stage16.
أصلح فقط narrowing/nullability في apps/student-web/src/offline-store.ts حول السطر 85 بدون إضعاف strictness أو تغيير السلوك، ثم شغّل exact-head Student Product + Stage16 PWA وتحقق من كل jobs/logs.

بعد نجاح exact-head:
1) اربط getStudentOfflineLease() + saveOfflineLease() بدورة الجلسة authenticated online بعد restore/login/activation.
2) عرّف cleanup دقيق عند logout/session expiry/device rebind بحيث لا تحذف scope لحساب/جهاز آخر.
3) أضف real Chromium IndexedDB acceptance للحساب/الجهاز/lease/clock rollback/cleanup.
4) بعدها فقط صمم explicit lesson offline download contract. ممنوع caching للـReader /v1 endpoint الحالي.
5) قبل blobs عرّف storage budgets + byte accounting + checksum + rollback + eviction/removal.
6) نفّذ reconnect revalidation/revocation purge.
7) بعد ذلك فقط فعّل revisions/tombstones/delta sync/outbox؛ الجداول الحالية content_revisions/content_tombstones/sync_checkpoints تعتبر dormant وليست authority جاهزة.

حدود الأمان الحالية:
- لا cache لأي /v1 في Service Worker.
- لا auth token/password/session cookie/device private key في offline DB.
- Reader protected content يبقى private,no-store حتى explicit authorized materialization.
- offline lease server-issued ومقيدة profileId/deviceId/server time/session/entitlement.
- max lease الحالي 24h ومقصوص بانتهاء session/entitlement.
- IndexedDB الجديد alwaslh-student-offline يحتوي leases metadata فقط حتى الآن، scoped بـ profileId:deviceId.
- لا auto skipWaiting ولا forced reload أثناء الدروس/الاختبارات.

Track A يملك Backend/Admin/AI/Question Bank/Quiz Builder/Stage13G. لا تنشئ authority مكررة. shared API change يجب أن يكون أصغر عقد ضروري، موثقًا في Issue #16، وغير متعارض.

لا تبدأ Stage17 قبل إغلاق Stage16 بنفس الرأس مع SW/IndexedDB/offline evidence. لا تبدأ deployment/hosting.

بعد كل batch مهم:
- حدّث docs/workstreams/STUDENT_PRODUCT_TRACK_STATUS.md
- حدّث docs/workstreams/STAGE16_STUDENT_HANDOFF.md
- حدّث PROJECT_STATUS.md / PROJECT_RESUME_SNAPSHOT.md / PROJECT_ENGINEERING_LOG.md / PROJECT_INTEGRATION_CONTINUITY.md / PROJECT_EXECUTION_QUEUE.md عند تغير الحقيقة
- انشر EXECUTION REPORT في Issue #16
- سجّل exact HEAD + run IDs + failures/root cause/fix + NOT YET VERIFIED + exact next action

ابدأ الآن من live GitHub، لا من هذا النص وحده.
```

إذا تعارض هذا Launcher مع دليل أحدث، اتبع الدليل الأحدث ثم حدّث هذا الملف.
