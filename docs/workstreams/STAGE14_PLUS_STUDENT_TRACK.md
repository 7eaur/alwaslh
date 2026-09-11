# Stage14+ Student Product Parallel Track

> Active Product Owner execution override for `parallel/stage14-student-product`.
> This document is branch-specific operating authority for the Student track and must be read together with latest Issue #16.

Last synchronized: 2026-09-10.

## 1. Mission

Build the Student-facing product from Stage14 onward as the best version of the same **الوسيلة الذكية** product while preserving valuable legacy outcomes, business rules and user flows.

This track starts at **Stage14 — Student Web/PWA Product** and proceeds sequentially through later Student/Product/Hardening stages, one verified batch/stage at a time.

The goal is not a visual rewrite only. The owner must understand actual code, contracts, data, flows, tests and dependencies before modifying them.

## 2. Branch / baseline

- Repository: `7eaur/alwaslh`
- Branch: `parallel/stage14-student-product`
- Initial baseline: stable `main @ 5fdb23030c77cae9bff5f8c33d4be466427eb6e5`
- Do not reset this branch onto unverified Stage13F work.
- When Track A promotes verified shared contracts to `main`, inspect and integrate them deliberately before implementing dependent Student features.
- No force-push or shared-history rewrite.

## 3. Shared execution ledger

GitHub Issue **#16** is the single shared cross-chat execution ledger.

Every meaningful batch must post an `EXECUTION REPORT` containing:

```md
### EXECUTION REPORT
Track: Student Stage14+
Stage/Feature:
Branch/HEAD:
Inspected:
Implemented:
Architecture/contracts/schema/UI changed:
Root causes/fixes:
Tests executed + exact results:
Security/performance/UX review:
Dependencies on Track A:
Known issues:
NOT YET VERIFIED:
Documentation updated:
Decision:
Exact next action:
```

Do not leave continuation-critical state only in chat.

## 4. Mandatory startup for any new conversation

Read actual files/code in this order before changing code:

1. `README.md`
2. `DOCUMENTATION_INDEX.md`
3. this file: `docs/workstreams/STAGE14_PLUS_STUDENT_TRACK.md`
4. `docs/workstreams/STUDENT_PRODUCT_TRACK_STATUS.md`
5. `PROJECT_HANDOFF.md`
6. `PROJECT_STATUS.md`
7. `PROJECT_RESUME_SNAPSHOT.md`
8. `PROJECT_ENGINEERING_LOG.md`
9. `PROJECT_INTEGRATION_CONTINUITY.md`
10. `PROJECT_EXECUTION_QUEUE.md`
11. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`
12. latest Issue #16 body/comments
13. `MASTER_REBUILD_ROADMAP.md`
14. `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md`
15. `PRODUCT_FEATURE_PARITY_MATRIX.md`
16. actual `apps/student-web` source/tests/config/build
17. relevant API/contracts currently on the branch/main
18. current GitHub Actions for Student/rebuild gates

Code/migrations/executable evidence outrank prose. Anything not inspected/executed is `NOT YET VERIFIED`.

## 5. Ownership boundaries

### Track B owns by default

- `apps/student-web`
- Student routing/navigation/session UX
- Student dashboard
- entitled curriculum browsing
- Lesson Reader/media/text/search/TTS UX
- Practice/Test/Model Student experience once canonical backend authority is available
- Offline/PWA
- Notes/Favorites/Needs Review
- Student notifications UX
- Student progress/statistics/private achievements
- Student-specific frontend tests/E2E/accessibility/responsive behavior
- Student design-system application and product polish

### Track A owns by default

- `apps/api`
- `apps/admin-web`
- `database/migrations`
- Auth/Access canonical backend rules
- Content/Media/OCR backend/admin operations
- AI generation/runtime/provider routing
- Question Bank persistence/review/publication
- Quiz Builder/versioning/regeneration/export authority
- shared DB/security/backend integration

Track B must not create a second backend authority because a shared API is missing.

If a missing shared contract blocks work:

1. inspect whether an existing contract/API already solves it;
2. record the dependency in Issue #16;
3. if a tiny non-conflicting shared change is genuinely needed and safe, document it before editing shared areas;
4. otherwise consume Track A's verified integration when it lands.

## 6. Critical dependency rule

Stage14 may proceed in parallel because curriculum/content/auth foundations already exist on stable main.

**Stage15 assessment consumption depends on Track A closing and integrating Stage13F Question Bank / Quiz Builder authority.**

Do not implement Stage15 with mocks/fake Question Bank persistence/duplicate quiz models. If Track A is not integrated when Stage15 is reached, stop at the dependency boundary, document it in Issue #16 and continue only work that does not violate sequence/authority.

## 7. Product / UX quality bar

Treat Student Web as a production learning product, not a generic dashboard.

Priorities:

`Function → Clarity → Learning UX → Hierarchy → Consistency → Accessibility → Visual polish`

Mandatory qualities:

- Arabic-first RTL
- mobile-first
- responsive tablet/desktop
- keyboard/focus accessibility
- semantic labels and screen-reader-friendly structure
- strong touch targets
- coherent typography/spacing/radius/grid
- restrained motion and reduced-motion support
- consistent loading / skeleton / empty / error / offline / stale / sync / session-expired states
- clear entitlement/locked-content behavior reflecting server authority
- no decorative card overload
- no gratuitous gradients/glow/glassmorphism
- fast navigation and content reading
- preserve student context when moving between class/subject/lesson/practice
- offline state must be explicit, not pretend-online

Design should feel purpose-built for Arabic students and study sessions, not like an admin panel recolored for students.

## 8. Stage sequence

### Stage14 — Student Web/PWA Product

Required product outcomes:

- entitled Classes / Subjects / Lessons browsing
- Student dashboard focused on continuing learning
- Reader workspace for lesson media/text
- search/TTS where supported by existing contracts
- Notes/Favorite/Needs Review entry points as appropriate to verified scope
- Practice/Tests/Models entry architecture without inventing Stage15 authority
- progress/private achievements/notifications surfaces where backed by current contracts
- RTL mobile-first UX
- loading/error/empty/offline/session-expiry states
- accessibility and real browser evidence

Before coding, audit actual Student Web and classify components `KEEP / IMPROVE / REFACTOR / REBUILD / REMOVE`; uninspected = `NOT YET VERIFIED`.

### Stage15 — Practice / Assessment Engine

Only after canonical published Question Bank/Quiz authority from Track A is available:

- Practice feedback
- Test/Model finalization
- stable question/version identities
- option shuffle/randomization using stable IDs
- resume/restart/history
- deterministic scoring
- exact lesson/page/source provenance
- published authority only

### Stage16 — Offline / PWA

- account/device-scoped IndexedDB
- explicit downloads
- bounded entitlement lease
- storage budgets
- revisions/tombstones/outbox/delta sync
- safe Service Worker update lifecycle

### Stage17 — Personal Learning Data

- Notes
- Favorites
- Needs Review
- stable provenance
- explicit local/server sync rule

### Stage18 — Notifications

- In-App
- Web Push where supported
- secure subscription lifecycle
- quiet hours / opt-out

### Stage19 — Progress / Statistics / Achievements

- trusted metrics
- sufficient-sample recommendations
- private achievements
- no unapproved global leaderboard

### Stage20 — Import / Export / Reporting

Student-facing behavior only where applicable; do not duplicate Admin exports owned by Track A.

### Stage21–25 — Product hardening

Proceed sequentially using `MASTER_REBUILD_ROADMAP.md`:

- performance engineering
- security hardening
- automated test/CI expansion
- accessibility/device QA
- initial production content/load verification as applicable

Production deployment remains separately approved work.

## 9. Engineering rules

- Understand actual callers, inputs, outputs, state and side effects before changes.
- Preserve contracts where possible.
- No blind rewrite.
- No fake API data for acceptance.
- No browser-owned canonical business state.
- No direct DB authority from frontend.
- No auth bypass.
- No test weakening.
- No hidden localStorage duplication where a canonical repository exists.
- No random sleeps/timeouts to hide races.
- Root-cause fixes only.
- Prefer simplest maintainable architecture.

## 10. Verification rules

After each meaningful batch run relevant available gates such as:

- Student lint
- strict typecheck
- unit tests
- build
- API contract/integration tests when Student behavior depends on them
- real Chromium/Playwright for critical flows
- responsive 390px / tablet / desktop checks
- keyboard/focus/accessibility checks
- offline/PWA tests when relevant
- wider regressions before stage closure

A build passing alone does not make a stage verified.

## 11. Documentation rules

During work, keep updated:

- `docs/workstreams/STUDENT_PRODUCT_TRACK_STATUS.md`
- specialized Stage14+ docs as created
- `PROJECT_ENGINEERING_LOG.md` when architecture/findings materially change
- `PROJECT_STATUS.md` / `PROJECT_RESUME_SNAPSHOT.md` when branch-level truth changes
- `LEGACY_FEATURE_COVERAGE_GATE.md` only when executable evidence justifies promotion of rows
- Issue #16 after every meaningful batch

Record exact HEAD and run IDs.

## 12. Integration discipline with Track A

Before consuming newly promoted Track A work:

1. inspect latest `main` and Track A closure report;
2. compare branch divergence;
3. integrate only verified shared contracts;
4. resolve conflicts by preserving canonical backend/business rules;
5. rerun Student quality + dependent E2E on the integrated head;
6. record the integration checkpoint in Issue #16 and Student Track Status.

Do not merge unfinished Stage13F branch merely to gain an API early.

## 13. Current first action

Start **Stage14 Repository Discovery** on `parallel/stage14-student-product`:

- inspect `apps/student-web` actual source, routes, components, state, APIs, styling and tests;
- inspect verified Auth/Entitlement/Curriculum/Content contracts it must consume;
- map Stage14 legacy Student rows to current implementation;
- classify `KEEP / IMPROVE / REFACTOR / REBUILD / REMOVE`;
- create/update Stage14 execution plan based on evidence;
- then implement incrementally with tests and real browser verification.

Do not begin by redesigning screens before understanding current flows and contracts.
