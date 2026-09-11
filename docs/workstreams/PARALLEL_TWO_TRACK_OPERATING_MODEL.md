# PARALLEL TWO-TRACK OPERATING MODEL — الوسيلة الذكية

> **Current operating model as of 2026-09-10.** Supersedes `SINGLE_OWNER_OPERATING_MODEL.md` for active work.

## 1. Goal

السماح بتطوير Admin/Backend وStudent Product بالتوازي دون تكرار السلطات أو كسر العقود المشتركة.

Issue #16 هو execution ledger المشترك؛ repository code/migrations/tests هي execution authority.

## 2. Track A — Backend / Admin / AI

Owns by default:

- `apps/api`
- `apps/admin-web`
- `database/migrations`
- backend/shared Admin contracts
- Auth/Access server authority
- Curriculum/content/media/OCR server authority
- AI contracts/execution/review/generation
- Question Bank / Quiz Builder
- Stage13G Remaining Admin Product
- backend/security/integration work needed by later Student stages

Current branch: `integration/stage13g-admin-product`.

## 3. Track B — Student Product

Owns by default:

- `apps/student-web`
- Student-facing Stage14+ UX/product work
- Student tests scoped to its product surface

Branch: `parallel/stage14-student-product`.

Track B consumes server contracts; it does not create substitute durable authority.

## 4. Shared authority rules

- `main` is the verified development integration baseline.
- Shared backend contracts are integrated into `main` only after appropriate executable gates.
- Track B must inspect/integrate the latest relevant `main` before implementing features depending on new Track A authority.
- Stage15 assessment must consume Stage13F published Question Bank/Quiz snapshots from `main`.
- No browser-direct database/provider authority.
- No duplicate Auth, Access, AI queue/review, Question Bank, publication, content or sync authority.

## 5. Coordination rules

1. Read current code/CI before acting; chat memory is not source of truth.
2. Issue #16 receives an EXECUTION REPORT after every meaningful batch.
3. Avoid overlapping edits. If overlap is unavoidable, coordinate the contract before code changes.
4. No force-push/rewrite of shared history.
5. No test weakening, auth bypass, fake API, client-owned durable state, or race-masking sleeps.
6. Preserve legacy product value through `PRODUCT_FEATURE_PARITY_MATRIX.md` and `LEGACY_FEATURE_COVERAGE_GATE.md`.
7. Every unverified area remains `NOT YET VERIFIED`.

## 6. Stage ownership / dependencies

- Stage13G: Track A.
- Stage14 closure: Track B.
- Stage15 Student assessment: Track B implementation **after integrating Stage13F authority from main**; Track A owns any missing shared backend contract.
- Stage16+ remains dependency-driven; ownership follows surface, while shared API/DB changes remain Track A unless explicitly coordinated otherwise.

## 7. Verification

Each track runs all applicable gates on its exact HEAD:

- lint
- strict typecheck
- unit tests
- integration tests
- clean PostgreSQL migrations/contracts
- build
- real Chromium/E2E
- concurrency/idempotency/security regressions where relevant
- responsive/RTL/a11y where relevant
- wider regression matrix before shared-contract promotion

Build alone is never a Stage PASS.

## 8. Deployment

Production deployment/cutover is future-only until explicitly authorized.

Temporary preview/staging is not implied by this operating model; it requires a separate Product Owner instruction and never replaces repository/CI verification.

## 9. Historical docs

The following are historical/superseded operating models, not current task-routing authority:

- `SINGLE_OWNER_OPERATING_MODEL.md`
- `TEAM_OPERATING_MODEL.md`
- `BACKEND_WORKSTREAM.md`
- `FRONTEND_WORKSTREAM.md`
- `INTEGRATION_WORKSTREAM.md`
