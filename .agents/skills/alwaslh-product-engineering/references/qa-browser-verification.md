# QA and Browser Verification

Do not approve a UI refactor from code review alone.

## Minimum batch verification

Run what applies:
- lint
- TypeScript/typecheck
- unit tests
- integration/API tests
- production build
- targeted Playwright/browser flows

Use existing repository workflows as the executable contract. Do not weaken tests to make a redesign pass.

## Browser checks

For changed Student screens verify at least:
- narrow mobile
- common mobile
- tablet
- desktop
- RTL
- keyboard/focus where interactive
- loading
- empty
- error
- offline/connection transition when relevant
- installed/PWA context when the feature depends on it

For changed Admin screens verify:
- common desktop
- narrower laptop/tablet fallback
- dense realistic data
- long Arabic labels
- table overflow/reflow
- dialogs/drawers/forms
- keyboard/focus
- loading/empty/error/permission/conflict states where applicable

## Regression checks

Verify:
- navigation/back behavior
- session persistence
- authorization errors
- duplicate submissions
- stale async responses
- destructive confirmation
- no console errors
- no unexpected network loops
- no layout shift that blocks actions

For protected/offline Student flows, retain existing tamper/expiry/account/device/integrity tests.

## Visual review

Screenshots are evidence, not the only evidence.

Compare:
- hierarchy
- spacing rhythm
- typography
- action priority
- state consistency
- RTL correctness
- clipping/overflow
- focus visibility
- responsive composition

A polished screenshot with broken flows is a failed batch.
