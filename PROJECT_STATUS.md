# PROJECT STATUS

- **Current Phase:** Stage13 Super Admin Product — Admin Web curriculum management **IMPLEMENTED / VERIFICATION PENDING**.
- **Planning branch / PR:** `planning/product-evolution-review` / draft PR #12.
- **Latest fully verified executable baseline:** `6484677dffa80ca0658ce5837750d824e1bb6943`.
- **Current Admin Curriculum executable implementation head:** `b2f7eb8277de1c2de841ad050b3a416f2ecfeee7` — **VERIFICATION PENDING**.
- **Deployment:** `DEFERRED BY PRODUCT OWNER`. Hosted Student/Admin/API/media/OCR/AI worker runtime remains `NOT YET VERIFIED`.

## Latest fully verified same-head matrix

Exact verified executable head: `6484677dffa80ca0658ce5837750d824e1bb6943`.

- Stage13 Curriculum backend `34092024879` — SUCCESS.
- Stage12 AI Execution `34092024902` — SUCCESS.
- Stage11 AI Contracts `34092024875` — SUCCESS.
- OCR Foundation `34092024895` — SUCCESS.
- Stage10 Media `34092024854` — SUCCESS.
- Stage9 Content Import `34092024883` — SUCCESS.
- Full Rebuild `34092024916` — SUCCESS including Chromium.

## Verified curriculum backend contract

```text
Class / Grade
→ Subject Offering (`subject_class_links`)
→ Unit / Section (optional)
→ Lesson
→ Content / pages / resources
```

`subject_class_links` remains the only Subject Offering authority. `curriculum_sections` is one optional layer only. `lessons.section_id` is nullable and cross-offering assignment is blocked by PostgreSQL. Stage9 source inventory remains provenance evidence, not curriculum authority.

## Current isolated batch — Admin Curriculum Web

The previous `apps/admin-web` was a static shell without session restore, API integration or real curriculum operations. It is classified **REBUILD inside the same Admin surface** while preserving Brand tokens and the separate Super Admin product boundary.

Implemented architecture:

```text
Admin Web
→ GET /v1/admin/me
→ POST /v1/auth/login when signed out
→ HttpOnly server session
→ GET /v1/admin/curriculum
→ Admin-only mutation routes
→ authoritative snapshot refresh after successful mutation
```

Implemented UI behavior:

- Admin login and automatic session restoration;
- server-backed logout;
- real curriculum counts only, no fake dashboard metrics;
- create Class / Subject / Subject Offering / optional Section / Lesson;
- sectioned and unsectioned lessons;
- rename Class/Subject/Section/Lesson;
- edit Class/Offering/Section/Lesson ordering;
- edit `active | inactive | archived` state;
- move a lesson between sections or detach it to the Offering root;
- explicit loading, empty, network-error and mutation-feedback states;
- RTL responsive Admin layout;
- future modules are visibly marked as later work instead of dead interactive controls;
- no destructive DELETE UI.

Code ownership:

- `apps/admin-web/src/App.tsx` — session + shell ownership;
- `apps/admin-web/src/LoginScreen.tsx` — Admin credential UX;
- `apps/admin-web/src/admin-api.ts` — typed API/session client;
- `apps/admin-web/src/CurriculumWorkspace.tsx` — curriculum operations;
- `docs/admin/STAGE13_ADMIN_CURRICULUM_UI.md` — detailed contract.

Correctness fixes made before CI:

1. Password input is passed exactly as entered; only the identifier is trimmed.
2. Logout does not pretend success if the server request fails.
3. A Git write divergence created while recording the implementation was repaired with an explicit merge commit instead of force-rewriting history. `b2f7eb82…` contains both implementation and documentation ancestry.

## Verification gate for current batch

Do **not** promote the verified baseline until one exact executable head passes:

1. Admin ESLint;
2. strict TypeScript typecheck;
3. Admin Vitest API-client tests;
4. Admin production build with explicit `VITE_API_BASE_URL`;
5. Stage13 backend clean PostgreSQL + API integration tests;
6. fresh-PostgreSQL Chromium Admin E2E proving login → create hierarchy → lesson move/rename/status → reload/session restore → logout;
7. narrow viewport overflow check;
8. Stage12/11/OCR/10/9 regressions;
9. Full Rebuild including existing Chromium coverage.

Current Admin Curriculum UI: **NOT YET VERIFIED** until these gates pass.

## Stable lower-layer boundaries

- Stage12 backend lifecycle/runtime remains VERIFIED on the last green baseline.
- Stage9 source inventory remains 15 roots / 48 source documents / 5,552 images.
- Stage10 media checksum/order remains authoritative source evidence.
- only reviewed/approved OCR is approved downstream text evidence.
- Student auth/device rules remain unchanged.
- Question Bank still persists only `multiple_choice | true_false`; AI `direct` remains reviewable output only.
- configured AI budget reservations are safety ceilings, not invoice truth.

Still intentionally `NOT YET VERIFIED`:

- authorized live AI provider adapters/credentials;
- live provider/model benchmark;
- production AI route/model defaults;
- production live-provider worker bootstrap;
- hosted worker runtime;
- hosted Admin/Student/API runtime while deployment is deferred.

## Next ordered work

1. Close or fix Admin Curriculum Web from CI/browser evidence only.
2. On green closure update Status/Engineering Log/Handoff/Documentation Index/specialized Admin docs and legacy coverage with exact run IDs.
3. Continue Stage13 content/media/OCR surfaces.
4. Continue Stage13 AI operations using the existing Stage12 queue/runtime only.
5. Resolve `direct` Question Bank persistence before publish flows depend on it.
6. Continue students/codes/recovery/device-rebind, notifications, import-export, reports, settings and audit.
7. Keep deployment disabled until explicit Product Owner re-enable instruction.

## Repository housekeeping

`tmp-unused-do-not-use` remains P3 repository noise only; it has no unique code and is not used by PR #12.

## Last build/test

**Last fully green executable head:** `6484677dffa80ca0658ce5837750d824e1bb6943`.

**Current executable implementation head:** `b2f7eb8277de1c2de841ad050b3a416f2ecfeee7` — **VERIFICATION PENDING**.

**Deployment:** `DEFERRED BY PRODUCT OWNER`.
