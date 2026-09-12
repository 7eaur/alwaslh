# UX/UI REFOUNDATION IMPLEMENTATION ROADMAP — الوسيلة الذكية

Date: **2026-09-12**  
Active baseline: UX/UI refoundation paused normal roadmap.  
Normal roadmap resumes only at **`STUDENT-016I`** after this track closes.

## 1. Objective

Refactor the current frontend foundations into:

- an installed-app Student experience;
- an operational Super Admin workspace;
- one coherent identity/design system;
- product-ready Arabic copy/data presentation;
- route-based screen boundaries;
- preserved backend/security/business contracts.

This is **incremental refoundation**, not a blind code rewrite. Visual composition itself may be rebuilt whenever that is the simplest way to reach product quality.

## 2. Execution rules

Each batch must:

1. start from refreshed live `main` unless explicitly dependent on an unmerged earlier refoundation branch;
2. have one clear frontend/product purpose;
3. avoid unrelated backend/database changes;
4. preserve existing API contracts where possible;
5. keep E2E behavior coverage or update it to equivalent route/user behavior;
6. run applicable lint/typecheck/unit/integration/build/Chromium gates;
7. verify RTL/responsive/keyboard/states for changed flows;
8. update `PROJECT_ENGINEERING_LOG.md`, `PROJECT_STATUS.md` and Issue #16;
9. record exact branch/commit/PR/run IDs;
10. mark unavailable evidence `NOT YET VERIFIED`.

### 2.1 Product-quality design ownership — binding from UX-B04 onward

The engineer/designer executing a batch owns the **final product quality**, not merely functional parity.

Binding rules:

- the current UI is evidence for features, flows, contracts, edge cases and data — **not a visual reference that must be preserved**;
- keep the approved Alwaslh identity, product logic and authority contracts, but freely rethink layout, composition, hierarchy, spacing, typography, navigation, density, component patterns, data presentation, interaction patterns and responsive behavior;
- do not default to incremental cosmetic improvement when the current composition is structurally weak;
- prefer the best pattern for the task: focused screen, list, table, split view, details page, tabs, drawer, dialog, action bar or another justified pattern instead of repeating card layouts;
- Student must feel like a focused educational app, not a dashboard or a desktop website compressed onto mobile;
- Admin may be dense but must remain clear, grouped and fast; **dense != crowded**;
- consistency comes from the system while page composition may vary by job-to-be-done;
- visual polish must not add heavy animation libraries, excessive DOM, unnecessary effects/assets, over-rendering or extra network traffic;
- external references such as Mobbin/Figma/Product Design are supporting research/prototyping tools only; Alwaslh code, contracts, product rules and approved identity remain source of truth.

Before any changed screen is accepted, explicitly judge:

1. Is this the best organization for the task?
2. Can the user understand what to do within seconds?
3. Can anything nonessential be removed?
4. Is hierarchy clear and content production-ready?
5. Does it look like a real professional product rather than a template, developer tool or AI-generated UI?
6. Does it work at the target phone/tablet/desktop sizes with correct RTL?
7. Are keyboard/focus/contrast/state semantics accessible?
8. Does it follow the design system without forcing every page into the same composition?
9. Is it performant and maintainable?
10. Would the responsible engineer approve shipping this screen to real users?

If any relevant answer is **no**, the screen is not complete even when it is functional.

No Stage17 work and no `016I/R/S/O/G` implementation is allowed inside this track.

---

# 3. Batch sequence

## UX-B00 — Foundation documentation and audit

Scope:

- Master UX/UI audit;
- Target IA;
- Design System Spec;
- Content Language Rules;
- this implementation roadmap;
- synchronize central status/log/Issue #16.

Code changes: none.

Acceptance:

- current surfaces classified KEEP/IMPROVE/REFACTOR/REBUILD/REMOVE;
- target Student/Admin hierarchy explicit;
- contracts/non-goals explicit;
- `STUDENT-016I` remains exact return point.

## UX-B01 — Shared frontend foundation

Scope:

- choose and introduce route foundation for both React apps;
- add stable application shell/navigation primitives without moving every feature;
- add shared presentation primitives where duplication is proven: PageState, StatusBadge, Button/Field semantics as needed;
- align official brand assets in Student/Admin shell/login;
- extend shared tokens only for evidence-backed app/admin layout roles;
- establish product error/status mapping layer rather than raw error display.

Non-goals:

- no mass visual redesign;
- no API changes;
- no feature workflow migration yet.

Acceptance:

- direct URL and browser back work for migrated shell destinations;
- auth/session bootstrap remains correct;
- official identity used;
- focus moves to route content appropriately;
- no raw technical error regression.

## UX-B02 — Student shell and navigation

Scope:

- authenticated Home shell;
- stable Home / Learn / Practice / Downloads navigation;
- Account entry;
- mobile bottom nav with safe area;
- tablet/desktop adaptive rail/header;
- global offline indicator;
- remove aggregate `StudentAccessSection` as the default composition while retaining underlying components temporarily.

Acceptance:

- mobile-first installed-app feel;
- 4 stable learning destinations;
- no fake Personal Learning/Progress destinations;
- keyboard/focus/back behavior verified;
- activation/login/recovery continue to work.

## UX-B03 — Student Learn / Curriculum / Reader

Scope:

- Learn/subject/lesson route hierarchy;
- separate curriculum browsing from Reader;
- dedicated Reader shell;
- migrate existing protected media/speech/loading/error behavior;
- copy cleanup for publication/media internals.

Non-goal:

- do not implement `STUDENT-016I` cold-start offline Reader.

Acceptance:

- online Reader behavior parity;
- entitlement/publication/media contracts preserved;
- direct lesson route works only through authorized data;
- Reader back/focus/responsive behavior verified.

## UX-B04 — Student Practice / Assessment

Scope:

- Practice list route;
- quiz/attempt route boundaries;
- focused active assessment shell;
- redesign Practice/Assessment composition from the learner task outward rather than preserving the legacy card-grid/workspace layout;
- remove server/version/developer-roadmap copy from normal Student presentation;
- preserve server scoring/finalization.

Acceptance:

- current Stage15 E2E scenarios pass through new navigation;
- attempt actions/results unchanged in authority;
- leaving/returning behavior explicit;
- Practice library, quiz choice, active attempt and result each have a clear single purpose and product-grade hierarchy;
- active assessment suppresses distracting global navigation and works as a focused phone-first learning task;
- changed screens pass the Product-quality design ownership gate in §2.1.

## UX-B05 — Student Downloads / Account / Copy closure

Scope:

- dedicated Downloads library;
- learner-facing offline statuses;
- Account/access route;
- remove SHA-256/SW/Cache/revision/device-key implementation copy;
- consistent empty/error/offline/access states.

Acceptance:

- existing download/materialization/remove behavior preserved;
- security integrity logic untouched;
- Student production copy scan finds no forbidden implementation terms in normal UI.

---

## UX-B06 — Admin shell and grouped navigation

Scope:

- route-based Admin shell;
- grouped global navigation according to Target IA;
- responsive navigation drawer for narrow widths;
- official brand asset;
- Dashboard as overview only;
- move Notifications to dedicated route;
- remove Stage/cache/repository copy from shell/dashboard.

Acceptance:

- deep links/browser back/history;
- grouped navigation scanability;
- no static 11-item nav block on mobile;
- session expiry remains correct;
- Dashboard contains only actionable overview blocks.

## UX-B07 — Admin Curriculum hierarchy

Scope:

- Classes list/detail;
- Offering detail;
- Lesson detail;
- move lesson summary/export capabilities out of parity panel into Lesson detail;
- creation operations become short dialog/dedicated route according to complexity.

Acceptance:

- current curriculum CRUD E2E behavior preserved;
- no mixed create-all + browse-all wall;
- `LessonAuthoringParityPanel` removable after parity proof.

## UX-B08 — Admin Content / Ingestion / OCR

Scope:

- Content Library/list/detail;
- Ingestion list/new/task detail;
- OCR Review queue/detail;
- progressively disclose technical path/MIME/error metadata;
- preserve upload/ready/publication distinction.

Acceptance:

- ingestion + content E2E coverage passes;
- upload never implies publication;
- failure/retry states actionable.

## UX-B09 — Admin AI Operations / Human Review

Scope:

- AI jobs list/detail routes;
- first-class Human Review queue/detail;
- keep existing adapter/view-model/polling logic where sound;
- hide raw job/output/prompt IDs from primary presentation;
- move diagnostics under advanced detail.

Acceptance:

- Stage13E/G AI operational contracts preserved;
- human review remains separate from publication;
- pagination/latest-authority semantics unchanged.

## UX-B10 — Admin contextual AI Authoring

Scope:

- move lesson generation to Lesson detail;
- move quiz generation to Quiz workflow;
- move question regeneration to Question detail;
- remove raw output-ID happy-path entry;
- retire catch-all AI authoring screen only after all capabilities are reachable.

Acceptance:

- no AI capability loss;
- no auto-publication;
- old `AdminAiAuthoringWorkspace` removable after E2E parity.

## UX-B11 — Question Bank

Scope:

- questions list/new/detail routes;
- lifecycle actions on detail;
- contextual regeneration;
- human status labels and conflict recovery.

Acceptance:

- Question Bank publication/revision rules unchanged;
- current Question Bank E2E scenarios pass.

## UX-B12 — Quiz Builder

Scope:

- quiz list/new/detail;
- version editor route;
- candidate search inside version editing task;
- move metadata panel capability into Quiz detail;
- retire parity metadata panel.

Acceptance:

- published immutable version authority preserved;
- current Quiz Builder E2E scenarios pass.

## UX-B13 — Students / Access / Code Files

Scope:

- Students list/detail;
- Access Codes page;
- move CSV import/export/print under Access Codes/files;
- remove misleading top-level “Files/Reports” destination;
- recovery/device/access actions remain explicit and safe.

Acceptance:

- current student/access/report E2E coverage passes under new IA;
- security/recovery contracts unchanged.

## UX-B14 — Operations / Audit / System Status

Scope:

- dedicated Audit route;
- human event labels/filters;
- Notifications final placement;
- constrained System Status diagnostics;
- remove config dump from general Admin UX.

Acceptance:

- required operational diagnostics remain available;
- raw DB/session implementation values are not default content;
- audit investigations remain precise.

---

## UX-B15 — Cross-product state/copy/design cleanup

Scope:

- remove legacy parity CSS/components after confirmed migrations;
- consolidate stable duplicated state/status/date/error primitives;
- scan visible Student/Admin copy for forbidden developer text;
- remove dead/legacy UI;
- reconcile official logo/favicon/app icons usage;
- tune spacing/density without creating decorative redesign debt.

Acceptance:

- no user-visible Stage/parity/TODO/developer copy;
- no raw Student crypto/storage terms;
- shared primitives used where behavior repeats;
- no capability loss.

## UX-B16 — Responsive / RTL / accessibility closure

Scope:

- phone/tablet/desktop matrix;
- Student installed PWA safe areas;
- Admin drawer/dense tables/forms;
- RTL/bidi;
- keyboard/focus/dialogs/menus;
- reduced motion;
- contrast;
- 200% zoom/narrow viewport.

Acceptance:

- changed critical flows pass device/browser matrix;
- no blocked keyboard path;
- no navigation overlap or clipped primary action;
- no tiny compressed Admin table text as responsive strategy.

## UX-B17 — Visual regression + refoundation closure

Scope:

- final Playwright/Chromium regression matrix;
- visual screenshots/diffs where tooling is available;
- full affected Student/Admin lint/typecheck/tests/build;
- exact-head CI;
- final dead-code cleanup;
- synchronize docs/Issue #16;
- explicitly hand normal roadmap back to `STUDENT-016I`.

Closure requires evidence, not screenshots alone.

---

# 4. Branch/PR policy

Recommended short branches:

- `ux/refoundation-foundation`
- `ux/shared-foundation`
- `ux/student-shell`
- `ux/student-learning`
- `ux/student-assessment`
- `ux/student-offline-account`
- `ux/admin-shell`
- `ux/admin-curriculum`
- `ux/admin-content`
- `ux/admin-ai-review`
- `ux/admin-authoring`
- `ux/admin-questions`
- `ux/admin-quizzes`
- `ux/admin-students-access`
- `ux/admin-operations`
- `ux/refoundation-closure`

A branch can be split further if diff size or ownership becomes too large.

Do not mix Student and Admin workflow migrations in one commit unless the change is truly shared foundation.

# 5. Required test matrix by batch

Minimum applicable commands/workflows:

- lint;
- strict typecheck;
- unit tests for changed API adapters/view models/components;
- production build;
- existing domain E2E for affected flow;
- Chromium shell/browser E2E when routing/shell changed;
- same-head GitHub Actions before merge.

Manual/browser checks for changed screens:

- phone narrow viewport;
- representative tablet;
- desktop;
- RTL;
- keyboard-only;
- loading;
- empty;
- error;
- offline where applicable;
- permission/session expiry where applicable.

If the current execution environment cannot produce visual screenshots, record them as `NOT YET VERIFIED` and rely on executable browser evidence only until a screenshot-capable environment is available.

# 6. Refoundation exit gate

Close the refoundation only when:

1. Student and Admin use stable route/navigation foundations;
2. highest-impact mixed/monolithic surfaces are split according to target IA;
3. Student feels like an installed educational app, not a long responsive webpage;
4. Admin is a grouped operational workspace;
5. changed production copy contains no inappropriate technical/developer text;
6. shared identity/design-system/state semantics are consistent;
7. critical responsive/RTL/accessibility matrix passes;
8. affected E2E behavior remains green;
9. no backend/security/business contract regression is introduced;
10. `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, Issue #16 and this roadmap contain exact closure evidence;
11. next normal engineering action is explicitly reset to **`STUDENT-016I`**.