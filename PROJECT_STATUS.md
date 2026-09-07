# PROJECT STATUS

- **Current Phase:** Stage13 Super Admin Product — Curriculum Structure backend foundation **VERIFIED**; next focus is Admin Web curriculum/content surface integration.
- **Planning branch / PR:** `planning/product-evolution-review` / draft PR #12.
- **Latest fully verified executable baseline:** `6484677dffa80ca0658ce5837750d824e1bb6943`.
- **Previous Stage12 closure:** `45a902eb94cf574ebbcf29e1d0e9b2ca0ae6f894`.
- **Deployment:** `DEFERRED BY PRODUCT OWNER`. Hosted Student/Admin/API/media/OCR/AI worker runtime remains `NOT YET VERIFIED`.

## Latest fully verified same-head matrix

Exact executable head: `6484677dffa80ca0658ce5837750d824e1bb6943`.

- Stage13 Curriculum Backend Verification `34092024879` — **SUCCESS**.
- Stage12 AI Execution Verification `34092024902` — **SUCCESS**.
- Stage11 AI Contract Verification `34092024875` — **SUCCESS**.
- OCR Foundation Verification `34092024895` — **SUCCESS**.
- Stage10 Media Pipeline `34092024854` — **SUCCESS**.
- Stage9 Content Import Verification `34092024883` — **SUCCESS**.
- Rebuild Stage Verification `34092024916` — **SUCCESS**, including Chromium Student activation/login/recovery E2E.

The initial curriculum implementation head `70621c2f73e13b542960ad0ee3f7c850e0350e00` failed shared Biome formatting before TypeScript/runtime checks. `6484677d…` contains formatting-only corrections; behavior and assertions were unchanged.

## Verified Curriculum Structure backend foundation

Product contract from PED-018:

```text
Class / Grade
→ Subject Offering
→ Unit / Section (optional)
→ Lesson
→ Content / pages / resources
```

Verified architecture:

- existing `classes` remains Class/Grade authority;
- existing `subjects` remains Subject authority;
- existing `subject_class_links` is the **Subject Offering** authority; no duplicate `subject_offerings` table exists;
- `curriculum_sections` is exactly one optional hierarchy layer;
- `lessons.section_id` is nullable, so lessons may live directly under an Offering;
- composite `lessons_section_scope_fk` prevents a lesson from referencing a section belonging to another Class/Subject Offering;
- Stage9 `content_source_documents/assets` remains source/provenance inventory, not curriculum authority;
- hierarchy is never derived implicitly from filenames/folders;
- `curriculum_events` records Admin curriculum mutations;
- Admin curriculum mutation is non-destructive by default: create/edit/reorder/status/archive/attach/detach, no DELETE route.

Migration: `database/migrations/0016_curriculum_structure.sql`.
Detailed contract: `docs/curriculum/CURRICULUM_STRUCTURE.md`.

## Verified Admin curriculum API foundation

Admin-only backend routes now exist for:

```text
GET    /v1/admin/curriculum
POST   /v1/admin/curriculum/classes
PATCH  /v1/admin/curriculum/classes/:classId
POST   /v1/admin/curriculum/subjects
PATCH  /v1/admin/curriculum/subjects/:subjectId
POST   /v1/admin/curriculum/offerings
PATCH  /v1/admin/curriculum/offerings/:classId/:subjectId
POST   /v1/admin/curriculum/sections
PATCH  /v1/admin/curriculum/sections/:sectionId
POST   /v1/admin/curriculum/lessons
PATCH  /v1/admin/curriculum/lessons/:lessonId
```

Verified behavior includes Admin authentication, duplicate-conflict handling, optional unsectioned lessons, cross-offering section rejection at both API and PostgreSQL levels, detach-without-delete, archive/status persistence, snapshot reads and durable audit events.

## Stable Stage12 boundary

Stage12 backend lifecycle/runtime remains **VERIFIED** after the new migration/API work. The new exact head passed the full Stage12 worker/lifecycle/capacity/control/pause regression suite.

Still intentionally `NOT YET VERIFIED`:

- authorized live AI provider adapters/credentials;
- live provider/model benchmark;
- production route/model defaults;
- production live-provider worker bootstrap;
- hosted worker runtime;
- current provider prices and actual billing reconciliation.

Do not invent fake production routes/adapters to close those boundaries.

## Next ordered engineering work

1. Build the Stage13 Admin Web shell/curriculum management UX on top of the verified `/v1/admin/curriculum` contract.
2. Add content/media/OCR management surfaces while preserving Stage9/10/OCR authority boundaries.
3. Add AI job operations/review UI against verified Stage12 contracts; do not introduce a second queue/client-owned progress.
4. Resolve AI `direct` question persistence explicitly before Question Bank publish workflows depend on it.
5. Continue students/codes/recovery/device rebind, notifications, import/export/reports/settings/audit according to Stage13 coverage gates.
6. Run live AI provider/model benchmark before any production AI routing/bootstrap.
7. Keep deployment disabled until the Product Owner explicitly re-enables it.

## Stable lower-layer facts

- Stage9 source inventory: 15 roots / 48 source documents / 5,552 images.
- Stage10 media identity/checksum/order remains authoritative source evidence.
- OCR derives only from ready media; only reviewed/approved OCR is approved downstream text evidence.
- Student auth/device rules from Stage6/8 remain unchanged.
- Question Bank persistence currently supports only `multiple_choice | true_false`; AI `direct` extraction remains reviewable output only.
- configured AI budget reservations are safety ceilings, not proof of invoice accuracy.

## Repository housekeeping

Temporary branch `tmp-unused-do-not-use` contains no unique code and is not referenced by PR #12. Removal remains a **P3 housekeeping item** because the connected GitHub write surface does not expose branch-ref deletion.

## Last build/test

**Last fully green executable head:** `6484677dffa80ca0658ce5837750d824e1bb6943`.

**Curriculum Structure / Stage13 backend foundation:** **VERIFIED**.

**Next focus:** Stage13 Admin Web curriculum/content integration.

**Deployment:** `DEFERRED BY PRODUCT OWNER`.
