# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Current consolidated engineering truth. Code, PostgreSQL migrations, executable CI and live runtime evidence outrank prose. Historical detail remains in Git history, merged PRs, Issue #16 and specialized workstream documents.

Last consolidated: **2026-09-12 — UX-B01 verified/merged; UX-B02 Student Shell and Navigation active from refreshed live main.**

## Project Understanding

الوسيلة الذكية منصة تعليمية عربية تتكون من Student Web/PWA + Super Admin Web فوق Fastify/PostgreSQL.

Student is an **installed educational app experience**, not a long responsive webpage. Implemented-era product flow remains:

`Activation/Login → Home → Learn/Curriculum → Lesson/Reader → Practice/Test → Downloads/Offline learning → Account`

B02 introduces the missing authenticated app shell and stable top-level destinations. It does not migrate Reader internals, Assessment internals or Stage16 offline authority.

Admin remains an operational workspace; its refoundation starts at UX-B06.

## Architecture

- `apps/student-web` — Student Web/PWA.
- `apps/admin-web` — Super Admin.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- `packages/brand` — canonical brand/design tokens.
- `packages/ui` — framework-neutral shared presentation semantics/styles from B01.
- `apps/*/src/presentation-foundation.tsx` — thin app-local React adapters.

Stable contracts preserved:

- browser is not canonical business authority;
- API + PostgreSQL own canonical state;
- Auth/Authorization and Entitlements remain server-owned;
- `media ready != published`;
- protected Reader/media remain publication + entitlement controlled;
- AI output never auto-publishes Student content/questions;
- human review remains mandatory;
- Question Bank publication and immutable Quiz versions remain authoritative;
- assessment scoring/finalization remains server-owned;
- `/v1` is never Service Worker Cache API authority;
- offline learning does not persist password/session token/device private key;
- signed offline authorization, integrity and device/session rules are unchanged.

## User Flows

### Student top-level shell — B02

Authenticated stable destinations:

`Home | Learn | Practice | Downloads`

Account is a separate entry/destination:

`Account`

Current B02 route contract:

- `/app/home`
- `/app/learn`
- `/app/practice`
- `/app/downloads`
- `/app/account`

Current feature ownership remains intentionally incremental:

- Learn mounts the existing Curriculum/Reader component; Reader route migration is B03.
- Practice mounts the existing Assessment component; assessment route/shell redesign is B04.
- Downloads mounts the existing verified offline-download component; full copy/account cleanup is B05.
- access/class-code management remains available during migration and is finalized in B05.

No fake Personal Learning or Progress destination is introduced.

### Admin target hierarchy

`Overview → Curriculum → Content/Ingestion/OCR → AI Jobs/Human Review → Question Bank/Quizzes → Students/Access → Operations/Audit`

Admin migration begins at B06 and is untouched by B02.

## Architecture Decisions

Critical retained decisions:

- **AD-170** — Service Worker caches shell/static assets only; `/v1` excluded.
- **AD-175** — no password/session token/device private key in offline storage.
- **AD-185/186/188** — cold-offline authorization/integrity remains server-signed and browser-verified.
- **AD-190** — new work starts from refreshed live `main` on short-lived branches.
- **AD-194** — browser API traffic remains same-origin `/v1`.
- **AD-195** — normal roadmap paused before `STUDENT-016I` for refoundation.
- **AD-202** — route/history is a product contract.
- **AD-203** — Student navigation contains implemented capabilities only.
- **AD-204** — Reader and active Assessment become focused screens only in B03/B04.
- **AD-211** — BrowserRouter is the shared routing base.
- **AD-213** — shared UI package remains framework-neutral and owns no domain authority.
- **AD-214** — route changes explicitly focus the labeled content region.
- **AD-215** — canonical browser API authority remains same-origin `/v1`.

B02 decisions:

- **AD-217 — `/app/home` is the authenticated Student landing route.** `/` and `/app` canonicalize to Home; feature destinations receive real history entries.
- **AD-218 — four learning destinations + Account only.** Home/Learn/Practice/Downloads are the stable learning navigation; Account is a separate utility entry. No unimplemented Progress/Personal Learning destination is exposed.
- **AD-219 — Student shell is adaptive, not a scaled desktop navbar.** Phone uses bottom navigation with safe-area padding; tablet uses a horizontal navigation surface; desktop uses a sticky rail.
- **AD-220 — B02 splits composition without rewriting feature authority.** Existing Curriculum/Reader, Assessment and Offline Downloads implementations are mounted in owning destinations and keep their API/security behavior.
- **AD-221 — global connectivity state belongs to the authenticated shell.** It informs navigation and current capability without creating any new offline authority.
- **AD-222 — migration compatibility is evidence-driven.** Existing Stage14/15/16 E2E is updated to enter behavior through new routes; tests are not weakened and feature internals are not rewritten early.

## Audit Findings

| ID | Severity | Area | Problem | Evidence / Solution | Status |
|---|---:|---|---|---|
| `UX-IA-101` | P1 | Routing | apps lacked route-based navigation | BrowserRouter + route foundation | FIXED / B01 VERIFIED+MERGED |
| `UX-IA-102` | P1 | Student | authenticated Student was one aggregate surface | B02 stable shell/destinations; B03–B05 finish descendants | IMPLEMENTED / VERIFYING |
| `UX-A11Y-101` | P2 | Student navigation | state-only navigation weakened history/focus | route focus + history + semantic nav | IMPLEMENTED / VERIFYING |
| `UX-RESP-102` | P1 | Student | authenticated app lacked installed-app mobile navigation | bottom nav + safe area + tablet/desktop adaptation | IMPLEMENTED / VERIFYING |
| `UX-STATE-101` | P2 | Student | connectivity feedback was page-local | authenticated shell network indicator | IMPLEMENTED / VERIFYING |
| `UX-COPY-101` | P1 | Student | technical offline/device copy remains in legacy feature surfaces | B02 improves shell copy; full cleanup belongs to B05 | OPEN / PARTIAL |
| `UX-IA-103` | P1 | Admin | flat/mixed Admin workspace | B06+ | OPEN |
| `STUDENT-016I` | P1 | Offline/PWA | true cold-start offline Reader not closed | resume only after B17 | PAUSED / NOT TOUCHED |
| `AI-012..AI-019` | P2 | AI | live provider readiness not proven | separate live verification | NOT YET VERIFIED |

## Changes Made — 2026-09-12

### UX-B00 — DONE / VERIFIED / MERGED

PR #42 final head `203882a934dfcb68df4a1e1e4f972583317cabf1`; **15/15 SUCCESS**; merge commit `3997ac94b47100bc1557b7622ae3c6d47058d25d`.

### UX-B01 — DONE / VERIFIED / MERGED

PR #43:

- final exact head `781e70eb31a48b76e50a1bad490f7aa947d2d7ce`;
- **20/20 workflows SUCCESS**;
- key runs:
  - `34709990523` — UX B01 Shared Frontend Foundation — SUCCESS;
  - `34709990570` — Stage14 Student Product — SUCCESS;
  - `34709990527` — Stage13E Frontend Preparation — SUCCESS;
  - `34709990477` — Stage13 Admin Product — SUCCESS;
  - `34709990577` — Stage16 Student PWA — SUCCESS;
  - `34709990489` — Rebuild Stage Verification — SUCCESS;
- merge commit/live main: `9866e3b3c332d4c83b15c6e20b4cfd2972008f1b`.

B01 introduced shared routing/presentation/accessibility foundations only.

### UX-B02 — Student Shell and Navigation

Branch: `ux/student-shell-navigation`

Base: `main@9866e3b3c332d4c83b15c6e20b4cfd2972008f1b`

Implementation in progress:

- canonicalized authenticated entry to `/app/home`;
- added Home/Learn/Practice/Downloads/Account route-aware composition;
- replaced default aggregate composition with destination-owned mounting of Curriculum, Assessment and Downloads;
- added Home overview cards;
- added mobile bottom navigation with safe-area handling;
- added tablet horizontal navigation and desktop sticky rail;
- added authenticated global connection/offline status and Account entry;
- preserved existing Auth/Access/Curriculum/Reader/Assessment/Offline implementations and authority;
- migrated Reader, Assessment, Downloads and lease E2E entry behavior to use shell navigation rather than old aggregate ordering;
- added dedicated `student-shell-navigation.e2e.spec.mjs` for 390px/tablet/desktop, RTL, route focus, history and offline status;
- added `.github/workflows/ux-b02-student-shell.yml` as direct B02 quality/browser gate.

Explicitly not changed:

- Reader internals/routes — B03;
- Assessment internals/routes — B04;
- full Downloads/Account/offline copy cleanup — B05;
- Admin — B06+;
- API/PostgreSQL/Railway;
- any new Stage16 implementation.

## Tests & Verification

### UX-B01 final acceptance

Exact final head `781e70eb31a48b76e50a1bad490f7aa947d2d7ce`: **20/20 SUCCESS**, then merged as `9866e3b3c332d4c83b15c6e20b4cfd2972008f1b`.

### UX-B02

Local checkout/testing remains unavailable in the current execution container because `github.com` DNS resolution is unavailable there. Repository CI is therefore the executable verification source.

Required before acceptance:

- Student lint/typecheck/unit/build;
- dedicated B02 Chromium shell suite at phone/tablet/desktop widths;
- Stage14 activation/login/recovery/access/curriculum regression through the new shell;
- Reader behavior parity through Learn navigation without B03 migration;
- Stage15 assessment parity through Practice navigation without B04 redesign;
- Stage16 PWA/download/lease regression without adding `016I` work;
- route focus/history/RTL/no-overflow checks;
- exact-head full path-triggered workflow matrix.

Current state: **IMPLEMENTATION IN PROGRESS / CI NOT YET VERIFIED**.

Manual screenshot review: `NOT YET VERIFIED`; final visual/device closure remains B16/B17. Executable viewport checks are part of B02 acceptance now.

## Known Issues / Remaining Work

- verify B02 exact-head CI and fix real regressions at root cause;
- full Student technical-copy cleanup waits for B05;
- Reader dedicated hierarchy/shell waits for B03;
- Assessment focused route/shell waits for B04;
- Admin refoundation waits for B06+;
- `AI-012..AI-019` live provider readiness remains `NOT YET VERIFIED`;
- Stage28 Production Cutover is not complete.

Normal roadmap remains paused until UX-B17. Exact return sequence remains:

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17`
