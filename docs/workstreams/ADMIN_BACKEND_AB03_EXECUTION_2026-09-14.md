# Admin + Backend AB-03 Execution — End-to-end vertical slices

Date: **2026-09-15**  
Branch: `rebuild/super-admin-foundation`  
Draft PR: #52 — remain Draft / unmerged / no auto-merge.  
Status: **ACTIVE — AB-03.6 Students**

## Scope and order

AB-03 migrates complete Admin vertical slices in canonical order: Overview + Operations → Curriculum + Content + OCR → AI Jobs/Review/authoring → Question Bank → Quiz Builder → Students → Access Codes.

Each slice follows `job → DB/API/security → backend boundary correction → IA/states/actions → frontend owner → integration/browser parity → switch → delete legacy`.

## AB-03.1 — Overview + Operations — DONE / EXACT-SOURCE VERIFIED
Final executable source checkpoint: `7eda86fbbd7cbdcd5f2197ef35db7557c0d210dc`.

## AB-03.2 — Curriculum + Content + OCR — DONE / EXACT-HEAD VERIFIED
Final executable/source checkpoint: `3a45d18d5e4e69ef77a818e4917450c9c2b94214`.

## AB-03.3 — AI Jobs / Review / Authoring — DONE / EXACT-SOURCE VERIFIED
Final executable/source checkpoint: `9b38c9d2f803e220874a40e71ac06399e78435a3`.

## AB-03.4 — Question Bank — DONE / EXACT-HEAD VERIFIED
Final executable/source checkpoint: `a5e76461234bd42a29984ffb5d1a587bdbc3092a`.

## AB-03.5 — Quiz Builder — DONE / EXACT-HEAD VERIFIED
Final executable/source checkpoint: `f60a4b279fad9a011f9188005dd3ad075c7e3f00`.

Sequence 84 feature-owned the Quiz Builder API/application transport; Sequence 85 feature-owned List/Create/Detail/Metadata presentation; Sequence 86 feature-owned specialized export/print contracts and transport; Sequence 87 retired only compatibility page facades proven dead and completed the closure scan.

Sequence 87 closure findings:
- router no longer consumed `admin/quizzes/*`;
- the four old page files were dead one-line re-exports and were deleted;
- root `quiz-builder-api.ts` still has real feature-page consumers and remains compatibility-only;
- mixed `admin-ai-authoring-api.ts` still has a real `AdminAiAuthoringWorkspace` consumer and remains compatibility-only;
- neither retained facade owns Quiz Builder implementation;
- backend `apps/api/src/quiz-builder/*` remains canonical with no defect requiring a rewrite.

Exact-head evidence on `f60a4b279fad9a011f9188005dd3ad075c7e3f00`:
- Architecture Guard `35022098967` — SUCCESS;
- Frontend Preparation `35022099016` — SUCCESS;
- Admin AI `35022098946` — SUCCESS;
- Combined Integration `35022098947` — SUCCESS including clean PostgreSQL/backend/security regressions and real Admin Chromium;
- Stage13G `35022099002` — SUCCESS including Admin backend/UI and Real API + PostgreSQL + Chromium.

## AB-03.6 — Students — NEXT

Fresh pre-scan evidence:
- current presentation is `apps/admin-web/src/admin/students/AdminStudentsPage.tsx`;
- Student frontend contracts/actions are mixed with Access Code contracts/actions inside `apps/admin-web/src/admin-student-access-api.ts`;
- the mixed unit test has two Access Code test groups followed by two Student-specific test groups;
- Student list/detail backend routes are already owned by `apps/api/src/admin-access/http.ts`, protected by explicit admin authorization and bounded Zod validation;
- Student recovery/device-rebind/entitlement mutations reuse existing auth/access authority, and Stage13G Access/Auth regressions are green;
- no backend/database defect has been identified for the first Students increment.

### AB-03.6.1 Students feature-owner foundation — NEXT

Split only Student-owned frontend contracts/actions and Student-specific tests into `features/students`, expose a narrow public boundary, retain root compatibility for the live Students page, and leave Access Code ownership intact for its later slice. Preserve exact endpoints/query serialization/payload/auth behavior; no Students UI redesign or backend/database mutation in this increment.

## Main reconciliation

Live `main`: `3646a63e36d9d9d967bdeb0c8a97ee65055cd672`. It contains authoritative offline-content API/PostgreSQL changes. Reconciliation remains `REQUIRED / DEFERRED` before overlapping backend/database mutation and before AB-08 final verification.
