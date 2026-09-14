# Admin Product Design + Architecture Rules — الوسيلة الذكية

Date: **2026-09-14**  
Status: **BINDING for Admin + Backend rebuild**  
Scope: `apps/admin-web` + Admin-facing API/backend contracts. Student frontend remains a separate workstream.

## 1. Why this document exists

The Student frontend workstream established several strong product-engineering rules that are general enough to reuse without coupling the two implementations. This document adapts those principles to Super Admin so the Admin rebuild is not only structurally clean, but also clear, usable, fast and coherent.

This document does **not** copy Student UI structure, components or routes. It borrows proven decision principles only.

## 2. Binding design priority

Every Admin decision follows this order:

**Clarity → Ease of use → Flow → Visual comfort → Consistency → Polish**

Architecture adds two non-negotiable constraints around that order:

**Correct ownership before convenience** and **verified contracts before visual preservation**.

Acceptance target:

**Functional + Clear + Easy + Predictable + Comfortable + Consistent + Fast + Maintainable + Professional**

A page is not accepted merely because it looks polished or because it preserves the current UI.

## 3. Legacy presentation is not a preservation contract

Current Admin screens are evidence for capabilities, data and workflows. They are not automatically the target presentation.

Preserve:

- valid business behavior;
- server/database authority;
- security and authorization rules;
- review/publication/revision/audit semantics;
- useful operator workflows;
- verified API contracts.

Do not preserve merely because it exists:

- crowded page composition;
- repeated cards/tabs/navigation;
- giant multi-workflow screens;
- technical wording exposed to normal operators;
- feature ownership in root files;
- visually equal actions with different importance;
- duplicated filters/forms/status blocks;
- obsolete compatibility surfaces after replacement parity.

## 4. One operator job, one primary owner

A route/page should answer one dominant operator job.

Examples:

- Overview answers: **what requires attention now?**
- Curriculum answers: **how is educational structure organized?**
- Content answers: **what content exists and where is it in its lifecycle?**
- Review answers: **what needs a human decision?**
- Question Bank answers: **how are questions created, reviewed, revised and reused?**
- Quiz Builder answers: **how are quiz versions composed and exported?**
- Students answers: **how are learner accounts/devices/access issues managed?**
- Access Codes answers: **how are codes generated, filtered, revoked and reported?**
- Operations answers: **is the system healthy, auditable and operationally actionable?**

If a screen has several independent primary jobs, split the route/composition instead of adding more tabs, cards or accordions.

## 5. Overview is not duplicated navigation

The Admin Overview must be **attention-first**, not a second sidebar rendered as cards.

Allowed:

- actionable exceptions;
- review queues;
- failures requiring intervention;
- concise system/content attention indicators supported by real data;
- clear links into the owning workflow.

Avoid:

- repeating every sidebar destination as a tile;
- decorative KPI grids without a decision attached;
- fake trend/health/progress values;
- duplicating the same task in summary cards, tabs and navigation simultaneously.

Only authoritative real values may appear as metrics.

## 6. Navigation and IA rules

- One Admin shell owns global chrome/navigation.
- Primary navigation is bounded and grouped by operator lifecycle, not backend directory names.
- Routes are deep-linkable and browser history/back behavior is first-class.
- Tabs are only for closely related views of the same entity/workflow.
- Dialogs/drawers are for bounded actions, not page-sized workflows.
- A compatibility route may exist temporarily, but must have a documented removal condition.
- Technical IDs may exist in URLs/contracts while remaining secondary in normal presentation.

## 7. Interaction affordance rules

Actions must look like actions before interaction.

- primary action is visually obvious;
- secondary/advanced actions do not compete with the primary action;
- static status/information does not look clickable;
- dangerous actions are visually and semantically distinct;
- disabled states explain why when useful;
- repeated icon-only controls require accessible labels/tooltips where meaning is not obvious;
- touch-capable responsive surfaces preserve comfortable interactive targets, with `44px` as the default minimum where practical for touch interactions;
- keyboard order follows visual/task order.

## 8. Product states are first-class architecture

Every important Admin workflow must explicitly design and test:

- loading;
- empty;
- error;
- permission/authorization denial;
- invalid input;
- conflict/stale data where applicable;
- unavailable dependency/service;
- success/confirmation;
- destructive confirmation;
- retry/recovery path.

Do not treat these as leftover conditional text at the end of implementation.

Backend error truth/codes remain server-owned. Admin UI maps them into:

**what happened → what it means operationally → what the operator can do next**.

Raw stack/runtime/provider/database messages are diagnostics, not default product copy.

## 9. Progressive disclosure for technical detail

Normal operator surfaces prioritize decisions and actions.

Advanced-only unless directly needed:

- UUIDs/internal IDs;
- provider names/config keys;
- raw JSON;
- hashes/checksums;
- storage paths;
- pipeline/runtime internals;
- stage/CI terminology;
- database implementation detail.

Diagnostics may expose these through an explicit advanced/details surface without polluting primary workflows.

## 10. No fabricated operational data

Never create fake:

- health scores;
- success percentages;
- trends;
- queue counts;
- time savings;
- completion metrics;
- SLA indicators;
- activity counts;
- business outcomes.

If the backend does not authoritatively provide a value, omit it or present an honest unavailable/zero state only when zero is actually authoritative.

## 11. Route-level performance is architecture

Destination-level code splitting is mandatory by default for major Admin feature areas.

Rules:

- auth/session/shell/bootstrap stay in the critical path only when needed;
- unrelated feature workspaces do not enter the initial bundle;
- no heavy library is added for a single small interaction without evidence;
- avoid duplicate requests caused by unclear ownership;
- route loading should preserve orientation and avoid layout collapse;
- bundle budgets are based on measured improved baselines, not warning suppression.

Raising Vite warning thresholds is not a performance fix.

## 12. Motion rule

Motion is an affordance, not decoration.

Use restrained transition/motion only to clarify:

- state change;
- open/close;
- focus/context transition;
- feedback.

No continuous decorative motion, heavy animation framework or exaggerated transition is justified by default. `prefers-reduced-motion` remains mandatory.

## 13. Design-system ownership

Binding direction:

`brand tokens → primitives → components → patterns → feature compositions`

Shared layers own semantics such as:

- typography;
- spacing;
- focus;
- buttons/inputs;
- status tone;
- form validation;
- dialogs/drawers;
- table/list shells;
- pagination/search/filter controls;
- loading/empty/error states;
- responsive behavior patterns.

Features own business composition and vocabulary.

A feature must not create a competing local design system to solve a page-specific problem.

## 14. Responsive / RTL / accessibility rules

- Arabic-first and RTL-native; use logical CSS properties.
- Mixed IDs/numbers/code use local `dir="ltr"`/isolation only where required.
- Desktop density may be high but must remain readable.
- Narrow layouts must intentionally recompose, not merely stack the desktop sidebar/table.
- Tables require an intentional narrow-screen strategy.
- No horizontal overflow on supported widths.
- Visible keyboard focus is mandatory.
- Focus moves intentionally after route/dialog/result transitions when context changes.
- Semantic headings/landmarks/labels remain coherent.
- Color alone never communicates state.

## 15. Browser-test philosophy

Browser tests assert **operator outcomes and contracts**, not obsolete presentation copy/selectors.

Good acceptance:

- operator can reach the route;
- authoritative data appears;
- action succeeds/fails with the correct outcome;
- permission is enforced;
- focus/context is restored correctly;
- no horizontal overflow;
- representative responsive/RTL flow works.

Bad acceptance:

- preserving an old heading purely because a test searched for its exact text;
- preserving obsolete DOM structure/selectors after a valid UX rebuild;
- weakening a real contract to keep a fixture convenient.

Tests should use stable semantic selectors/roles/test IDs only where they represent durable product meaning.

## 16. Admin/backend coupling rule

The UI must not compensate for weak backend boundaries with client-side business logic.

Canonical flow:

`PostgreSQL → application/domain authority → HTTP contract → feature API adapter → presentation model → UI`

For writes, reverse through the same boundary.

- validation at API/domain boundaries;
- business transitions server-owned;
- Admin derives display state, not canonical workflow state;
- API DTOs may be adapted into view models when presentation needs differ;
- raw database rows are never an accidental UI contract.

## 17. Structural simplicity rules

Prefer the simplest structure that preserves ownership and future changeability.

Avoid:

- abstraction for abstraction's sake;
- generic components with dozens of feature-specific flags;
- one mega-hook that coordinates many unrelated workflows;
- global state for local page state;
- duplicate adapters for the same endpoint;
- feature folders that merely wrap old giant files unchanged.

A clean architecture is measured by how obvious change ownership is, not by the number of layers.

## 18. Review questions before every Admin UI batch

Before implementation ask:

1. What operator job is this route solving?
2. Is this the correct feature owner?
3. Which backend/database contracts are authoritative?
4. What information is necessary for the decision, and what is noise?
5. Is any navigation/action duplicated elsewhere?
6. Are primary/secondary/destructive actions visually distinct?
7. What are loading/empty/error/permission/conflict states?
8. Does this need route-level lazy loading?
9. Is technical information progressively disclosed?
10. Can the same result be achieved with fewer components/state/fetches?
11. Does keyboard/RTL/responsive behavior remain intentional?
12. Which old owner is removed after parity?

No implementation batch is complete until these questions have explicit answers in the batch evidence/log.

## 19. Relationship to Student workstream

The Student workstream remains independent (`stage16/student-016i`, PR #57 at time of adoption). Its implementation is not copied here.

Reusable principles adopted here are limited to product-engineering lessons such as:

- preserve contracts, not presentation debt;
- clarity/ease/flow before polish;
- outcome-based browser acceptance;
- honest data only;
- first-class failure states;
- restrained motion;
- route-level code splitting;
- obvious affordance;
- one shell/one owner/no duplicate navigation.

Future changes in Student frontend do not automatically change Admin rules. Admin/backend decisions remain owned by this workstream and its verified code/contracts.