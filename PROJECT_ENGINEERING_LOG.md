# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Current consolidated engineering truth. Code, PostgreSQL migrations, executable CI and live runtime evidence outrank prose. Historical detail remains in Git history, merged PRs, Issue #16 and specialized workstream documents.

Last consolidated: **2026-09-12 — UX-B01 verified/merged; UX-B02 Student Shell and Navigation implemented and code-head verified.**

## Project Understanding

الوسيلة الذكية منصة تعليمية عربية تتكون من Student Web/PWA + Super Admin Web فوق Fastify/PostgreSQL.

Student is an **installed educational app experience**, not a long responsive webpage. Implemented-era flow now has a stable authenticated shell:

`Activation/Login → Home → Learn/Curriculum → Lesson/Reader → Practice/Test → Downloads/Offline learning → Account`

UX-B02 establishes only the top-level Student shell/navigation and splits the prior aggregate composition. Reader, Assessment and Account/Downloads cleanup remain deliberately incremental in B03–B05. Admin remains untouched until B06.

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

Authenticated stable learning destinations:

`Home | Learn | Practice | Downloads`

Separate utility destination:

`Account`

Route contract:

- `/app/home`
- `/app/learn`
- `/app/practice`
- `/app/downloads`
- `/app/account`

Current feature ownership remains intentionally incremental:

- Learn mounts the existing Curriculum/Reader implementation; Reader route/shell migration is B03.
- Practice mounts the existing Assessment implementation; focused assessment route/shell redesign is B04.
- Downloads mounts the current verified offline-download implementation; full Downloads/Account/technical-copy cleanup is B05.
- access/class-code management remains temporarily reachable during migration and is finalized in B05.

No fake Personal Learning or Progress destination was introduced.

### Admin target hierarchy

`Overview → Curriculum → Content/Ingestion/OCR → AI Jobs/Human Review → Question Bank/Quizzes → Students/Access → Operations/Audit`

Admin migration begins at B06 and is untouched by B02.

## Architecture Decisions

Critical retained decisions:

- **AD-170** — Service Worker caches shell/static assets only; `/v1` excluded.
- **AD-175** — no password/session token/device private key in offline storage.
- **AD-185/186/188** — cold-offline authorization/integrity remains server-signed and browser-verified.
- **AD-190** — new work starts from refreshed live `main` on short-lived branches.
- **AD-194/215** — browser API authority remains same-origin `/v1`.
- **AD-195** — normal roadmap paused before `STUDENT-016I` for refoundation.
- **AD-202** — route/history is a product contract.
- **AD-203** — Student navigation contains implemented capabilities only.
- **AD-204** — Reader and active Assessment become focused screens only in B03/B04.
- **AD-211** — BrowserRouter is the shared routing base.
- **AD-213** — shared UI package remains framework-neutral and owns no domain authority.
- **AD-214** — route changes explicitly focus the labeled content region.

B02 decisions:

- **AD-217 — `/app/home` is the authenticated Student landing route.** `/` and `/app` canonicalize to Home; top-level Student destinations receive real history entries.
- **AD-218 — four learning destinations + Account only.** Home/Learn/Practice/Downloads are stable learning navigation; Account is a separate utility entry. No unimplemented Progress/Personal Learning destination is exposed.
- **AD-219 — Student shell is adaptive, not a scaled desktop navbar.** Phone uses bottom navigation with safe-area padding; tablet uses horizontal navigation; desktop uses a sticky rail.
- **AD-220 — B02 splits composition without rewriting feature authority.** Existing Curriculum/Reader, Assessment and Offline Downloads components keep their current security/API contracts.
- **AD-221 — global connectivity state belongs to the authenticated shell.** It is informational and does not create offline authority.
- **AD-222 — migration compatibility is executable.** Existing Stage14/15/16 browser suites enter behavior through the new shell; feature tests were not weakened to obtain green CI.
- **AD-223 — reuse loaded access state across Student destinations.** Moving from Home to Account/Learn does not issue a redundant entitlements request when access state is already loaded; direct entry still loads canonical server state. This prevents navigation from consuming a server-session-expiry signal before the user action that owns it and reduces unnecessary network work.

## Audit Findings

| ID | Severity | Area | Problem | Solution / Evidence | Status |
|---|---:|---|---|---|
| `UX-IA-101` | P1 | Routing | apps lacked route-based navigation | BrowserRouter + route foundation | FIXED / B01 VERIFIED+MERGED |
| `UX-IA-102` | P1 | Student | authenticated Student was one aggregate surface | B02 stable app shell + destination-owned mounting | FIXED AT TOP LEVEL / B03–B05 descendants remain |
| `UX-A11Y-101` | P2 | Student navigation | state-only navigation weakened history/focus | semantic nav + route focus + browser history | VERIFIED IN B02 |
| `UX-RESP-102` | P1 | Student | no installed-app mobile navigation | safe-area bottom nav + tablet nav + desktop rail | VERIFIED IN B02 |
| `UX-STATE-101` | P2 | Student | connectivity feedback was page-local | authenticated shell online/offline indicator | VERIFIED IN B02 |
| `UX-PERF-101` | P2 | Student access | navigation could refetch already-loaded entitlement state | reuse loaded access state, direct-entry load retained | FIXED / VERIFIED via Stage16 regression |
| `UX-COPY-101` | P1 | Student | technical offline/device copy remains in legacy feature surfaces | full cleanup belongs to B05 | OPEN / PARTIAL |
| `UX-IA-103` | P1 | Admin | flat/mixed Admin workspace | B06+ | OPEN |
| `STUDENT-016I` | P1 | Offline/PWA | true cold-start offline Reader not closed | resume only after B17 | PAUSED / NOT TOUCHED |
| `AI-012..AI-019` | P2 | AI | live provider readiness not proven | separate live verification | NOT YET VERIFIED |

## Changes Made — 2026-09-12

### UX-B00 — DONE / VERIFIED / MERGED

PR #42 final head `203882a934dfcb68df4a1e1e4f972583317cabf1`; **15/15 SUCCESS**; merge commit `3997ac94b47100bc1557b7622ae3c6d47058d25d`.

### UX-B01 — DONE / VERIFIED / MERGED

PR #43 final exact head `781e70eb31a48b76e50a1bad490f7aa947d2d7ce`; **20/20 SUCCESS**; merge commit/live main `9866e3b3c332d4c83b15c6e20b4cfd2972008f1b`.

### UX-B02 — Student Shell and Navigation

PR #44 / branch `ux/student-shell-navigation`.

Base: `main@9866e3b3c332d4c83b15c6e20b4cfd2972008f1b`.

Verified implementation code head before final documentation synchronization:

`3cc44b1bb9b44de3cb99a18c6cf5b2d29439c8f3`

Delivered:

- canonical authenticated Home `/app/home`;
- stable Home/Learn/Practice/Downloads + Account route-aware composition;
- mobile safe-area bottom navigation;
- tablet horizontal navigation;
- desktop sticky navigation rail;
- global authenticated online/offline indicator;
- Home overview cards and installed-app information hierarchy;
- Curriculum, Assessment and Downloads no longer render together as the old default giant Student surface;
- production-facing Arabic shell copy and RTL behavior;
- route focus, `aria-current`, browser back/history and no-overflow handling;
- existing Reader/Assessment/Offline authority preserved while E2E enters through new destinations;
- dedicated `student-shell-navigation.e2e.spec.mjs` and `.github/workflows/ux-b02-student-shell.yml`.

No Reader migration, Assessment redesign, full Downloads/Account cleanup, Admin refoundation, API/PostgreSQL/Railway change or new Stage16 implementation was performed.

## Tests & Verification

### B02 exact code-head acceptance

On exact code head `3cc44b1bb9b44de3cb99a18c6cf5b2d29439c8f3`:

**20/20 workflows SUCCESS.**

Key runs:

- `34711657358` — UX B02 Student Shell and Navigation — SUCCESS;
- `34711657422` — Stage14 Student Product — SUCCESS;
- `34711657321` — Stage15 Student Assessment — SUCCESS;
- `34711657335` — Stage16 Student PWA — SUCCESS;
- `34711657347` — UX B01 Shared Frontend Foundation — SUCCESS;
- `34711657393` — Rebuild Stage Verification — SUCCESS.

Direct B02 gate proved:

- API typecheck/build and clean migrations;
- Student lint/typecheck/unit/build;
- real Chromium at phone 390px;
- representative tablet viewport;
- desktop rail viewport;
- RTL;
- route focus + browser history;
- global offline/online indicator;
- no horizontal overflow.

Regression matrix proved:

- Stage14 activation/login/recovery/access/curriculum + Reader parity through Learn;
- Stage15 server-owned Assessment parity through Practice;
- Stage16 PostgreSQL lease/download contracts, PWA shell and IndexedDB lifecycle/materialization;
- Rebuild activation/returning-login/recovery browser flow;
- all Admin/backend path-triggered suites remain green.

### Stage16 regression found during B02

An intermediate B02 head failed the Stage16 browser lifecycle because entering Account performed a redundant entitlements reload after the server session had already been invalidated. That request consumed the 401 before the explicit refresh action expected by the lifecycle flow.

Root cause was B02 navigation request timing, not Stage16 storage/signing/authorization.

Fix:

- reuse already-loaded access state across Home → Account/Learn navigation;
- preserve canonical load on direct entry;
- do not alter offline lease/signature/materialization logic.

Proof after fix: Stage16 run `34711657335` is fully SUCCESS across PostgreSQL, PWA Chromium and lifecycle/materialization Chromium jobs.

### Final documentation head

This documentation synchronization changes the PR head after the proven code-head matrix. One final exact-head workflow pass is required before PR #44 is marked ready for review/merge.

Local container checkout remains unavailable because the execution environment cannot resolve `github.com`; repository CI is the executable source of truth.

Manual screenshot/art-direction closure is `NOT YET VERIFIED` here; B16/B17 own final visual/device closure. B02 responsive behavior itself is executable-browser verified.

## Known Issues / Remaining Work

- final exact-head CI after docs synchronization;
- Reader dedicated hierarchy/shell — B03;
- Assessment focused route/shell — B04;
- full Downloads/Account/offline technical-copy cleanup — B05;
- Admin refoundation — B06+;
- `AI-012..AI-019` live provider readiness — `NOT YET VERIFIED`;
- Stage28 Production Cutover — not complete.

Normal roadmap remains paused until UX-B17. Exact return sequence remains:

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17`
