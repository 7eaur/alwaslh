# AB-00.5 Foundation Readiness Review — Admin + Full Backend

Date: **2026-09-14**  
Status: **PASS — AB-01 AUTHORIZED**

## Decision

AB-00 is ready to close and AB-01 foundation work may begin.

This is authorization for the **smallest evidence-backed foundation batches**, not for a mass file move or broad rewrite.

## Evidence reviewed

- live `main`: `3053640cc5bb0699cfa7456cf646e8997f6aa81b` immediately before this gate;
- current architecture branch compared to live `main` by path;
- Student frontend remains isolated in its separate workstream;
- no new `main` movement occurred since the reviewed divergence checkpoint;
- Admin/backend scope and full Student-facing backend ownership are explicit;
- AB-00.1 ownership map: complete;
- AB-00.2 dependency/migration inventory: complete;
- strengthened architecture guard implementation: green at `2b0106cddfaefd4b481a75b70b66926ffa52135e`, run `34797722703`;
- commits after that guard verification through the AB-00 baseline are documentation-only with respect to guard implementation;
- AB-00.4 baseline: complete in `ADMIN_BACKEND_BASELINE_2026-09-14.md`;
- baseline head `4e4e75445cf18d0e811f60b023c52cd7696bd102` has green Admin AI and Combined real integration evidence;
- PR #52 remains Draft / unmerged / no auto-merge.

## Branch reconciliation result

The branch remains diverged from `main`, but `main` has not advanced beyond `3053640...` during this readiness review. The previously inspected `main`-only implementation changes remain owned by the Student frontend workstream/documentation rather than introducing new Admin/API/migration/shared-contract implementation that must be imported first.

Decision: continue isolated structural work, rechecking live `main` at every structural phase boundary and before merge readiness.

## Baseline facts that constrain AB-01

- Admin main JS baseline: **968.68 kB / 193.92 kB gzip**.
- Admin CSS baseline: **91.38 kB / 13.68 kB gzip**.
- Admin tests: **71/71 green**.
- API tests: **66/66 green**.
- clean PostgreSQL migration path: green.
- real Admin Chromium baseline: **9/9 green**.
- frontend hotspot: `apps/admin-web/src/App.tsx` owns session + shell + routes + eager workflow imports.
- backend hotspot: `apps/api/src/app.ts` owns broad manual system composition.

AB-01 must preserve these behavioral/security contracts while improving ownership.

## First AB-01 batch selection

### `AB-01.1 — Admin shared API transport/error boundary`

Selected because current `apps/admin-web/src/admin-api.ts` mixes two different responsibilities:

1. generic HTTP transport/error/cookie behavior used by many Admin feature adapters;
2. Auth + Curriculum domain contracts and operations.

This is a high-leverage, low-business-risk seam to correct first.

Target:

```text
apps/admin-web/src/shared/api/client.ts
```

Owns only:

- API base URL handling;
- credentialed fetch transport;
- JSON/error parsing;
- stable `ApiRequestError` + public error-code model;
- blob transport;
- session-missing error classification as transport/session signal.

`admin-api.ts` keeps existing Auth/Curriculum public functions temporarily and re-exports the transport symbols for compatibility while callers migrate. This prevents a big-bang import rewrite.

### Acceptance for AB-01.1

- no endpoint/path/body behavior change;
- credential cookies preserved;
- public backend error code/message preserved;
- network failure still maps to `SERVICE_UNAVAILABLE`;
- blob error path preserved;
- existing `admin-api` tests stay green;
- new direct transport tests cover the extracted owner;
- lint/typecheck/build green;
- Architecture Guard green;
- no feature logic moves into `shared`.

### Removal condition

The compatibility re-exports in root `admin-api.ts` are transitional. They are removed only after feature adapters/Auth owner migrate to their final locations and no production caller relies on the root transport seam.

## What AB-01.1 explicitly does not do

- no Student frontend edits;
- no backend business-rule changes;
- no DB changes;
- no route changes;
- no UI redesign;
- no React Query/global-store introduction;
- no mass API adapter migration;
- no session-provider refactor in the same batch.

After AB-01.1 is exact-head green, the next foundation batch may centralize Admin session lifecycle and then proceed to backend app-composition extraction under separate parity gates.