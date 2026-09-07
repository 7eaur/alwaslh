# CURRICULUM STRUCTURE — STAGE13 BACKEND FOUNDATION

Status: **IMPLEMENTED / VERIFICATION PENDING**

Parent verified executable baseline: `45a902eb94cf574ebbcf29e1d0e9b2ca0ae6f894`.
Product decision: PED-018 in `docs/product/PRODUCT_EVOLUTION_REVIEW.md`.

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

The existing PostgreSQL model already has:

- `classes`;
- `subjects`;
- `subject_class_links`;
- `lessons` with a composite `(class_id, subject_id)` foreign key to `subject_class_links`.

`subject_class_links` is therefore the existing **Subject Offering** concept. Creating a second `subject_offerings` table would duplicate authority and add needless migration risk, so it is kept and strengthened instead.

Stage9 source inventory remains separate evidence. `content_source_documents/assets` describe imported source material and provenance; they do not silently create or redefine curriculum hierarchy.

## Additive database extension

`database/migrations/0016_curriculum_structure.sql` adds:

- `status` + `updated_at` to `subject_class_links`;
- `curriculum_sections` as exactly one optional hierarchy layer;
- nullable `lessons.section_id`;
- composite `lessons_section_scope_fk` over `(class_id, subject_id, section_id)` so a lesson cannot reference a section from another Class/Subject Offering;
- `curriculum_events` for durable Admin mutation audit;
- supporting ordering/status/audit indexes.

Existing lesson IDs, class/subject foreign keys, media, questions, attempts and source evidence are preserved.

## Mutation policy

Admin curriculum management is non-destructive in this foundation batch:

- create;
- rename/edit metadata;
- reorder;
- set `active | inactive | archived`;
- attach/detach a lesson from an optional section.

No Admin DELETE endpoint is added. Historical lessons may already be referenced by media, questions, practice sessions and attempts, so status/archive is the safe default lifecycle instead of cascading deletion.

## API foundation

`apps/api/src/curriculum` adds an Admin-only backend surface:

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

The API reuses existing session/Admin authorization and `AppError` envelopes. Slug creation is normalized server-side; duplicate creates are conflict-safe with PostgreSQL `ON CONFLICT` handling.

## Concurrency / integrity

Creation of offerings/sections/lessons locks the relevant parent rows during the short mutation transaction so archive/create races have explicit ordering.

Application validation rejects cross-offering section assignment, while the database composite FK independently enforces the same rule. The database remains authoritative if code is bypassed or a future caller is incorrect.

## Verification gate

Dedicated Stage13 workflow must prove on one exact implementation head:

- API lint/typecheck/unit/build;
- clean application of all migrations;
- new tables/columns/constraints/indexes;
- Admin authentication on curriculum routes;
- class/subject/offering/section/lesson creation;
- optional unsectioned lessons;
- duplicate conflict behavior;
- cross-offering section rejection through API;
- direct PostgreSQL cross-scope insertion rejection;
- moving a lesson out of a section without deleting it;
- status/archive behavior preserving lesson rows;
- curriculum audit events;
- absence of a destructive lesson DELETE route.

Until those gates and lower-layer regressions pass, this batch is **NOT YET VERIFIED**.

## Deferred boundaries

This foundation does not yet implement:

- Stage13 Admin Web curriculum screens;
- Student entitlement-filtered curriculum read API;
- content Draft/Review/Published workflows;
- Question Bank publishing operations;
- source-import-to-curriculum mapping automation;
- hosted deployment.

Those remain later integration work and must reuse this durable hierarchy instead of creating parallel curriculum authority.
