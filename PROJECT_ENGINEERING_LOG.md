# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Current consolidated engineering truth. Code, PostgreSQL migrations, executable CI and live runtime evidence outrank prose. Historical detail remains in Git history, merged PRs, Issue #16 and specialized workstream documents.

Last consolidated: **2026-09-12 — UX/UI refoundation foundation audit completed on source; target IA/design/copy/implementation plan recorded; normal roadmap remains paused at STUDENT-016I.**

## Project Understanding

الوسيلة الذكية منصة تعليمية عربية تتكون من Student Web/PWA + Super Admin Web فوق Fastify/PostgreSQL.

Student is an **installed educational app experience**, not a small responsive website.

Current implemented-era Student flow:

`Activation/Login → Home target → Subjects/Curriculum → Lesson/Reader → Practice/Test → Offline learning`

Personal Learning and Progress are later roadmap capabilities and must not be represented as already implemented product destinations.

Admin is an **operational workspace** around:

`Curriculum → Content/Ingestion → Media/OCR → AI → Human Review → Question Bank → Quiz Builder → Students/Access → Operations/Audit`

Approved identity evidence exists under `packages/brand/`: Arabic/Yemeni educational context, calm/trustworthy visual language, teal/open-book identity, Cairo typography, RTL-first, touch-first Student and dense-but-readable Admin.

## Architecture

- `apps/student-web` — Student Web/PWA.
- `apps/admin-web` — Super Admin.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- `packages/*` — shared domain/validation/brand primitives.

Stable contracts:

- browser is not canonical business authority;
- API + PostgreSQL own canonical state;
- `media ready != published`;
- protected Reader/media remain publication + entitlement controlled;
- AI output never auto-publishes Student content/questions;
- human review chain remains mandatory;
- Question Bank publication and immutable Quiz versions remain authoritative;
- assessment scoring/finalization is server-owned;
- `/v1` is not Service Worker Cache API authority;
- offline learning must not persist password/session token/device private key.

`apps/api/src/app.ts` confirms separate runtime domain families for Auth, Activation/Access, Admin Access, Admin Operations, Notifications, Curriculum/Reader, Content Ingestion/Operations, AI Operations/Authoring, Question Bank, Quiz Builder, Student Assessment and Offline.

## Current Position

PR #41 — unified project skill package — was green/mergeable and merged before refoundation implementation work.

- PR #41 final head: `25f876d3cfe2af95a8a27319c289f102db3e6db0`
- merge commit: `c3ddef04933772116c3bd9cdf29eb5a973c527fd`
- active foundation branch: `ux/refoundation-foundation`
- branch base: `c3ddef04933772116c3bd9cdf29eb5a973c527fd`

Normal roadmap remains paused.

Stage state:

- Stage1–10 + OCR — VERIFIED.
- Stage11 — VERIFIED.
- Stage12 — VERIFIED backend/runtime; `AI-012..AI-019` live provider readiness OPEN.
- Stage13A–G — VERIFIED / CLOSED / integrated.
- Stage14 Student — CLOSED / VERIFIED.
- Stage15 Practice/Assessment — CLOSED / VERIFIED.
- Stage16 Offline/PWA — OPEN / PARTIALLY VERIFIED / PAUSED FOR UX.
- Stage17+ — not started in normal roadmap order.

`STUDENT-016H` is **DONE / VERIFIED / MERGED**.

Exact post-refoundation resume sequence remains:

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17`

## Architecture Decisions

Existing decisions retained:

- **AD-170** — Service Worker caches shell/static assets only; `/v1` excluded.
- **AD-175** — no password/session token/device private key in offline storage.
- **AD-185** — cold-offline Reader requires server-authentic signed authorization.
- **AD-186** — protected blobs verified at use time against signed integrity metadata.
- **AD-188** — API signs offline manifests with P-256/ES256; Student receives verification material only.
- **AD-190** — new work starts from live `main` on short-lived branches.
- **AD-192** — content bootstrap bounded/idempotent/Draft-only and never auto-publishes.
- **AD-194** — hosted browser API traffic uses same-origin `/v1` proxying.
- **AD-195** — normal roadmap pauses before 016I for UX/UI refoundation.
- **AD-196** — Student/Admin share identity/tokens/state language but retain different density/interaction models.
- **AD-197** — one repository-scoped Alwaslh skill plus focused references.
- **AD-198** — Product Design/Mobbin/Figma remain subordinate to product evidence/contracts.
- **AD-199** — refoundation preserves approved Alwaslh identity and product model.
- **AD-200** — visible production UI uses user/domain language; implementation internals stay hidden unless dedicated diagnostics require them.
- **AD-201** — dashboards are overview/entry surfaces; major workflows use deliberate route/page boundaries.

New refoundation decisions:

- **AD-202 — Route/history is a product contract:** Student and Admin will migrate from state-switched pseudo-navigation to real route-based navigation so deep links, browser back, route focus and page ownership are explicit.
- **AD-203 — Student stable navigation remains bounded to implemented capabilities:** initial authenticated shell exposes Home, Learn, Practice, Downloads and Account access; Personal Learning/Progress are not shown until their roadmap stages exist.
- **AD-204 — Reader and active Assessment are focused task screens:** neither remains embedded in an aggregate Student page; their authority/data contracts stay unchanged.
- **AD-205 — Admin global IA follows operator lifecycle:** Curriculum, Content, AI/Review, Questions/Tests, Students/Access and Operations are grouped work areas; backend modules are not automatically top-level destinations.
- **AD-206 — Context owns authoring actions:** Lesson AI generation belongs to Lesson detail, Quiz generation to Quiz flow, Question regeneration to Question detail; AI Operations/Review owns jobs/review rather than one catch-all authoring page.
- **AD-207 — Parity surfaces are temporary migration debt:** valid Lesson/Quiz capabilities move into canonical detail pages and parity UI is removed only after executable behavior parity is proven.
- **AD-208 — Access-code file utilities are not a global Reports module:** current CSV import/export/print capability moves under Access Codes.
- **AD-209 — Technical metadata uses progressive disclosure:** IDs, storage paths, prompt keys, raw event codes and runtime config are secondary diagnostics only when they enable an operator decision.
- **AD-210 — Existing brand tokens are KEEP/EXTEND:** the refoundation does not replace the palette/type system; it adds only evidence-backed layout/state/component semantics.

## Audit Findings

| ID | Severity | Area | Problem | Evidence / Impact | Solution | Status |
|---|---:|---|---|---|---|---|
| `DOC-PAUSE-001` | P2 | Continuity | stale docs described 016H as open after merge | contradicted merged PR #38 | synchronized status/log/pause docs | FIXED |
| `UX-FOUNDATION-001` | P1 | UX/UI | Student/Admin foundations create high cognitive load and product debt | actual source inventory | structural refoundation before more roadmap features | ACTIVE |
| `UX-IA-101` | P1 | Routing | neither app has route-based application navigation | package dependencies + App sources | shared routing foundation | OPEN / UX-B01 |
| `UX-IA-102` | P1 | Student | authenticated Student stacks Curriculum + Assessment + Downloads + Access | `StudentAccessSection` | Student app shell + dedicated routes | OPEN / UX-B02-B05 |
| `UX-IA-103` | P1 | Admin | 11 flat state-switched sidebar workspaces | Admin `App.tsx` | grouped route-based workspace shell | OPEN / UX-B06 |
| `UX-IA-104` | P1 | Admin | curriculum/ingestion/content/AI/QB/quiz/governance pages combine independent workflows | inspected workspace sources | list/detail/review route decomposition | OPEN / UX-B07-B14 |
| `UX-COPY-101` | P1 | Student copy | visible device/server/SHA-256/SW/Cache/revision/sync language | Student App/Reader/Assessment/Downloads | product-language mappings | OPEN / UX-B02-B05 |
| `UX-COPY-102` | P1 | Admin copy | Stage/parity/cache/repository/config/revision implementation language visible | Admin Dashboard/Governance/AI/Parity | domain-language + diagnostics disclosure | OPEN / UX-B06-B15 |
| `UX-LEGACY-101` | P1 | Admin legacy UI | Lesson/Quiz parity panels duplicate canonical product operations | parity components embedded beside workspaces | migrate capability, verify, remove | OPEN / UX-B07/B12/B15 |
| `UX-RESP-101` | P2 | Admin responsive | <=820px stacks entire sidebar above content | Admin CSS | responsive drawer/compact shell | OPEN / UX-B06/B16 |
| `UX-BRAND-101` | P2 | Identity | production brand lockups differ from approved asset system | Student local SVG/Admin letter mark | official assets | OPEN / UX-B01 |
| `UX-DS-101` | P2 | UI system | duplicated status/date/error/state/metric patterns | repeated local workspace helpers/styles | small stable shared primitives | OPEN / UX-B01/B15 |
| `UX-A11Y-101` | P2 | Accessibility | focus/touch/RTL foundations exist but pseudo-navigation weakens route focus/history | CSS + manual focus restoration | preserve foundations + route-level semantics | OPEN / UX-B01-B16 |
| `UX-DATA-101` | P2 | Data display | IDs/revisions/source paths/config values often first-class content | Admin/Student workspace inspection | human primary identity + advanced diagnostics | OPEN / UX-B02-B15 |
| `STUDENT-016I` | P1 | Offline/PWA | true browser-close/restart/network-unavailable Reader not closed | Stage16 source/queue | resume after refoundation | PAUSED / NEXT NORMAL ROADMAP |
| `STUDENT-016R` | P1 | Reconnect | full revalidation/purge incomplete | Stage16 queue | post-016I | OPEN |
| `STUDENT-016S` | P1 | Sync | full delta flow not proven | Stage16 queue | post-016R | OPEN |
| `AI-012..AI-019` | P2 | AI | live provider readiness not proven | project status | separate live verification later | NOT YET VERIFIED |

Detailed evidence/classification:

`docs/product/UX_UI_MASTER_AUDIT_2026-09-12.md`

## Target Information Architecture

Canonical document:

`docs/product/TARGET_INFORMATION_ARCHITECTURE.md`

### Student target

Unauthenticated:

- `/activate`
- `/login`
- `/recover`

Authenticated stable destinations:

- Home
- Learn / Subjects
- Practice
- Downloads
- Account

Focused descendants:

- Subject
- Lesson / Reader
- Quiz/Attempt / Assessment

No fake Personal Learning/Progress destinations before their roadmap stages.

### Admin target groups

- Overview
- Curriculum
- Content / Ingestion / OCR
- AI Jobs / AI Review
- Question Bank / Quizzes
- Students / Access Codes
- Operations / Notifications / Audit / System Status

Valid authoring actions migrate into entity context rather than a catch-all page.

## Design System

Canonical spec:

`docs/product/DESIGN_SYSTEM_SPEC.md`

KEEP:

- shared `packages/brand` semantic tokens;
- approved teal/open-book/Cairo identity;
- focus/touch/radius/spacing/motion foundations;
- RTL logical property direction;
- Reader width constraints;
- reduced motion.

IMPROVE:

- app/admin layout roles;
- safe areas;
- Button/Field/Status/PageState/Search/Filter/Table/Dialog/Drawer primitives where repetition is proven;
- Student shell/Reader/Assessment patterns;
- Admin master/detail/review/long-running-operation patterns;
- official brand asset usage.

No “everything is a card” abstraction.

## Content Language

Canonical rules:

`docs/product/CONTENT_LANGUAGE_RULES.md`

Student must not see raw crypto/storage/cache/revision/sync/server mechanics. Example meanings:

- valid saved package → `متاح بدون إنترنت`;
- stale saved lesson → `يوجد تحديث للدرس`;
- network failure → `تعذر الاتصال. تحقق من الإنترنت وحاول مجددًا.`

Admin may use domain terms such as OCR, AI Review, Question Bank and publication, but Stage numbers, parity, DB pool/SSL/cookie config, raw UUID/event keys and implementation commentary are not default product copy.

## Refoundation Implementation Roadmap

Canonical plan:

`docs/workstreams/UX_UI_REFOUNDATION_IMPLEMENTATION_ROADMAP.md`

Sequence:

- UX-B00 foundation audit/docs;
- UX-B01 shared routing/shell/presentation foundation;
- UX-B02-B05 Student shell/learning/assessment/offline-account;
- UX-B06-B14 Admin shell/workflow families;
- UX-B15 shared cleanup/legacy removal;
- UX-B16 responsive/RTL/a11y closure;
- UX-B17 browser/visual/regression closure.

## Changes Made — 2026-09-12

### PR #41 skill-package integration

Merged required project-scoped skill and focused references before UX implementation.

Merge: `c3ddef04933772116c3bd9cdf29eb5a973c527fd`.

### UX-B00 foundation branch

Branch: `ux/refoundation-foundation`.

Created:

- `docs/product/UX_UI_MASTER_AUDIT_2026-09-12.md`
- `docs/product/TARGET_INFORMATION_ARCHITECTURE.md`
- `docs/product/DESIGN_SYSTEM_SPEC.md`
- `docs/product/CONTENT_LANGUAGE_RULES.md`
- `docs/workstreams/UX_UI_REFOUNDATION_IMPLEMENTATION_ROADMAP.md`

Central `PROJECT_STATUS.md` and this log synchronized during the batch.

Issue #16 updated during work; comment ID `5647502620` records the audit branch/head and findings.

No application code, API, database, Railway configuration, content publication or AI provider configuration changed in UX-B00.

## Tests & Verification

### PR #41

Before merge:

- PR state open/mergeable was verified;
- final head `25f876d...` had all returned PR workflows completed successfully;
- merge was performed with expected-head protection;
- merge commit `c3ddef04933772116c3bd9cdf29eb5a973c527fd`.

No separate merge-commit workflow runs were returned immediately after merge; this does not invalidate the already-green PR-head evidence.

### UX-B00

Source verification completed:

- actual Student UI tree and primary flows inspected;
- actual Admin UI tree/workspace families inspected;
- package dependencies checked: no current routing dependency in either app;
- brand tokens/assets inspected;
- API composition inspected;
- Student/Admin E2E inventories inspected;
- current responsive CSS behavior inspected.

Application lint/typecheck/build/browser runs are **not applicable to documentation-only UX-B00**. Exact-head PR CI is still required before merge.

Redesigned browser/device/visual screenshots: **NOT YET VERIFIED** because implementation has not started.

Relevant prior runtime evidence remains:

- PR #38: 18/18 workflows SUCCESS; `STUDENT-016H` merged;
- PR #39: 17/17 workflows SUCCESS; hosted Admin same-origin session continuity verified.

## Content State

Canonical source: `7eaur/alwaslh-go@f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`.

Inventory: 48 documents / 5,552 images.

Bounded Grade 9 English proof remains 75 source images / 75 ready media assets / 300 variants / 75 Draft lesson assets / 10 lessons.

Do not bulk-materialize full inventory during UX/UI refoundation.

## Known Issues

- Student live authenticated same-origin E2E after PR #39 — `NOT YET VERIFIED`.
- visual/device inspection of redesigned UI — `NOT YET VERIFIED` until changed code exists.
- exact icon library choice — `NOT YET VERIFIED / not needed for UX-B00`.
- `AI-012..AI-019` live provider readiness — `NOT YET VERIFIED`.
- Stage21 performance, Stage22 security, Stage24 final accessibility/device closure — later roadmap gates.
- Stage28 Production Cutover — not complete.

## Remaining Work

Current batch closure:

1. open foundation PR;
2. verify exact-head CI;
3. merge only after green evidence;
4. refresh `main`;
5. begin `UX-B01 — Shared frontend foundation`.

Refoundation then follows the documented B01–B17 sequence.

Exact normal-roadmap resume point remains:

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17`.