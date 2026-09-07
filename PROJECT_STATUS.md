# PROJECT STATUS

- **Current Phase:** Stage13 Super Admin Product — Admin Web curriculum management **IMPLEMENTED / VERIFICATION PENDING** on top of the verified Curriculum backend foundation.
- **Planning branch / PR:** `planning/product-evolution-review` / draft PR #12.
- **Latest fully verified executable baseline:** `6484677dffa80ca0658ce5837750d824e1bb6943`.
- **Current Admin Curriculum implementation commit:** `f4d5c4fed02ee0793efc4ecb68d91e3a83bf56cc` — **VERIFICATION PENDING**.
- **Current reconciled branch head:** `936cbe5a5041a38f228c3d6e01c4ca74f5277e75` once the branch ref is advanced to the merge commit.
- **Deployment:** `DEFERRED BY PRODUCT OWNER`. Hosted Student/Admin/API/media/OCR/AI worker runtime remains `NOT YET VERIFIED`.

## Latest fully verified same-head matrix

Exact executable head: `6484677dffa80ca0658ce5837750d824e1bb6943`.

- Stage13 Curriculum Verification backend job `34092024879` — **SUCCESS**.
- Stage12 AI Execution Verification `34092024902` — **SUCCESS**.
- Stage11 AI Contract Verification `34092024875` — **SUCCESS**.
- OCR Foundation Verification `34092024895` — **SUCCESS**.
- Stage10 Media Pipeline `34092024854` — **SUCCESS**.
- Stage9 Content Import Verification `34092024883` — **SUCCESS**.
- Rebuild Stage Verification `34092024916` — **SUCCESS**, including Chromium Student activation/login/recovery E2E.

The verified backend hierarchy remains:

```text
Class / Grade
→ Subject Offering (`subject_class_links`)
→ Unit / Section (optional)
→ Lesson
→ Content / pages / resources
```

`subject_class_links` remains the only Subject Offering authority. `curriculum_sections` is one optional layer only. `lessons.section_id` is nullable and protected by the verified cross-offering composite FK. Stage9 source inventory remains provenance evidence and never silently defines curriculum hierarchy.

## Current isolated batch — Admin Curriculum Web

The previous `apps/admin-web` was a static Foundation shell with no session restore, API client or product operations. This batch classifies it as **REBUILD inside the same Admin surface** while preserving shared Brand tokens and the separate Admin product boundary.

Implemented browser architecture:

```text
Admin Web
→ GET /v1/admin/me session restore
→ POST /v1/auth/login when signed out
→ HttpOnly server session
→ GET /v1/admin/curriculum
→ Admin-only mutation routes
→ authoritative snapshot refresh after mutation
```

Current UI operations:

- Admin login, session restore and server-backed logout;
- real curriculum counts only; no placeholder operational metrics;
- create Class and Subject;
- create Class↔Subject Offering;
- create optional Section/Unit;
- create sectioned or unsectioned Lesson;
- rename Class/Subject/Section/Lesson;
- edit explicit Class/Offering/Section/Lesson ordering;
- edit `active | inactive | archived` lifecycle state;
- move Lesson between Sections or detach it to the Offering root;
- loading, empty, network-error and mutation-feedback states;
- responsive RTL Admin layout;
- future Admin modules visibly marked as later work rather than dead interactive controls;
- no destructive DELETE UI.

Implementation is split into:

- `apps/admin-web/src/admin-api.ts` — typed browser API/session contract;
- `apps/admin-web/src/LoginScreen.tsx` — Admin-only authentication UX;
- `apps/admin-web/src/CurriculumWorkspace.tsx` — curriculum hierarchy operations;
- `apps/admin-web/src/App.tsx` — session/shell ownership only;
- `docs/admin/STAGE13_ADMIN_CURRICULUM_UI.md` — detailed contract and verification gate.

Correctness decisions before CI:

1. Admin password input is passed exactly as entered; only the identifier is trimmed. The UI does not alter credential semantics.
2. Logout does not claim local success if the server logout request fails; failure routes through explicit session error/recovery instead of pretending the server session was revoked.
3. The implementation/status branch divergence created during Git writing is reconciled by explicit merge commit `936cbe5a5041a38f228c3d6e01c4ca74f5277e75`, preserving both histories rather than force-rewriting or hiding the mistake.

## Verification gate for current batch

Do **not** promote the verified baseline until one exact implementation head passes:

1. Admin ESLint;
2. strict TypeScript typecheck;
3. Admin API-client Vitest tests;
4. Admin production build with explicit `VITE_API_BASE_URL`;
5. existing Stage13 backend clean PostgreSQL + API integration tests;
6. fresh-PostgreSQL Chromium Admin E2E:
   - unauthenticated login screen;
   - Admin login;
   - Class + Subject + Offering + Section + Lesson creation;
   - Lesson move, rename and status mutation;
   - browser reload + session restoration;
   - logout;
   - narrow-viewport overflow check;
7. lower-layer Stage12/11/OCR/10/9 regressions;
8. Full Rebuild including existing Chromium coverage.

Current Admin Curriculum UI status: **NOT YET VERIFIED** until those gates pass.

## Stable Stage12 and AI boundary

Stage12 backend lifecycle/runtime remains **VERIFIED** on the last green baseline. Still intentionally `NOT YET VERIFIED`:

- authorized live AI provider adapters/credentials;
- live provider/model benchmark;
- production route/model defaults;
- production live-provider worker bootstrap;
- hosted worker runtime;
- current provider prices and actual billing reconciliation.

Do not invent fake production routes/adapters to close those boundaries.

## Next ordered engineering work

1. Close/fix the Admin Curriculum Web batch from CI/browser evidence only; no test weakening.
2. After same-head green closure, update `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, `PROJECT_HANDOFF.md`, `DOCUMENTATION_INDEX.md`, specialized Admin docs, and legacy coverage evidence with exact commit/run IDs.
3. Continue Stage13 content/media/OCR management surfaces while preserving Stage9/10/OCR authority boundaries.
4. Add AI job operations/review UI against verified Stage12 contracts; no second queue/client-owned progress.
5. Resolve AI `direct` question persistence before Question Bank publish workflows depend on it.
6. Continue students/codes/recovery/device rebind, notifications, import/export/reports/settings/audit according to Stage13 coverage gates.
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

**Admin Curriculum Web:** **IMPLEMENTED / VERIFICATION PENDING**.

**Deployment:** `DEFERRED BY PRODUCT OWNER`.
