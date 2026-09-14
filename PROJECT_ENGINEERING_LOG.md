# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-14 — AB-02.4 auth login presentation ownership implemented; awaiting exact-head/source-tree-equivalent integration/browser closure.**

## Durable invariants

- `apps/admin-web` — Super Admin product.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL integrity authority.
- `apps/student-web` frontend implementation remains a separate workstream; Student-facing backend contracts remain owned here.
- Auth/authorization/entitlement/publication/revision/provenance/audit/assessment/offline authority stays server-owned.
- Never weaken tests/security/validation to satisfy a migration.

## Governance

Branch `rebuild/super-admin-foundation`; PR #52 remains Draft. Workers A/B/C use `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` as the serial handoff authority. Never auto-merge or rewrite shared history.

Live main: `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0`. Main implementation changes remain Student-focused and do not overlap Admin/API/migrations; shared project docs require deliberate reconciliation before the AB-03 structural phase boundary.

## AB-00 — DONE

Architecture baseline, inventories, guardrails and readiness are closed.

## AB-01 — DONE / EXACT-HEAD VERIFIED

Admin transport/session/product-state foundations, five bounded backend app-composition seams and shared request-validation ownership are closed.

## AB-02 — ACTIVE

Canonical record: `docs/workstreams/ADMIN_BACKEND_AB02_EXECUTION_2026-09-14.md`.

### AB-02.1 — Global shell/layout ownership — DONE

Source checkpoint `0d07a24aa062ad569ff654524bdc13a4e368f399`; closure Guard `34838037118`, Frontend Preparation `34838037114`, Combined `34838123077`, Stage13G `34838123143` — SUCCESS.

### AB-02.2 — Inner Admin route-table ownership — DONE

Source checkpoint `732555cb9b8499c712ad6cd19ad50cccf26a8e4a`; closure Guard `34840954071`, Frontend Preparation `34840953959`, Admin AI `34841142948`, Combined `34841142987`, Stage13G `34841142975` — SUCCESS.

### AB-02.3 — Substantial workflow route lazy boundaries — DONE

Source checkpoint `f60d3d0d163c9f31dead139cc36406396f795a7e`; closure Guard `34849322458`, Frontend Preparation `34849322443`, Admin AI `34849322533`, source-tree-equivalent Combined `34849829516`, Stage13G `34849829576` — SUCCESS. Verified initial JS is **196.84 kB / 64.11 kB gzip**, with independent lazy workflow chunks and no artificial warning/manualChunks tuning.

### AB-02.4 — Auth login presentation ownership — IMPLEMENTED / WAITING_FOR_CI

Discovery found one explicitly assigned AB-02 debt from the AB-01 canonical record: root `apps/admin-web/src/LoginScreen.tsx` was documented as transitional auth presentation debt.

Source implementation checkpoint: `d4c3c7896043ea6b1cc4cac1dd404d7912131916`.

Correction:

- moved login presentation to `apps/admin-web/src/features/auth/ui/LoginScreen.tsx`;
- exposed it through `apps/admin-web/src/features/auth/public/index.ts`;
- changed `App.tsx` to compose `LoginScreen` through the auth public boundary;
- deleted the transitional root `LoginScreen.tsx`.

No behavior change was introduced: same credentials form, browser validation attributes, pending/error behavior, `loginAdmin` call, profile callback, session acceptance and post-auth focus. No API/PostgreSQL/migration/Student frontend implementation changed.

Verification at source checkpoint:

- Architecture Guard `34853562192` — SUCCESS;
- Stage13G `34853562095` — IN PROGRESS at observation;
- Combined `34853562292` — PENDING at observation.

The seam remains open until relevant Admin/API/PostgreSQL/integration/Chromium gates are green on the source or a documented source-tree-equivalent head.

## Exact continuation

Verify and close AB-02.4 only. Then perform one final shell/router/provider closure inspection; if no material debt remains, close AB-02 instead of inventing abstraction. Reconcile live `main` before entering AB-03. Do not combine closure with an AB-03 workflow migration.

Remaining roadmap: AB-02 → AB-03 vertical slices → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final full verification/reconciliation.
