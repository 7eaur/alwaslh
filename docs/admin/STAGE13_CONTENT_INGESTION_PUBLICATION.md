# Stage13D — Admin Content Ingestion / Publication

Status: **VERIFIED**

Verified executable head: `4eca7de8877ac9e2289b9c7990c912d33c256935`

Deployment/Preview: **`DEFERRED BY PRODUCT OWNER`**. Hosted runtime is not implied by this verification.

## Purpose

Stage13D closes the legacy Admin outcome `LES-A-010..015` without restoring the unsafe legacy client-owned upload/task model.

The verified product flow is:

```text
Admin selects Lesson
→ selects ordered JPG/PNG/WebP/PDF inputs
→ server creates durable ingestion task/items
→ binary inputs are uploaded against immutable item positions
→ Stage10 MediaPipelineService processes images/PDF pages
→ durable task/media history records authoritative progress/errors
→ ready media remains unpublished
→ Admin explicitly links ready media to Lesson as Draft lesson_assets
→ Admin explicitly submits Draft → Review
→ Admin explicitly publishes Review → Published
→ task can be archived without deleting publication/provenance history
```

`media_assets.status = ready` is processing evidence only. It never automatically publishes Lesson content.

## Architecture

### Database

Migration: `database/migrations/0017_content_ingestion_publication.sql`.

Adds durable authorities for:

- `content_ingestion_tasks`;
- `content_ingestion_items`;
- `content_ingestion_media`;
- `lesson_assets.media_asset_id` provenance;
- ingestion task/item provenance on `lesson_assets`;
- explicit `draft | review | published` publication state and actor/timestamp fields.

Important invariants:

- Admin/client request idempotency is scoped to the creating profile and validated against the original task contract;
- task items carry immutable source positions;
- ingestion media points to canonical Stage10 `media_assets` rather than duplicating processed media;
- Lesson assets link to canonical media through FK/provenance;
- published state requires explicit publication transition;
- archival is non-destructive.

### Backend

Implementation:

- `apps/api/src/content/ingestion-service.ts`;
- `apps/api/src/content/ingestion-http.ts`;
- existing `apps/api/src/media/service.ts` / Stage10 media pipeline;
- `apps/api/src/app.ts` wiring;
- filesystem storage through existing MediaStorage abstraction and `MEDIA_STORAGE_ROOT`.

The browser does not own canonical task progress. Processing ownership uses server-side lease/token checks so an expired/stale processor cannot overwrite the current task state.

### Admin API

Admin-only routes:

- `GET /v1/admin/content-ingestions` — durable history/filter/archive view;
- `GET /v1/admin/content-ingestions/:taskId` — authoritative task detail;
- `POST /v1/admin/content-ingestions` — create idempotent ordered task;
- `PUT /v1/admin/content-ingestions/:taskId/items/:itemId/content` — upload raw source bytes;
- `POST /v1/admin/content-ingestions/:taskId/process` — process/retry through Stage10;
- `POST /v1/admin/content-ingestions/:taskId/link` — link completed ready media to Lesson as Draft;
- `PATCH /v1/admin/content-ingestions/:taskId/publication` — `submit_review | return_to_draft | publish`;
- `PATCH /v1/admin/content-ingestions/:taskId/archive` — preserve history while hiding normal active list.

Authorization uses the existing Admin session boundary. Student role/session isolation remains enforced; no Stage13D authorization exception exists.

## Ordering contract

For mixed sources, selected item order is server-owned by `content_ingestion_items.position`.

Processing maintains a cumulative source cursor:

```text
image at item position 0 → media sourcePosition 0
PDF next → each extracted page occupies the next source positions
following image → starts after all PDF pages
```

The backend integration test proves an image → 2-page PDF → image sequence yields media source positions `[0, 1, 2, 3]` in the original logical order.

## Publication contract

The verified separation is:

```text
Uploaded
→ Stage10 processed / media Ready
→ no lesson_assets publication yet
→ explicit Link creates lesson_assets as Draft
→ explicit Submit Review
→ Review
→ explicit Publish
→ Published + Lesson content revision/timestamp update
```

Publication is rejected when prerequisites are not satisfied. Processing completion alone is never treated as publication authority.

## Admin Web

Implementation:

- `apps/admin-web/src/content-ingestion-api.ts`;
- `apps/admin-web/src/ContentIngestionWorkspace.tsx`;
- `apps/admin-web/src/content-ingestion.css`;
- Admin shell navigation in `apps/admin-web/src/App.tsx`.

Verified UX:

- Lesson selection from authoritative curriculum;
- multiple JPG/PNG/WebP/PDF selection;
- visible selected order before upload;
- file count/type/size validation;
- upload progress presentation driven by completed authoritative uploads;
- durable history and reopening after page reload;
- processing retry on failed task;
- explicit Draft link, Review, Return-to-Draft and Publish controls;
- publish confirmation;
- archive/history visibility;
- loading/error/empty/action feedback;
- responsive 390px viewport without horizontal overflow.

## Security / correctness decisions

- no browser-direct PostgreSQL/storage authority;
- no Student use of Admin password login; Student authorization regression uses legitimate device-bound session;
- no duplicate media processor: Stage13D reuses `MediaPipelineService`;
- no automatic publish on `ready`;
- idempotency key reuse with a different lesson/item contract is rejected;
- stale worker failure writes are blocked after lease ownership is lost;
- source file checksum/byte size is checked before processing;
- task archival is forbidden while actively processing;
- archived task history and linked/published Lesson dependencies are preserved.

## Legacy replacement notes

Legacy upload behavior was preserved as a user outcome but rebuilt where necessary:

- legacy browser-owned task/progress state → durable server/PostgreSQL tasks;
- legacy mixed-file completion ordering risk → immutable item positions + cumulative PDF page cursor;
- legacy upload/compression path → single Stage10 pipeline;
- implicit/unclear content readiness → explicit Draft/Review/Published authority;
- destructive task cleanup → archive/history.

No valuable `LES-A-010..015` capability was removed.

## Executable evidence

Same executable head: `4eca7de8877ac9e2289b9c7990c912d33c256935`.

- Stage13D Content Ingestion `34177369784` — **SUCCESS**: API lint/typecheck/unit/build, clean PostgreSQL migrations/schema checks, mixed ingestion integration, ordering, link/publication/archive.
- Stage13D Admin Upload UI `34177369743` — **SUCCESS**: API/Admin quality gates, clean migrations, explicit Admin fixture, real Chromium mixed upload→process→Draft→Review→Publish→reload/history→archive, plus narrow viewport.
- Stage13 Admin Product `34177369748` — **SUCCESS**: existing Curriculum/Content/OCR backend + Admin Chromium regressions.
- Full Rebuild `34177369768` — **SUCCESS**: PostgreSQL/Auth/Access/Activation and Student Chromium regressions.
- Stage12 AI Execution `34177369812` — **SUCCESS**.
- Stage11 AI Contracts `34177369753` — **SUCCESS**.
- OCR Foundation `34177369750` — **SUCCESS**.
- Stage10 Media Pipeline `34177369777` — **SUCCESS**.
- Stage9 Content Import `34177369756` — **SUCCESS**.

## Legacy coverage closed by this stage

- `LES-A-010` — image upload: **VERIFIED**;
- `LES-A-011` — PDF upload/extraction: **VERIFIED**;
- `LES-A-012` — mixed PDF/images preserving original order: **VERIFIED**;
- `LES-A-013` — upload authoring reuses one compression/media pipeline: **VERIFIED**;
- `LES-A-014` — durable task progress/status: **VERIFIED**;
- `LES-A-015` — task history/archive: **VERIFIED**.

This does **not** close `LES-A-016+` AI detection/generation/editing flows. Those remain `NOT YET VERIFIED` until Stage13E/F evidence exists.

## Known limits / next boundary

Stage13D does not claim:

- dependency-aware Lesson delete/bulk Lesson authoring (`LES-A-008/009`);
- page-boundary AI detection/review (`LES-A-016..019`);
- Admin AI operations/review (`LES-A-020..037` foundations exist only where Stage11/12 proved them);
- Question Bank authoring/publish (`Stage13F`);
- hosted upload/storage/runtime verification while deployment is deferred.

Current next work is **Stage13E — Admin AI Operations / Review**, per `MASTER_REBUILD_ROADMAP.md`. It must reuse verified Stage12 jobs/units/attempts and must not create a client-owned queue or expose provider secrets.
