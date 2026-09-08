# PROJECT STATUS — الوسيلة الذكية

> الحالة التنفيذية المختصرة. Repository code/migrations + GitHub Actions هي evidence الأعلى. اقرأ `PROJECT_HANDOFF.md` و`PROJECT_ENGINEERING_LOG.md` للتفاصيل.

آخر تحديث: 2026-09-08.

## Current Position

- Repository: `7eaur/alwaslh`
- Branch: `planning/product-evolution-review`
- Draft PR: #12, base `rebuild/media-pipeline`
- Latest fully verified **executable head**: `4eca7de8877ac9e2289b9c7990c912d33c256935`
- Current documentation closure: docs-only descendant of that executable head.
- Deployment: **`DEFERRED BY PRODUCT OWNER`**
- Old database migration/access: **OUT OF CURRENT SCOPE**
- Current Next Work: **Stage13E — Admin AI Operations / Review**

## Product in one paragraph

الوسيلة الذكية منصة تعليمية عربية بسطحين مستقلين: Student Web/PWA للطالب، وAdmin Web للـSuper Admin، مع Backend API خاص فوق PostgreSQL. الإدارة تبني وتراجع المنهج والمحتوى والوسائط وOCR/AI وبنك الأسئلة، والطالب يستهلك محتوى منشورًا ومصرحًا له به ويقرأ ويتدرب ويختبر ويحفظ ملاحظاته ويتابع تقدمه Offline/Online. الـrebuild يحافظ على كل نتيجة قديمة ذات قيمة لكنه يستبدل التنفيذ غير الآمن أو المعقد بمعمارية أبسط وأقوى.

## Permanent Team Operating Model

المشروع يعمل الآن بثلاثة workstreams دائمة تتشارك GitHub كذاكرة/قناة أوامر وتقارير، وليس chat memory:

- **Backend / Platform** — Command Board Issue `#14`; persistent guide `docs/workstreams/BACKEND_WORKSTREAM.md`.
- **Frontend / Product** — Command Board Issue `#15`; persistent guide `docs/workstreams/FRONTEND_WORKSTREAM.md`.
- **Integration / Architecture / QA / Release** — Board Issue `#16`; persistent guide `docs/workstreams/INTEGRATION_WORKSTREAM.md`.
- **Team Room** — Issue `#13` للعقود/blockers/القرارات المشتركة.
- Team-wide rules: `docs/workstreams/TEAM_OPERATING_MODEL.md`.

كل workstream يستخدم branch قصيرة من أحدث Integration-approved HEAD، يراجع نفسه، ثم يرفع `REPORT` في Board الخاصة به. Integration Lead وحده يقرر القبول/الدمج وStage PASS بعد same-head cross-boundary verification. Backend/Frontend لا يعلنان Stage VERIFIED منفردين.

**Continuity/quality gates إلزامية:** بعد كل batch/Stage يجب أن توجد commits + tests + workstream report + exact next action بحيث تستطيع محادثة جديدة الاستمرار من GitHub فقط. أي bug/failure مهم يحتاج Root Cause + blast radius + correct fix location + regression test؛ ممنوع test weakening/security bypass/hidden catch/duplicate authority/random timeout كحل نهائي. نهاية كل Stage تحتاج Closure Report ثم مزامنة central docs بعد قبول Integration.

## Fully Verified Same-Head Matrix

Exact executable head: `4eca7de8877ac9e2289b9c7990c912d33c256935`.

| Gate | Run | Result |
|---|---:|---|
| Stage13D Admin Upload UI | `34177369743` | SUCCESS — real mixed upload/publication Chromium + 390px |
| Stage13D Content Ingestion | `34177369784` | SUCCESS — PostgreSQL + mixed ingestion/link/publication/archive |
| Stage13 Admin Product | `34177369748` | SUCCESS — backend + existing Admin Chromium |
| Stage12 AI Execution | `34177369812` | SUCCESS |
| Stage11 AI Contracts | `34177369753` | SUCCESS |
| OCR Foundation | `34177369750` | SUCCESS |
| Stage10 Media Pipeline | `34177369777` | SUCCESS |
| Stage9 Content Import | `34177369756` | SUCCESS |
| Full Rebuild | `34177369768` | SUCCESS — includes Student Chromium |

Do not replace this evidence with a newer commit unless the required gates for that commit actually pass.

## Stage Ledger

| Stage / Area | State |
|---|---|
| Stage1 Product Inventory/Contract | VERIFIED |
| Stage2 Brand | VERIFIED |
| Stage3 UX Architecture baseline | VERIFIED |
| Stage4 PostgreSQL Platform | VERIFIED |
| Stage5 Engineering Foundation | VERIFIED |
| Stage6 Auth & Authorization | VERIFIED |
| Stage7 Access Codes & Entitlements | VERIFIED |
| Stage8 Student Activation / Returning Login / Recovery / Device | VERIFIED incl. Chromium |
| Stage9 Canonical Source Import | VERIFIED |
| Stage10 Media Pipeline | VERIFIED |
| OCR Foundation | VERIFIED |
| Stage11 Provider-neutral AI Contracts | VERIFIED |
| Stage12 Durable AI Execution / Capacity / Controls / Pause / Worker Runtime | VERIFIED backend/runtime |
| Stage13A Curriculum Structure backend | VERIFIED |
| Stage13B Admin Curriculum Web | VERIFIED incl. Chromium |
| Stage13C Admin Content / Media / OCR Operations | VERIFIED incl. Chromium |
| Stage13D Upload / Processing History / Publication Linking | **VERIFIED incl. Chromium** |
| Stage13E Admin AI Operations / Review | **NEXT / NOT YET VERIFIED** |
| Stage13F Question Bank / Review / Publish | REQUIRED / NOT YET VERIFIED |
| Stage13G Remaining Admin modules | REQUIRED / NOT YET VERIFIED |
| Stage14+ Student and later product stages | REQUIRED / NOT YET VERIFIED according to Roadmap |
| Hosted deployment | DEFERRED / NOT YET VERIFIED |

## What Stage13D now provides

One authority chain is now verified:

```text
Admin selected image/PDF/mixed inputs
→ durable content_ingestion_tasks/items
→ Stage10 MediaPipelineService
→ ready canonical media_assets/media_variants
→ explicit link to Lesson as Draft lesson_assets
→ explicit Review
→ explicit Published
```

Verified behavior:

- JPG/PNG/WebP/PDF upload contract;
- mixed image/PDF ordering preserved, including PDF page expansion;
- durable server-owned task progress, errors, retry and history;
- source checksum/size validation;
- processing lease/token stale-worker protection;
- no second media pipeline;
- ready media remains unpublished until explicit link;
- Lesson link creates Draft assets with media/task/item provenance;
- Draft → Review → Published transitions are explicit and audited;
- published transition updates Lesson content revision/timestamp;
- task archive preserves history and linked dependencies;
- Admin UI supports selection/order/progress/history/retry/link/review/publish/archive;
- Chromium proves the full mixed flow and narrow responsive UX.

Specialized evidence: `docs/admin/STAGE13_CONTENT_INGESTION_PUBLICATION.md`.

Legacy coverage `LES-A-010..015` is now VERIFIED. `LES-A-016+` remains NOT YET VERIFIED.

## Current Next Work — Stage13E

Backend command is tracked in Issue `#14`; Frontend command is tracked in Issue `#15`. Integration/acceptance is tracked in Issue `#16`.

Implement only after discovery of the actual Stage12 callers/contracts:

1. Reuse `ai_jobs / ai_job_units / attempts / outputs`; do not create a second queue.
2. Admin-observable queued/running/retrying/paused/failed/completed states and server-derived progress.
3. Retry/cancel/pause/resume using verified Stage12 authority.
4. Provider/model/project observability without exposing credentials or secrets.
5. Review generated summary/question/page-detection outputs with source/page provenance visible.
6. Edit/reject/approve review outcomes; raw provider output is never auto-published.
7. Do not enable live provider routing until benchmark authorization exists.
8. Add PostgreSQL/API/unit/integration/Chromium evidence before marking any Stage13E legacy rows VERIFIED.

## High-Priority Open Boundaries

- `AI-011-005` P2 — AI `direct` question output exists but current Question Bank DB does not safely persist that type.
- `AI-012-019` P2 — live provider/model benchmark, credentials, production routes/bootstrap remain NOT YET VERIFIED.
- Admin AI Operations/Review UI is current next work and NOT YET VERIFIED.
- `LES-A-016..019` page-detection/review/batch-save flow is NOT YET VERIFIED.
- `LES-A-020..037` Admin AI generation/review operations are NOT YET VERIFIED as user flows even where Stage11/12 backend foundations exist.
- Student entitlement-filtered curriculum/read APIs and full Student product remain later work.
- TTS production implementation/quality/runtime is not verified.
- Offline/PWA final product stages remain later work.
- `tmp-unused-do-not-use` branch is P3 repository housekeeping only.

`CONTENT-013-002` is CLOSED by Stage13D executable evidence.

## Stable Non-Negotiable Boundaries

- Browser does not directly own PostgreSQL/auth/publish/job state.
- Full Code = 6 digits; Class Code = 7 digits.
- Student login requires password + registered P-256 device challenge; Admin recovery/rebind rules remain intact.
- Curriculum = Class → Subject Offering → optional Section → Lesson.
- Stage9 source inventory is provenance evidence, not curriculum authority.
- Upload/media success is independent from OCR/AI/TTS.
- `media ready != published`.
- Reviewed source/page/checksum provenance is required for source-sensitive AI.
- Exact AI modes never invent unknown answers.
- Durable AI worker/runtime remains separate from Fastify HTTP.
- No test weakening, authorization bypass, hidden catch, duplicate lifecycle or production hard-code as a “fix”.

## Deployment / Runtime

Current Product Owner decision overrides the older preview cadence:

`DEFERRED BY PRODUCT OWNER`

Do not sync/deploy to Vercel/Supabase or re-enable auto-deployment until a new explicit instruction. Hosted Student/Admin/API/media/OCR/AI behavior remains `NOT YET VERIFIED`.

## Documentation Health

Canonical startup path:

`README.md → DOCUMENTATION_INDEX.md → PROJECT_HANDOFF.md → PROJECT_STATUS.md → PROJECT_ENGINEERING_LOG.md → TEAM_OPERATING_MODEL/workstream board → CURRENT_PRODUCT_OVERRIDES → Product Decisions → Parity/Coverage → Roadmap → specialized docs`.

`TODO.md`, root legacy code, legacy PRD/audits are historical references and must not override current executable evidence.
