# PROJECT HANDOFF — الوسيلة الذكية

> **Purpose:** أي محادثة هندسية بديلة يجب أن تستطيع استئناف المشروع بالكامل من GitHub بدون ذاكرة Chat سابقة.

Last synchronized: **2026-09-09 — Stage13E Admin AI Operations / Review is VERIFIED and promoted; Stage13F is READY / NOT STARTED.**

## 0. Mandatory startup

Before changing code:

1. confirm repo `7eaur/alwaslh`;
2. read `README.md`;
3. read `DOCUMENTATION_INDEX.md`;
4. read this file;
5. read `PROJECT_STATUS.md`;
6. read `PROJECT_RESUME_SNAPSHOT.md`;
7. read `PROJECT_ENGINEERING_LOG.md`, `PROJECT_INTEGRATION_CONTINUITY.md`, `PROJECT_EXECUTION_QUEUE.md`;
8. read `docs/product/CURRENT_PRODUCT_OVERRIDES.md` and `docs/workstreams/SINGLE_OWNER_OPERATING_MODEL.md`;
9. read latest Issue `#16` comments;
10. live-check `main`, current Actions and the current-stage code/tests before any conclusion.

Code/migrations/executable evidence outrank prose. Anything not inspected/executed = `NOT YET VERIFIED`.

## 1. Operating model / deployment policy

- One replaceable engineering owner owns Product/Architecture/Backend/Frontend/UX/Security/Performance/QA/Git/Documentation.
- Issue `#16` is the sole active execution board.
- Issues #13/#14/#15 are historical only.
- `main` is the integration-approved development baseline, not deployment authority.
- **Hosting/deployment is fully deferred until Product Owner provides a VPS and explicitly reopens it.**
- No Render/Vercel/Railway/hosted-smoke work belongs to the current Definition of Done.

## 2. Stable architecture / business rules

- Browser owns presentation/session UX, not durable canonical business state.
- Full Code = 6 digits; Class Code = 7 digits.
- Returning Student = password + registered P-256 device proof.
- Curriculum = Class → Subject Offering → optional Section → Lesson.
- source inventory = provenance, not curriculum hierarchy.
- `media ready != published`; publication is explicit Draft → Review → Published.
- raw AI/provider output never becomes automatic Student/Question Bank authority.
- provider calls stay outside long DB transactions; durable AI worker remains separate from Fastify HTTP.
- no raw provider responses/credentials/internal provider errors in browser contracts.
- no duplicate queue/lifecycle/storage authority.
- durable Admin history remains reachable through bounded pagination.
- historical review pages never redefine canonical current review authority.
- coupled Admin AI read models are snapshot-consistent.
- pagination values are validated before reaching service/DB.
- no test weakening, auth bypass, fake API or timeout/sleep race masking.

## 3. Exact current state

Stage13E runtime/application verification authority:

`d5ebc7f25a369430387a758c7c0bb89350963d67`

Accepted candidate:

`72ead8446af237392dc6d953c8e0c2382f468286`

- Candidate: **12/12 SUCCESS** on the same head; verification-only PR #24 closed unmerged.
- Selective promotion: one commit / exact 36-file manifest on latest inspected main.
- Promotion: **12/12 SUCCESS** on `d5ebc7f...`; verification-only PR #25 closed unmerged.
- `main` was fast-forwarded non-force to `d5ebc7f...` after confirming it had not moved.
- later documentation-only closure commits may advance `main`; they are not new runtime evidence.
- Stage13E is **VERIFIED / CLOSED**.
- Stage13F is **READY / NOT STARTED**.

## 4. Stage13E verified product boundary

Stage13E closes Admin AI Operations / Review while reusing Stage11/12 authorities:

- authenticated Jobs/Units/Attempts/Outputs observability;
- server-derived progress/actions;
- pause/resume/cancel/retry via Stage12;
- complete bounded Jobs/Units/Attempts/Review History navigation;
- append-only Stage11-validated edit/approve/reject review;
- review mutation only on execution-stable outputs;
- PostgreSQL reject-note invariant;
- canonical latest review independent from selected history page;
- short repeatable-read snapshots for coupled Admin read models;
- Job page selected before Unit aggregation;
- safe pagination numeric boundary;
- safe telemetry/provenance without credentials/raw provider payload/internal errors;
- real Chromium pagination, pause/resume, review durability, session expiry, stale `409`, and 390px responsive evidence.

Stage13E review approval is **not Question Bank publication**. Stage13F owns that boundary.

## 5. Final promotion verification evidence

Exact promotion HEAD `d5ebc7f25a369430387a758c7c0bb89350963d67`:

- Combined Stage13E `34401502463` — SUCCESS
- Stage13E standalone `34401549935` — SUCCESS
- Stage13E Frontend Prep `34401549849` — SUCCESS
- Rebuild `34401550016` — SUCCESS
- Stage13 Admin `34401549835` — SUCCESS
- Stage9 `34401549851` — SUCCESS
- Stage10 `34401549989` — SUCCESS
- OCR `34401549910` — SUCCESS
- Stage11 `34401549927` — SUCCESS
- Stage12 `34401549964` — SUCCESS
- Stage13D Content `34401550065` — SUCCESS
- Stage13D Admin UI `34401549903` — SUCCESS

The Combined workflow executed real setup/checkout, API/Admin quality gates, clean PostgreSQL migrations/contracts, Stage13E backend regressions, isolated Stage12/auth regressions, deterministic fixtures and real Chromium.

## 6. Closed findings

- `AI-013E-DB-001` P1 — FIXED + VERIFIED.
- `AI-013E-REVIEW-002` P1 — FIXED + VERIFIED.
- `AI-013E-OPS-003` P1 — FIXED + VERIFIED.
- `AI-013E-OPS-004` P1 — FIXED + VERIFIED.
- `AI-013E-OPS-005` P2 — FIXED + VERIFIED.
- `AI-013E-OPS-006` P2 — FIXED + VERIFIED.
- `AI-013E-PERF-007` P2 — FIXED + VERIFIED.
- `AI-013E-API-008` P2 — FIXED + VERIFIED.
- `CI-013E-009` P1 — FIXED + VERIFIED; workflow drift was not a product failure.

## 7. Open boundaries carried forward

- `AI-011-005` P2 — Stage13F reviewed `direct` Question Bank persistence.
- `AI-012-019` P2 — live provider benchmark/routes/credentials/bootstrap remains `NOT YET VERIFIED`.
- `CI-001` — historical runner allocation incident no longer blocks work; exact historical external cause remains `NOT YET VERIFIED`.

## 8. Exact next work

1. Complete this documentation closure and Stage13E Closure Report in Issue #16.
2. Re-read current main live; do not assume the docs closure SHA from chat.
3. Start Stage13F as a fresh isolated batch only after repository discovery of existing Question Bank/Quiz DB/API/Admin/tests.
4. Preserve Stage11 validation, Stage12 durable execution and Stage13E review authority; do not duplicate them.
5. Require reviewed Question Bank persistence/provenance, explicit Draft→Review→Published, Quiz Builder/versioning/regeneration/export, plus PostgreSQL/API/Admin/real Chromium evidence.
6. Keep deployment fully deferred.

## 9. End-of-batch rule

After every meaningful batch update Queue, Continuity, Status, Engineering Log, Handoff/Resume Snapshot, specialized stage docs and Issue #16. Record exact HEAD/run IDs and explicit `NOT YET VERIFIED`; never leave continuation-critical state only in chat.
