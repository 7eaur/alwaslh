# STAGE13 CONTENT / MEDIA / OCR OPERATIONS

Status: **VERIFIED**

Executable closure: `260cfef1c48d1290611103f8443d222f8cd041b6`

## 1. Purpose

Stage13C gives the Super Admin a real operations/read-review surface over the already verified content-processing authorities:

```text
Stage9 source/provenance
→ Stage10 media processing/variants
→ OCR extraction/review
→ Admin supervision + OCR review
```

It deliberately does **not** create a second uploader, media queue, OCR worker or publication model.

## 2. Why this layer was needed

Repository discovery after Admin Curriculum verification showed:

- `content_source_documents/assets` already held ordered canonical source evidence;
- `media_assets/media_variants` already held Stage10 processing identity/status/variants;
- `ocr_extractions` already held durable OCR lifecycle/review state;
- media/OCR repositories had worker primitives but no Admin-oriented joined read model;
- `apps/api/src/app.ts` had no Admin content/media/OCR routes;
- Admin sidebar had “الوسائط وOCR” as disabled placeholder;
- `lesson_assets` existed, but there was no contract that made Stage10 media automatically Published Lesson content.

Classification: **IMPROVE/REBUILD Admin operations over KEEP existing authorities**.

## 3. Backend implementation

Files:

- `apps/api/src/content/admin-operations.ts`
- `apps/api/src/content/admin-operations-http.ts`
- wiring in `apps/api/src/app.ts`
- integration test `apps/api/tests/integration/content-operations.integration.test.ts`

No migration was required because Stage9/10/OCR schemas already contained the needed evidence.

### Admin API

#### `GET /v1/admin/content-operations`

Admin-only list/read model with:

- class filter;
- subject filter;
- source kind `textbook | government_exam`;
- query search across title/path/class/subject;
- bounded pagination;
- source facets;
- summary counts for documents/assets/media-ready/media-failed/OCR-pending.

List payload carries OCR metadata/counts only; it does not load raw OCR text for thousands of pages.

#### `GET /v1/admin/content-operations/documents/:documentId`

Returns source document identity/provenance, source assets in canonical Stage9 `position` order, optional Stage10 media status/error/attempt state, deterministic variants ordered `source → display → thumbnail → ai`, and OCR metadata entries for the media.

#### `GET /v1/admin/content-operations/ocr/:extractionId`

Returns review detail only when explicitly opened: raw/normalized text, confidence, provider/profile metadata, review state/reason/actor/time, failure metadata, and source document/asset/file/page/media provenance.

#### `PATCH /v1/admin/content-operations/ocr/:extractionId/review`

Rules:

- Admin session required;
- extraction must be `completed + pending`;
- repeated/concurrent review becomes `409 CONFLICT`;
- rejected extraction cannot carry replacement text;
- replacement text is normalized server-side;
- blank replacement is rejected;
- an empty OCR result cannot become `approved` until a non-empty correction exists;
- review actor/time remains server-owned/audited;
- existing OCR repository transaction is reused.

## 4. Admin Web implementation

Files:

- `apps/admin-web/src/ContentOperationsWorkspace.tsx`
- `apps/admin-web/src/content-operations-api.ts`
- `apps/admin-web/src/content-operations-api.test.ts`
- `apps/admin-web/src/content-operations.css`
- Admin shell switch in `App.tsx`

The previous disabled sidebar item is now a real navigation action.

Admin can see real processing metrics, search/filter, paginate source documents, inspect ordered source pages/assets, distinguish no-media/processing/ready/failed states, see media variant/error details, open OCR, compare raw/current normalized text, edit corrected text, approve/reject pending OCR, and see authoritative status/count refresh after mutation.

Implemented states: loading, error, empty result, document-detail loading/error, OCR loading/saving/error, and disabled review actions after terminal review.

The screen explicitly tells the Admin that it does not automatically publish Lesson content.

## 5. Payload / performance decisions

Overview/document lists do not return OCR raw text. Raw/normalized text is fetched only for an explicit extraction detail.

Reason: canonical Stage9 inventory contains 5,552 source images; loading raw OCR bodies into the operations list would make supervision unnecessarily heavy.

Document/detail APIs use bounded pagination. Future cursor pagination should be introduced only if measured scale requires it.

## 6. Security / authority

- All operations routes require authenticated Admin role.
- Browser sends intent only; review rules and mutations are server-owned.
- Browser never directly queries PostgreSQL.
- No storage key/secret/provider credential is exposed through this surface.
- Existing Stage9/10/OCR lifecycle remains authoritative.

## 7. PostgreSQL / integration evidence

Integration fixture proves:

- source assets return by canonical position even when inserted in different order;
- ready and failed media report correctly;
- ready media exposes four deterministic variants;
- OCR list metadata does not leak raw text;
- OCR detail returns raw text and source page provenance;
- correction is normalized and actor-recorded;
- replayed review conflicts;
- empty pending OCR cannot be approved without correction;
- corrected empty OCR can be approved;
- pending review count updates after review.

## 8. Browser evidence

Admin Chromium flow:

```text
login
→ open “الوسائط وOCR”
→ see source document + metrics
→ open document
→ inspect 001.jpg
→ verify ready media + 4 variants
→ open pending OCR
→ verify raw text
→ edit correction
→ approve
→ verify approved state
→ verify pending metric 1 → 0
```

A strict Playwright locator initially matched both raw `<pre>` and editable `<textarea>` because both correctly contained the same source text. This was a **test harness locator defect**, not a product defect. Final test targets `pre.ocr-source-text` explicitly and keeps the review textarea assertion independently.

## 9. Exact verification

Executable head: `260cfef1c48d1290611103f8443d222f8cd041b6`.

- Stage13 Admin Product `34173006035` — SUCCESS, backend + Admin Chromium.
- Stage12 AI Execution `34173006025` — SUCCESS.
- Stage11 AI Contracts `34173006065` — SUCCESS.
- OCR Foundation `34173006050` — SUCCESS.
- Stage10 Media Pipeline `34173006043` — SUCCESS.
- Stage9 Content Import `34173006055` — SUCCESS.
- Full Rebuild `34173006036` — SUCCESS incl. Student Chromium.

Result: **Stage13C Content / Media / OCR Operations VERIFIED**.

## 10. Architecture decisions

- Reuse Stage9→Stage10→OCR; do not create a second lifecycle.
- Keep list payloads metadata-focused and fetch raw OCR by detail.
- OCR review is server transactional and actor-audited.
- Empty OCR cannot be approved without corrected content.
- Stage10 media/OCR evidence is not automatically Published Lesson content.
- Admin operations supervision is separate from upload authoring and publication authority.

See AD-114…AD-120 in `PROJECT_ENGINEERING_LOG.md`.

## 11. Explicitly out of scope / remaining

Stage13C does **not** prove:

- image/PDF/mixed upload UI/API;
- upload processing task progress/history;
- user-selected mixed source ordering through upload;
- automatic/manual media→`lesson_assets` publication linking;
- Lesson Draft→Review→Published end-to-end workflow;
- AI generation job UI;
- Question Bank publish workflow;
- hosted media/OCR behavior.

Those are `NOT YET VERIFIED`.

## 12. Next Stage13D contract

Before implementation, inspect actual Stage10 media service/storage callers and `lesson_assets` dependencies. Then define:

```text
Admin input (image/PDF/mixed)
→ durable ingestion task
→ canonical source/media identity
→ ordered Stage10 processing
→ task progress/history
→ review/link to curriculum Lesson
→ explicit Draft/Review/Published transition
```

Do not let the browser own canonical progress, and do not treat `media_assets.status='ready'` as a publication decision.