---
name: alwaslh-product-engineering
description: Project-specific product engineering and design skill for the Alwaslh "الوسيلة الذكية" repository. Use for any work in 7eaur/alwaslh involving Student PWA/app UX, Super Admin UX, design systems, Arabic RTL, accessibility, React/Vite frontend, API/backend/database, security, performance, tests/QA, architecture, or roadmap continuation. Route work to focused references while preserving canonical business, security, and backend contracts.
---

# Alwaslh Product Engineering

Treat `7eaur/alwaslh` as one real product. Optimize for correctness, clarity, maintainability, learning UX, security, performance, accessibility, and reviewability without overengineering.

## Start every task from evidence

1. Read `PROJECT_STATUS.md` and `PROJECT_ENGINEERING_LOG.md`.
2. For UX/UI work, also read `docs/workstreams/UX_UI_REFOUNDATION_PAUSE_2026-09-12.md`.
3. Inspect the actual callers, contracts, tests, migrations, and runtime surfaces relevant to the task.
4. Mark anything not inspected as `NOT YET VERIFIED`.
5. Do not infer business rules from filenames, screenshots, or external design references.

## Route to the minimum needed references

Do not load every reference automatically.

- Student UI, PWA, installed-app behavior, Reader, assessments, offline UX: read `references/student-pwa-app-ux.md`.
- Super Admin IA, dashboards, navigation, dense operations, tables/forms: read `references/admin-workspace-ux.md`.
- Design tokens, components, RTL, responsive rules, states, accessibility: read `references/design-system-rtl-a11y.md`.
- React/Vite architecture, state, routing, forms, frontend performance: read `references/frontend-engineering.md`.
- API/backend/database/security/performance work: read `references/backend-security-performance.md`.
- Learning journeys, educational interaction logic, assessment UX: read `references/educational-product-logic.md`.
- Browser QA, Playwright, responsive/device checks, regression verification: read `references/qa-browser-verification.md`.
- Product Design, Mobbin, Figma, visual research and prototyping: read `references/research-design-tools.md`.
- Any change that spans layers or alters architecture: read `references/project-guardrails.md`.

## Conflict resolution order

When guidance conflicts, use this order:

1. Current explicit Product Owner direction.
2. Live `main`, executable code, PostgreSQL contracts, executable CI, and verified live runtime evidence.
3. Security, authorization, data integrity, publication, assessment, and offline authority contracts.
4. Project-specific references in this skill.
5. Existing product/design system conventions that remain valid.
6. External plugins, examples, Mobbin references, Figma explorations, generic skills, and visual inspiration.
7. Visual polish.

Never weaken a verified security or business contract to make a screen easier to implement. Never copy an external product pattern when it conflicts with the learning flow or Arabic-first UX.

## Current management boundary

The normal roadmap is paused for UX/UI refoundation. Preserve the verified backend/domain/platform work. Do not start the next roadmap item merely because UI work touches adjacent code.

The exact roadmap return point recorded by the project is:

`STUDENT-016I — True cold-start offline Reader`

Do not redo `STUDENT-016H`.

## Design and implementation rules

- Student is a web technology surface with an installed **app experience**, not a shrunk website.
- Admin is an operational workspace, not a wall of equal cards and modules.
- Share tokens, primitives, semantics, and state language across Student/Admin; do not force identical layouts or density.
- Prefer a small reusable component set over abstraction for its own sake.
- Design all changed flows for loading, empty, error, offline, expired/denied access, disabled, success, and recovery states when applicable.
- Arabic RTL is first-class. Use logical layout properties and verify mixed Arabic/Latin/numeric content.
- Mobile-first for Student; task-density and desktop efficiency for Admin.
- Accessibility and keyboard/focus behavior are acceptance criteria, not final polish.
- Avoid decorative gradients, glassmorphism, glow, repetitive cards, fake metrics, animation without purpose, and generic AI-looking layouts.
- Use motion sparingly and honor `prefers-reduced-motion`.
- Preserve current API contracts whenever possible; if a UI problem exposes a real contract flaw, document evidence and fix the root cause in a separate reviewable batch.

## Required workflow

`Discover → Understand flow → Classify KEEP/IMPROVE/REFACTOR/REBUILD/REMOVE → Design foundation → Implement small batch → Browser verify → Test → Document`

Before a broad redesign, inventory the real routes/screens/components/states and identify the highest-impact structural issues. Do not start from colors or decoration.

After each implementation batch, run all applicable lint, typecheck, unit/integration tests, build, and browser checks. A successful build alone is not product verification.

Update `PROJECT_ENGINEERING_LOG.md` and `PROJECT_STATUS.md` with findings, decisions, changed files, tests, exact commit/PR evidence, known issues, and next action.
