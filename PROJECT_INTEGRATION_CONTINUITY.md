# PROJECT INTEGRATION CONTINUITY — الوسيلة الذكية

> **Purpose:** الذاكرة التشغيلية التفصيلية لأي محادثة هندسية بديلة. يجب أن تستطيع الاستمرار من GitHub فقط بدون Chat history.
>
> **Authority:** current code + PostgreSQL migrations + executable evidence أعلى من هذا الملف. أي شيء غير مفحوص/غير منفذ = `NOT YET VERIFIED`.

Last synchronized: **2026-09-09 — Single Owner; Stage13E has four P1 + four P2 fixes in candidate, final static audit found no additional proven defect, Roadmap/Legacy Coverage plus zero-overlap Promotion Manifest are closure-ready; CI-001 scope is verified repository-wide while exact external runner-allocation cause remains unverified.**

## 1. Resume procedure

1. Confirm repository `7eaur/alwaslh`.
2. Read `README.md` → `DOCUMENTATION_INDEX.md` → `PROJECT_HANDOFF.md` → `PROJECT_STATUS.md` → `PROJECT_ENGINEERING_LOG.md` → this file → `PROJECT_EXECUTION_QUEUE.md`.
3. Read `docs/product/CURRENT_PRODUCT_OVERRIDES.md`, `docs/workstreams/SINGLE_OWNER_OPERATING_MODEL.md`, latest Issue `#16` comments, and current-stage specialized docs/code/migrations/tests.
4. Live-check `main`, active candidate branch and GitHub Actions before conclusions.

Do not depend on earlier chat. Anything not inspected/executed = `NOT YET VERIFIED`.

## 2. Operating / hosting model

One replaceable engineering conversation owns Product/Architecture/Backend/Frontend/UX/Security/Performance/QA/Git/Documentation. Issue `#16` is the sole active execution ledger; Queue is ordered task authority; #13/#14/#15 are historical.

**Deployment/hosting are fully deferred until Product Owner provides a VPS and explicitly reopens them.** Lack of VPS is not a development blocker.

## 3. Stable product architecture

**الوسيلة الذكية** is an Arabic education platform with Student Web/PWA, Super Admin Web, Fastify API, PostgreSQL, durable media/OCR/AI pipelines and reviewed publication authorities.

Stable rules include:

- Browser does not own durable canonical business state.
- Full Code = 6 digits; Class Code = 7 digits.
- activation verification non-consuming; completion atomic.
- returning Student = password + registered P-256 device proof.
- Curriculum = Class → Subject Offering (`subject_class_links`) → optional Section → Lesson.
- source inventory = provenance, not curriculum hierarchy.
- `media ready != published`; Stage13D publication = Draft → Review → Published.
- raw provider/AI output never becomes automatic Student/Question Bank authority.
- provider calls stay outside long DB transactions; durable AI worker remains separate from Fastify HTTP.
- secrets/credential aliases/provider metadata/internal error text never Frontend contract.
- no duplicate queue/lifecycle/storage authority.
- operational/audit history is reachable through bounded server pagination.
- historical-page selection never defines current authority.
- every Stage13E Admin AI response assembled from multiple PostgreSQL queries uses one short `REPEATABLE READ` snapshot.
- bounded HTTP pagination must also bound expensive DB aggregation where the query can enforce that directly; query-shape root causes are fixed before speculative indexing.
- pagination offsets accepted by HTTP must be safely representable end-to-end; unsafe integer values fail as `400 BAD_REQUEST` before service/DB execution.
- Stage13E progress semantics reuse Stage12 lifecycle authority exactly; no second progress calculation contract is allowed.

## 4. Verified application baseline

Latest fully executable green head:

`4eca7de8877ac9e2289b9c7990c912d33c256935`

Verified through Stage13D. Same-head runs remain recorded in `PROJECT_STATUS.md`. Never replace this baseline with unexecuted/docs-only heads.

## 5. Git / current stage state

- Stage13E runtime is **not** in `main`.
- active candidate: `integration/stage13e-ai-operations`.
- current candidate/docs HEAD: `c48d1e597497e6054340f71235c78937082b9371`.
- latest runtime/test HEAD below docs: `d60218b518fb0fe453c21386e77cd35a2228ad07`.
- legacy archive: `archive/legacy-main-2026-09-08 @ 5d16c9ae5e4aa84a13c128da34b0e62f4ae28c06`.

Historical source branches are evidence only: Backend `348c02646d0ff873fd305beff16f41c46d9c0285`; Frontend `1eb141e950e96c9f53ffd103a386d59166113c16`; Product/Test `7bf2f8c32907032551aace9f3aa27681040c4b0f`.

Administrative note: an accidental temporary file `tmp-ignore` was created on `main` in `5916ac42f1d6ed216e0efe336b20a8f030d1f45e` while changing GitHub write method, then removed immediately in `52fa960155964903290a78657029b3cb950bd6ee`. No runtime/product effect.

## 6. Stage13E candidate scope

Candidate provides Admin Jobs/Units/Attempts/Outputs read models, server-derived progress/actions, Stage12 pause/resume/cancel/retry reuse, safe provider/model/project telemetry, provenance, append-only Stage11-validated edit/approve/reject review, stable-unit review boundary, authenticated Admin UI, canonical refresh after 409, bounded Jobs/Units/Attempts/Review History pagination, snapshot-consistent read models, bounded Job-list aggregation, safe pagination input bounds and real browser fixtures. It does **not** publish to Stage13F Question Bank.

## 7. Stage13E audit findings

### AI-013E-DB-001 — P1 durable reject-note invariant
Fixed with PostgreSQL nonblank reject constraint + direct insert regression. `FIXED IN CANDIDATE / EXECUTION PENDING`.

### AI-013E-REVIEW-002 — P1 review/retry integrity
Review only for stable `completed | review_required` units; output+unit locked before mutation. Non-stable outputs inspection-only. `FIXED IN CANDIDATE / EXECUTION PENDING`.

### AI-013E-OPS-003 — P1 Jobs/Units/Attempts truncation
Fixed end-to-end bounded pagination with real fixtures proving later Jobs page, Unit 51 and Attempt page 2. `FIXED IN CANDIDATE / EXECUTION PENDING`.

### AI-013E-OPS-004 — P1 Review History completeness / authority isolation
Original Output Detail exposed only latest 100 review events and derived current authority from `history[0]`. Fixed with bounded `reviewLimit/reviewOffset`, `reviewPagination`, independent canonical-latest query, independent Frontend review offset and real >100 Chromium fixture. Historical pages are audit evidence only; current state/actions/effective output come only from latest durable revision. `FIXED IN CANDIDATE / EXECUTION PENDING`.

### AI-013E-OPS-005 — P2 Output Detail snapshot consistency
Output/page/count/latest reads moved into one short `REPEATABLE READ` transaction at `9d59f84f...`. `FIXED IN CANDIDATE / EXECUTION PENDING`.

### AI-013E-OPS-006 — P2 Admin multi-query read-model consistency
List Jobs, Job Detail and Unit Detail use shared `readSnapshot()`; Stage12 `allowedActions` stays in the same Job Detail snapshot. Fix lineage `6a146c26...` → `f5c5dddf...` → `10f32c72...`. `FIXED IN CANDIDATE / EXECUTION PENDING`.

### AI-013E-PERF-007 — P2 Admin Job-list bounded aggregation
`listJobs()` previously aggregated Unit history across all matching Jobs before page bounding. Fix `8501d2e0...` pages/filter/orders Jobs first, then aggregates only selected Jobs. Regression `6efce151...` proves page-before-aggregation and rejects the former global join shape. `FIXED IN CANDIDATE / EXECUTION PENDING`.

### AI-013E-API-008 — P2 Safe pagination input boundary

**Original defect:** `offset`, `unitOffset`, `attemptOffset`, and `reviewOffset` were only checked as non-negative JavaScript integers. Integer-looking values beyond `Number.MAX_SAFE_INTEGER` could reach PostgreSQL pagination and surface as a DB/representation failure instead of `400` client validation.

**Root fix:** commit `887f772df927c8d24df0003b76b9cb7ea0313e15` introduces one shared `PaginationOffsetSchema` with `0..Number.MAX_SAFE_INTEGER` and uses it for all four Stage13E offsets.

**Regression:** final commit `d60218b518fb0fe453c21386e77cd35a2228ad07` adds `apps/api/tests/ai-admin-pagination-bounds.test.ts`. It uses real Fastify routing/error mapping with Admin/service stubs to prove all four unsafe offsets return `400 BAD_REQUEST` before any service call, while `Number.MAX_SAFE_INTEGER` remains valid. This file is included automatically by existing API `tests/*.test.ts` unit gate.

**Workflow safety note:** an initial PostgreSQL integration regression (`7e337799...`) was removed (`6b04c9f5...`) after the tool safety layer rejected rewriting the existing workflow because the file itself contains a fixed browser-test credential. No gate was weakened or skipped; the final unit regression exercises the exact HTTP boundary and requires no workflow modification.

**Specialized doc:** `docs/ai/STAGE13E_ADMIN_AI_HTTP_VALIDATION.md`.

Status: `FIXED IN CANDIDATE / EXECUTION PENDING`.

## 8. Final static closure audit

The latest static pass checked:

- HTTP query/body/UUID/status/note boundaries against PostgreSQL schema;
- Stage13E pagination representation bounds;
- Stage13E progress math/status semantics against Stage12 `AiJobLifecycleRepository.getProgress()`;
- mutation return/canonical-refresh behavior;
- current review authority vs historical audit page;
- multi-query snapshot consistency;
- Job-list query shape and existing indexes;
- workflow coverage of all new unit/integration/browser regressions.

Result: **no additional proven Stage13E defect** after API-008. Do not create speculative fixes merely because executable CI is blocked.

## 9. CI-001 / Browser executable gate

Real fixtures: Happy Job = 51 Units + 51 Attempts + 101 review edits; Race Job = terminal execution + open output for real stale-review 409; Pagination Marker = old Job + 30 newer fillers.

Chromium contract covers complete Jobs/Units/Attempts/Review History navigation, latest-authority isolation while old page is open, pause/resume, approve/reload, session expiry, stale-review 409, and 390px overflow. No mock/fake API or sleep race.

Workflow: `.github/workflows/stage13e-integration.yml`.

`CI-001` scope is now **VERIFIED repository-wide; exact account/platform cause remains NOT YET VERIFIED**.

Evidence timeline:

- Full Rebuild `34177369768` on `4eca7de...` started `2026-09-08T01:39:16Z`, completed SUCCESS `2026-09-08T01:43:19Z`; its jobs ran real `Set up job`, containers, checkout, setup/install, tests, PostgreSQL and Chromium steps.
- Independent Stage10 Media Pipeline `34191051851` / job `101949023395` later failed pre-checkout with `steps=null`.
- Independent Stage11 AI Contract `34191051835` / job `101949023152` later failed pre-checkout with `steps=null`.
- Stage13E runtime/test `34283353562` / job `102253102885` failed pre-checkout with `steps=[]`.
- Stage13E candidate/docs `34283442253`, attempt `2`, job `102256556365` failed pre-checkout.
- The same Stage13E job was explicitly re-run again; attempt `3` produced job `102266150322`, conclusion `failure`, `steps=[]`, and no log blob because no runner step executed.

Public/platform boundary:

- GitHub public status reported no Actions incident for September 8, 2026, so CI-001 is not classified as a known global GitHub outage.
- repository owner permission is confirmed `admin` through the connected integration;
- the integration can read/re-run Actions but does not expose account/repository Actions usage, billing, budget or runner-allocation settings;
- GitHub documentation confirms private-repository hosted runners depend on account-plan usage/billing policy, but quota/payment exhaustion is only a diagnostic possibility until account evidence is inspected.

Local fallback boundary:

- `/mnt/data/alwaslh-stage13e` is empty and not a Git checkout;
- current execution-container DNS cannot resolve `github.com` or `registry.npmjs.org`;
- HTTPS to those hosts fails before connection;
- `git ls-remote https://github.com/7eaur/alwaslh.git HEAD` fails with `Could not resolve host`.

Therefore no local executable PASS can be claimed either.

Detailed incident record: `docs/integration/GITHUB_ACTIONS_RUNNER_INCIDENT.md`.

No executed product/test failure exists on the current candidate. Do not change Stage13E product/workflow semantics because a runner never starts.

## 10. Closure-readiness documentation

While EXEC-004 is externally blocked, closure documentation was prepared without changing verification state:

- `MASTER_REBUILD_ROADMAP.md` records Stage13E as `COMBINED CANDIDATE / EXECUTION PENDING`, Stage13F as blocked by ordered closure, and deployment as future VPS-only work;
- `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` introduces `CANDIDATE / EXECUTION PENDING` and maps Stage13E candidate evidence to relevant legacy rows without marking them VERIFIED;
- candidate-targeted rows currently include `LES-A-035/036/037`, `AIRULE-025`, and `AI-OPS-012/013/014/015/017`; final closure can only promote rows proven by executable evidence;
- rows not actually closed by the Operations/Review boundary remain explicitly NOT YET VERIFIED, including bulk generation trigger, full page-detection batch-save authoring, complete generated/manual editor/delete flows, exports, and Stage13F Question Bank publication.

## 11. Promotion readiness / merge-debt audit

A live compare was performed before promotion preparation:

- common merge base: `1069aabc5a921b38ca6c8e4bb4bf801f83fc2455`;
- audited `main`: `e10de6d7811ad04811e8a841628966a5269b1dfd`;
- candidate: `c48d1e597497e6054340f71235c78937082b9371`;
- candidate is 53 commits ahead / 77 commits behind current `main` at that snapshot;
- candidate changed exactly 36 Stage13E workflow/Admin/API/test/migration/specialized-doc files since the merge base;
- `main` changed 19 central governance/workstream/deployment-portability files since the same merge base;
- **changed-file intersection = 0**.

This proves no historical merge/cherry-pick chain is required. `docs/integration/STAGE13E_PROMOTION_MANIFEST.md` is the authority for the exact 36-file promotion set.

Promotion policy after candidate combined + wider PASS:

1. re-live-check `main` and candidate and repeat the overlap comparison;
2. create short-lived `integration/stage13e-promotion` from then-current `main`;
3. overlay only the accepted manifest files;
4. reject any unrelated/central-doc diff;
5. run combined Stage13E + wider regression matrix again on the exact promotion HEAD;
6. only after that exact-head PASS, promote to `main` if `main` has not moved; otherwise rebuild/reverify from latest `main`.

Do not create the promotion branch while candidate CI cannot execute; that would only create another unverified head and runner trigger without new evidence.

## 12. Exact next action

1. Keep Stage13E outside `main`.
2. Preserve all four P1 fixes plus OPS-005/OPS-006/PERF-007/API-008 P2 hardenings and regressions unchanged.
3. Inspect/restore GitHub-hosted Actions runner availability through an administrative channel that exposes account/repository usage, budget, payment and Actions settings. Do not infer the exact cause from repository code.
4. Re-run the **unchanged** Combined Gate after runner allocation is restored.
5. Infrastructure recovery is proven only when a real runner executes setup/checkout. Any later executed failure → root-cause fix + regression.
6. Combined PASS → wider same-head Stage9/10/OCR/11/12/13/13D/Full Rebuild matrix on candidate.
7. Follow `docs/integration/STAGE13E_PROMOTION_MANIFEST.md` to assemble and reverify exact promotion HEAD from latest `main`.
8. Promotion-head PASS → integrate to `main`, convert only proven legacy candidate rows to VERIFIED, update closure docs and Issue #16.
9. Only then begin Stage13F.
10. Hosting stays deferred until explicit VPS command.

## 13. Open findings

- `CI-001` P1 — **repository-wide hosted-runner allocation scope VERIFIED; exact account/platform cause NOT YET VERIFIED**.
- `AI-013E-DB-001` P1 — fixed, execution pending.
- `AI-013E-REVIEW-002` P1 — fixed, execution pending.
- `AI-013E-OPS-003` P1 — fixed, execution pending.
- `AI-013E-OPS-004` P1 — fixed, execution pending.
- `AI-013E-OPS-005` P2 — fixed, execution pending.
- `AI-013E-OPS-006` P2 — fixed, execution pending.
- `AI-013E-PERF-007` P2 — fixed, execution pending.
- `AI-013E-API-008` P2 — fixed, execution pending.
- `AI-011-005` P2 — Stage13F direct-question persistence.
- `AI-012-019` P2 — live provider benchmark/routes/credentials/bootstrap unverified.
- remaining later Admin/Student/product stages incomplete.
