# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Current consolidated engineering truth. Code, PostgreSQL migrations, executable CI and live runtime evidence outrank prose. Historical detail remains in Git history, merged PRs, Issue #16 and specialized workstream documents.

Last consolidated: **2026-09-12 — UX-B00 verified/merged; UX-B01 shared frontend foundation implemented on branch and awaiting exact-head verification.**

## Project Understanding

الوسيلة الذكية منصة تعليمية عربية تتكون من Student Web/PWA + Super Admin Web فوق Fastify/PostgreSQL.

Student is an **installed educational app experience**, not a small responsive website. Current implemented-era flow remains:

`Activation/Login → Subjects/Curriculum → Lesson/Reader → Practice/Test → Offline learning`

The refoundation adds the missing Home/navigation/page architecture incrementally. Personal Learning and Progress remain later roadmap capabilities and must not be represented as implemented destinations.

Admin is an **operational workspace** around:

`Curriculum → Content/Ingestion → Media/OCR → AI → Human Review → Question Bank → Quiz Builder → Students/Access → Operations/Audit`

Approved identity remains Arabic-first, RTL-first, calm educational, teal/open-book, Cairo typography, Student touch-first and Admin dense-but-readable.

## Architecture

- `apps/student-web` — Student Web/PWA.
- `apps/admin-web` — Super Admin.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- `packages/brand` — canonical brand/design tokens.
- `packages/ui` — B01 shared semantic presentation foundation; contains no business authority.

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

### Student target hierarchy

Unauthenticated future route migration:

`Activation / Login / Recovery`

Authenticated implemented-era stable destinations after B02:

`Home → Learn → Practice → Downloads → Account`

Focused descendants:

`Subject → Lesson → Reader`

`Quiz → Attempt → Assessment`

B01 does **not** migrate those feature routes yet. It introduces only the shared BrowserRouter/app boundary required for later batches.

### Admin target hierarchy

`Overview`

`Curriculum`

`Content / Ingestion / OCR`

`AI Jobs / Human Review`

`Question Bank / Quizzes`

`Students / Access Codes`

`Operations / Notifications / Audit / constrained System Status`

Admin workflow route migration begins in B06; B01 only establishes the router/shell primitives.

## Architecture Decisions

Existing critical decisions retained:

- **AD-170** — Service Worker caches shell/static assets only; `/v1` excluded.
- **AD-175** — no password/session token/device private key in offline storage.
- **AD-185** — cold-offline Reader requires server-authentic signed authorization.
- **AD-186** — protected blobs verified against signed integrity metadata.
- **AD-188** — API signs offline manifests with P-256/ES256; Student receives verification material only.
- **AD-190** — new work starts from live `main` on short-lived branches.
- **AD-194** — hosted browser API traffic uses same-origin `/v1` proxying.
- **AD-195** — normal roadmap pauses before 016I for UX/UI refoundation.
- **AD-196** — Student/Admin share identity/tokens/state language but retain different composition/density.
- **AD-200** — production UI uses user/domain language, not implementation internals.
- **AD-201** — dashboards are overview/entry surfaces; major workflows use deliberate routes/pages.
- **AD-202** — route/history is a product contract; Student/Admin migrate from state-only pseudo-navigation to real route navigation.
- **AD-203** — Student stable navigation remains bounded to implemented capabilities; no fake Personal Learning/Progress destinations.
- **AD-204** — Reader and active Assessment become focused task screens in their owning batches.
- **AD-205** — Admin global IA follows operator lifecycle rather than backend modules.
- **AD-206** — AI authoring actions move into entity context; AI Operations/Review owns jobs/review.
- **AD-207** — parity surfaces are temporary migration debt and are removed only after executable parity proof.
- **AD-210** — existing brand tokens are KEEP/EXTEND, not replaced.

New B01 decisions:

- **AD-211 — BrowserRouter is the shared routing base.** Nginx in Student/Admin already uses SPA `try_files ... /index.html`; Student Service Worker already returns cached `/` shell for navigation while excluding `/v1`, so clean history URLs are compatible with current hosting/offline shell behavior.
- **AD-212 — B01 exposes only canonical `/app` boundaries.** Feature destinations are intentionally not invented before B02/B06; current workflow composition remains inside `/app/*` temporarily.
- **AD-213 — Shared UI package is semantic only.** `@alwaslh/ui` owns route shell, PageState, focus/skip-link and presentation error mapping; it does not own server/domain state or force Student/Admin layouts to be identical.
- **AD-214 — Route focus is explicit.** Browser route changes focus the route content boundary; skip links are first-class and RTL-safe.

## Audit Findings

| ID | Severity | Area | Problem | Solution | Status |
|---|---:|---|---|---|---|
| `UX-IA-101` | P1 | Routing | neither app had route-based application navigation | BrowserRouter/shared route foundation | IMPLEMENTED / VERIFYING in UX-B01 |
| `UX-IA-102` | P1 | Student | authenticated Student is still one aggregate surface | B02–B05 route migration | OPEN |
| `UX-IA-103` | P1 | Admin | 11 flat state-switched workspaces | B06 grouped route shell | OPEN |
| `UX-IA-104` | P1 | Admin | major workspaces mix independent workflows | B07–B14 list/detail/review boundaries | OPEN |
| `UX-COPY-101` | P1 | Student | crypto/storage/revision terms visible | presentation mappings + B02–B05 copy cleanup | OPEN |
| `UX-COPY-102` | P1 | Admin | Stage/parity/config implementation language visible | B06–B15 domain copy cleanup | OPEN |
| `UX-BRAND-101` | P2 | Identity | app shell marks differed from approved asset | official open-book app mark in both surfaces | IMPLEMENTED / VERIFYING in UX-B01 |
| `UX-DS-101` | P2 | Design system | recurring state/focus/error semantics duplicated | `@alwaslh/ui` + semantic token extension | IMPLEMENTED / VERIFYING in UX-B01 |
| `UX-A11Y-101` | P2 | Accessibility | state-only navigation weakens history/focus | route focus + skip link + BrowserRouter | IMPLEMENTED / VERIFYING in UX-B01 |
| `UX-RESP-101` | P2 | Admin responsive | narrow layout stacks full sidebar above content | B06/B16 | OPEN |
| `UX-LEGACY-101` | P1 | Admin legacy | parity panels duplicate canonical capabilities | migrate then remove in B07/B12/B15 | OPEN |
| `STUDENT-016I` | P1 | Offline/PWA | true cold-start offline Reader not closed | resume after refoundation | PAUSED / NEXT NORMAL ROADMAP |
| `AI-012..AI-019` | P2 | AI | live provider readiness not proven | separate live verification | NOT YET VERIFIED |

Detailed evidence remains in `docs/product/UX_UI_MASTER_AUDIT_2026-09-12.md`.

## Changes Made — 2026-09-12

### UX-B00 — DONE / VERIFIED / MERGED

PR #42:

- final head `203882a934dfcb68df4a1e1e4f972583317cabf1`;
- **15/15 PR-head workflows SUCCESS**;
- workflow run IDs: `34708535761`, `34708535688`, `34708535777`, `34708535760`, `34708535684`, `34708535706`, `34708535719`, `34708535687`, `34708535692`, `34708535768`, `34708535766`, `34708535729`, `34708535746`, `34708535762`, `34708535728`;
- `Rebuild Stage Verification` run `34708535728` SUCCESS;
- merge commit `3997ac94b47100bc1557b7622ae3c6d47058d25d`;
- live `main` verified at the merge SHA after merge.

B00 produced the Master Audit, Target IA, Design System Spec, Content Language Rules and B01–B17 roadmap, and corrected `DOCUMENTATION_INDEX.md` resume guidance.

### UX-B01 — Shared frontend foundation

Branch: `ux/shared-foundation`

Base: `3997ac94b47100bc1557b7622ae3c6d47058d25d`

Implemented:

- created `packages/ui` with `ProductShell`, `RouteFocus`, presentation-ready `PageState`, and `mapProductError`;
- extended `packages/brand/src/tokens.css` only with evidence-backed app/workspace/safe-area/control/z-index/layout roles;
- added `react-router-dom@7.9.5` and `@alwaslh/ui` to Student/Admin app manifests;
- mounted `BrowserRouter` in both React entry points;
- added canonical `/app/*` route boundary, root redirect and human not-found state for both apps;
- added route-focus and skip-link behavior;
- aligned Student/Admin shell marks with the approved open-book app mark;
- added targeted Student/Admin Playwright routing tests for direct URL, route focus, canonical route and browser history.

No API, PostgreSQL migration/data, Railway configuration, publication, assessment authority, AI authority or offline authorization contract changed.

## Tests & Verification

### UX-B00

Verified and merged as recorded above.

### UX-B01

Local container execution was attempted but the execution environment could not resolve `github.com`, so repository checkout/testing in that container was unavailable. This is an environment limitation, not a product result.

Required executable evidence is therefore delegated to repository CI on the exact PR head:

- Student lint/typecheck/unit/build;
- Stage14 real Chromium Student suite;
- Admin lint/typecheck/unit/build;
- applicable Admin Chromium suites;
- new routing-foundation Playwright specs;
- Rebuild Stage Verification;
- all path-triggered project workflows.

Current state: **IMPLEMENTED / CI NOT YET VERIFIED**. Do not merge B01 until the exact-head runs are green.

Manual screenshot/visual inspection in this tool environment: `NOT YET VERIFIED`. Executable Chromium evidence is required now; final visual/device closure remains B16/B17.

## Known Issues

- Student authenticated live same-origin E2E after PR #39 — `NOT YET VERIFIED`.
- Admin grouped navigation/mobile drawer — B06.
- Student installed-app destinations and safe-area navigation composition — B02.
- Student normal UI still contains technical offline/device copy until B05.
- Admin normal UI still contains Stage/parity/config copy until B06–B15.
- `AI-012..AI-019` live provider readiness — `NOT YET VERIFIED`.
- Stage28 Production Cutover — not complete.

## Remaining Work

1. open UX-B01 PR;
2. verify exact-head lint/typecheck/tests/build/Chromium/workflows;
3. fix any real regression at root cause;
4. record final PR head/run IDs in Issue #16 and PR metadata;
5. merge only after green evidence;
6. then begin **UX-B02 — Student shell and navigation** from refreshed `main`.

Normal roadmap remains paused until UX-B17 closure. Exact return sequence remains:

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17`
