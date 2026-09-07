# STAGE13 ADMIN CURRICULUM UI

Status: **IMPLEMENTED / VERIFICATION PENDING**

Parent verified executable baseline: `6484677dffa80ca0658ce5837750d824e1bb6943`.
Backend contract: `docs/curriculum/CURRICULUM_STRUCTURE.md`.

## Purpose

Replace the static Admin foundation shell with the first real Super Admin product surface without creating parallel data authority or client-owned business rules.

The browser remains a consumer of `apps/api` only. It never writes PostgreSQL directly and never embeds database/provider credentials.

## Authentication flow

```text
Admin Web load
→ GET /v1/admin/me
→ valid Admin session: open workspace
→ missing/expired session: show Admin login
→ POST /v1/auth/login
→ HttpOnly server session cookie
→ curriculum workspace
```

Logout uses `POST /v1/auth/logout`. The UI must not claim logout success if the server request fails.

## Curriculum workspace

The UI consumes the verified hierarchy:

```text
Class
→ Subject Offering (`subject_class_links`)
→ optional Unit / Section
→ Lesson
```

Current implemented operations:

- real server-derived counts for classes, subjects, offerings and lessons;
- create Class;
- create Subject;
- link Subject to Class as an Offering;
- create optional Section/Unit;
- create sectioned or unsectioned Lesson;
- rename Class/Subject/Section/Lesson;
- update explicit ordering for Class/Offering/Section/Lesson;
- update `active | inactive | archived` state;
- move Lesson between Sections or detach it to the Offering root;
- refresh authoritative snapshot after every successful mutation;
- explicit loading, empty, network-error and mutation feedback states;
- responsive RTL Admin layout;
- no destructive DELETE control.

The UI deliberately does **not** derive hierarchy from Stage9 filenames/source folders.

## Navigation rule

Only implemented Admin modules are interactive. Future Media/OCR, AI Operations, Students/Access and Reports/Settings modules are visibly marked as later work instead of using dead buttons or placeholder dashboards.

## Verification contract

The Stage13 workflow is extended with a fresh-PostgreSQL Chromium job. Closure requires one exact head to pass:

1. Admin ESLint;
2. strict TypeScript typecheck;
3. Admin API-client unit tests;
4. production Admin build with explicit `VITE_API_BASE_URL`;
5. all migrations on clean PostgreSQL;
6. explicit Super Admin bootstrap;
7. real browser unauthenticated → login flow;
8. Class + Subject + Offering + Section + Lesson creation through the browser;
9. Lesson move/rename/status mutation through the browser;
10. reload with server session restoration;
11. logout back to Admin login;
12. narrow-viewport horizontal-overflow check;
13. existing Stage13 backend and lower-layer regression workflows.

Until those checks pass this UI remains **NOT YET VERIFIED**.

## Legacy coverage targeted by this batch

This batch targets the first implementation evidence for:

- `PUB-002` separate Admin login;
- `ADMIN-007` grouped Admin navigation foundation;
- `ADMIN-008` responsive Admin shell;
- `CLASS-A-001..003`, `CLASS-A-005..007`, `CLASS-A-010` where supported by the current hierarchy operations;
- `LES-A-001..003`, `LES-A-006..007` for the current curriculum list/filter/edit/order foundation.

Deletion semantics, bulk lesson operations, uploads/media/OCR/AI authoring, preview/search/pagination and the rest of Stage13 parity remain separate work and must not be marked complete from this batch.

## Deferred boundaries

Still `NOT YET VERIFIED` / not implemented in this batch:

- operational Admin dashboard beyond real curriculum counts;
- content/media upload and processing UI;
- OCR review UI;
- AI job operations/review UI;
- Question Bank Draft → Review → Published UI;
- student/account/access-code management UI;
- notifications/import-export/reports/settings/audit screens;
- hosted Admin deployment, because deployment remains deferred by the Product Owner.
