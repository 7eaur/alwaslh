# STAGE13 ADMIN CURRICULUM UI

Status: **VERIFIED**

Verified executable closure: `d3e621e6f60cc56ee3838b7df36a86ebafa37524`.
Backend contract: `docs/curriculum/CURRICULUM_STRUCTURE.md`.

## Purpose

This batch turns the previous static Admin shell into the first real Super Admin product surface while keeping PostgreSQL and business rules server-owned.

## Authentication and data flow

```text
Admin Web load
→ GET /v1/admin/me
→ valid session: workspace
→ missing session: Admin login
→ POST /v1/auth/login
→ HttpOnly server session
→ GET /v1/admin/curriculum
→ Admin-only curriculum mutations
→ authoritative snapshot refresh
```

Logout is server-backed. The browser does not own authoritative curriculum data or database/provider credentials.

## Verified curriculum workspace

```text
Class
→ Subject Offering (`subject_class_links`)
→ optional Unit / Section
→ Lesson
```

Verified behavior:

- server-derived counts for classes, subjects, offerings and lessons;
- create Class, Subject, Offering, optional Section and Lesson;
- sectioned and unsectioned lessons;
- rename Class/Subject/Section/Lesson;
- edit Class/Offering/Section/Lesson ordering;
- edit `active | inactive | archived` state;
- move Lesson between Sections or detach it to the Offering root;
- explicit loading, empty, network-error and mutation-feedback states;
- responsive RTL layout;
- lifecycle controls preserve records rather than exposing destructive curriculum removal in this foundation.

Stage9 filenames/source folders are never treated as curriculum authority.

## Executable verification

Exact head `d3e621e6f60cc56ee3838b7df36a86ebafa37524` passed:

- Stage13 Curriculum Verification `34168788666` — SUCCESS;
- Stage12 AI Execution `34168788667` — SUCCESS;
- Stage11 AI Contracts `34168788661` — SUCCESS;
- OCR Foundation `34168788704` — SUCCESS;
- Stage10 Media `34168788646` — SUCCESS;
- Stage9 Content Import `34168788663` — SUCCESS;
- Full Rebuild `34168788747` — SUCCESS.

Stage13 Chromium proves on fresh PostgreSQL:

1. Admin login;
2. Class + Subject + Offering + Section + Lesson creation;
3. Lesson move/detach;
4. Lesson rename;
5. Lesson status mutation;
6. reload with server session restoration;
7. logout back to Admin login;
8. 390px viewport without horizontal overflow.

## Test-harness hardening during closure

No production authorization/business rule was weakened. Closure corrected:

- mocked fetch response reuse;
- URL assertions that assumed no configured API base URL;
- ambiguous Playwright label/text selectors;
- Stage12 global-capacity race coverage that originally used units sharing one job-row lock instead of independent jobs competing for the same global slot.

The final same-head matrix proves the hardened tests and production contracts together.

## Legacy coverage evidenced by this batch

Verified implementation/test evidence exists for the implemented subset of:

- `PUB-002`;
- `ADMIN-007`, `ADMIN-008`;
- `CLASS-A-001..003`, `CLASS-A-005..007`, `CLASS-A-010` where represented by current hierarchy operations;
- `LES-A-001..003`, `LES-A-006`, `LES-A-007`.

This is not blanket Stage13 parity. Search, preview, dependency-aware removal, bulk lesson actions, upload/media/progress/history, OCR operations UI, AI authoring/review, export and publish flows remain separate work.

## Next Stage13 boundary

The next batch activates “الوسائط وOCR” only after adding a thin Admin API/read-review layer over existing Stage9 source, Stage10 media and OCR authorities. It must not create a second queue or present processing evidence as published Lesson content.

Still `NOT YET VERIFIED`:

- content/media upload workflow and processing-history UI;
- OCR operations/review UI;
- media→`lesson_assets` publication/linking contract;
- AI Operations UI;
- Question Bank Draft → Review → Published UI;
- student/account/access-code management UI;
- notifications/import-export/reports/settings/audit;
- hosted Admin runtime while deployment remains deferred.
