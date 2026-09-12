# PROJECT STATUS — الوسيلة الذكية

> Concise execution truth. Code, PostgreSQL migrations, executable CI and live runtime evidence outrank prose. Anything not executed or inspected is `NOT YET VERIFIED`.

Last synchronized: **2026-09-12**.

## Current management state

**NORMAL ROADMAP: PAUSED**

**ACTIVE TRACK: UX/UI REFOUNDATION + DESIGN SYSTEM + STUDENT/ADMIN EXPERIENCE REMEDIATION**

**CURRENT UX BATCH: `UX-B01 — Shared frontend foundation`**

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

PR #41 project-skill package remains integrated at:

`.agents/skills/alwaslh-product-engineering/SKILL.md`

## UX-B00 closure

Status: **DONE / VERIFIED / MERGED**.

Delivered:

- full Student/Admin UX/UI source inventory;
- KEEP / IMPROVE / REFACTOR / REBUILD / REMOVE classification;
- target Student/Admin information architecture;
- shared design-system specification;
- production content-language rules;
- incremental B01–B17 implementation roadmap;
- corrected `DOCUMENTATION_INDEX.md` so replacement conversations do not resume Stage16 while UX refoundation is active.

No application/backend/database contract changed in B00.

## UX-B01 current scope

Branch: `ux/shared-foundation`

Base: `3997ac94b47100bc1557b7622ae3c6d47058d25d`

Implemented on branch, verification pending:

- shared `@alwaslh/ui` presentation foundation;
- BrowserRouter entry foundation for Student and Admin;
- canonical `/app` route boundary with SPA-compatible direct URL behavior;
- route-focus + skip-link accessibility foundation;
- presentation-ready PageState semantics for loading/empty/error/offline/permission/info;
- product error mapping layer for session/permission/connectivity/service/validation/unknown states;
- evidence-backed shared layout/safe-area/z-index/control tokens;
- official open-book app mark aligned in Student/Admin shell branding;
- focused Playwright routing contracts for direct URL, canonical route, focus and browser history.

Explicitly **not** moved in B01:

- Student Home/Learn/Practice/Downloads IA migration — UX-B02;
- Student Reader/Assessment workflow migration — UX-B03/B04;
- Admin grouped workspace routing — UX-B06;
- backend/API/PostgreSQL contracts;
- Stage16 `016I/R/S/O/G` work.

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

Implemented-era target destinations:

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

## UX-B01 verification state

Required before PR acceptance:

- Student lint;
- Student strict typecheck;
- Student unit tests;
- Student production build;
- Student real Chromium suite including routing foundation;
- Admin lint;
- Admin strict typecheck;
- Admin unit tests;
- Admin production build;
- applicable Admin Chromium suites including routing foundation;
- exact-head GitHub Actions;
- responsive/RTL/keyboard inspection for changed foundation surfaces.

Current result: **NOT YET VERIFIED — branch implementation exists; PR/CI evidence pending.**

## Known open items outside B01

- Student live authenticated same-origin E2E after PR #39 — `NOT YET VERIFIED`.
- `AI-012..AI-019` live provider readiness — `NOT YET VERIFIED`.
- visual/device closure for redesigned Student/Admin flows — later refoundation batches.
- Stage21/22/24 final performance/security/accessibility gates remain later roadmap stages.
- Stage28 Production Cutover is not complete.

## Next action

Finish UX-B01 verification, open/validate its independent PR from `ux/shared-foundation`, record exact head/run evidence in Issue #16 and PR metadata, and merge only after green evidence. Do not start UX-B02 before B01 is accepted.
