# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Engineering source of truth for project understanding, architecture, audit findings, decisions, changes, verification and remaining work. Code/migrations + executable CI evidence outrank prose. Anything not inspected/executed = `NOT YET VERIFIED`.

Last consolidated: **2026-09-10 — Stage13F Question Bank / Quiz Builder implementation verified through wider exact-head runtime matrix; closure documentation prepared for same-head re-verification.**

Historical detailed logs remain permanently available in Git history. This file is intentionally consolidated so a replacement engineering conversation can resume from current truth without reconstructing stale candidate states.

## 1. Project Understanding

**الوسيلة الذكية** منصة تعليمية عربية يعاد بناؤها مع الحفاظ على Business Outcomes وUser Flows والقيمة الفعلية للمنتج، مع استبدال التنفيذ غير الآمن أو المكرر عندما يلزم.

Runtime surfaces:

- `apps/student-web` — Student Web/PWA.
- `apps/admin-web` — Super Admin Web.
- `apps/api` — authoritative Fastify/TypeScript API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- `packages/*` — shared domain/brand/validation primitives.

Current execution model from Issue #16:

- **Track A** owns API/Admin/DB/AI/Question Bank/Quiz Builder and current Stage13G follow-on work.
- **Track B** owns Student Product on `parallel/stage14-student-product`.
- Issue #16 is the sole cross-track execution ledger.
- Shared contracts are promoted through `main`; neither track may duplicate durable authority to avoid integration.
- Production deployment/cutover remains future-only. Temporary preview/staging is optional only under explicit Product Owner direction and is not a substitute for CI.

## 2. Architecture

```text
Student Web ─┐
             ├── Fastify API ── PostgreSQL
Admin Web ───┘       │
                     ├── Auth / Activation / Access
                     ├── Curriculum
                     ├── Source / Media / OCR
                     ├── Stage11 typed AI contracts
                     ├── Stage12 durable AI execution
                     ├── Stage13E human AI review
                     ├── Stage13F Question Bank
                     └── Stage13F Quiz Builder / immutable delivery snapshots
```

Stable rules:

- Browser owns presentation/session UX, never canonical durable business state.
- Auth/Authorization/Entitlements are server-owned.
- Full Code = 6 digits; Class Code = 7 digits.
- Curriculum = Class → Subject Offering → optional Section → Lesson.
- source inventory is provenance, not curriculum hierarchy.
- `media ready != published`; Lesson content requires explicit Draft → Review → Published.
- raw/provider AI output never becomes Student/Question Bank authority.
- provider calls remain outside long DB transactions; Stage12 worker owns execution leases/retries/capacity.
- Stage13E approval is **import eligibility**, not Question Bank publication.
- Question Bank authoring identity is separate from assessment delivery snapshots.
- published Question Bank revisions and published quiz snapshots are immutable historical authority.
- Student Stage15 must consume published quiz snapshots, not mutable Question Bank authoring rows.

## 3. Core User / Authoring Flows

### Source → reviewed AI → Question Bank

```text
reviewed source/media/OCR
→ Stage11 typed request + prompt version
→ Stage12 durable job/unit/attempt/output
→ Stage13E append-only edit/approve/reject
→ latest terminal approve only
→ Stage13F import
→ Draft Question Bank revision
→ Review
→ Published
```

### Manual Question Bank

```text
Admin chooses class + subject + one/more lessons
→ typed MCQ / T-F / direct question
→ Draft
→ Review
→ Published
→ reusable stable item UUID
```

### Quiz Builder

```text
Admin creates quiz scope
→ server lists only published Question Bank revisions in scope
→ create one/more version/model
→ materialize immutable delivery snapshots
→ Review
→ Published
→ no post-publish snapshot mutation
```

### Regenerate one

```text
current published sourced Question Bank revision
→ Stage11 regenerate_question request
→ Stage12 durable output
→ Stage13E approve
→ explicit Stage13F apply
→ new Draft revision of SAME item UUID
→ old Published revision remains authority until replacement publish
```

No browser→provider synchronous regeneration path exists.

### Export

Reviewed/published quiz + exact version UUID → server export bundle → Excel-compatible UTF-8 CSV or RTL print/PDF template. Draft export is rejected by server.

## 4. Stage Ledger

| Stage / Area | Classification | State |
|---|---|---|
| 1 Product Contract | KEEP | VERIFIED |
| 2 Brand | KEEP | VERIFIED |
| 3 UX Architecture | KEEP/EVOLVE | VERIFIED baseline |
| 4 PostgreSQL | additive/current | VERIFIED |
| 5 Engineering Foundation | KEEP | VERIFIED |
| 6 Auth / Authorization | REFACTOR | VERIFIED |
| 7 Access / Entitlements | KEEP/REBUILD enforcement | VERIFIED |
| 8 Activation/Login/Recovery/Device | REFACTOR | VERIFIED incl. Chromium |
| 9 Source Import | KEEP provenance | VERIFIED |
| 10 Media Pipeline | REBUILD implementation / same outcome | VERIFIED |
| OCR Foundation | durable derived layer | VERIFIED |
| 11 AI Contracts | provider-neutral rebuild | VERIFIED |
| 12 Durable AI Execution | durable worker authority | VERIFIED backend/runtime |
| 13A Curriculum Backend | KEEP + IMPROVE | VERIFIED |
| 13B Admin Curriculum | REBUILD UI | VERIFIED |
| 13C Content/Media/OCR Ops | reuse authorities | VERIFIED |
| 13D Upload/History/Publication | REBUILD unsafe browser state | VERIFIED incl. Chromium |
| 13E Admin AI Operations / Review | reuse Stage11/12 | VERIFIED / CLOSED |
| 13F Question Bank / Quiz Builder | new canonical authoring layer + reuse delivery tables | **VERIFIED / CLOSED** |
| 13G Remaining Admin | incremental completion | NEXT Track A work |
| 14 Student Product | parallel workstream | IN PROGRESS; Access/Curriculum/Reader verified |
| 15–25 | required | NOT YET VERIFIED by sequence |
| 26–29 | release/deployment | FUTURE |

## 5. Architecture Decisions

Historical decisions through AD-147 remain in Git history. Current decisions added/confirmed by Stage13F:

- **AD-148** — canonical reusable Question Bank is a separate stable-item/revision authoring layer; existing `questions` remain delivery snapshots.
- **AD-149** — Stage13E `approve` makes output import-eligible only; Stage13F import always creates Draft authority.
- **AD-150** — published Question Bank content is immutable; edits/regeneration create new revision under the same item UUID.
- **AD-151** — quiz versions select published Question Bank **revision IDs**, then materialize immutable delivery snapshots with bank provenance.
- **AD-152** — direct questions use typed Question Bank support and explicit delivery-snapshot support; Student answering semantics remain Stage15.
- **AD-153** — regenerate-one must reuse Stage11 `regenerate_question` + Stage12 + Stage13E and may only create a later revision of the same stable item.
- **AD-154** — regeneration output cannot be imported through the generic AI-import path as a new standalone item; PostgreSQL also guards this invariant.
- **AD-155** — Quiz Builder candidate discovery is server-scoped to published revisions matching quiz class/subject/lessons.
- **AD-156** — quiz Draft is mutable; Review/Published versions freeze snapshot mutation. Publication/archive are server-owned lifecycle actions.
- **AD-157** — export authority is exact quiz-version scoped and allowed only at Review/Published; Draft preview/export is not publication authority.
- **AD-158** — current project execution is the Issue #16 parallel two-track model; shared backend contracts reach Student work through verified `main`, not duplicate implementations.

## 6. Audit Findings

| ID | Sev | Area | Problem / Evidence | Impact | Solution | Status |
|---|---:|---|---|---|---|---|
| `AI-011-005` | P2 | AI→Question Bank | Stage11 `direct` output had no reviewed canonical persistence/delivery boundary | direct generated questions could not become safe assessment authority | typed Question Bank + direct delivery snapshots + review/publish | **FIXED + VERIFIED** |
| `QB-013F-001` | P1 | Architecture | old `questions` table modeled delivery instances, not reusable authoring identity | edits/quiz reuse could corrupt historical meaning | stable `question_bank_items` + immutable revisions | **FIXED + VERIFIED** |
| `QB-013F-002` | P1 | AI import | Stage13E approval could be confused with publication | unreviewed-for-bank content risk | import latest approve only, always as Draft | **FIXED + VERIFIED** |
| `QB-013F-003` | P1 | Provenance | reusable questions needed exact AI/source/review lineage | audit/source trust gap | output/review locator + prompt/version/mode + source/page/checksum/OCR links | **FIXED + VERIFIED** |
| `QB-013F-004` | P1 | Quiz integrity | mutable bank content could alter published quizzes | attempts non-reproducible | immutable version snapshots with bank revision refs | **FIXED + VERIFIED** |
| `QB-013F-005` | P1 | Regeneration | generic import could turn `regenerate_question` into a new item | stable identity loss | dedicated same-item apply + DB guard | **FIXED + VERIFIED** |
| `QB-013F-006` | P1 | Regeneration replay | replay was initially checked after open-Draft conflict | idempotent retry failed on its own created Draft | replay lookup moved before open-Draft conflict | **FIXED + VERIFIED** |
| `QB-013F-007` | P1 | Export | Draft export could look like published assessment authority | trust/publication ambiguity | server rejects Draft; exact Review/Published version only | **FIXED + VERIFIED** |
| `QB-013F-008` | P2 | Admin UX | nested candidate search form was invalid HTML | fragile submission/browser behavior | non-nested search controls | **FIXED + VERIFIED** |
| `CI-013F-009` | P2 | Browser test | ambiguous text locators matched hidden options/multiple prompt nodes | false negative Chromium failures | semantic scoped locators; no assertion weakening | **FIXED + VERIFIED** |
| `CI-013F-010` | P2 | Test fixture | regeneration fixture had `string | undefined` closure binding under strict TS | quality gate stopped before integration | runtime row assertion + stable narrowed binding | **FIXED + VERIFIED** |
| `CI-013F-011` | P3 | Quality | import ordering/format and unsafe filename regex violated Biome | CI stopped before product tests | conforming formatting + code-point filename sanitizer; no lint disable | **FIXED + VERIFIED** |
| `GIT-013F-012` | P3 | Git | accidental `.noop` create/delete occurred before Stage13F branch | repository history noise only | cleanup commit `5fdb2303...`; resulting tree exactly `bcd433bd...` | **RESOLVED / NO TREE EFFECT** |
| `AI-012-019` | P2 | Live AI | provider benchmark/routes/credentials/bootstrap not proven with live runtime | production generation route is not verified | future explicit benchmark/config/runtime evidence | **OPEN / NOT YET VERIFIED** |
| `CI-001` | historical | Actions | old hosted runner allocation incident | previously blocked evidence | later real runners executed matrices successfully | NONBLOCKING; exact external cause NOT YET VERIFIED |

No P0/P1 Stage13F finding remains open inside the verified Stage13F scope.

## 7. Stage13F Changes Made

### PostgreSQL / Backend

- canonical Question Bank schema, revision/source/lesson/import/event tables and lifecycle constraints;
- direct question authoring + delivery representation;
- Question Bank list/detail/manual/import/edit/review/reject/publish API;
- published-candidate service for Quiz Builder;
- Quiz Builder create/list/detail/version/add/remove/replace/review/reject/publish/archive API;
- immutable delivery snapshots retaining Question Bank item/revision refs;
- dedicated same-item regeneration service/API and DB invariant;
- exact-version Review/Published export service/API.

### Admin Web

- dedicated Question Bank navigation/workspace;
- typed Question Bank API client + unit coverage;
- manual/AI import/edit/review/publish/provenance/history/session UX;
- dedicated Quiz Builder navigation/workspace;
- typed quiz/candidate/export client + unit coverage;
- class/subject/multi-lesson quiz creation, version/model selection, published question candidates, lifecycle, immutable post-publish state;
- approved regeneration-apply UX for sourced published bank questions;
- CSV download and print/PDF template action;
- mobile 390px overflow coverage.

## 8. Tests & Verification

### Stage-specific runtime checkpoint

Exact runtime HEAD:

`afbe552710b3f1cf79ee70594f691fa836c05a45`

- Stage13F backend/PostgreSQL run `34420441878` — **SUCCESS**.
- Stage13F Admin/PostgreSQL/real Chromium run `34420441837` — **SUCCESS**.

Backend evidence includes API lint/typecheck/unit/build, clean migrations, DB contracts, Question Bank integration, stable regeneration integration and Quiz Builder integration.

Admin evidence includes Admin lint/typecheck/unit/build, clean PostgreSQL, backend authority regression, deterministic real fixtures and real Chromium Question Bank + Quiz Builder flows.

### Wider runtime matrix

Verification-only Draft PR `#27` targeted `main` from exact runtime HEAD `afbe5527...`, ran **13/13 SUCCESS**, then was closed unmerged.

Runs:

- Stage9 `34420900598`
- Stage10 `34420900550`
- OCR `34420900527`
- Stage11 `34420900592`
- Stage12 `34420900501`
- Stage13 Admin `34420900492`
- Stage13D Content `34420900547`
- Stage13D Admin `34420900488`
- Stage13E Frontend Prep `34420900522`
- Stage13E Admin AI Ops `34420900503`
- Stage13F Backend `34420900520`
- Stage13F Admin/Chromium `34420900476`
- Rebuild `34420900482`

Rebuild passed Product/Brand/UX, clean PostgreSQL, Engineering foundation, Auth, Access, Activation backend, Admin/Student builds and real Student activation/returning-login/recovery Chromium.

### Closure documentation rule

The documentation commit containing this consolidated log must run the same wider PR matrix before non-force fast-forward promotion to `main`. The verification PR itself must be closed unmerged.

## 9. Legacy Coverage Decision

Stage13F closes only legacy rows with actual product/test evidence. It does not claim all Admin Quiz generation/export variants.

Verified Stage13F outcomes include quiz list/create/scope/multi-lesson/multiple-version/add-remove-version, Question Bank edit/manual/remove-from-draft-version behavior, provenance preservation and Excel-compatible exact-version export.

Remaining generation orchestration and specialized export variants are explicitly routed to Stage13G/AI authoring; see `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md`.

## 10. Known Issues / Remaining Work

- `AI-012-019` — live provider benchmark/routes/credentials/bootstrap remains `NOT YET VERIFIED`.
- Stage13G must finish remaining Admin account/code/operations/reporting/settings/audit parity plus the QADMIN/lesson-generation authoring outcomes explicitly left open by Stage13F.
- Track B Stage14 has verified Access/Curriculum/Reader runtime but final shell/copy/a11y closure remains active.
- Track B Stage15 must first incorporate the exact Stage13F checkpoint promoted to `main`.
- Stage16–25 remain ordered product/hardening work.
- Production deployment/cutover remains future release work.

## 11. Next Action

1. exact-head verify this Stage13F closure documentation commit through a verification-only PR;
2. re-check live `main`;
3. if unchanged from Stage13F base, fast-forward `main` non-force to the exact verified closure commit;
4. post the final Stage13F EXECUTION REPORT to Issue #16;
5. Track A starts Stage13G; Track B may then incorporate the new main checkpoint before Stage15.

## 12. Documentation Continuity Contract

Every meaningful batch must synchronize Status, Engineering Log, Queue, Continuity, Handoff/Resume, specialized docs and Issue #16. Never leave continuation-critical state only in Chat. Any unverified statement must remain explicitly `NOT YET VERIFIED`.