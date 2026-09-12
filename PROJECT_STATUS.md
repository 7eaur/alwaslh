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
- key acceptance runs:
  - `UX B01 Shared Frontend Foundation` `34709990523` — SUCCESS
  - `Stage14 Student Product` `34709990570` — SUCCESS
  - `Stage 13E Frontend Preparation Verification` `34709990527` — SUCCESS
  - `Stage 13 Admin Product Verification` `34709990477` — SUCCESS
  - `Stage16 Student PWA` `34709990577` — SUCCESS
  - `Rebuild Stage Verification` `34709990489` — SUCCESS
- PR #43 merge commit: `9866e3b3c332d4c83b15c6e20b4cfd2972008f1b`
- verified live `main`: `9866e3b3c332d4c83b15c6e20b4cfd2972008f1b`

UX-B00 and UX-B01 must not be redone.

## UX-B02 current state

Branch: `ux/student-shell-navigation`

Base: `main@9866e3b3c332d4c83b15c6e20b4cfd2972008f1b`

Status: **IMPLEMENTED IN PROGRESS / VERIFICATION PENDING**.

Implemented so far:

- canonical authenticated Student entry at `/app/home`;
- stable destinations:
  - `/app/home`
  - `/app/learn`
  - `/app/practice`
  - `/app/downloads`
  - `/app/account`;
- mobile bottom navigation with safe-area handling;
- tablet horizontal navigation and desktop rail composition;
- global authenticated connection/offline status;
- Account entry separated from the four learning destinations;
- Home overview with clear entry cards instead of the old single long learning surface;
- existing Curriculum, Assessment and Downloads components mounted only in their owning destination;
- access/class-code management retained temporarily for lifecycle compatibility and Account migration work in B05;
- route focus/history/RTL foundation preserved from B01;
- Reader remains inside the current Curriculum component and Assessment remains inside the current Assessment component — their redesign/migration is deliberately deferred to B03/B04;
- Stage14/15/16 browser contracts are being migrated to reach existing behavior through the new shell routes, not weakened;
- dedicated `UX B02 Student Shell and Navigation` CI gate added for Student lint/typecheck/unit/build plus real Chromium phone/tablet/desktop shell verification.

## UX-B02 explicit non-goals

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

## UX-B02 verification required before acceptance

- Student lint;
- strict typecheck;
- unit tests;
- production build;
- real Chromium at 390px;
- representative tablet verification;
- desktop adaptive navigation verification;
- RTL;
- route focus and browser back/history;
- activation/login/recovery regression;
- Reader behavior parity through Learn navigation, without Reader migration;
- Stage15 assessment behavior parity through Practice navigation, without Assessment redesign;
- Stage16 current offline/PWA/download/lease regression gates;
- exact-head GitHub Actions.

Current result: **NOT YET VERIFIED — implementation branch exists; PR/exact-head CI pending.**

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

Finish UX-B02 browser-compatible implementation, run exact-head CI and device/browser verification, fix real regressions at root cause, open the independent B02 PR, record exact head/run evidence in PR + Issue #16, and do **not** begin UX-B03 until B02 is accepted and integrated.
