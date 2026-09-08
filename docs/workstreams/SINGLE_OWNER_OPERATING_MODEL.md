# SINGLE OWNER OPERATING MODEL — الوسيلة الذكية

> **Current operating model.** Supersedes the permanent multi-chat Backend/Frontend/Integration team topology. Historical workstream files and Issues remain evidence only.

Last synchronized: 2026-09-08.

## 1. Role

A single replaceable engineering conversation acts as the full senior product engineering team:

- Software/Product Architect
- Backend/PostgreSQL/API/Auth Engineer
- Frontend/Product/UX Engineer
- Security/Performance Engineer
- QA/Test Engineer
- Git/Integration Engineer
- Documentation/Continuity Owner

Avoid overengineering. Choose the simplest solution that satisfies correctness, clarity, security, maintainability, performance and product UX.

## 2. Product preservation

Keep the same product idea/business outcomes/important flows. Implementation may improve when evidence shows a stronger approach.

Do not preserve unsafe legacy architecture merely because it worked. Legacy is capability/failure evidence, not runtime authority.

## 3. Source of Truth

Precedence:

1. current code + PostgreSQL migrations + executable test evidence;
2. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`;
3. `PROJECT_HANDOFF.md`, `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`;
4. `PROJECT_INTEGRATION_CONTINUITY.md`;
5. `PROJECT_EXECUTION_QUEUE.md`;
6. Product Decisions and specialized stage docs;
7. Legacy Coverage / Parity;
8. Roadmap;
9. historical docs/code.

Anything not inspected/executed = `NOT YET VERIFIED`.

## 4. Mandatory resume path

A new conversation must read:

`README.md → DOCUMENTATION_INDEX.md → PROJECT_HANDOFF.md → PROJECT_STATUS.md → PROJECT_ENGINEERING_LOG.md → PROJECT_INTEGRATION_CONTINUITY.md → PROJECT_EXECUTION_QUEUE.md → CURRENT_PRODUCT_OVERRIDES.md → this file → Issue #16 → current stage docs/code/tests`.

Do not ask the previous chat what happened. If continuation requires chat history, documentation is defective and must be corrected.

## 5. Sole execution ledger

GitHub Issue `#16` is the only active execution Board.

After each meaningful batch, add:

```md
### EXECUTION REPORT
Stage/Feature:
Branch/HEAD:
Inspected:
Implemented:
Architecture/contracts/schema/UI changed:
Root causes/fixes:
Tests executed + exact results:
Security/performance/UX review:
Known issues:
NOT YET VERIFIED:
Documentation updated:
Decision:
Exact next action:
```

Issues `#13/#14/#15` are closed historical evidence only.

## 6. Work method

For each queue item:

1. inspect actual implementation, callers and persistence;
2. establish business rule/authority/contract;
3. classify relevant parts KEEP / IMPROVE / REFACTOR / REBUILD / REMOVE;
4. implement in the owning layer;
5. add regression coverage for defects;
6. run appropriate executable gates;
7. review security/performance/UX/accessibility;
8. update specialized + central docs;
9. record exact HEAD/results/remaining work;
10. move to next queue item only when dependencies permit.

## 7. Root-Cause Gate

Every significant defect/failure must answer:

- Symptom
- Root cause
- Broken invariant/contract
- Blast radius
- Correct owning layer
- Fix
- Regression protection
- Remaining risk

Forbidden final fixes:

- catch/hide error;
- weaken assertion to get green;
- auth/validation bypass;
- duplicate queue/state/pipeline;
- permanent client workaround for server bug;
- arbitrary sleeps/timeouts hiding races;
- hard-coded production exception;
- broad rewrite without evidence.

## 8. Architecture boundaries

Stable current boundaries include:

- Browser owns presentation/session UX, not canonical durable business state.
- PostgreSQL/Backend own Auth, entitlements, jobs, publication, trusted scoring and durable state.
- Full Code = 6 digits; Class Code = 7 digits.
- Student returning login requires password + registered P-256 device proof.
- Curriculum = Class → Subject Offering → optional Section → Lesson.
- Stage9 source inventory = provenance, not curriculum hierarchy.
- `media ready != published`.
- Stage13D publication = explicit Draft → Review → Published.
- OCR/AI are derived/reviewed layers, not automatic student authority.
- provider/network calls stay outside long DB transactions.
- durable AI workers use server/PostgreSQL leases/capacity/control.
- Fastify HTTP is not the AI background worker.
- raw provider response/internal errors/secrets never become browser contract.

## 9. Branching

`main` is the latest Integration-approved **development baseline**.

Use short branches for isolated work when appropriate:

- `feature/<stage>-<scope>`
- `fix/<stage>-<scope>`
- `integration/<stage>-<scope>`

The single owner may implement Backend + Frontend in one stage branch when that reduces needless divergence, but commits should remain logically reviewable.

Do not merge a stage into `main` without required executable evidence unless Product Owner explicitly changes the gate.

## 10. Verification

Use all applicable gates:

- lint;
- strict typecheck;
- unit tests;
- integration tests;
- clean PostgreSQL migrations;
- constraints/transactions/concurrency/idempotency tests;
- build;
- Admin/Student Chromium;
- mobile/RTL/a11y checks;
- wider stage regressions;
- Legacy Coverage.

Build alone is never Stage PASS.

External CI failure before checkout is not product evidence. Do not change code to chase a runner-allocation failure.

## 11. Documentation contract

Keep synchronized during work:

- `PROJECT_EXECUTION_QUEUE.md` — exact active tasks.
- `PROJECT_INTEGRATION_CONTINUITY.md` — detailed resumable snapshot.
- `PROJECT_STATUS.md` — concise state.
- `PROJECT_ENGINEERING_LOG.md` — architecture/findings/changes/tests.
- `PROJECT_HANDOFF.md` — replacement engineer startup/context.
- `DOCUMENTATION_INDEX.md` — memory map.
- specialized module/stage docs.
- `LEGACY_FEATURE_COVERAGE_GATE.md` when capability state changes.
- `MASTER_REBUILD_ROADMAP.md` when stage state/order changes.
- Issue #16 — execution reports.

## 12. Hosting policy

Hosting/deployment is currently **DEFERRED / OUT OF SCOPE** until Product Owner provides a VPS and explicitly reopens deployment.

Do not:

- provision Render/Vercel/Railway;
- make hosted smoke a current Stage gate;
- redesign architecture around a temporary provider;
- block product development because no VPS exists.

Keep application architecture portable. When VPS becomes available, deployment work resumes as a later explicit queue item.

## 13. Current stage

Stage13E — Admin AI Operations / Review.

Read exact candidate/runs/next action from:

- `PROJECT_EXECUTION_QUEUE.md`;
- `PROJECT_INTEGRATION_CONTINUITY.md`;
- Issue #16.

Do not start Stage13F before Stage13E closes under the current Roadmap/gates.
