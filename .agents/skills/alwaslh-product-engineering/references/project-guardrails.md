# Project Guardrails

Use this reference for changes that span multiple layers, affect architecture, or risk changing product behavior.

## Preserve the same product

The goal is to build a stronger version of **الوسيلة الذكية**, not a different product.

Preserve unless concrete evidence proves a defect or Product Owner explicitly changes them:

- original education-first product idea;
- canonical business rules;
- Student/Admin role separation;
- curriculum/publication/access semantics;
- assessment authority;
- offline security model;
- approved identity foundation and brand assets;
- roadmap continuation point.

A redesign may change navigation, composition, component architecture, spacing, typography implementation, copy quality, state presentation, and page boundaries when those changes improve the same product.

## Understand before modifying

Inspect:
- inputs/outputs;
- callers;
- side effects;
- dependencies;
- authorization boundaries;
- persistence behavior;
- tests;
- migrations/contracts;
- affected user flow;
- visible content/copy;
- approved brand source when UI/identity is touched.

Anything not inspected is `NOT YET VERIFIED`.

## Classification

Classify each affected area:

- `KEEP` — sound and consistent;
- `IMPROVE` — limited refinement;
- `REFACTOR` — internal restructuring while preserving behavior;
- `REBUILD` — current structure is genuinely unsuitable;
- `REMOVE` — unused, duplicated, misleading, or harmful.

Do not use `REBUILD` simply because a screen looks unattractive.

## UX/product boundary

Do not change backend/business contracts only to make a UI mockup easier.

If UX work reveals a real contract flaw:
1. record evidence;
2. describe impact;
3. separate the contract fix from visual work where possible;
4. verify callers/tests/migrations;
5. update project documentation.

## Identity boundary

Do not replace Alwaslh's identity with an external template or reference product.

Product Design, Mobbin, Figma, screenshots, generic skills, and design trends are advisory. Approved repository identity and Product Owner direction outrank them.

## Content boundary

Internal implementation state is not automatically user-facing information.

Production UI must use final human-readable product copy and only display data useful to the current task. Do not leak API/database/cache/signature/revision/sync internals into Student or ordinary Admin screens.

## Page/IA boundary

Do not solve complexity by placing every feature in one page.

- dashboard = overview/entry point;
- major workflow = route/page;
- deeper object/task = focused sub-page where justified;
- tabs = closely related views only;
- dialogs/drawers = short focused interactions, not a replacement for navigation architecture.

## Batch discipline

Prefer small coherent batches:
- design-system foundation;
- app shell/navigation;
- one flow or related screen family;
- state/copy cleanup;
- accessibility correction;
- backend contract correction;
- regression tests.

Do not mix unrelated cleanup into one batch.

## Verification

After changes run applicable:
- lint;
- typecheck;
- unit tests;
- integration tests;
- build;
- browser/Playwright flows;
- responsive checks;
- accessibility checks;
- security/authorization regressions.

Success means the user flow works and the contracts remain correct, not merely that compilation passes.
