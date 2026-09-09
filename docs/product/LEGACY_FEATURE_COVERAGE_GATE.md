# LEGACY FEATURE COVERAGE GATE

Purpose: prevent any valuable capability from the legacy **الوسيلة الذكية** from disappearing during the rebuild because screens/architecture are being redesigned.

Canonical inventory: `PRODUCT_FEATURE_PARITY_MATRIX.md`.

## Rule

Before Admin Product or Student Product can be declared feature-complete, every legacy capability row must have:

```text
legacy capability ID
→ KEEP | IMPROVE | REFACTOR | REBUILD | REMOVE
→ target module/flow
→ decision where relevant
→ implementation evidence
→ executable acceptance evidence
```

`REMOVE` requires explicit Product Owner approval and documented reason/replacement.

## Evidence vocabulary

- `VERIFIED` — implementation exists and executable acceptance evidence passed.
- `FOUNDATION VERIFIED` — lower-level infrastructure exists but the legacy user outcome is not yet closed.
- `CANDIDATE / EXECUTION PENDING` — implementation exists but required executable acceptance has not passed.
- `NOT YET VERIFIED` — no complete acceptance evidence.
- `REMOVE APPROVED` — explicit Product Owner evidence exists.

Infrastructure does not automatically close a later UI/business capability.

## Current verified executable baseline

Stage13E runtime/application baseline:

`d5ebc7f25a369430387a758c7c0bb89350963d67`

Promotion exact-head evidence is **12/12 SUCCESS**:

- Combined Stage13E `34401502463`
- Stage13E Admin AI Operations `34401549935`
- Stage13E Frontend Preparation `34401549849`
- Rebuild `34401550016`
- Stage13 Admin Product `34401549835`
- Stage9 `34401549851`
- Stage10 `34401549989`
- OCR `34401549910`
- Stage11 `34401549927`
- Stage12 `34401549964`
- Stage13D Content Ingestion `34401550065`
- Stage13D Admin UI `34401549903`

Accepted candidate `72ead8446af237392dc6d953c8e0c2382f468286` independently passed the same required 12-gate candidate matrix before promotion. PR #24/#25 were verification-only and closed unmerged.

## Verified Admin Curriculum subset

Previously verified Curriculum/Admin rows remain verified, including `PUB-002`, `ADMIN-007/008`, `CLASS-A-001/002/003/005/006/007/010`, and `LES-A-001/002/003/006/007` under their recorded KEEP/IMPROVE/REBUILD dispositions.

Rows whose exact later product behavior is still absent remain open; lower-level foundation is not treated as completion.

## Stage13C Content / Media / OCR — VERIFIED

Verified operational supervision/review over Stage9 → Stage10 → OCR authorities includes source search/filter/pagination, ordered assets, media state/variants/errors, OCR detail/provenance, correction and approve/reject review.

Specialized evidence: `docs/admin/STAGE13_CONTENT_MEDIA_OCR_OPERATIONS.md`.

## Stage13D Upload / Processing History / Publication Linking — VERIFIED

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

Closed rows remain:

| Capability | Final state |
|---|---|
| `LES-A-010` | VERIFIED — image upload via durable ingestion + Stage10 |
| `LES-A-011` | VERIFIED — PDF upload/page extraction via Stage10 |
| `LES-A-012` | VERIFIED — mixed PDF/image selected order preserved |
| `LES-A-013` | VERIFIED — single Stage10 media pipeline reused |
| `LES-A-014` | VERIFIED — durable processing progress/status/error/retry |
| `LES-A-015` | VERIFIED — history/reopen/archive with provenance |

`CONTENT-013-002` is VERIFIED: `media ready != published`; Lesson publication requires explicit Draft → Review → Published.

## Stage13E Admin AI Operations / Review — VERIFIED

Accepted candidate:

`72ead8446af237392dc6d953c8e0c2382f468286`

Verified promotion/runtime:

`d5ebc7f25a369430387a758c7c0bb89350963d67`

Verified flow:

```text
Stage12 durable jobs/units/attempts/outputs
→ authenticated Admin status/progress/filter/detail
→ bounded Jobs/Units/Attempts/Review History navigation
→ pause/resume/cancel/retry through Stage12 authority
→ safe telemetry + provenance
→ stable-output inspection
→ Stage11-validated edit/reject/approve
→ canonical latest review remains independent from selected audit page
```

Important verified properties:

- no second queue/lifecycle authority;
- server-derived actions/progress;
- review mutation only while owning unit is execution-stable;
- durable nonblank reject reason at PostgreSQL boundary;
- append-only human review history remains fully reachable;
- historical page selection never redefines current review authority;
- coupled Admin read models use one short repeatable-read snapshot;
- Job list pages before expensive Unit aggregation;
- unsafe numeric offsets rejected at HTTP boundary;
- raw provider response, credential aliases and internal provider errors excluded from browser contract;
- real Chromium covers pagination, pause/resume, approval/reload, real session expiry, stale-review `409` canonical refresh and 390px responsive behavior.

Eight audit findings are now **FIXED + VERIFIED**: `AI-013E-DB-001`, `AI-013E-REVIEW-002`, `AI-013E-OPS-003`, `AI-013E-OPS-004`, `AI-013E-OPS-005`, `AI-013E-OPS-006`, `AI-013E-PERF-007`, `AI-013E-API-008`.

### Stage13E legacy rows promoted to VERIFIED

| Capability | Final evidence state |
|---|---|
| `LES-A-035` | **VERIFIED** — durable AI jobs remain reachable through authenticated Admin Operations with bounded pagination/polling independent of worker ownership |
| `LES-A-036` | **VERIFIED** — Admin cancel delegates to Stage12 cancellation authority |
| `LES-A-037` | **VERIFIED** — failed-job retry delegates to Stage12 bounded retry authority |
| `AIRULE-025` | **VERIFIED** — generated output supports Stage11-validated human edit before terminal review |
| `AI-OPS-012` | **VERIFIED** — cancellation exposed without browser-owned task lifecycle |
| `AI-OPS-013` | **VERIFIED** — retry exposed with server-derived action authority |
| `AI-OPS-014` | **VERIFIED** — progress/status is server-derived and snapshot-consistent |
| `AI-OPS-015` | **VERIFIED** — safe durable model/project/attempt/latency/token/cost telemetry where data exists, while secret/internal fields remain excluded |
| `AI-OPS-017` | **VERIFIED** — Admin AI Operations covers jobs, units, attempts, outputs, controls and review without a second queue |

These rows are promoted because both candidate and selective promotion exact-head matrices executed green, including real PostgreSQL and Chromium; they are no longer candidate-only mappings.

## Rows not closed by Stage13E

| Capability / group | Reason / next boundary |
|---|---|
| `LES-A-004` | lesson search product flow remains separate |
| `LES-A-005` | published Lesson preview contract remains separate |
| `LES-A-008/009` | dependency-aware removal/bulk lesson selection remains incomplete |
| `LES-A-016..019` | generic output review does not prove complete page-detection → metadata edit → transactional lesson batch-save authoring |
| `LES-A-020..028` | AI foundations/operations are verified, but complete lesson-generation authoring flows are not automatically closed |
| `LES-A-029..033` | generic reviewed-output edit does not equal full summary/question/manual editor/delete product flows |
| `LES-A-034` | bulk generation trigger across selected lessons is not Stage13E |
| `LES-A-038/039` | export/history product UI remains later coverage |

## Stage13F coverage gate — READY / NOT STARTED

Stage13F must close Question Bank / Quiz Builder / Publish outcomes, including `AI-011-005`, reviewed persistence/provenance, editing, Draft → Review → Published, stable question identity/versioning/regeneration and safe export/print.

Stage13E approval is **not** Question Bank publication. Raw/unreviewed provider output remains ineligible for Student/Question Bank authority.

## AI capability boundaries still open

- `AI-012-019`: live provider/model benchmark/routes/credentials/bootstrap = `NOT YET VERIFIED`.
- reviewed Question Bank persistence/publication = Stage13F.
- complete Admin generated-content authoring flows beyond Operations/Review = later explicit coverage.
- actual production provider credentials/billing behavior = `NOT YET VERIFIED`.

## Student coverage status

Student Auth/Activation/Returning Login/Recovery/Device foundations remain VERIFIED including Chromium. Most learning-product rows remain later-stage work: entitled curriculum browsing, Reader/media/text/search/TTS, Practice/Test/Models, Notes/Favorites/Needs Review, Offline/PWA, Notifications and progress/statistics/private achievements.

## Final release gate

For every legacy row, release must answer:

1. Where is it in the new product?
2. What changed and why?
3. Which Product/Architecture Decision supports the change?
4. Which executable test proves the outcome?
5. If removed, where is Product Owner approval?

Anything without these answers is `NOT YET VERIFIED` and cannot be silently treated as complete.
