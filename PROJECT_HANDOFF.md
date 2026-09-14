# PROJECT HANDOFF — الوسيلة الذكية — Admin + Backend Rebuild

Date: **2026-09-14**  
Purpose: resume the scoped Super Admin + Backend rebuild without relying on chat memory.

## Mandatory startup

Before mutation:

1. confirm repo `7eaur/alwaslh` and branch `rebuild/super-admin-foundation`;
2. fetch live branch HEAD and live `main` HEAD;
3. read `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` first;
4. read `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, this file and the autonomous protocol;
5. inspect active phase docs, code/tests and exact-head Actions;
6. confirm no active worker collision;
7. compare live `main` at structural phase boundaries or when overlapping scoped changes appear.

Code/migrations/executable CI/runtime evidence outrank prose.

## Scope

Owned here: complete Super Admin, full Fastify backend/API, PostgreSQL/migrations/integrity, server capabilities consumed by Admin/Student, relevant shared contracts, architecture documentation and required CI/security/integration/browser verification.

Excluded only: structural/design implementation of `apps/student-web` frontend. Student-facing backend remains in scope.

## Branch / PR

- branch: `rebuild/super-admin-foundation`;
- PR #52 stays Draft and is never auto-merged;
- never force-reset or force-push shared history;
- live `main`: `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0`.

Main implementation delta remains Student-focused with no Admin/API/migration overlap; shared project docs require deliberate reconciliation before the AB-03 structural phase boundary.

## Current phase

- AB-00 — DONE
- AB-01 — DONE / EXACT-HEAD VERIFIED
- AB-02 — ACTIVE
  - AB-02.1 Global Admin shell/layout ownership — DONE
  - AB-02.2 Inner Admin route-table ownership — DONE
  - AB-02.3 Substantial workflow route lazy boundaries — DONE
  - AB-02.4 Auth login presentation ownership — IMPLEMENTED / WAITING_FOR_CI
- AB-03..AB-08 — PENDING

Canonical AB-02 record: `docs/workstreams/ADMIN_BACKEND_AB02_EXECUTION_2026-09-14.md`.

## AB-02.1 closure

Source checkpoint `0d07a24aa062ad569ff654524bdc13a4e368f399`; Guard `34838037118`, Frontend Preparation `34838037114`, Combined `34838123077`, Stage13G `34838123143` — SUCCESS.

## AB-02.2 closure

Source checkpoint `732555cb9b8499c712ad6cd19ad50cccf26a8e4a`; Guard `34840954071`, Frontend Preparation `34840953959`, Admin AI `34841142948`, Combined `34841142987`, Stage13G `34841142975` — SUCCESS.

## AB-02.3 closure

Source checkpoint `f60d3d0d163c9f31dead139cc36406396f795a7e`; Guard `34849322458`, Frontend Preparation `34849322443`, Admin AI `34849322533`, source-tree-equivalent Combined `34849829516`, Stage13G `34849829576` — SUCCESS. Initial JS verified at **196.84 kB / 64.11 kB gzip** with independent workflow chunks and no threshold/manualChunks tuning.

## AB-02.4 current seam

AB-01 explicitly documented root `apps/admin-web/src/LoginScreen.tsx` as transitional presentation debt assigned to AB-02. Remaining AB-02 discovery therefore selected this single seam instead of inventing a new abstraction.

Source implementation checkpoint: `d4c3c7896043ea6b1cc4cac1dd404d7912131916`.

Changed ownership:

- `apps/admin-web/src/features/auth/ui/LoginScreen.tsx` now owns the login presentation;
- `apps/admin-web/src/features/auth/public/index.ts` exposes `LoginScreen` as the feature composition contract;
- `App.tsx` consumes it through that public boundary;
- root `apps/admin-web/src/LoginScreen.tsx` was deleted.

Login/session behavior is unchanged: form fields and validation, loading/error state, `loginAdmin`, authenticated profile handoff, session acceptance and post-auth focus remain the same. No API/DB/migration/Student frontend implementation changed.

Verification observed on the source checkpoint:

- Architecture Guard `34853562192` — SUCCESS;
- Stage13G `34853562095` — in progress;
- Combined `34853562292` — pending.

Therefore AB-02.4 is **not DONE** yet.

## Exact continuation

1. Inspect the latest source/source-tree-equivalent gates for AB-02.4.
2. If Admin quality, integration, PostgreSQL/security and Real API + PostgreSQL + Chromium evidence are green, close AB-02.4.
3. Then perform one final AB-02 closure inspection only; if no material shell/router/provider debt remains, close AB-02.
4. Reconcile live `main` before starting AB-03 because that is a structural phase boundary.
5. Do not combine AB-02 closure with an AB-03 workflow migration.

## Remaining roadmap

Finish/close AB-02 → AB-03 vertical slices Overview+Operations → Curriculum+Content+OCR → AI → Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
