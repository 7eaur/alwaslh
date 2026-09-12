# PROJECT STATUS — الوسيلة الذكية

> Concise execution truth. Code, PostgreSQL migrations, executable CI and live runtime evidence outrank prose. Anything not executed or inspected is `NOT YET VERIFIED`.

Last synchronized: **2026-09-12**.

## Current management state

**NORMAL ROADMAP: PAUSED**

**ACTIVE TRACK: UX/UI REFOUNDATION + DESIGN SYSTEM + STUDENT/ADMIN EXPERIENCE REMEDIATION**

**CURRENT UX BATCH: `UX-B01 — Shared frontend foundation`**

**PR: #43 — OPEN / IMPLEMENTATION VERIFIED / FINAL DOC-HEAD REVALIDATION REQUIRED**

**EXACT RETURN POINT AFTER THIS TRACK: `STUDENT-016I — True cold-start offline Reader`**

Canonical documents:

- `docs/workstreams/UX_UI_REFOUNDATION_PAUSE_2026-09-12.md`
- `docs/product/UX_UI_MASTER_AUDIT_2026-09-12.md`
- `docs/product/TARGET_INFORMATION_ARCHITECTURE.md`
- `docs/product/DESIGN_SYSTEM_SPEC.md`
- `docs/product/CONTENT_LANGUAGE_RULES.md`
- `docs/workstreams/UX_UI_REFOUNDATION_IMPLEMENTATION_ROADMAP.md`

## Live main baseline

UX-B00 closed through PR #42.

- PR #42 final head: `203882a934dfcb68df4a1e1e4f972583317cabf1`
- exact-head workflows: **15/15 SUCCESS**
- `Rebuild Stage Verification` run: `34708535728` — SUCCESS
- merge commit / live `main`: `3997ac94b47100bc1557b7622ae3c6d47058d25d`

## UX-B00 closure

Status: **DONE / VERIFIED / MERGED**.

Delivered the source-backed Master Audit, Target IA, Design System Spec, Content Language Rules, B01–B17 implementation roadmap, and corrected replacement-conversation resume path. No application/backend/database contract changed in B00.

## UX-B01 scope and state

Branch: `ux/shared-foundation`

Base: `3997ac94b47100bc1557b7622ae3c6d47058d25d`

PR: `#43 — feat(ux): establish shared frontend routing and presentation foundation`

Verified implementation head before final documentation sync:

`6acd2ce85c1b848ae34a9740be562a5d423eacfc`

Result on that exact head: **20/20 workflows SUCCESS**.

Implemented:

- framework-neutral shared `@alwaslh/ui` semantics/styles for presentation state and error mapping;
- thin app-local React presentation adapters for Student/Admin shells, PageState rendering and route focus;
- `BrowserRouter` foundation in Student and Admin;
- canonical `/app/*` route boundary, root redirect and human Arabic not-found state;
- route-focus + skip-link accessibility foundation;
- RTL route-shell contract;
- semantic loading/empty/error/offline/permission/info state patterns;
- evidence-backed app/workspace/layout/safe-area/z-index/control tokens without prematurely applying Student safe-area composition;
- official open-book app mark aligned in Student/Admin shell branding;
- targeted Playwright routing contracts for direct URL, canonical route, RTL, focus and browser history;
- dedicated UX-B01 real-Chromium workflow covering Student 390px and Admin desktop routing foundation.

Explicitly **not** moved in B01:

- Student Home/Learn/Practice/Downloads IA migration — UX-B02;
- Student Reader/Assessment workflow migration — UX-B03/B04;
- Student offline copy cleanup — UX-B05;
- Admin grouped workspace routing — UX-B06;
- backend/API/PostgreSQL contracts;
- Stage16 `016I/R/S/O/G` work.

## UX-B01 executable evidence

Exact implementation head:

`6acd2ce85c1b848ae34a9740be562a5d423eacfc`

All 20 PR-head workflows were successful:

`34709720850`, `34709720815`, `34709720841`, `34709720831`, `34709720826`, `34709720817`, `34709720829`, `34709720896`, `34709720827`, `34709720893`, `34709720881`, `34709720812`, `34709720843`, `34709720832`, `34709720858`, `34709720825`, `34709720880`, `34709720821`, `34709720835`, `34709720837`.

Key acceptance evidence:

- `UX B01 Shared Frontend Foundation` run `34709720825` — SUCCESS:
  - API/Student/Admin builds — SUCCESS;
  - migrations — SUCCESS;
  - Student routing foundation at 390px Chromium — SUCCESS;
  - Admin routing foundation at desktop Chromium — SUCCESS.
- `Stage14 Student Product` run `34709720881` — SUCCESS:
  - Student lint/typecheck/unit/build — SUCCESS;
  - real Chromium auth/access/curriculum suite at 390px — SUCCESS.
- `Stage 13E Frontend Preparation` run `34709720841` — Admin lint/typecheck/unit/build SUCCESS.
- `Stage 13 Admin Product Verification` run `34709720835` — Admin backend + real browser E2E SUCCESS.
- `Rebuild Stage Verification` run `34709720837` — SUCCESS including product, brand, UX, PostgreSQL, auth/access/activation and browser gates.
- `Stage16 Student PWA` run `34709720829` — SUCCESS, proving B01 did not regress current offline/PWA contracts.

Two CI issues were found and fixed before this verified head:

1. shared React source could not resolve app-local React dependencies; root fix made `@alwaslh/ui` framework-neutral and kept thin React adapters inside each app;
2. the first B01 workflow incorrectly injected an absolute `VITE_API_BASE_URL`, breaking canonical same-origin `/v1` unit contracts; root fix removed the override and retained the existing Vite `/v1` proxy.

Manual screenshot review in this tool environment: `NOT YET VERIFIED`. Real Chromium viewport/RTL/focus/history behavior is verified; full visual/device closure remains UX-B16/B17.

The documentation-sync commit after this evidence changes the PR head, so exact final PR-head CI must be green again before merge. Do not treat earlier runs as acceptance for a later head.

## Product contracts preserved

- API/PostgreSQL remain canonical authority;
- Auth/Authorization remain server-owned;
- Entitlements remain authoritative;
- `media ready != published`;
- AI never auto-publishes;
- human review chain remains mandatory;
- assessment scoring/finalization remains server-owned;
- `/v1` is not Service Worker Cache API authority;
- signed offline authorization/integrity/device/session rules remain unchanged.

## Target product IA

### Student

Implemented-era target destinations for B02+:

- Home
- Learn / Subjects
- Practice
- Downloads
- Account

Focused descendants:

- Subject / Lesson / Reader
- Quiz / Attempt / Assessment

Do not add Personal Learning or Progress before their roadmap stages exist.

### Super Admin

- Overview
- Curriculum
- Content / Ingestion / OCR
- AI Jobs / Human Review
- Question Bank / Quizzes
- Students / Access Codes
- Operations / Notifications / Audit / constrained System Status

Dashboard remains an overview/attention surface only.

## Stage ledger

| Stage | State |
|---|---|
| Stage1–10 + OCR | VERIFIED |
| Stage11 | VERIFIED |
| Stage12 | VERIFIED backend/runtime; `AI-012..AI-019` live provider readiness OPEN |
| Stage13A–G | VERIFIED / CLOSED / integrated |
| Stage14 Student | CLOSED / VERIFIED |
| Stage15 Practice/Assessment | CLOSED / VERIFIED |
| **Stage16 Offline/PWA** | **OPEN / PARTIALLY VERIFIED — paused during UX refoundation** |
| Stage17 | BLOCKED BY Stage16 closure |
| Stage18–29 | pending in roadmap order |

`STUDENT-016H`: **DONE / VERIFIED / MERGED**. Do not redo it.

Exact normal-roadmap continuation after refoundation:

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17`

## Known open items outside B01

- Student live authenticated same-origin E2E after PR #39 — `NOT YET VERIFIED` as a hosted-runtime item; local/CI Student browser suites are green.
- `AI-012..AI-019` live provider readiness — `NOT YET VERIFIED`.
- Student final installed-app destination composition/safe-area navigation — B02.
- Student normal UI technical offline/device copy — B05.
- Admin grouped IA and current Stage/parity/config copy — B06–B15.
- final visual/responsive/device/accessibility closure — B16/B17.
- Stage28 Production Cutover is not complete.

## Next action

Re-verify PR #43 on the exact documentation-synchronized head. If green, record the final head/run evidence in PR #43 and Issue #16 and leave B01 ready for review/merge. **Do not start UX-B02 until B01 is accepted and integrated.**
