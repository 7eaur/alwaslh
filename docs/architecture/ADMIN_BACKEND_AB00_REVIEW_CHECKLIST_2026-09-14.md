# AB-00 Decision Review Checklist — Admin + Backend

Date: 2026-09-14  
Status: **BINDING REVIEW GATE**

This checklist prevents the rebuild from becoming either patching or architecture theater.

Before AB-01 begins, all answers must be YES or explicitly NOT APPLICABLE with evidence.

## Scope / truth

- [x] Student frontend implementation is isolated to its separate workstream.
- [x] Admin + full API/backend/PostgreSQL scope is explicit.
- [x] live `main` was compared by path, not only by commit count.
- [x] current main-only changes do not modify Admin/API/migrations/shared implementation paths at this checkpoint.
- [ ] live `main` is re-compared immediately before AB-01 starts.

## Architecture

- [x] backend remains a modular monolith.
- [x] database/business/security authority stays server-owned.
- [x] Admin app root is composition-only target.
- [x] feature ownership and private/public boundaries are explicit.
- [x] shared layers have narrow ownership and cannot become dumping grounds.
- [x] no mandatory empty Clean Architecture layers/interfaces.
- [x] no new state/query framework without evidence.
- [x] no styling-stack replacement without evidence.
- [x] no microservices/DI framework/service locator authorized.

## Product / IA / design

- [x] route/page ownership is based on operator jobs, not backend module names.
- [x] existing `/app` runtime base is preserved unless deployment evidence justifies a prefix change.
- [x] Overview is attention-first and uses authoritative values only.
- [x] loading/empty/error/permission/conflict/unavailable/success/recovery states are first-class.
- [x] technical internals are progressively disclosed.
- [x] brand/design-system authority is reused, not reinvented.
- [x] RTL/a11y/responsive/reduced-motion are architecture acceptance criteria.

## Migration safety

- [x] AB-00.1 ownership map completed.
- [x] AB-00.2 migration/dependency inventory completed.
- [x] existing legacy exceptions are explicitly frozen.
- [x] Architecture Guard exists and had a successful initial run.
- [x] Guard was reviewed for dynamic-import and app→private-internal gaps and strengthened.
- [ ] strengthened Guard is exact-head green after documentation reconciliation.
- [ ] AB-00.4 reproducible performance/composition baselines recorded.
- [ ] AB-00.5 readiness review passes.

## Implementation discipline

Every future slice must prove:

`operator job → contracts → target owner → states/actions → implementation → outcome tests → route/composition switch → old-owner deletion → exact-head gates → documentation`

A slice is not complete when only the new implementation exists. The old owner must be deleted or have a bounded, documented compatibility-removal condition.
