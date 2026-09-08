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

`260cfef1c48d1290611103f8443d222f8cd041b6`

Evidence:

- Stage13 Admin Product `34173006035` — SUCCESS incl. Admin Chromium;
- Stage12 AI Execution `34173006025` — SUCCESS;
- Stage11 AI Contracts `34173006065` — SUCCESS;
- OCR Foundation `34173006050` — SUCCESS;
- Stage10 Media Pipeline `34173006043` — SUCCESS;
- Stage9 Content Import `34173006055` — SUCCESS;
- Full Rebuild `34173006036` — SUCCESS incl. Student Chromium.

## Verified Admin Curriculum subset

Current verified implementation/test evidence closes the following implemented subset:

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

Stage13C adds verified operational supervision/review over existing Stage9→Stage10→OCR authorities:

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

### What this closes vs does not close

It proves the **processing supervision and OCR review outcome** that supports legacy Admin content operations. It does **not** falsely close upload/publish capabilities that are not yet implemented.

The following remain `NOT YET VERIFIED`:

| Capability | Reason / next evidence needed |
|---|---|
| `LES-A-004` | Admin lesson search itself is not yet a verified lesson-management flow |
| `LES-A-005` | no published Lesson preview contract yet |
| `LES-A-008/009` | dependency-aware removal/bulk lesson selection not complete |
| `LES-A-010` | Admin image upload contract/UI not yet verified |
| `LES-A-011` | Admin PDF upload flow not yet verified, though Stage10 Poppler backend exists |
| `LES-A-012` | mixed PDF/image authoring order not yet verified |
| `LES-A-013` | Stage10 media variants foundation is VERIFIED, but legacy Admin upload→compression user flow waits for Stage13D |
| `LES-A-014` | durable Admin upload progress contract not yet verified |
| `LES-A-015` | upload task history/archive not yet verified |
| `LES-A-016..019` | page-detection/review/batch-save Admin flow not yet built |
| `LES-A-020..028` | Stage11/12 AI backend foundations VERIFIED; Admin authoring user flows still NOT YET VERIFIED |
| `LES-A-029..033` | generated/manual content editors not yet verified |
| `LES-A-034..037` | Stage12 queue/retry/cancel foundations VERIFIED; Admin bulk/job UX still not verified |
| `LES-A-038/039` | export/history UI not verified |

This distinction is required: **verified infrastructure ≠ verified legacy user capability**.

## AI capability evidence

Stage11/12 provide strong foundations for `AIRULE-*` and `AI-OPS-*`: provider-neutral contracts, Prompt Registry, exact counts/types, answer/index validation, source/page provenance, exact-mode uncertainty, duplicate checks, durable jobs, retries, cancellation, progress, pause/resume, capacity/cooldown/budget controls and dedicated worker runtime.

Not yet closed as product capabilities:

- live provider/model benchmark and production route selection;
- Admin AI Operations dashboard;
- Admin editing/review/publish UI;
- `direct` Question Bank persistence;
- actual production provider credentials/billing behavior.

## Student coverage status

Student Auth/Activation/Returning Login/Recovery/Device foundations are VERIFIED including Chromium.

Most learning-product rows remain later-stage work: entitlement-filtered curriculum browsing, Reader/media/text/search/TTS, Practice/Test/Models, Notes/Favorites/Needs Review, Offline/PWA final contract, Notifications, progress/statistics/private achievements.

Do not mark these complete from the old root frontend or legacy TODO entries.

## Next coverage batch — Stage13D

Target legacy rows: `LES-A-010..015` first.

Required acceptance sequence:

```text
Admin image/PDF/mixed input
→ one Stage10-compatible ingestion path
→ original selected order preserved
→ durable processing progress/history
→ explicit media/source → Lesson linking
→ Draft/Review/Published authority
→ API/PostgreSQL/unit/Chromium evidence
```

Only rows actually proven are updated to VERIFIED.

## Final release gate

For every legacy row, release must answer:

1. Where is it in the new product?
2. What changed and why?
3. Which Product/Architecture Decision supports the change?
4. Which executable test proves the outcome?
5. If removed, where is Product Owner approval?

Anything without these answers is `NOT YET VERIFIED` and cannot be silently treated as complete.