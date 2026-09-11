# NEXT CONVERSATION PROMPT

هذا Launcher فقط. الحالة الفعلية في GitHub والمستودع، وأحدث نقطة استئناف تفصيلية هي `docs/workstreams/STAGE16_STUDENT_HANDOFF.md`.

```text
اعمل كالمسؤول الهندسي والتصميمي الكامل عن Student Product Track في مستودع:
7eaur/alwaslh

اعمل فقط على:
parallel/stage14-student-product

لا تعتمد على ذاكرة المحادثات. Source of Truth = repository + executable GitHub Actions + Issue #16 + docs. Code/migrations/executable evidence > prose. أي شيء غير مفحوص = NOT YET VERIFIED.

ابدأ بترتيب القراءة الإلزامي الموجود في docs/workstreams/STAGE16_STUDENT_HANDOFF.md، ثم افحص live Student HEAD وmain وIssue #16 وActions قبل أي تعديل.

نقطة runtime الموثقة الحالية:
53aeb972c4c891c3eecafdde0716b544751d2711

Stage14 وStage15 مغلقتان/موثقتان. Stage16 ما زالت ACTIVE.

الموثق على runtime 53aeb972...:
- Stage16 run 34551931757 — SUCCESS.
- PostgreSQL bounded offline lease PASS.
- Student strict build PASS.
- safe PWA real Chromium PASS.
- real Chromium IndexedDB lease lifecycle 3/3 PASS: persistence, account/device isolation, scoped logout/session-expiry/device-rebind cleanup, clock rollback rejection.
- Stage14 run 34551931610 attempt 2 — SUCCESS على نفس الرأس: lint + strict TS + Vitest 22/22 + production build + contracts + full Chromium.
- attempt 1 كان فيه Assessment assertion failure غير قابل لإعادة الإنتاج؛ rerun بدون أي تعديل نجح بالكامل، لذلك لا تغيّر Assessment ولا تضعف الاختبار إلا إذا ظهر دليل جديد قابل لإعادة الإنتاج.

حدود الأمان التي لا تتغير:
- لا cache لأي /v1 داخل Service Worker.
- protected Reader/API يبقى private,no-store.
- لا password/session cookie/token/device private key/raw storage key في Stage16 storage.
- offline lease server-issued ومقيدة profileId/deviceId/PostgreSQL time/session/entitlement، max 24h مع clipping.
- IndexedDB alwaslh-student-offline v1 يحتوي leases metadata فقط حتى الآن.
- sessionStorage يحتوي فقط non-secret active scope pointer {profileId,deviceId} لتأمين scoped cleanup عبر reload.
- لا auto skipWaiting ولا forced reload أثناء درس/اختبار.
- content_revisions/content_tombstones/sync_checkpoints ما زالت DORMANT / NOT YET WIRED.

الحالة الحالية للـfindings:
- STUDENT-016-LEASE-002 FIXED / VERIFIED FOR LEASE BOUNDARY.
- STUDENT-016-QA-004 FIXED / VERIFIED.
- STUDENT-016-CLIENT-005 FIXED / VERIFIED.
- STUDENT-016-CACHE-003 OPEN / NEXT DESIGN.
- STUDENT-016-DOWNLOAD-006 OPEN / NEXT.
- STUDENT-016-REVOCATION-007 OPEN.
- STUDENT-016-SYNC-001 OPEN / PROVEN.
- STUDENT-016-OUTBOX-008 OPEN.

Exact next batch = STUDENT-016D:
1) recheck live Student HEAD, main, Issue #16 and Track A shared changes.
2) افتح actual Reader/content/publication/media backend code + migrations + integration tests.
3) صمم explicit server-authorized protected lesson download manifest باستخدام canonical IDs/authority الحالية، لا authority جديدة في Student Web.
4) قبل أي blob عرّف stable lesson/asset IDs + revision/provenance + SHA-256/checksum + exact byte sizes + Published/entitled authorization.
5) عرّف account/device storage budget + exact byte accounting + failure rollback + deterministic eviction/removal.
6) لا تستخدم Reader /v1 الحالي كـCache API path ولا تعرض raw storage keys.
7) إذا احتاج Shared API جديدًا، نفّذ أصغر contract ضروري ومتوافق ووثقه في Issue #16.
8) بعد ثبات العقد فقط أضف protected materialization scoped للحساب/الجهاز + real Chromium.
9) ثم reconnect entitlement/publication/device revalidation + purge revoked/expired/unpublished.
10) بعد ذلك فقط revisions/tombstones/server cursor/delta/outbox.
11) لا تبدأ Stage17 أو deployment حتى Stage16 تغلق بنفس runtime HEAD وبأدلة حقيقية.

بعد كل batch مهم حدّث Student Track Status + Stage16 Handoff + PROJECT_STATUS + PROJECT_RESUME_SNAPSHOT + PROJECT_ENGINEERING_LOG + PROJECT_INTEGRATION_CONTINUITY + PROJECT_EXECUTION_QUEUE، وحدّث هذا Launcher إذا تغيرت نقطة الاستئناف، ثم انشر EXECUTION REPORT في Issue #16.
```

إذا تعارض هذا Launcher مع دليل أحدث، اتبع الدليل الأحدث ثم حدّث هذا الملف.
