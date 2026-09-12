# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Current consolidated engineering truth. Code, PostgreSQL migrations, executable CI and live runtime evidence outrank prose. Historical detail remains in Git history, merged PRs, Issue #16 and specialized workstream documents.

Last consolidated: **2026-09-12 — normal roadmap paused for UX/UI refoundation; unified repository skill package prepared and refined with identity/content/IA rules; return point remains STUDENT-016I.**

## Project Understanding

الوسيلة الذكية منصة تعليمية عربية تتكون من Student Web/PWA + Super Admin Web فوق Fastify/PostgreSQL.

Student flow:

`Activation/Login → Home → Subjects → Curriculum → Lesson/Reader → Practice/Test → Offline learning → Personal learning → Progress`

Admin flow:

`Curriculum → Content/Ingestion → Media/OCR → AI → Human Review → Question Bank → Quiz Builder → Students/Access → Operations/Audit`

The Student surface should hide infrastructure complexity and optimize the learning journey. The Admin surface should be an operational workspace, not a flat collection of equally weighted modules.

Approved identity evidence exists under `packages/brand/`. Current baseline is an Arabic educational Yemeni product with a calm/trustworthy visual language, teal/open-book identity direction, RTL-first behavior, touch-first Student surface, and dense-but-readable Admin surface. UI refoundation improves this identity rather than replacing it.

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

Live `main` before the skill-package batch:

`5513d7ba7f3aac11231479c99d656cbffe458a9d`

This includes PR #40 and the formal UX/UI pause/resume checkpoint.

Stage state:

- Stage1–10 + OCR — VERIFIED.
- Stage11 AI contracts — VERIFIED.
- Stage12 durable AI runtime — VERIFIED backend/runtime; `AI-012..AI-019` live provider readiness OPEN.
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
- **AD-197** — project capability guidance uses one repository-scoped skill entry point plus progressive-disclosure references; do not install overlapping project-specific skills that compete for the same tasks.
- **AD-198** — external design tools/references such as Product Design, Mobbin and Figma are subordinate to Product Owner direction, live project evidence, security/business contracts and project-specific skill rules.
- **AD-199** — UX/UI refoundation preserves the approved Alwaslh product identity and original product model; `packages/brand/*` is mandatory design evidence before visual-system changes.
- **AD-200** — production UI copy/data is presentation-ready and user-facing; backend/API/database/cache/signature/revision/sync implementation details stay hidden unless a dedicated operator task genuinely requires them.
- **AD-201** — dashboards are overview/entry surfaces, not monolithic product pages; major Student/Admin workflows use deliberate routes/pages/sub-pages with one clear purpose instead of unrelated content stacked into a long scrolling wall.

## Audit Findings

| ID | Severity | Area | Problem | Solution | Status |
|---|---:|---|---|---|---|
| `DOC-PAUSE-001` | P2 | Continuity | stale docs described 016H as open after PR #38 | synchronize status/log and add explicit pause/resume document | FIXED |
| `UX-FOUNDATION-001` | P1 | UX/UI | Admin is cognitively heavy and Student UI foundation is structurally weak/inconsistent | structured source/flow audit, IA redesign and unified design system before more features | ACTIVE |
| `UX-COPY-002` | P1 | Product content | UI can leak internal/process terminology or display data with no user value | dedicated presentation-copy/data rules; domain/user language only | GOVERNED IN SKILL PACKAGE |
| `UX-IA-003` | P1 | Information architecture | dashboard/app surfaces risk becoming long mixed pages instead of clear task hierarchy | route/page/sub-page boundaries; dashboard as overview only | GOVERNED IN SKILL PACKAGE |
| `SKILL-FOUNDATION-001` | P2 | Engineering governance | multiple generic design/frontend skills could conflict or override project contracts | one project router skill with task-specific references and explicit conflict order | IMPLEMENTED in current branch |
| `STUDENT-016I` | P1 | Offline/PWA | true browser-close/restart/network-unavailable Reader is not closed | resume after UX/UI refoundation | PAUSED / NEXT ROADMAP ITEM |
| `STUDENT-016R` | P1 | Reconnect | full revalidation/purge is incomplete | revalidate server authority and purge invalid local content | OPEN |
| `STUDENT-016S` | P1 | Sync | schema primitives exist but full delta flow is not proven | implement writers/cursor/delta/client application | OPEN |
| `AI-012..AI-019` | P2 | AI | live provider/model/routes/credentials/bootstrap not proven | separate live-readiness verification | NOT YET VERIFIED |

## Changes Made — 2026-09-12

### UX/UI pause batch

- created `docs/workstreams/UX_UI_REFOUNDATION_PAUSE_2026-09-12.md`;
- synchronized status/log with PR #38/#39 reality;
- recorded exact return point as `STUDENT-016I`.

### Unified skill-package batch

Branch: `chore/alwaslh-skill-package`.

Initial skill commit: `832a0c66b150dfb198be3b5f42a5792ac687f0b2`.

Created one triggerable repository skill:

`.agents/skills/alwaslh-product-engineering/SKILL.md`

Created focused progressive-disclosure references:

- `references/project-guardrails.md`
- `references/student-pwa-app-ux.md`
- `references/admin-workspace-ux.md`
- `references/design-system-rtl-a11y.md`
- `references/product-content-copy.md`
- `references/frontend-engineering.md`
- `references/backend-security-performance.md`
- `references/educational-product-logic.md`
- `references/qa-browser-verification.md`
- `references/research-design-tools.md`

Design rationale:

- one skill name/trigger avoids competing project-specific skills;
- references are loaded only when the task needs them;
- Student PWA is explicitly treated as an installed educational app experience, not a small website;
- Admin is explicitly treated as a dense operational workspace, not a Student-like UI;
- shared Design System/RTL/accessibility rules do not force identical layout/density;
- external design tools remain advisory and cannot override verified contracts;
- approved brand foundation is mandatory context before redesign;
- visible copy/data must be final-quality and user-meaningful rather than exposing backend/process internals;
- Admin and Student navigation must be intentionally divided into pages/sub-pages instead of one long mixed surface;
- backend/security/performance guidance is included without turning the UX refoundation into a backend rewrite.

No application code, migrations, Railway configuration, PostgreSQL data, content publication or AI provider configuration changed in this skill-package batch.

## Tests & Verification

Skill-package structural checks completed in the working session:

- baseline recursive tree contained no existing `.agents/skills` path — no repository skill-name collision found;
- `SKILL.md` frontmatter contains one valid lower-case hyphenated name and a task-specific description;
- YAML frontmatter parse check — PASS;
- all skill references are under the same package directory;
- no second project-specific triggerable skill was introduced;
- no product source code changed;
- approved identity sources `packages/brand/BRAND_FOUNDATION.md` and `packages/brand/BRAND_GUIDELINES.md` were re-read before adding identity-preservation rules.

PR #41 was opened for this batch. Its CI must be re-evaluated on the final updated branch head before merge; earlier in-progress runs on older branch heads are not final acceptance evidence.

Relevant existing product evidence remains:

- PR #38: 18/18 workflows SUCCESS;
- PR #39: 17/17 workflows SUCCESS;
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

The unified project skill package is the governing capability layer for the upcoming audit and redesign work.

Next sequence:

1. merge/verify the unified skill package;
2. inventory approved identity assets/tokens and current Student/Admin visual usage;
3. inventory Student routes/screens/components/states/copy;
4. inventory Admin routes/workflows/components/states/copy;
5. map current and target information architecture and screen boundaries;
6. audit tokens/components/RTL/responsiveness/accessibility/state handling;
7. classify areas as KEEP / IMPROVE / REFACTOR / REBUILD / REMOVE;
8. define the target shared design foundation and presentation-copy language;
9. implement in small reviewable batches with lint/typecheck/tests/build/browser verification;
10. update status/log before closing the refoundation.

### Exact resume point after refoundation

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17`

Canonical pause/resume document:

`docs/workstreams/UX_UI_REFOUNDATION_PAUSE_2026-09-12.md`
