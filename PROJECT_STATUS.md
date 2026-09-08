# PROJECT STATUS — الوسيلة الذكية

> الحالة التنفيذية المختصرة. Repository code/migrations + GitHub Actions هي evidence الأعلى. اقرأ `PROJECT_HANDOFF.md` و`PROJECT_ENGINEERING_LOG.md` للتفاصيل.

آخر تحديث: 2026-09-08.

## Current Position

- Repository: `7eaur/alwaslh`
- Branch: `planning/product-evolution-review`
- Draft PR: #12, base `rebuild/media-pipeline`
- Latest fully verified **executable head**: `260cfef1c48d1290611103f8443d222f8cd041b6`
- Current documentation closure: docs-only descendant of that executable head.
- Deployment: **`DEFERRED BY PRODUCT OWNER`**
- Old database migration/access: **OUT OF CURRENT SCOPE**

## Product in one paragraph

الوسيلة الذكية منصة تعليمية عربية بسطحين مستقلين: Student Web/PWA للطالب، وAdmin Web للـSuper Admin، مع Backend API خاص فوق PostgreSQL. الإدارة تبني وتراجع المنهج والمحتوى والوسائط وOCR/AI وبنك الأسئلة، والطالب يستهلك محتوى منشورًا ومصرحًا له به ويقرأ ويتدرب ويختبر ويحفظ ملاحظاته ويتابع تقدمه Offline/Online. الـrebuild يحافظ على كل نتيجة قديمة ذات قيمة لكنه يستبدل التنفيذ غير الآمن أو المعقد بمعمارية أبسط وأقوى.

## Fully Verified Same-Head Matrix

Exact executable head: `260cfef1c48d1290611103f8443d222f8cd041b6`.

| Gate | Run | Result |
|---|---:|---|
| Stage13 Admin Product | `34173006035` | SUCCESS — backend + Admin Chromium |
| Stage12 AI Execution | `34173006025` | SUCCESS |
| Stage11 AI Contracts | `34173006065` | SUCCESS |
| OCR Foundation | `34173006050` | SUCCESS |
| Stage10 Media Pipeline | `34173006043` | SUCCESS |
| Stage9 Content Import | `34173006055` | SUCCESS |
| Full Rebuild | `34173006036` | SUCCESS — includes Student Chromium |

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
| Stage13C Admin Content / Media / OCR Operations | **VERIFIED incl. Chromium** |
| Stage13D Upload / Processing History / Publication Linking | **NEXT / NOT YET VERIFIED** |
| Stage13E Admin AI Operations / Review | REQUIRED / NOT YET VERIFIED |
| Stage13F Question Bank / Review / Publish | REQUIRED / NOT YET VERIFIED |
| Stage13G Remaining Admin modules | REQUIRED / NOT YET VERIFIED |
| Stage14+ Student and later product stages | REQUIRED / NOT YET VERIFIED according to Roadmap |
| Hosted deployment | DEFERRED / NOT YET VERIFIED |

## What Stage13C now provides

Backend/Admin UI now uses one authority chain:

```text
Stage9 content_source_documents/assets
→ Stage10 media_assets/media_variants
→ OCR extraction/review
→ Admin operations read/review workspace
```

Verified behavior:

- Admin-only source document list/search/filter/pagination;
- real processing summary counts;
- ordered source assets;
- media status, errors and deterministic variants;
- OCR metadata separated from raw-detail payload;
- OCR detail with source provenance;
- approve/reject/correct pending OCR;
- empty OCR cannot be approved until corrected;
- repeated/conflicting review rejected;
- Admin workspace has loading/error/empty/status/detail/review UX;
- browser test proves opening source media and approving corrected OCR;
- pending-review metric refreshes to zero after approval.

This **does not** mean media has been published into a Lesson. `lesson_assets` publication/linking is an explicit next contract.

## Current Next Work — Stage13D

Implement in this order, after repository discovery of actual callers/contracts:

1. Define Admin upload ingestion contract for image/PDF/mixed input without bypassing Stage10.
2. Preserve user-chosen order across mixed PDF/image sources.
3. Define durable upload/processing task progress/history rather than browser-owned progress.
4. Define source/media → curriculum Lesson linking/publication contract explicitly.
5. Prevent processing evidence from becoming Published lesson content without review/state transition.
6. Add Backend/PostgreSQL/unit/integration/Chromium evidence.
7. Update Legacy Coverage for `LES-A-010..015` only for capabilities actually proven.
8. Update Status/Log/Handoff/specialized docs before moving to Stage13E.

## High-Priority Open Boundaries

- `CONTENT-013-002` P1 — Stage10 media is not yet linked/published into `lesson_assets` by an explicit contract.
- `AI-011-005` P2 — AI `direct` question output exists but current Question Bank DB does not safely persist that type.
- `AI-012-019` P2 — live provider/model benchmark, credentials, production routes/bootstrap remain NOT YET VERIFIED.
- Upload task progress/history is not yet implemented as a verified Admin contract.
- Draft → Review → Published content workflow is not complete end-to-end.
- Student entitlement-filtered curriculum/read APIs and full Student product remain later work.
- TTS production implementation/quality/runtime is not verified.
- Offline/PWA final product stages remain later work.
- `tmp-unused-do-not-use` branch is P3 repository housekeeping only.

## Stable Non-Negotiable Boundaries

- Browser does not directly own PostgreSQL/auth/publish state.
- Full Code = 6 digits; Class Code = 7 digits.
- Student login requires password + registered P-256 device challenge; Admin recovery/rebind rules remain intact.
- Curriculum = Class → Subject Offering → optional Section → Lesson.
- Stage9 source inventory is provenance evidence, not curriculum authority.
- Upload/media success is independent from OCR/AI/TTS.
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

`README.md → DOCUMENTATION_INDEX.md → PROJECT_HANDOFF.md → PROJECT_STATUS.md → PROJECT_ENGINEERING_LOG.md → CURRENT_PRODUCT_OVERRIDES → Product Decisions → Parity/Coverage → Roadmap → specialized docs`.

`TODO.md`, root legacy code, legacy PRD/audits are historical references and must not override current executable evidence.