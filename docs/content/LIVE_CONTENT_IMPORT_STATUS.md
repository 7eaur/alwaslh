# LIVE CONTENT IMPORT STATUS — الوسيلة الذكية

> Canonical content/materialization state for the hosted Railway inspection/dev stack. Repository source contracts + executable import evidence outrank prose.

Last synchronized: **2026-09-12**.

## 1. Source policy

Current approved source of curriculum/media bytes:

- canonical source repository: `7eaur/alwaslh-go`
- canonical source revision used by Stage9/content proof: `f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`
- Stage9 verified inventory: **48 source documents / 5,552 source images**

The old Supabase database was explicitly removed from the current import scope by Product Owner direction. Do **not** copy legacy Supabase rows/files into Railway unless a later explicit instruction reopens that scope.

The active runtime database is Railway PostgreSQL. Canonical media bytes are stored through the current `media_assets` / variants / `lesson_assets` pipeline on the API media volume, not by writing arbitrary files beside the app.

## 2. What Stage9 proves versus what it does not

Stage9 proves the canonical source inventory/provenance contract for the full source repository. It does **not** mean all 5,552 image bytes are already materialized into Railway media storage or linked to published lessons.

Never equate:

`source inventory metadata == uploaded media == lesson draft == reviewed lesson == published Student content`.

Those are separate states and must stay separate.

## 3. Grade 9 English bounded live proof — VERIFIED

Scope:

- class slug: `grade-9`
- subject slug: `english`
- source document: `تاسع انجليزي/الانجليزي_تاسع`
- source repository/revision: `7eaur/alwaslh-go@f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`

The importer/CLI was added through PR #34 and verified before merge. PR #34 passed the complete verification matrix used for the batch, including Stage9/10/content ingestion/API/Admin/Student/Rebuild regressions.

Live Railway bootstrap evidence:

- bootstrap deployment: `8428981b-aa6d-4927-b1f9-31545265e3f9`
- source images: **75**
- source bytes: **8,390,689 bytes**
- ready media assets: **75**
- generated media variants: **300** (`source`, `display`, `thumbnail`, `ai`)
- linked lesson assets: **75**
- source-authored lessons created/used: **10**
- publication state: **Draft**
- replay count during first live execution: 0

The importer uses the current Media Pipeline and checksum/storage contracts. It does not bypass media metadata, checksum, variants or lesson-asset persistence.

## 4. Publication safety boundary

All 75 Grade 9 English lesson assets remain **Draft**.

They are intentionally not automatically Student-visible. The next content action is:

1. inspect the generated class/subject/lesson structure in Admin;
2. review ordering/grouping and representative rendered media;
3. correct any source-to-lesson mapping issue before publication;
4. use the normal Admin lesson Draft → Review → Published flow;
5. verify Student entitlement/Reader behavior against the published result in the hosted Student app.

Never publish all imported material merely because the byte import completed successfully.

## 5. Questions / AI relationship

The Grade 9 English byte bootstrap did **not** auto-generate or publish questions.

Question generation must continue through the existing Stage13G G-D authoring authority:

`lesson/source context → AI job/output → human AI review → Question Bank Draft → Question Bank Review/Published → Quiz Builder immutable published snapshot`.

Important rules:

- AI output never becomes Student question authority automatically;
- generated questions must remain attached to the correct lesson/source provenance;
- Question Bank publication is human-controlled;
- Quiz delivery uses immutable published quiz versions;
- `AI-012..AI-019` live provider/model/credential/bootstrap readiness remains `NOT YET VERIFIED` unless separately proven against a real provider.

If future content import includes pre-existing generated questions from another source, do not bulk copy them into published authority. Normalize them through current Question Bank/import/review contracts with explicit provenance and validation.

## 6. Full source import — NOT YET EXECUTED

The remaining canonical inventory is approximately:

- total inventory: 5,552 images / 48 documents;
- live byte materialized so far: 75 images in the Grade 9 English proof;
- remaining full-source byte materialization: **NOT YET EXECUTED**.

Before widening import:

1. inventory each candidate subject/document and confirm deterministic lesson grouping/order;
2. estimate raw + generated variant storage against the 500 MB Railway media volume;
3. increase/provision media capacity if required;
4. import one bounded subject/batch at a time through the idempotent current pipeline;
5. verify exact source count, checksums, ready assets, variants, lesson links and replay behavior;
6. review in Admin before publication;
7. keep a rollback/archive path for wrongly mapped Draft content.

Do not use a partial Stage9 inventory file as a snapshot import if that would incorrectly mark unrelated sources absent. The Stage9 inventory contract represents the whole canonical snapshot.

## 7. Current code/tooling

Current scoped production-proof command exists in `apps/api` as the allow-listed legacy-subject bootstrap tooling. It was designed for controlled subject materialization and is not a blanket auto-publisher.

The normal API boot command is **not** the content bootstrap command. Run content materialization as an explicit controlled operation, then restore/keep normal API startup.

## 8. Current next content batch

Priority order:

1. **Review Grade 9 English Draft material in Admin.**
2. Publish only approved lesson assets through normal publication authority.
3. Smoke test the published subject in Student Reader on Railway.
4. Record any mapping/order/rendering fixes and add regression coverage if a systemic importer issue is found.
5. Select the next small canonical subject only after the first published sample is accepted.
6. Defer full 5,552-image materialization until capacity + mapping + review workflow are proven at more than one representative subject.

## 9. Evidence pointers

- PR #34 — scoped Grade 9 English bootstrap implementation and CI acceptance.
- Issue #16 latest `Live content proof — Grade 9 English — VERIFIED` report.
- `PROJECT_STATUS.md` and `PROJECT_ENGINEERING_LOG.md` for the integrated project view.
- `docs/operations/RAILWAY_LIVE_STATE.md` for hosted runtime/service details.
