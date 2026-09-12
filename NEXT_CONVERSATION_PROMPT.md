# NEXT CONVERSATION PROMPT

هذا Launcher فقط. Source of Truth الحقيقي هو GitHub/الكود/CI/Railway/Issue #16 والملفات المذكورة أدناه.

انسخ النص التالي إلى المحادثة الجديدة:

```text
اعمل كالمسؤول الهندسي والتصميمي الكامل عن مستودع:
7eaur/alwaslh

لا تعتمد على ذاكرة أي محادثة سابقة. المستودع والكود والمigrations وGitHub Actions وIssue #16 وحالة Railway الحالية هم Source of Truth. أي شيء لم تفحصه أو تنفذه = NOT YET VERIFIED.

نموذج العمل الحالي ليس Track A/Track B منفصلين. تم دمج Stage13G + آخر Student Product في main عبر PR #33 بعد 19/19 workflows SUCCESS، والمسؤولية الحالية هي إكمال كل ما تبقى بعد Stage13 من baseline موحد في live main. لا تبدأ من integration/stage13g-admin-product أو parallel/stage14-student-product؛ هما historical/reference بعد الدمج.

قبل أي تعديل اقرأ بالترتيب:
1. README.md
2. DOCUMENTATION_INDEX.md
3. PROJECT_HANDOFF.md
4. PROJECT_STATUS.md
5. PROJECT_RESUME_SNAPSHOT.md
6. PROJECT_ENGINEERING_LOG.md
7. PROJECT_INTEGRATION_CONTINUITY.md
8. PROJECT_EXECUTION_QUEUE.md
9. docs/product/CURRENT_PRODUCT_OVERRIDES.md
10. docs/workstreams/STAGE16_STUDENT_HANDOFF.md
11. docs/workstreams/STUDENT_PRODUCT_TRACK_STATUS.md
12. docs/operations/RAILWAY_LIVE_STATE.md
13. docs/content/LIVE_CONTENT_IMPORT_STATUS.md
14. MASTER_REBUILD_ROADMAP.md
15. docs/product/LEGACY_FEATURE_COVERAGE_GATE.md
16. PRODUCT_FEATURE_PARITY_MATRIX.md
17. latest Issue #16 body/comments
ثم افحص live main HEAD وGitHub Actions وRailway services الفعلية قبل إصدار أي حكم.

الحالة الأساسية الحالية:
- Stage1–10 + OCR VERIFIED.
- Stage11 VERIFIED.
- Stage12 backend/runtime VERIFIED؛ AI-012..AI-019 live provider readiness ما زالت NOT YET VERIFIED.
- Stage13A–G CLOSED / VERIFIED / integrated into main.
- Stage14 CLOSED / VERIFIED.
- Stage15 CLOSED / VERIFIED.
- Stage16 Offline/PWA ACTIVE / NOT CLOSED.
- Stage17+ لا تبدأ قبل Stage16 closure.

Integration checkpoint:
- PR #33 verification head dcdae7579a40878c71f64593280a0df2f8363ee2.
- 19/19 workflows SUCCESS.
- merge commit 5e22c3ff157b42b6da47febe205dd91fcb264eed.
- قبل آخر documentation sync كان main = 8006a7c4b2fa66bcac9cfb3addcd52fa831c42df؛ لا تعتمد عليه دون live-check لأن docs الجديدة قد تكون اندمجت بعده.

Stage16 المنفذ حاليًا:
- safe PWA shell؛ /v1 خارج Service Worker Cache.
- bounded server-issued offline lease مربوط بالprofile/device/session/entitlement/PostgreSQL time.
- IndexedDB account/device lifecycle + exact cleanup.
- explicit protected lesson manifest/assets.
- Published + entitled issuance only.
- exact byte size + SHA-256 verification.
- 64 MiB lesson / 256 MiB scope budgets.
- atomic storage/replacement/removal.
- server-signed P-256/ES256 authorization envelope في apps/api/src/offline/signing.ts.
- Student public-key/keyId/signature/canonical-manifest verification قبل storage في apps/student-web/src/offline-authorization.ts.
- Stage16 run 34560999667 على PR #33 head: app shell + API signing/PostgreSQL contracts + real Chromium lifecycle/materialization SUCCESS.

المهم: Stage16 ليست مغلقة رغم وجود التوقيع.
المتبقي بالترتيب:
1) durable non-secret active offline scope؛ الحالي في sessionStorage ولا يعيش بعد true browser restart.
2) عند offline use/render أعد التحقق من stored signed envelope: keyId + ES256 signature + canonical payload + stored-field equality.
3) أعد SHA-256 لكل stored blob وقت القراءة وقارنه بالsigned checksum/byte size، لا تعتمد فقط على download-time hash.
4) ابن true cold-start offline library/Reader: download online → close/restart browser → network unavailable → PWA shell → discover scope/package → verify authorization/blobs → render.
5) أضف real Chromium rejection: signature tamper، stored-field mismatch، blob tamper، expiry، backward clock، wrong account/device.
6) reconnect revalidation: session/device/entitlement/publication/content revision ثم purge/disable revoked/expired/unpublished/invalid packages.
7) بعدها فقط wire authoritative revision writers + tombstones + bounded server cursor/delta + client application.
8) outbox فقط إذا later product-authorized offline writes تحتاجه، مع stable IDs/idempotency/bounded retry/conflict rule.
9) أغلق Stage16 على exact HEAD مع lint/typecheck/unit/build/API/clean PostgreSQL/real Chromium/a11y/responsive/wider regression/docs/Issue #16.
10) بعدها Stage17 ثم 18... حتى Stage29 حسب PROJECT_EXECUTION_QUEUE.md وMASTER_REBUILD_ROADMAP.md.

Railway الحالي live inspection/dev stack:
- Student: https://alwaslh-dev-student-7eaur-production.up.railway.app
- Admin: https://alwaslh-dev-admin-7eaur-production.up.railway.app
- API: https://alwaslh-dev-api-7eaur-production.up.railway.app
- API/Admin/Student/PostgreSQL آخر حالة موثقة SUCCESS.
- API يستخدم repo-root apps/api/Dockerfile + pre-deploy migrations + /ready + persistent media volume.
- لا تعتبر environment name production دليل Stage28 cutover؛ هذه inspection/dev hosting حتى يمر Release Gate.
- اقرأ docs/operations/RAILWAY_LIVE_STATE.md قبل أي deploy config change.

المحتوى الحالي:
- canonical source = 7eaur/alwaslh-go@f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23.
- Stage9 inventory = 48 documents / 5,552 images.
- Grade 9 English proof materialized live: 75 images / 8,390,689 bytes / 75 ready media assets / 300 variants / 75 Draft lesson assets / 10 lessons.
- كل المحتوى Draft وغير ظاهر للطالب حتى Admin review/publish.
- bootstrap لم يولد/ينشر أسئلة تلقائيًا.
- Supabase القديمة خارج scope الحالي؛ لا تستورد منها بدون أمر Product Owner جديد.
- لا تعمل bulk 5,552 images قبل مراجعة sample + قياس media volume capacity + deterministic mapping.

يمكن تنفيذ content review كbatch منفصل:
- افتح Admin وراجع Grade9 English grouping/order/rendering.
- صحح mapping إن لزم.
- انشر فقط approved lessons/assets عبر normal Draft→Review→Published authority.
- اختبر Student Reader على Railway.
لكن لا تخلط full content load داخل Stage16 architecture batch.

قواعد ثابتة:
- لا duplicate Auth/Access/Curriculum/Question Bank/Assessment authority.
- لا browser-owned canonical state.
- لا raw storage keys.
- لا private signing key في Student أو docs.
- لا test weakening/auth bypass/fake API/random sleeps.
- media ready != published.
- AI output لا auto-publish؛ AI review → QB Draft → QB review/publish → immutable Quiz version.
- أصلح root cause في owning layer.

ابدأ العمل الفعلي هكذا:
A) live-check main/Issue #16/Actions/Railway.
B) أنشئ short-lived branch من main لStage16 completion.
C) افتح offline signing/session/content-store/App/E2E actual code.
D) نفذ STUDENT-016H من PROJECT_EXECUTION_QUEUE.md.
E) اختبر وحدث docs/Issue #16 بعد كل batch مهم.

لا تسأل عن معلومات موجودة في هذه الملفات؛ افحصها ونفذ مباشرة.
```

إذا تعارض هذا Launcher مع دليل live أحدث، اتبع الدليل الأحدث ثم حدّث هذا الملف.
