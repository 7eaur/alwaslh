# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Current consolidated engineering truth. Code, PostgreSQL migrations, executable CI and live runtime evidence outrank prose. Historical detail remains in Git history, merged PRs, Issue #16 and specialized workstream documents.

Last consolidated: **2026-09-12 — normal roadmap paused for UX/UI refoundation; return point is STUDENT-016I.**

## Project Understanding

الوسيلة الذكية منصة تعليمية عربية تتكون من Student Web/PWA + Super Admin Web فوق Fastify/PostgreSQL.

Student flow:

`Activation/Login → Home → Subjects → Curriculum → Lesson/Reader → Practice/Test → Offline learning → Personal learning → Progress`

Admin flow:

`Curriculum → Content/Ingestion → Media/OCR → AI → Human Review → Question Bank → Quiz Builder → Students/Access → Operations/Audit`

The Student surface should hide infrastructure complexity and optimize the learning journey. The Admin surface should be an operational workspace, not a flat collection of equally weighted modules.

## Architecture

- `apps/student-web` — Student Web/PWA.
- `apps/admin-web` — Super Admin.
- `apps/api` — authoritative API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- `packages/*` — shared domain/validation/brand primitives.

Stable rules:

- browser is not canonical business authority;
- API + PostgreSQL own canonical state;
- `media ready != published`;
- protected Reader/media remain publication + entitlement controlled;
- AI output never auto-publishes Student content/questions;
- assessment scoring/finalization remains server-owned;
- `/v1` never becomes Service Worker Cache API authority;
- offline learning must not persist password/session token/device private key.

## Current Position

Frozen live baseline before this documentation branch:

`main@e2344d22820a972b6a29f7d5cca16a94b670cd10`

This is PR #39 merge commit.

Stage state:

- Stage1–10 + OCR — VERIFIED.
- Stage11 — VERIFIED.
- Stage12 — VERIFIED backend/runtime; `AI-012..AI-019` live provider readiness OPEN.
- Stage13A–G — VERIFIED / CLOSED / integrated.
- Stage14 Student — CLOSED / VERIFIED.
- Stage15 Practice/Assessment — CLOSED / VERIFIED.
- Stage16 Offline/PWA — OPEN / PARTIALLY VERIFIED.
- Stage17+ — not started in normal roadmap order.

`STUDENT-016H` is **DONE / VERIFIED / MERGED**.

PR #38 evidence:

- tested head `407d9992c91d95081147fc104e13b69addef5eb8`;
- 18/18 workflows SUCCESS;
- merge `a6f220c74e46852a8b2e6667271acc41b3fb8c79`.

PR #39 evidence:

- tested head `8659414259fef83183aafa3204883281750491ad`;
- 17/17 workflows SUCCESS;
- merge/main `e2344d22820a972b6a29f7d5cca16a94b670cd10`;
- tested-head and merge tree equality verified during recovery;
- hosted Admin same-origin authenticated persistence verified live.

Student authenticated hosted same-origin E2E after PR #39: `NOT YET VERIFIED`.

## Architecture Decisions

- **AD-170** — Service Worker caches shell/static assets only; `/v1` excluded.
- **AD-175** — no password/session token/device private key in offline learning storage.
- **AD-185** — cold-offline Reader requires server-authentic signed authorization.
- **AD-186** — stored protected blobs are verified at use time against signed integrity metadata.
- **AD-188** — API signs offline manifests with P-256/ES256; Student receives public verification material only.
- **AD-190** — post-integration work starts from live `main` using short-lived branches.
- **AD-192** — content bootstrap is bounded, idempotent, Draft-only and never auto-publishes.
- **AD-194** — production browser API traffic uses same-origin `/v1` proxying.
- **AD-195** — normal roadmap pauses before 016I while UX/UI foundations are remediated.
- **AD-196** — Student and Admin share one design foundation/state language but retain different density and interaction models.

## Audit Findings

| ID | Severity | Area | Problem | Solution | Status |
|---|---:|---|---|---|---|
| `DOC-PAUSE-001` | P2 | Continuity | stale docs described 016H as open after PR #38 | synchronize status/log and add explicit pause/resume document | FIXED in this docs branch |
| `UX-FOUNDATION-001` | P1 | UX/UI | Admin is cognitively heavy and Student UI foundation is structurally weak/inconsistent | structured source/flow audit, IA redesign and unified design system before more features | ACTIVE |
| `STUDENT-016I` | P1 | Offline/PWA | true browser-close/restart/network-unavailable Reader is not closed | resume after UX/UI refoundation | PAUSED / NEXT ROADMAP ITEM |
| `STUDENT-016R` | P1 | Reconnect | full revalidation/purge is incomplete | revalidate server authority and purge invalid local content | OPEN |
| `STUDENT-016S` | P1 | Sync | schema primitives exist but full delta flow is not proven | implement writers/cursor/delta/client application | OPEN |
| `AI-012..AI-019` | P2 | AI | live provider/model/routes/credentials/bootstrap not proven | separate live-readiness verification | NOT YET VERIFIED |

## Changes Made — 2026-09-12

Documentation-only pause batch:

- created `docs/workstreams/UX_UI_REFOUNDATION_PAUSE_2026-09-12.md`;
- synchronized `PROJECT_STATUS.md` with PR #38/#39 reality;
- consolidated this log around the actual current state;
- recorded the UX/UI refoundation as the active management track;
- recorded exact return point as `STUDENT-016I`.

No application code, migrations, Railway configuration, PostgreSQL data, content publication or AI provider configuration changed.

## Tests & Verification

No product code changed in this documentation batch, so no new product test claim is made.

Relevant verified evidence remains:

- PR #38: 18/18 workflows SUCCESS;
- PR #39: 17/17 workflows SUCCESS;
- PR #39 tested tree equals current recovery baseline tree;
- hosted Admin same-origin authenticated persistence verified live.

## Content State

Canonical source:

`7eaur/alwaslh-go@f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`

Inventory: 48 documents / 5,552 images.

Bounded Grade 9 English proof: 75 source images, 75 ready media assets, 300 variants, 75 lesson assets, 10 lessons, Draft only.

Do not bulk-materialize the full inventory during UX/UI maintenance.

## Known Issues

- Student live authenticated E2E after PR #39 — `NOT YET VERIFIED`.
- `AI-012..AI-019` live AI provider readiness — `NOT YET VERIFIED`.
- Stage21 performance, Stage22 security, Stage24 accessibility/device final closure — pending roadmap.
- Stage28 Production Cutover — not complete.
- detailed UX/UI findings beyond the currently observed foundation problems — `NOT YET VERIFIED` until the dedicated source/flow audit.

## Remaining Work

### Active management track

**UX/UI REFOUNDATION + DESIGN SYSTEM + STUDENT/ADMIN EXPERIENCE REMEDIATION**

Before broad UI implementation:

1. establish the design/frontend/product skill package and governing rules;
2. inventory Student routes/screens/components/states;
3. inventory Admin routes/workflows/components/states;
4. map current and target information architecture;
5. audit tokens/components/RTL/responsiveness/accessibility/state handling;
6. classify areas as KEEP / IMPROVE / REFACTOR / REBUILD / REMOVE;
7. define the target shared design foundation;
8. implement in small reviewable batches with lint/typecheck/tests/build/browser verification;
9. update status/log before closing the refoundation.

### Exact resume point after refoundation

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17`

Canonical pause/resume document:

`docs/workstreams/UX_UI_REFOUNDATION_PAUSE_2026-09-12.md`
