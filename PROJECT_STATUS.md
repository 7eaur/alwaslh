# PROJECT STATUS — الوسيلة الذكية

> Concise execution truth. Code, PostgreSQL migrations, executable CI and live runtime evidence outrank prose. Anything not executed or inspected is `NOT YET VERIFIED`.

Last synchronized: **2026-09-12**.

## Current management state

**NORMAL ROADMAP: PAUSED**

**ACTIVE TRACK: UX/UI REFOUNDATION + DESIGN SYSTEM + STUDENT/ADMIN EXPERIENCE REMEDIATION**

**CURRENT UX BATCH: `UX-B02 — Student Shell and Navigation`**

**EXACT RETURN POINT AFTER THIS TRACK: `STUDENT-016I — True cold-start offline Reader`**

Canonical roadmap: `docs/workstreams/UX_UI_REFOUNDATION_IMPLEMENTATION_ROADMAP.md`.

## Live main baseline

UX-B01 is closed and integrated.

- PR #43 final head: `781e70eb31a48b76e50a1bad490f7aa947d2d7ce`
- exact-head workflows: **20/20 SUCCESS**
- PR #43 merge commit / verified live `main`: `9866e3b3c332d4c83b15c6e20b4cfd2972008f1b`

UX-B00 and UX-B01 must not be redone.

## UX-B02 current state

PR: **#44** — `feat(student): establish installed-app shell and navigation`

Branch: `ux/student-shell-navigation`

Base: `main@9866e3b3c332d4c83b15c6e20b4cfd2972008f1b`

Verified implementation head before this documentation synchronization:

`3cc44b1bb9b44de3cb99a18c6cf5b2d29439c8f3`

Result on that exact code head: **20/20 workflows SUCCESS**.

Key runs:

- `UX B02 Student Shell and Navigation` — `34711657358` — SUCCESS;
- `Stage14 Student Product` — `34711657422` — SUCCESS;
- `Stage15 Student Assessment` — `34711657321` — SUCCESS;
- `Stage16 Student PWA` — `34711657335` — SUCCESS;
- `UX B01 Shared Frontend Foundation` — `34711657347` — SUCCESS;
- `Rebuild Stage Verification` — `34711657393` — SUCCESS.

The documentation synchronization commit creates the final PR head and therefore requires one final exact-head workflow pass before PR #44 can be marked acceptance-ready.

## UX-B02 delivered scope

- canonical authenticated Student entry at `/app/home`;
- stable top-level destinations:
  - `/app/home`
  - `/app/learn`
  - `/app/practice`
  - `/app/downloads`;
- separate `/app/account` entry;
- mobile bottom navigation with safe-area handling;
- tablet horizontal adaptive navigation;
- desktop sticky navigation rail;
- authenticated global connection/offline indicator;
- Home overview with clear learning entry points instead of the old giant default surface;
- Curriculum mounted only under Learn;
- Assessment mounted only under Practice;
- current verified Offline Downloads mounted only under Downloads;
- access/class-code management retained temporarily for migration compatibility and final Account cleanup in B05;
- RTL, route focus, browser history/back and no-overflow contracts;
- production-facing Arabic shell copy;
- dedicated phone/tablet/desktop Chromium verification.

The old `StudentAccessSection` no longer acts as one giant visible surface containing Curriculum + Assessment + Downloads together. Its current file remains a migration orchestrator only until B03–B05 move descendant concerns into their final boundaries.

## UX-B02 regression found and fixed

During exact-head verification, Stage16 initially exposed a B02 navigation timing regression: opening Account after the server invalidated a session caused an unnecessary automatic entitlements reload to consume the 401 before the explicit access refresh action.

Root-cause fix:

- reuse already-loaded access state when moving from Home to Account/Learn;
- avoid redundant entitlements request;
- preserve direct-entry loading behavior;
- do not alter Stage16 signed offline authorization, IndexedDB lifecycle, materialization or Service Worker authority.

Verification after the fix:

- `Stage16 Student PWA` run `34711657335` — **SUCCESS**;
- PostgreSQL lease/download contracts — SUCCESS;
- PWA app-shell Chromium — SUCCESS;
- lifecycle/materialization Chromium — SUCCESS.

## UX-B02 explicit non-goals preserved

Not part of this batch:

- Reader route/shell migration — UX-B03;
- Assessment redesign/route migration — UX-B04;
- full Downloads/Account/offline technical-copy cleanup — UX-B05;
- any Admin refoundation — UX-B06+;
- `STUDENT-016I/R/S/O/G` or any new Stage16 implementation;
- API/PostgreSQL/Railway/business-rule changes.

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

`STUDENT-016H`: **DONE / VERIFIED / MERGED**.

Exact normal-roadmap continuation after UX-B17 remains:

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17`

## UX-B02 verification evidence

Verified on code head `3cc44b1bb9b44de3cb99a18c6cf5b2d29439c8f3`:

- Student lint — PASS;
- strict typecheck — PASS;
- unit tests — PASS;
- production build — PASS;
- API build/migrations in dedicated B02 gate — PASS;
- real Chromium at 390px — PASS;
- representative tablet navigation — PASS;
- desktop rail navigation — PASS;
- RTL — PASS;
- route focus + browser back/history — PASS;
- no horizontal overflow — PASS;
- global online/offline state — PASS;
- Stage14 activation/login/recovery/access/curriculum + Reader parity — PASS;
- Stage15 assessment parity through Practice — PASS;
- Stage16 PWA/download/lease/lifecycle regression — PASS;
- Rebuild activation browser regression — PASS;
- complete workflow matrix — **20/20 SUCCESS**.

Manual screenshot/art-direction closure remains `NOT YET VERIFIED` here and belongs to the later visual/device closure batches B16/B17; executable responsive browser evidence is complete for B02 acceptance.

## Known open items outside B02

- Student hosted live authenticated same-origin E2E after PR #39 — `NOT YET VERIFIED` as a hosted-runtime item.
- `AI-012..AI-019` live provider readiness — `NOT YET VERIFIED`.
- Reader information architecture and dedicated Reader shell — B03.
- Assessment route/shell redesign — B04.
- Student Downloads/Account and technical offline-copy closure — B05.
- Admin grouped IA and workflow migration — B06–B15.
- final visual/responsive/device/accessibility closure — B16/B17.
- Stage28 Production Cutover — not complete.

## Next action

Run one final exact-head CI pass after this documentation synchronization. If green, record the final SHA/run IDs in PR #44 and Issue #16 and leave UX-B02 ready for review/merge. Do **not** start UX-B03 in this batch.
