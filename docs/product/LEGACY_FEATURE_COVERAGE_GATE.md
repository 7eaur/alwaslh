# LEGACY FEATURE COVERAGE GATE

Purpose: prevent any valuable capability from the legacy **الوسيلة الذكية** from disappearing during the rebuild because screens/architecture are being redesigned.

Canonical inventory: `PRODUCT_FEATURE_PARITY_MATRIX.md`.

## Rule

Before Admin Product or Student Product can be declared feature-complete, **every legacy capability row** must have an explicit disposition:

```text
legacy capability ID
→ KEEP | IMPROVE | REFACTOR | REBUILD | REMOVE
→ target module/flow
→ Product Decision / Architecture Decision where relevant
→ implementation evidence
→ test/acceptance evidence
```

`REMOVE` is valid only with explicit Product Owner approval and a documented reason/replacement.

A capability may move to a better screen or share infrastructure, but its useful user/business outcome must remain unless removal is explicitly approved.

## Evidence vocabulary

- `VERIFIED` — implementation exists and executable acceptance evidence passed.
- `FOUNDATION VERIFIED` — lower-level infrastructure exists but legacy user outcome is not yet closed.
- `NOT YET VERIFIED` — no complete acceptance evidence for that capability.
- `REMOVE APPROVED` — only with explicit Product Owner evidence.

Never count a backend foundation as completion of a later UI/business flow automatically.

## Current exact verified executable baseline

`4eca7de8877ac9e2289b9c7990c912d33c256935`

Same-head evidence:

- Stage13D Admin Upload UI `34177369743` — SUCCESS incl. mixed upload/publication Chromium + narrow viewport;
- Stage13D Content Ingestion `34177369784` — SUCCESS incl. clean PostgreSQL and mixed ordering/link/publication/archive integration;
- Stage13 Admin Product `34177369748` — SUCCESS incl. existing Admin Chromium;
- Stage12 AI Execution `34177369812` — SUCCESS;
- Stage11 AI Contracts `34177369753` — SUCCESS;
- OCR Foundation `34177369750` — SUCCESS;
- Stage10 Media Pipeline `34177369777` — SUCCESS;
- Stage9 Content Import `34177369756` — SUCCESS;
- Full Rebuild `34177369768` — SUCCESS incl. Student Chromium.

## Verified Admin Curriculum subset

| Capability | Disposition / evidence |
|---|---|
| `PUB-002` | KEEP/IMPROVE — separate Admin login/session/logout verified in Chromium |
| `ADMIN-007` | REBUILD — real grouped Admin navigation; unimplemented modules remain visibly unavailable |
| `ADMIN-008` | IMPROVE — responsive Admin shell; narrow viewport checked |
| `CLASS-A-001` | KEEP — server-backed class list |
| `CLASS-A-002` | KEEP — create Class |
| `CLASS-A-003` | KEEP — rename/status/order Class |
| `CLASS-A-005` | KEEP — Subjects inside selected Class Offering context |
| `CLASS-A-006` | KEEP — create Subject |
| `CLASS-A-007` | KEEP — rename/status Subject |
| `CLASS-A-010` | KEEP — explicit Subject→Class Offering link |
| `LES-A-001` | KEEP/REBUILD — server-backed hierarchy/list foundation |
| `LES-A-002` | KEEP — Class selection/filter |
| `LES-A-003` | KEEP — Subject Offering selection/filter |
| `LES-A-006` | KEEP — Lesson title edit |
| `LES-A-007` | KEEP — deterministic Lesson order edit |

Still not closed by Curriculum UI alone: `CLASS-A-004`, `CLASS-A-008/009/011/012`, `LES-A-004`, `LES-A-005`, `LES-A-008/009` where exact legacy semantics/operations remain absent.

## Stage13C Content / Media / OCR evidence

Stage13C provides verified operational supervision/review over existing Stage9→Stage10→OCR authorities:

- source document search/filter/pagination;
- ordered source assets;
- ready/failed media and deterministic variants;
- processing/error visibility;
- pending OCR visibility;
- OCR raw/detail/source provenance;
- correction + approve/reject review;
- server guard against approving empty OCR;
- Admin Chromium flow proves review and metrics refresh.

Specialized evidence: `docs/admin/STAGE13_CONTENT_MEDIA_OCR_OPERATIONS.md`.

## Stage13D Upload / Processing History / Publication Linking — VERIFIED

Specialized evidence: `docs/admin/STAGE13_CONTENT_INGESTION_PUBLICATION.md`.

Stage13D closes the legacy upload-authoring outcome while replacing unsafe browser-owned state with server/PostgreSQL authority.

Verified flow:

```text
Admin selects Lesson + ordered image/PDF/mixed files
→ durable ingestion task/items
→ Stage10 MediaPipelineService
→ canonical ready media
→ authoritative progress/error/retry/history
→ explicit Lesson link as Draft lesson_assets
→ explicit Review
→ explicit Publish
→ reload/history/archive retains provenance
```

Important evidence:

- backend integration proves image → 2-page PDF → image becomes ordered source positions `[0,1,2,3]`;
- no `lesson_assets` are created merely because media processing becomes ready;
- link creates Draft assets with media/task/item provenance;
- Review/Publish are separate explicit Admin actions;
- Chromium proves actual mixed upload, processing, Draft/Review/Publish, reload/history/archive and responsive UX;
- Stage10 pipeline is reused; there is no parallel Admin compression/media implementation.

### Closed Stage13D rows

| Capability | Disposition / executable evidence |
|---|---|
| `LES-A-010` | **VERIFIED — KEEP/REFACTOR**: Admin image upload through durable ingestion + Stage10; `34177369784`, `34177369743` |
| `LES-A-011` | **VERIFIED — KEEP/REFACTOR**: PDF upload and Poppler page extraction through Stage10; `34177369784`, `34177369743` |
| `LES-A-012` | **VERIFIED — KEEP/FIX**: mixed PDF/image original selected order preserved; backend expansion + Chromium order assertions |
| `LES-A-013` | **VERIFIED — KEEP/REFACTOR**: upload authoring uses the single Stage10 source/display/thumbnail/AI media pipeline |
| `LES-A-014` | **VERIFIED — KEEP**: durable server-owned upload/processing task progress, status, errors and retry |
| `LES-A-015` | **VERIFIED — KEEP/REBUILD**: Admin task history/reopen/archive with non-destructive provenance retention |

`CONTENT-013-002` is closed: media→Lesson publication linking is now explicit and executable evidence proves `media ready != published`.

## What remains NOT YET VERIFIED after Stage13D

| Capability | Reason / next evidence needed |
|---|---|
| `LES-A-004` | Admin lesson search itself is not yet a verified lesson-management flow |
| `LES-A-005` | no published Lesson preview contract yet |
| `LES-A-008/009` | dependency-aware removal/bulk lesson selection not complete |
| `LES-A-016..019` | page-detection/review/batch-save Admin flow not yet built; Stage13E is current next boundary |
| `LES-A-020..028` | Stage11/12 AI backend foundations VERIFIED; Admin authoring/review user flows still NOT YET VERIFIED |
| `LES-A-029..033` | generated/manual content editors not yet verified |
| `LES-A-034..037` | Stage12 queue/retry/cancel/pause foundations VERIFIED; Admin AI Operations UX still not verified |
| `LES-A-038/039` | export/history UI not verified |

This distinction is required: **verified infrastructure ≠ verified legacy user capability**.

## AI capability evidence

Stage11/12 provide strong foundations for `AIRULE-*` and `AI-OPS-*`: provider-neutral contracts, Prompt Registry, exact counts/types, answer/index validation, source/page provenance, exact-mode uncertainty, duplicate checks, durable jobs, retries, cancellation, progress, pause/resume, capacity/cooldown/budget controls and dedicated worker runtime.

Not yet closed as product capabilities:

- live provider/model benchmark and production route selection;
- Admin AI Operations dashboard/review flow (Stage13E current next);
- Admin generated-content editing/review/publish UI;
- `direct` Question Bank persistence;
- actual production provider credentials/billing behavior.

## Student coverage status

Student Auth/Activation/Returning Login/Recovery/Device foundations are VERIFIED including Chromium.

Most learning-product rows remain later-stage work: entitlement-filtered curriculum browsing, Reader/media/text/search/TTS, Practice/Test/Models, Notes/Favorites/Needs Review, Offline/PWA final contract, Notifications, progress/statistics/private achievements.

Do not mark these complete from the old root frontend or legacy TODO entries.

## Next coverage batch — Stage13E

Current target is Admin AI Operations / Review over the **existing Stage12 authority**.

Required acceptance direction:

```text
Stage12 durable jobs/units/attempts/outputs
→ Admin status/progress/filters/detail
→ retry/cancel/pause/resume using server authority
→ provider/model/project observability without secrets
→ generated output + source/page provenance review
→ edit/reject/approve
→ no raw provider output auto-published
→ PostgreSQL/API/unit/integration/Chromium evidence
```

Only rows actually proven are updated to VERIFIED. Live provider routing remains blocked until benchmark authorization/configuration exists.

## Final release gate

For every legacy row, release must answer:

1. Where is it in the new product?
2. What changed and why?
3. Which Product/Architecture Decision supports the change?
4. Which executable test proves the outcome?
5. If removed, where is Product Owner approval?

Anything without these answers is `NOT YET VERIFIED` and cannot be silently treated as complete.