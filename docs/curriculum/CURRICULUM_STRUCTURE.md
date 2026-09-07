# CURRICULUM STRUCTURE — STAGE13 BACKEND FOUNDATION

Status: **VERIFIED**

Verified executable head: `6484677dffa80ca0658ce5837750d824e1bb6943`.
Product decision: PED-018 in `docs/product/PRODUCT_EVOLUTION_REVIEW.md`.

Same-head verification:

- Stage13 Curriculum Backend `34092024879` — SUCCESS;
- Stage12 AI Execution `34092024902` — SUCCESS;
- Stage11 AI Contracts `34092024875` — SUCCESS;
- OCR Foundation `34092024895` — SUCCESS;
- Stage10 Media Pipeline `34092024854` — SUCCESS;
- Stage9 Content Import `34092024883` — SUCCESS;
- Full Rebuild `34092024916` — SUCCESS including Chromium.

## Product contract

The curriculum hierarchy is intentionally shallow and explicit:

```text
Class / Grade
→ Subject Offering
→ Unit / Section (optional)
→ Lesson
→ Content / pages / resources
```

There is no generic recursive tree and no filename-derived curriculum authority.

## Existing model kept

Repository discovery proved the PostgreSQL model already had:

- `classes`;
- `subjects`;
- `subject_class_links`;
- `lessons` with a composite `(class_id, subject_id)` foreign key to `subject_class_links`.

`subject_class_links` is therefore the existing **Subject Offering** concept. Creating a second `subject_offerings` table would duplicate authority, so the existing table is kept and strengthened.

Stage9 source inventory remains a separate evidence layer. `content_source_documents/assets` describe imported source material/provenance; they do not silently create, rename or redefine curriculum hierarchy.

## Verified additive database extension

`database/migrations/0016_curriculum_structure.sql` adds:

- `status` + `updated_at` to `subject_class_links`;
- `curriculum_sections` as exactly one optional hierarchy layer;
- nullable `lessons.section_id`;
- composite `lessons_section_scope_fk` over `(class_id, subject_id, section_id)` so a lesson cannot reference a section from another Class/Subject Offering;
- `curriculum_events` for durable Admin mutation audit;
- ordering/status/audit indexes and updated-at triggers.

Existing lesson IDs, class/subject relationships, media, questions, attempts and source evidence are preserved.

## Mutation policy

Admin curriculum management is intentionally non-destructive:

- create;
- rename/edit metadata;
- reorder;
- set `active | inactive | archived`;
- attach/detach a lesson from an optional section.

No Admin DELETE endpoint is exposed. Historical lessons may already be referenced by media, questions, practice sessions and attempts, so status/archive is the safe default lifecycle instead of cascading deletion.

## Verified API foundation

`apps/api/src/curriculum` provides an Admin-only surface:

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

The API reuses existing session/Admin authorization and `AppError` envelopes. Slugs are normalized server-side on creation; duplicate creates are conflict-safe through PostgreSQL-backed `ON CONFLICT` handling.

## Concurrency / integrity

Creation of offerings/sections/lessons locks the relevant parent rows during short mutation transactions so archive/create races have explicit ordering.

Application validation rejects cross-offering section assignment. PostgreSQL independently enforces the same invariant with the composite foreign key, protecting integrity even if a future caller bypasses the service.

## Verification evidence

The Stage13 integration suite proved:

- API lint/typecheck/unit/build;
- clean application of all migrations;
- expected tables/columns/constraints/indexes;
- Admin authentication on curriculum routes;
- class/subject/offering/section/lesson creation;
- optional unsectioned lessons;
- duplicate conflict behavior;
- cross-offering section rejection through API;
- direct PostgreSQL cross-scope insertion rejection via `lessons_section_scope_fk`;
- moving a lesson out of a section without deleting it;
- status/archive behavior preserving lesson rows;
- curriculum audit events attributed to the Admin actor;
- absence of a destructive lesson DELETE route.

The first implementation head `70621c2f73e13b542960ad0ee3f7c850e0350e00` failed only Biome formatting before runtime checks. Final head `6484677d…` applied formatter-only corrections and passed the complete same-head matrix.

## Deferred boundaries

This verified backend foundation does not yet implement:

- Stage13 Admin Web curriculum screens;
- Student entitlement-filtered curriculum read API;
- content Draft/Review/Published workflows;
- Question Bank publishing operations;
- source-import-to-curriculum mapping automation;
- hosted deployment.

Later work must reuse this durable hierarchy instead of creating parallel curriculum authority.
