# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Current consolidated engineering truth. Code, PostgreSQL migrations, executable CI and live runtime evidence outrank prose. Historical detail remains in Git history, merged PRs, Issue #16 and specialized workstream documents.

Last consolidated: **2026-09-12 — UX-B00 merged; UX-B01 implementation verified on exact code head, final documentation-synchronized PR head still requires revalidation before merge.**

## Project Understanding

الوسيلة الذكية منصة تعليمية عربية تتكون من Student Web/PWA + Super Admin Web فوق Fastify/PostgreSQL.

Student is an **installed educational app experience**, not a small responsive website. Current implemented-era flow remains:

`Activation/Login → Subjects/Curriculum → Lesson/Reader → Practice/Test → Offline learning`

The refoundation adds Home/navigation/page architecture incrementally. Personal Learning and Progress remain later roadmap capabilities and must not be represented as implemented destinations.

Admin is an **operational workspace** around:

`Curriculum → Content/Ingestion → Media/OCR → AI → Human Review → Question Bank → Quiz Builder → Students/Access → Operations/Audit`

Approved identity remains Arabic-first, RTL-first, calm educational, teal/open-book, Cairo typography, Student touch-first and Admin dense-but-readable.

## Architecture

- `apps/student-web` — Student Web/PWA.
- `apps/admin-web` — Super Admin.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- `packages/brand` — canonical brand/design tokens.
- `packages/ui` — B01 framework-neutral shared presentation semantics/styles; contains no React runtime dependency and no business authority.
- `apps/*/src/presentation-foundation.tsx` — thin app-local React adapters over shared semantics/styles.

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

Unauthenticated route migration belongs to later Student shell work:

`Activation / Login / Recovery`

Authenticated implemented-era stable destinations after B02:

`Home → Learn → Practice → Downloads → Account`

Focused descendants:

`Subject → Lesson → Reader`

`Quiz → Attempt → Assessment`

B01 does **not** migrate those feature routes. It introduces only the shared BrowserRouter/app boundary and reusable presentation foundation required by later batches.

### Admin target hierarchy

`Overview`

`Curriculum`

`Content / Ingestion / OCR`

`AI Jobs / Human Review`

`Question Bank / Quizzes`

`Students / Access Codes`

`Operations / Notifications / Audit / constrained System Status`

Admin workflow route migration begins in B06; B01 only establishes router/presentation foundations.

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

B01 decisions:

- **AD-211 — BrowserRouter is the shared routing base.** Student/Admin Nginx already uses SPA `try_files ... /index.html`; Student Service Worker already returns cached `/` shell for navigation while excluding `/v1`, so clean history URLs are compatible with current hosting/offline-shell behavior.
- **AD-212 — B01 exposes only canonical `/app/*` boundaries.** Feature destinations are intentionally not invented before B02/B06; current workflow composition remains inside `/app/*` temporarily.
- **AD-213 — Shared UI package is framework-neutral.** `@alwaslh/ui` owns shared state/error semantics and presentation CSS. React shell/PageState/focus adapters remain app-local so current per-app dependency installation stays valid. The package owns no server/domain state and does not force Student/Admin layouts to be identical.
- **AD-214 — Route focus is explicit.** Browser route changes focus the labeled route-content region; skip links are first-class and RTL-safe.
- **AD-215 — Same-origin `/v1` remains the browser contract during UX work.** A B01 CI attempt that injected an absolute API base exposed test regressions; the gate was corrected to use the existing Vite `/v1` proxy rather than weakening canonical same-origin behavior.
- **AD-216 — Safe-area variables are foundation tokens in B01, not global layout padding.** Student installed-app safe-area composition is applied deliberately in B02 to avoid changing the current aggregate shell prematurely.

## Audit Findings

| ID | Severity | Area | Problem | Solution | Status |
|---|---:|---|---|---|---|
| `UX-IA-101` | P1 | Routing | neither app had route-based application navigation | BrowserRouter + canonical route foundation | FIXED IN B01 / VERIFIED ON CODE HEAD |
| `UX-IA-102` | P1 | Student | authenticated Student is still one aggregate surface | B02–B05 route migration | OPEN |
| `UX-IA-103` | P1 | Admin | 11 flat state-switched workspaces | B06 grouped route shell | OPEN |
| `UX-IA-104` | P1 | Admin | major workspaces mix independent workflows | B07–B14 list/detail/review boundaries | OPEN |
| `UX-COPY-101` | P1 | Student | crypto/storage/revision terms visible | shared presentation semantics + B02–B05 copy cleanup | OPEN |
| `UX-COPY-102` | P1 | Admin | Stage/parity/config implementation language visible | B06–B15 domain copy cleanup | OPEN |
| `UX-BRAND-101` | P2 | Identity | app shell marks differed from approved asset | official open-book app mark in both surfaces | FIXED IN B01 / VERIFIED ON CODE HEAD |
| `UX-DS-101` | P2 | Design system | recurring state/focus/error semantics duplicated | framework-neutral `@alwaslh/ui` + semantic token extension | FIXED IN B01 / VERIFIED ON CODE HEAD |
| `UX-A11Y-101` | P2 | Accessibility | state-only navigation weakens history/focus | route focus + labeled region + skip link + BrowserRouter | FIXED IN B01 / VERIFIED ON CODE HEAD |
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
- live `main` verified at that merge SHA.

### UX-B01 — Shared frontend foundation

Branch: `ux/shared-foundation`

Base: `3997ac94b47100bc1557b7622ae3c6d47058d25d`

PR: #43.

Verified implementation head before final documentation sync:

`6acd2ce85c1b848ae34a9740be562a5d423eacfc`

Implemented:

- created framework-neutral `packages/ui` with shared state/error semantics and presentation CSS;
- added thin app-local React adapters for Student/Admin shell, PageState and route-focus rendering;
- extended `packages/brand/src/tokens.css` only with evidence-backed app/workspace/safe-area/control/z-index/layout roles;
- added `react-router-dom@7.9.5` and `@alwaslh/ui` to Student/Admin app manifests;
- mounted `BrowserRouter` in both React entry points;
- added canonical `/app/*` route boundary, root redirect and human not-found state for both apps;
- added labeled route-focus region and skip-link behavior;
- aligned Student/Admin shell marks with the approved open-book app mark;
- added targeted Student/Admin Playwright routing tests for direct URL, RTL, route focus, canonical route and browser history;
- added `.github/workflows/ux-b01-shared-foundation.yml` as a direct B01 browser gate for Student 390px + Admin desktop.

No API, PostgreSQL migration/data, Railway configuration, publication, assessment authority, AI authority or offline authorization contract changed.

## Tests & Verification

### UX-B00

Verified and merged as recorded above.

### UX-B01 implementation code head

Exact verified code head:

`6acd2ce85c1b848ae34a9740be562a5d423eacfc`

Result: **20/20 workflows SUCCESS**.

Run IDs:

- `34709720850` — Stage 11 AI Contract Verification — SUCCESS
- `34709720815` — Stage14 Student API Regression — SUCCESS
- `34709720841` — Stage 13E Frontend Preparation Verification — SUCCESS
- `34709720831` — Stage 13F Question Bank Verification — SUCCESS
- `34709720826` — Stage 10 Media Pipeline — SUCCESS
- `34709720817` — Stage 13D Content Ingestion Verification — SUCCESS
- `34709720829` — Stage16 Student PWA — SUCCESS
- `34709720896` — OCR Foundation Verification — SUCCESS
- `34709720827` — Stage 12 AI Execution Verification — SUCCESS
- `34709720893` — Stage 13E Admin AI Operations Verification — SUCCESS
- `34709720881` — Stage14 Student Product — SUCCESS
- `34709720812` — Stage 13E Combined Integration Verification — SUCCESS
- `34709720843` — Stage 9 Content Import Verification — SUCCESS
- `34709720832` — Stage 13D Admin Upload UI Verification — SUCCESS
- `34709720858` — Stage15 Student Assessment — SUCCESS
- `34709720825` — UX B01 Shared Frontend Foundation — SUCCESS
- `34709720880` — Stage 13G Admin Operations Verification — SUCCESS
- `34709720821` — Stage 13F Admin Question Bank Verification — SUCCESS
- `34709720835` — Stage 13 Admin Product Verification — SUCCESS
- `34709720837` — Rebuild Stage Verification — SUCCESS

Key browser/quality evidence:

- `34709720825`: API/Student/Admin builds, migrations, Student routing at **390px Chromium**, and Admin routing at desktop Chromium all SUCCESS.
- `34709720881`: Student lint/typecheck/unit/build and full real Chromium auth/access/curriculum suite at **390px** SUCCESS.
- `34709720841`: Admin lint/typecheck/unit/build SUCCESS.
- `34709720835`: Admin curriculum/content backend and real Admin browser E2E SUCCESS.
- `34709720837`: product/brand/UX/PostgreSQL/auth/access/activation + real activation browser flow SUCCESS.
- `34709720829`: Stage16 PWA SUCCESS, providing explicit non-regression evidence for the existing offline/PWA boundary.

CI-driven root fixes during B01:

1. **Shared React resolution**: first implementation put React components directly in `packages/ui`; per-app installs could not resolve React from the package source path. Root fix: shared package became framework-neutral; thin React adapters moved app-local.
2. **Same-origin test authority**: first dedicated B01 gate set an absolute `VITE_API_BASE_URL`, changing unit-test requests from canonical `/v1/...` to absolute URLs and breaking offline mocks. Root fix: removed the override and used existing Vite `/v1` proxy behavior.

Local container checkout/testing was unavailable because that execution environment could not resolve `github.com`; executable evidence therefore comes from exact-head GitHub Actions and real Chromium jobs above.

Manual screenshot/visual inspection in this tool environment: `NOT YET VERIFIED`. Browser viewport, routing, RTL, focus and history contracts are executable and green. Full visual/device closure remains B16/B17.

### Final PR-head rule

This documentation synchronization changes PR #43 head after the verified implementation SHA. The resulting exact PR head must pass its own CI before B01 is considered merge-ready. Earlier green runs remain implementation evidence but do not replace final-head acceptance.

## Known Issues

- Student authenticated hosted same-origin E2E after PR #39 — `NOT YET VERIFIED` as a hosted-runtime item.
- Admin grouped navigation/mobile drawer — B06.
- Student installed-app destinations and safe-area navigation composition — B02.
- Student normal UI still contains technical offline/device copy until B05.
- Admin normal UI still contains Stage/parity/config copy until B06–B15.
- `AI-012..AI-019` live provider readiness — `NOT YET VERIFIED`.
- Stage28 Production Cutover — not complete.

## Remaining Work

1. revalidate PR #43 on the exact documentation-synchronized head;
2. if green, record final head/run evidence in PR #43 and Issue #16;
3. leave B01 ready for review/merge;
4. do not start **UX-B02 — Student shell and navigation** until B01 is accepted and integrated.

Normal roadmap remains paused until UX-B17 closure. Exact return sequence remains:

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17`
