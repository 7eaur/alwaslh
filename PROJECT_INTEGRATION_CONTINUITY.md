# PROJECT INTEGRATION CONTINUITY — الوسيلة الذكية

> **Purpose:** الذاكرة التشغيلية التفصيلية لأي محادثة هندسية بديلة. يجب أن تستطيع الاستمرار من GitHub فقط بدون Chat history.
>
> **Authority:** current code + PostgreSQL migrations + executable evidence أعلى من هذا الملف. أي شيء غير مفحوص/غير منفذ = `NOT YET VERIFIED`.

Last synchronized: **2026-09-09 22:57 Asia/Aden — Stage13E Combined Gate PASS; wider candidate verification has 10 green workflows and one stale standalone CI assertion failure.**

## 1. Resume procedure

1. Confirm repository `7eaur/alwaslh`.
2. Read `README.md` → `DOCUMENTATION_INDEX.md` → `PROJECT_HANDOFF.md` → `PROJECT_STATUS.md` → **`PROJECT_RESUME_SNAPSHOT.md`** → `PROJECT_ENGINEERING_LOG.md` → this file → `PROJECT_EXECUTION_QUEUE.md`.
3. Read `docs/product/CURRENT_PRODUCT_OVERRIDES.md`, `docs/workstreams/SINGLE_OWNER_OPERATING_MODEL.md`, `docs/integration/STAGE13E_PROMOTION_MANIFEST.md`.
4. Read latest Issue `#16` comments and PR `#24` current checks.
5. Inspect actual Stage13E workflows/code/migrations/tests.
6. Live-check `main`, candidate branch and Actions before any conclusion.

Do not depend on earlier Chat. Anything not inspected/executed = `NOT YET VERIFIED`.

## 2. Operating / hosting model

- Single replaceable engineering owner.
- Issue `#16` is sole execution ledger.
- Issues #13/#14/#15 are historical.
- Hosting/deployment fully deferred until VPS + explicit Product Owner reopening.
- Absence of VPS is not a development blocker.
- `main` is development baseline, not deployment authority.

## 3. Stable architecture

- Browser does not own durable canonical business state.
- Full Code = 6 digits; Class Code = 7 digits.
- returning Student = password + registered P-256 device proof.
- Curriculum = Class → Subject Offering → optional Section → Lesson.
- source inventory = provenance, not curriculum hierarchy.
- `media ready != published`; publication = Draft → Review → Published.
- raw AI/provider output never automatic Student/Question Bank authority.
- provider calls outside long DB transactions.
- durable AI worker remains separate from Fastify HTTP.
- credentials/raw provider/internal errors stay out of browser contracts.
- no duplicate queue/lifecycle/storage authority.
- durable Admin AI history is reachable through bounded server pagination.
- historical audit pages never define canonical current review authority.
- Stage13E multi-query read models use one short repeatable-read snapshot.
- bounded pages must bound expensive DB work when query shape owns that cost.
- HTTP pagination offsets must be safely representable end-to-end.
- Stage13E progress reuses Stage12 lifecycle authority.
- no test weakening, fake API, auth bypass or sleep-based race hiding.

## 4. Current Git state

- Stage13E runtime is **not** in `main`.
- candidate branch: `integration/stage13e-ai-operations`.
- executable candidate HEAD: `e291c6bde3971845048bf8bcc4561b65d3c702e6`.
- Draft verification-only PR: `#24`.
- PR #24 must **never be merged**; it exists only to trigger `pull_request` workflows.
- immediately before the handoff-doc batch, `main` was `22e8ad71a413d0d5434710ae3cb58303e3e82b5a`; docs commits advanced it afterward, so re-read live before promotion.
- latest fully verified pre-Stage13E application baseline remains `4eca7de8877ac9e2289b9c7990c912d33c256935` until Stage13E closes.

## 5. Stage13E candidate scope

Candidate provides:

- Admin Jobs/Units/Attempts/Outputs observability;
- server-derived lifecycle progress/actions;
- Stage12 pause/resume/cancel/retry reuse;
- safe provider/model/project telemetry;
- provenance;
- append-only Stage11-validated review;
- stable-unit review boundary;
- authenticated Admin UI;
- canonical 409 refresh;
- bounded Jobs/Units/Attempts/Review History pagination;
- independent canonical-latest review authority;
- repeatable-read multi-query snapshots;
- Job-list page-before-aggregation performance shape;
- safe pagination offset bounds;
- deterministic real browser fixtures.

It does **not** publish to Stage13F Question Bank.

## 6. Stage13E findings — current verification state

- `AI-013E-DB-001` P1 durable reject-note invariant — FIXED; Combined PASS.
- `AI-013E-REVIEW-002` P1 review/retry integrity — FIXED; Combined PASS.
- `AI-013E-OPS-003` P1 Jobs/Units/Attempts reachability — FIXED; Chromium PASS.
- `AI-013E-OPS-004` P1 Review History completeness/current-authority isolation — FIXED; Chromium PASS.
- `AI-013E-OPS-005` P2 Output Detail snapshot consistency — FIXED; Combined PASS.
- `AI-013E-OPS-006` P2 Admin multi-query snapshot consistency — FIXED; Combined PASS.
- `AI-013E-PERF-007` P2 Job-list bounded aggregation — FIXED; Combined PASS.
- `AI-013E-API-008` P2 safe pagination representation boundary — FIXED; Combined PASS.

## 7. Final Combined executable cycle

### Important executed fixes

1. Admin test harness reused a consumed `Response` object → each request now gets a fresh `Response`.
2. Combined DB assertion had unmatched shell quote/parenthesis → syntax corrected only.
3. Stage13E integration suite left claimable queue state and polluted Stage12 global worker regression → schema reset + migrations between suites.
4. Browser fixture timestamp parameter was inferred as text in a `CASE` → explicit `::timestamptz`.
5. Playwright workspace heading locator was ambiguous → exact H1 locator.
6. Session-expiry E2E helper sent JSON Content-Type on bodyless logout unlike production → logout helper now sends only `Origin`.

No production security/business contract or test expectation was weakened.

### Combined PASS

Workflow: `.github/workflows/stage13e-integration.yml`.

Run: **`34394580893`**.

Exact candidate HEAD: `e291c6bde3971845048bf8bcc4561b65d3c702e6`.

All steps SUCCESS:

- API quality;
- Admin quality;
- clean migrations through `0018`;
- Stage13E DB contracts;
- Stage13E backend authority/review/concurrency;
- DB reset;
- Stage12 execution/capacity/control/lifecycle;
- auth regression;
- fresh browser DB;
- real Super Admin bootstrap;
- deterministic Stage13E fixture seed;
- fixture DB invariants;
- Chromium install;
- **Admin Chromium 5/5 PASS**.

Browser PASS proves full Jobs/Units/Attempts/Review History navigation, current review authority, pause/resume, approve/reload durability, real session expiry, real stale-review 409 canonical refresh and 390px responsive behavior.

## 8. Wider same-head candidate matrix

PR #24 triggered the repository `pull_request` workflows.

Green runs:

- Stage9 `34395033866`
- Stage10 `34395033929`
- OCR `34395033922`
- Stage11 `34395033876`
- Stage12 `34395033892`
- Stage13 Admin `34395033898`
- Stage13D Content Ingestion `34395033978`
- Stage13D Admin Upload UI `34395034010`
- Full Rebuild `34395033928`
- Stage13E Frontend Preparation `34395033957`

Only red run:

- Stage13E Admin AI Operations `34395034000`
- job `102612508570`
- API lint/typecheck/unit/build PASS
- clean migrations PASS
- failure only at `Verify Stage13E PostgreSQL contracts`
- shell error: `unexpected EOF while looking for matching ')'`

## 9. CI-013E-009 — Current closure blocker

Severity: **P1**.

Area: `.github/workflows/stage13e-ai-operations.yml`.

Problem:

The standalone Stage13E workflow is stale relative to current migration and passing Combined workflow:

- shell quote/parenthesis defect remains;
- it expects old three-constraint review contract;
- it expects two indexes including a redundant latest-review index that was intentionally removed;
- current migration has four review constraints including `ai_output_review_events_reject_note_required`;
- current UNIQUE `(ai_output_id, revision)` serves latest-revision access;
- Combined workflow uses current expectations and passed on real PostgreSQL.

Classification: **CI workflow drift, not product/database failure**.

Correct fix:

1. compare standalone workflow, Combined workflow and `0018_ai_admin_review.sql`;
2. fix shell syntax;
3. assert all current four review constraints;
4. stop asserting removed redundant latest-review index;
5. retain legitimate current index/contract checks;
6. do not weaken any gate;
7. push to candidate branch and require exact-new-HEAD wider rerun.

## 10. Historical CI-001 update

The previous repository-wide hosted-runner allocation incident is **not currently blocking**. Current jobs receive real runners and execute setup/checkout/tests. Exact historical external cause remains `NOT YET VERIFIED` because no account/platform telemetry established it.

Do not reopen runner debugging unless new evidence appears.

## 11. Promotion readiness

After candidate wider matrix becomes fully green:

1. close PR #24 unmerged;
2. live-check latest `main` and candidate;
3. re-run overlap comparison;
4. read `docs/integration/STAGE13E_PROMOTION_MANIFEST.md`;
5. create `integration/stage13e-promotion` from latest `main`;
6. overlay only accepted manifest files;
7. reject unrelated/central-doc regressions;
8. run Combined + wider matrix again on exact promotion HEAD;
9. if `main` moves, rebuild/reverify from latest `main`;
10. only after promotion-head PASS integrate Stage13E into `main`.

Do not merge/cherry-pick the candidate's divergent historical commit chain directly.

## 12. Stage13E closure requirements

Before marking VERIFIED:

- all relevant wider workflows green on current candidate;
- PR #24 closed unmerged;
- promotion branch built from latest main using manifest;
- Combined + wider matrix green on exact promotion HEAD;
- final diff checked for unrelated changes;
- Stage13E integrated into `main`;
- Roadmap + Legacy Coverage + central docs updated;
- Stage13E Closure Report posted to Issue #16.

Only then begin Stage13F.

## 13. Open findings

- `CI-013E-009` P1 — ACTIVE / current closure blocker.
- `CI-001` historical external runner incident — not currently blocking; exact historical cause NOT YET VERIFIED.
- `AI-011-005` P2 — Stage13F reviewed direct Question Bank persistence.
- `AI-012-019` P2 — live provider benchmark/routes/credentials/bootstrap NOT YET VERIFIED.

## 14. Supporting current checkpoint docs

- `PROJECT_RESUME_SNAPSHOT.md`
- `docs/integration/STAGE13E_EXECUTABLE_CHECKPOINT_2026-09-09.md`
- `docs/integration/STAGE13E_PROMOTION_MANIFEST.md`
- Issue #16 comment `5607969444`

If older historical prose says Stage13E has no runner evidence, it is stale and superseded by current Actions evidence and the documents above.
