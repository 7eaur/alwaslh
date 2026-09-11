# CURRENT PRODUCT OVERRIDES — الوسيلة الذكية

> قرارات Product Owner الحالية تتقدم تشغيليًا على أي وثيقة أقدم متعارضة. الكود والمigrations والاختبارات التنفيذية تبقى Source of Truth للتنفيذ.

آخر تحديث: **2026-09-10**.

## PO-OVR-001 — Production deployment/cutover ليس عملًا حاليًا

- لا تجعل غياب hosted runtime blocker للتطوير أو Stage closure.
- repository/CI gates هي السلطة الحالية: lint/typecheck/unit/integration/clean PostgreSQL/build/browser/security/performance حسب المرحلة.
- لا Production cutover بدون أمر Product Owner صريح لاحق.
- أي preview/staging مؤقت يحتاج أمرًا صريحًا مستقلًا، ولا يستبدل CI ولا يبرر provider-specific rewrite.
- لا يوجد في Stage13G الحالية أمر نشر.

## PO-OVR-002 — قاعدة البيانات القديمة خارج النطاق الحالي

- لا تعتمد مرحلة حالية على legacy/Supabase database.
- `database/migrations/*` + current integration tests هي PostgreSQL authority.
- Stage9/current source inventory هو provenance authority المرجعي.
- legacy code/schema يبقى capability/failure evidence فقط.

## PO-OVR-003 — Repository Documentation هي ذاكرة المشروع الرسمية

ابدأ من:

`README.md → DOCUMENTATION_INDEX.md → PROJECT_HANDOFF.md → PROJECT_STATUS.md → PROJECT_RESUME_SNAPSHOT.md → PROJECT_ENGINEERING_LOG.md → PROJECT_INTEGRATION_CONTINUITY.md → PROJECT_EXECUTION_QUEUE.md → CURRENT_PRODUCT_OVERRIDES.md → PARALLEL_TWO_TRACK_OPERATING_MODEL.md → Issue #16 → current track code/tests`

## PO-OVR-004 — لا ترقيع أو تغطية للمشكلات

- لا تخفف test لإخفاء product defect.
- لا auth/validation bypass.
- لا duplicate durable authority.
- لا sleeps/timeouts عشوائية لإخفاء race.
- أصلح root cause في owning layer وأضف regression evidence.

## PO-OVR-005 — `main` هو Development Integration baseline

- `main` = آخر verified integration checkpoint مشترك.
- الفروع القصيرة للـisolated work.
- لا force-push/rewrite للتاريخ المشترك.
- Shared contracts تصل للمسار الآخر عبر verified `main`.
- Feature غير منفذة أو غير مختبرة = `NOT YET VERIFIED`.

Current `main` checkpoint بعد Stage13F:

`3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`

## PO-OVR-006 — المعمارية تبقى portable دون بناء Hosting الآن

- Fastify API منفصل عن durable workers.
- PostgreSQL عبر migrations/contracts واضحة.
- environment-driven configuration.
- frontend builds مستقلة عن backend authority.
- storage/provider abstractions فقط حيث توجد حاجة فعلية.

## PO-OVR-007 — Single Owner model — SUPERSEDED

قرار 2026-09-08 باعتماد محادثة هندسية واحدة أصبح **HISTORICAL / SUPERSEDED** في 2026-09-10.

`docs/workstreams/SINGLE_OWNER_OPERATING_MODEL.md` مرجع تاريخي فقط ولا يوزع عملًا جديدًا.

## PO-OVR-008 — Parallel Two-Track Execution هو النموذج الحالي

**Current Decision:** `PARALLEL TWO-TRACK EXECUTION`.

### Track A

- Backend / API / PostgreSQL / Admin Web / AI / generation / Question Bank / Quiz Builder / current Stage13G.
- Current branch: `integration/stage13g-admin-product`.
- Owns shared backend contracts and must promote verified integration points through `main`.

### Track B

- Student Web/PWA Stage14+.
- Branch: `parallel/stage14-student-product`.
- Must consume canonical backend contracts; no duplicate Auth/Access/Question Bank/content/AI/sync authority.

### Shared coordination

- Issue #16 is the sole cross-track execution ledger.
- Avoid overlapping edits by default: Track A owns `apps/api`, `apps/admin-web`, DB/shared Admin/AI contracts; Track B owns `apps/student-web`.
- Any shared contract change requires explicit coordination through repo docs/Issue #16.
- Stage15 Student assessment must integrate the verified Stage13F Question Bank/Quiz authority already promoted to `main`.
- No track may weaken another track’s verified contracts to make integration easier.

Current detailed model: `docs/workstreams/PARALLEL_TWO_TRACK_OPERATING_MODEL.md`.
