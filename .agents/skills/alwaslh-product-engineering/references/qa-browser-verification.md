# QA & Browser Verification

Browser verification is required for UX/UI changes because correctness cannot be inferred from code or build success alone.

## Verify the real task

For each changed flow verify:

- entry point;
- expected route/page hierarchy;
- primary action;
- back/exit path;
- loading/empty/error/offline/permission states;
- responsive behavior;
- keyboard/focus behavior where applicable;
- visible copy/data quality;
- no leaked implementation jargon;
- no unrelated workflow sections stacked into the same page without a product reason.

## Student device coverage

At minimum cover representative:

- narrow phone;
- common phone;
- tablet;
- desktop/browser fallback.

For PWA-related changes also verify installed/app-like viewport behavior where tooling permits.

Check safe-area collisions, sticky/bottom navigation, virtual keyboard interactions, and scroll traps.

## Admin coverage

Verify realistic desktop widths first, then responsive fallback.

Check:
- global navigation grouping;
- contextual navigation;
- page title/action hierarchy;
- tables at realistic column/data density;
- filter/search behavior;
- forms/dialogs/drawers;
- long labels and Arabic wrapping;
- no dashboard/page becomes an unstructured wall of unrelated sections.

## Visible-content QA

Treat poor copy as a product defect when it confuses the user.

Reject screens containing:
- TODO/placeholder/developer notes;
- raw enum keys;
- stack/API/database/cache/signature/revision/sync terminology without a genuine operator need;
- fake KPIs or invented claims;
- inconsistent names for the same domain concept;
- buttons whose labels describe implementation instead of user intent.

## Automated/browser tests

Use Playwright/browser tooling for meaningful user journeys, not only selectors.

Prefer assertions on:
- visible user state;
- navigation destination;
- accessibility role/name;
- persistence/resume where relevant;
- error/recovery behavior;
- actual responsive composition;
- offline/online transitions where relevant.

Avoid brittle tests coupled to decorative DOM structure.

## Visual regression

Use screenshots when layout consistency, responsive behavior, RTL, or identity compliance is material.

Review screenshots as evidence, not as proof that interactions/business behavior are correct.

## Completion gate

A frontend batch is not complete until:

1. applicable lint/typecheck/tests pass;
2. production build passes;
3. changed browser flows work;
4. changed responsive targets are inspected;
5. changed accessibility/focus behavior is inspected;
6. visible copy/data is production-ready;
7. no verified backend/security/business contract regressed;
8. project status/log are updated.
