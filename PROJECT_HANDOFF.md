# PROJECT HANDOFF — الوسيلة الذكية

> **Purpose:** أي محادثة هندسية بديلة يجب أن تستطيع استئناف المشروع بالكامل من GitHub بدون ذاكرة Chat سابقة.

Last synchronized: **2026-09-09 22:57 Asia/Aden — Stage13E Combined Gate is fully green; wider candidate matrix has ten green workflows and one stale standalone Stage13E workflow assertion failure.**

## 0. Mandatory startup

Before changing code:

1. confirm repo `7eaur/alwaslh`;
2. read `README.md`;
3. read `DOCUMENTATION_INDEX.md`;
4. read this file;
5. read `PROJECT_STATUS.md`;
6. read **`PROJECT_RESUME_SNAPSHOT.md`** — this is the latest detailed checkpoint;
7. read `PROJECT_ENGINEERING_LOG.md`, `PROJECT_INTEGRATION_CONTINUITY.md`, `PROJECT_EXECUTION_QUEUE.md`;
8. read `docs/product/CURRENT_PRODUCT_OVERRIDES.md` and `docs/workstreams/SINGLE_OWNER_OPERATING_MODEL.md`;
9. read `docs/integration/STAGE13E_PROMOTION_MANIFEST.md`;
10. read latest Issue `#16` comments and PR `#24` checks;
11. inspect current Stage13E workflow/code/migrations/tests;
12. live-check `main`, candidate HEAD and Actions before any conclusion.

Code/migrations/executable evidence outrank prose. Anything not inspected/executed = `NOT YET VERIFIED`.

## 1. Operating model / deployment policy

- One replaceable engineering owner owns Product/Architecture/Backend/Frontend/UX/Security/Performance/QA/Git/Documentation.
- Issue `#16` is sole active execution board.
- Issues #13/#14/#15 are historical only.
- `main` is Integration-approved development baseline, not deployment authority.
- **Hosting/deployment is fully deferred until Product Owner provides a VPS and explicitly reopens it.**
- No Render/Vercel/Railway/hosted-smoke work belongs to the current Definition of Done.

## 2. Stable architecture / business rules

- Browser owns presentation/session UX, not durable canonical business state.
- Full Code = 6 digits; Class Code = 7 digits.
- returning Student = password + registered P-256 device proof.
- Curriculum = Class → Subject Offering → optional Section → Lesson.
- source inventory = provenance, not curriculum hierarchy.
- `media ready != published`; publication is explicit Draft → Review → Published.
- raw AI/provider output never becomes automatic Student/Question Bank authority.
- provider calls stay outside long DB transactions; durable AI worker remains separate from Fastify HTTP.
- no raw provider responses/credentials/internal provider errors in browser contracts.
- no duplicate queue/lifecycle/storage authority.
- durable Admin history must remain reachable through bounded pagination.
- historical review pages never redefine canonical current review authority.
- coupled Stage13E read models are snapshot-consistent.
- pagination offsets must be safely representable before reaching service/DB.
- no test weakening, auth bypass, fake API or timeout/sleep race masking.

## 3. Exact current state

Current product stage: **Stage13E — Admin AI Operations / Review**.

Current candidate branch:

`integration/stage13e-ai-operations`

Current executable candidate HEAD:

`e291c6bde3971845048bf8bcc4561b65d3c702e6`

Current verification-only Draft PR:

`#24 — ci(stage13e): wider same-head verification only`

PR #24 is **not a delivery PR and MUST NOT BE MERGED**.

Immediately before this documentation sync, `main` was `22e8ad71a413d0d5434710ae3cb58303e3e82b5a`; documentation commits now advance `main`, so always read it live before promotion work.

Latest fully verified pre-Stage13E application baseline remains `4eca7de8877ac9e2289b9c7990c912d33c256935` until Stage13E is promoted/closed.

## 4. Stage13E Combined Gate — EXECUTED PASS

Workflow: `.github/workflows/stage13e-integration.yml`.

Successful run: **`34394580893`** on exact candidate HEAD `e291c6bde3971845048bf8bcc4561b65d3c702e6`.

All steps passed:

- API lint/typecheck/unit/build;
- Admin lint/typecheck/unit/build;
- clean migrations through `0018_ai_admin_review.sql`;
- Stage13E PostgreSQL contract assertions;
- Stage13E backend authority/review/concurrency tests;
- isolated Stage12 execution/capacity/control/lifecycle regressions;
- auth security regression;
- real Super Admin bootstrap;
- deterministic browser fixtures + DB invariants;
- Chromium install;
- **real Admin Chromium suite 5/5 PASS**.

Browser coverage includes full Jobs/Units/Attempts/Review History navigation, canonical latest review authority, pause/resume, approval durability across reload, real logout/session expiry, real stale-review 409 canonical refresh and 390px no-horizontal-overflow.

## 5. Root-cause fixes from the final executable pass

- Fresh `Response` per Admin test mock request fixed a consumed-body test harness defect.
- Combined DB contract unmatched shell quote/parenthesis fixed without weakening migration assertions.
- PostgreSQL reset/migrate between Stage13E and Stage12/auth regressions fixed real test-suite state pollution; Stage12 global queue behavior was not changed.
- Browser seed timestamp was explicitly cast to `timestamptz`.
- Playwright workspace H1 locator was made exact to remove ambiguity.
- Session-expiry helper stopped sending JSON Content-Type on bodyless logout so E2E matches production `logoutAdmin()` transport.

No production security or business rule was weakened.

## 6. Wider candidate matrix

Draft PR #24 triggered the repository's `pull_request` workflows.

### SUCCESS

- Stage9 `34395033866`
- Stage10 `34395033929`
- OCR `34395033922`
- Stage11 `34395033876`
- Stage12 `34395033892`
- Stage13 Admin `34395033898`
- Stage13D Content Ingestion `34395033978`
- Stage13D Admin Chromium `34395034010`
- Full Rebuild `34395033928`
- Stage13E Frontend Preparation `34395033957`

### Remaining failure

Stage13E Admin AI Operations standalone workflow:

- run `34395034000`
- job `102612508570`
- API quality: PASS
- clean migrations: PASS
- failure only in `Verify Stage13E PostgreSQL contracts`
- shell error: `unexpected EOF while looking for matching ')'`

Root cause: `.github/workflows/stage13e-ai-operations.yml` is stale. It still has the old shell quote defect and old DB expectations (three constraints + two indexes). Current migration has four review constraints including reject-note enforcement, and the redundant latest-review index was intentionally removed. The Combined workflow already uses the corrected current contract and passed it on real PostgreSQL.

Classification: **CI workflow drift, not product/database failure**.

Tracking ID for continuation: `CI-013E-009` P1.

## 7. Exact next work

1. Keep Stage13E outside `main`.
2. Keep PR #24 open/Draft/unmerged.
3. Inspect `.github/workflows/stage13e-ai-operations.yml`, `.github/workflows/stage13e-integration.yml`, and `database/migrations/0018_ai_admin_review.sql` together.
4. Fix only the stale standalone DB contract assertion:
   - correct shell syntax;
   - require all current four review constraints;
   - stop requiring the intentionally removed redundant latest-review index;
   - preserve legitimate current index assertions;
   - do not weaken any test or DB rule.
5. Push to `integration/stage13e-ai-operations`.
6. PR #24 will trigger the wider matrix on the new exact candidate HEAD.
7. Require every relevant workflow to PASS on that exact HEAD.
8. Close PR #24 **unmerged** after evidence is captured.
9. Re-check latest `main` vs candidate changed-file overlap; do not reuse the old main SHA blindly.
10. Follow `docs/integration/STAGE13E_PROMOTION_MANIFEST.md` to build `integration/stage13e-promotion` from latest `main` and overlay only the accepted Stage13E manifest files.
11. Run Combined + wider matrix again on exact promotion HEAD.
12. Only after promotion-head PASS, integrate Stage13E into `main`, update Roadmap/Legacy Coverage/central docs and post Stage13E Closure Report to Issue #16.
13. Only then begin Stage13F.

## 8. Findings state

- `AI-013E-DB-001` P1 — FIXED; Combined PASS.
- `AI-013E-REVIEW-002` P1 — FIXED; Combined PASS.
- `AI-013E-OPS-003` P1 — FIXED; real Chromium PASS.
- `AI-013E-OPS-004` P1 — FIXED; real Chromium PASS.
- `AI-013E-OPS-005` P2 — FIXED; Combined PASS.
- `AI-013E-OPS-006` P2 — FIXED; Combined PASS.
- `AI-013E-PERF-007` P2 — FIXED; Combined PASS.
- `AI-013E-API-008` P2 — FIXED; Combined PASS.
- `CI-013E-009` P1 — OPEN; stale standalone Stage13E DB assertion workflow; current closure blocker.
- `CI-001` historical runner-allocation incident — runners are executing now; no longer the current blocker. Historical exact external cause remains NOT YET VERIFIED.
- `AI-011-005` P2 — Stage13F.
- `AI-012-019` P2 — live provider bootstrap NOT YET VERIFIED.

## 9. Continuation-critical document

`PROJECT_RESUME_SNAPSHOT.md` is the detailed latest checkpoint for the next conversation. If older central prose still says no executable Stage13E runner evidence exists, it is stale and superseded by this handoff + the snapshot + current Actions evidence.

## 10. End-of-batch rule

After the next meaningful batch update Queue, Continuity, Status, Engineering Log, Handoff/Resume Snapshot, specialized Stage docs, and Issue #16. Record exact HEAD/run IDs and explicit `NOT YET VERIFIED`; never leave continuation-critical state only in chat.
