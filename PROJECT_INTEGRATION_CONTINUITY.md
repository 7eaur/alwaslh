# PROJECT INTEGRATION CONTINUITY — الوسيلة الذكية

> **Purpose:** الذاكرة التشغيلية التفصيلية لأي محادثة هندسية بديلة. يجب أن تستطيع الاستمرار من GitHub فقط بدون Chat history.
>
> **Authority:** current code + PostgreSQL migrations + executable evidence أعلى من هذا الملف. أي شيء غير مفحوص/غير منفذ = `NOT YET VERIFIED`.

Last synchronized: **2026-09-08 — Single Owner; Stage13E combined candidate has four P1 root fixes including complete Review History pagination with canonical-latest authority isolation; executable runner still unavailable before checkout.**

## 1. Resume procedure

1. Confirm repository `7eaur/alwaslh`.
2. Read `README.md`.
3. Read `DOCUMENTATION_INDEX.md`.
4. Read `PROJECT_HANDOFF.md`.
5. Read `PROJECT_STATUS.md`.
6. Read `PROJECT_ENGINEERING_LOG.md`.
7. Read this file.
8. Read `PROJECT_EXECUTION_QUEUE.md`.
9. Read `docs/product/CURRENT_PRODUCT_OVERRIDES.md`.
10. Read `docs/workstreams/SINGLE_OWNER_OPERATING_MODEL.md`.
11. Read latest comments in active Issue `#16`.
12. Read current-stage specialized docs + actual code/migrations/tests.
13. Live-check `main`, active branch HEADs and GitHub Actions before conclusions.

Do not depend on earlier chat. Anything not inspected/executed = `NOT YET VERIFIED`.

## 2. Current operating model

Product Owner retired separate Backend/Frontend/Integration chats. One replaceable engineering conversation owns Product/Architecture/Backend/Frontend/UX/Security/Performance/QA/Git/Documentation.

- Issue `#16` = sole active Project Execution Board.
- `PROJECT_EXECUTION_QUEUE.md` = ordered task authority.
- Issues #13/#14/#15 and old workstream docs = historical only.
- Root-cause/no-patching is mandatory.

## 3. Hosting policy

`DEPLOYMENT / HOSTING FULLY DEFERRED UNTIL VPS IS AVAILABLE`.

No Render/Vercel/Railway/Supabase hosting work, no hosted smoke gate, no provider cutover, and no deployment work until explicit Product Owner VPS command. Lack of VPS is not a development blocker.

## 4. Stable product architecture

**الوسيلة الذكية** is an Arabic education platform with Student Web/PWA, Super Admin Web, Fastify API, PostgreSQL, durable media/OCR/AI pipelines and reviewed publication authorities.

Stable rules:

- Browser does not own durable canonical business state.
- Full Code = 6 digits; Class Code = 7 digits.
- activation verification is non-consuming; completion atomic.
- returning Student = password + registered P-256 device proof.
- Curriculum = Class → Subject Offering (`subject_class_links`) → optional Section → Lesson.
- source inventory = provenance, not curriculum hierarchy.
- `media ready != published`.
- Stage13D publication = Draft → Review → Published.
- raw provider/AI output never becomes automatic Student authority.
- provider calls stay outside long DB transactions.
- durable AI worker remains separate from Fastify HTTP.
- secrets/credential aliases/provider metadata/internal error text never Frontend contract.
- no duplicate queue/lifecycle/storage authority.
- operational/audit history must be reachable through bounded server pagination.
- **historical page selection never defines current authority**; current review state/actions derive from latest durable review revision separately.

## 5. Verified application baseline

Latest fully executable green head:

`4eca7de8877ac9e2289b9c7990c912d33c256935`

Same-head SUCCESS:

- Stage13D Admin `34177369743`;
- Stage13D Backend `34177369784`;
- Stage13 Admin `34177369748`;
- Stage12 `34177369812`;
- Stage11 `34177369753`;
- OCR `34177369750`;
- Stage10 `34177369777`;
- Stage9 `34177369756`;
- Full Rebuild `34177369768` incl. Student Chromium.

Verified through Stage13D. Never replace this baseline with unexecuted/documentation-only heads.

## 6. Git / current stage state

- `main` = Integration-approved development baseline.
- Stage13E runtime is **not** in `main`.
- active candidate branch: `integration/stage13e-ai-operations`.
- current candidate docs HEAD at sync: `b344c6cdc21ce71e5d8c6b34bb2dc7f6e42b5ebb`.
- latest runtime/test HEAD below docs: `6a9e9df01ecdab8a6298f0a47c05001d4cb8dd6b`.
- Legacy archive: `archive/legacy-main-2026-09-08 @ 5d16c9ae5e4aa84a13c128da34b0e62f4ae28c06`.

Historical source branches are evidence only:

- Backend `348c02646d0ff873fd305beff16f41c46d9c0285`;
- Frontend `1eb141e950e96c9f53ffd103a386d59166113c16`, Product/Test `7bf2f8c32907032551aace9f3aa27681040c4b0f`.

## 7. Stage13E candidate scope

Candidate provides:

- Admin jobs/units/attempts/outputs read models;
- server-derived progress/status/action availability;
- Stage12 pause/resume/cancel/retry reuse;
- provider/model/project observability without secret leakage;
- source/page/checksum provenance;
- append-only review audit;
- Stage11 semantic validation inside review authority;
- edit/approve/reject with concurrency protection;
- review only for execution-stable `completed | review_required` units;
- authenticated Frontend transport/controller/workspace;
- canonical refresh after 409;
- bounded Jobs/Units/Attempts/Review History pagination;
- deterministic real session-expiry/stale-review/history browser fixtures;
- no Stage13F publication.

## 8. Stage13E P1 audit findings

### AI-013E-DB-001 — durable reject-note invariant

HTTP/service required nonblank reject reason but PostgreSQL did not. Fixed with DB constraint and direct insert regression. Status: `FIXED IN CANDIDATE / EXECUTION PENDING`.

### AI-013E-REVIEW-002 — review/retry integrity

Stage12 may replace `ai_outputs` during retry. Review is now allowed only for stable unit states, and output+unit rows are locked before review decision. Non-stable outputs are inspection-only. Status: `FIXED IN CANDIDATE / EXECUTION PENDING`.

### AI-013E-OPS-003 — Jobs/Units/Attempts truncation

Frontend previously exposed only first 30/50/50 records. Fixed with independent bounded server pages, current-page polling/refresh, accessible navigation and real fixtures proving Jobs page 2, Unit 51 and Attempt 1 on page 2. Status: `FIXED IN CANDIDATE / EXECUTION PENDING`.

### AI-013E-OPS-004 — Review History truncation / authority coupling

**Original defect:** `outputDetail()` returned `ORDER BY revision DESC LIMIT 100` only. No `offset`, no total, so older human audit revisions were unreachable. It also used `history[0]` as current review state.

**Why a simple offset patch is unsafe:** on an old page, `history[0]` is an old revision. If current state were derived from that page, an approved/rejected output could appear editable again or show stale reviewed content.

**Root fix:**

- Backend query accepts bounded `reviewLimit/reviewOffset`, max 100;
- returns `reviewPagination { total, limit, offset }`;
- requested history page, total count, and canonical latest revision are separate reads;
- only canonical latest revision drives `reviewStatus`, `allowedReviewActions`, `effectiveReviewedOutput`;
- Frontend stores `reviewOffsetRef` independently of Jobs/Units/Attempts offsets;
- polling/refresh/409 preserve the current Review page;
- changing selected Unit resets Review page;
- Review History uses accessible Previous/Next controls and total count.

**Regression:** Backend inserts 105 revisions, asks for offset 100 and receives revisions 5..1, while canonical state remains revision 105 approved/no-actions/latest output.

**Real browser fixture:** Happy output has 101 edit revisions. Browser navigates `1–50`, `51–100`, `101–101`, opens revision 1, confirms latest review still authorizes Approve, approves to revision 102, then proves canonical approved state and reload durability.

Key runtime/test commits:

- `d242e0542df4402392780098418cdd015cb11107`
- `f04fe2beeff79dea0353f69fbe5e2774fe5703ea`
- `e33d43c19c8b954429036bba24ca0f3c72d0ba15`
- `9c18826acbc8f2deeb42f70b2e0f651321504f94`
- `2c82e8790b066a2ac035f8eee8c172136a0ed28a`
- `72711ec8aaefc09fa4e2979008b0be03beb526c3`
- `de3a9dc260871ab913bd9d60350479b60de708b9`
- `bf782c92bd74436831e74391768c53c9cd9cb075`
- `d7830d187e89bb16619234609f8480c5bec070cf`
- `f64419fa20c930ac0bbd641ba63c229dc9db9605`
- `a1ef3d7a824d1e8c7503ecb3203df3bebe850619`
- `f95c1a9ee5e800125bdcc665c5a64d0fe10a1fd9`
- `6a9e9df01ecdab8a6298f0a47c05001d4cb8dd6b`

Status: `FIXED IN CANDIDATE / EXECUTION PENDING`.

## 9. Current real-browser authority

Environment:

- `STAGE13E_E2E_JOB_TYPE=stage13e_e2e_happy`;
- `STAGE13E_E2E_RACE_JOB_TYPE=stage13e_e2e_race`;
- `STAGE13E_E2E_PAGINATION_JOB_TYPE=stage13e_e2e_pagination_marker`;
- explicit Admin identifier/password and API/origin values in combined workflow.

Happy fixture: active Job, 51 Units, 51 Attempts, 101 review edits.
Race fixture: terminal execution with open output, no initial review event.
Pagination marker: deliberately old Job + 30 newer fillers.

Real BrowserContext tests cover complete Jobs/Units/Attempts/Review History navigation, pause/resume, approve/reload, session expiry, stale-review 409 and 390px overflow. No mock/fake API or sleep race.

## 10. Combined executable gate

Workflow: `.github/workflows/stage13e-integration.yml`.

Expected execution:

1. API + Admin lint/typecheck/unit/build;
2. clean PostgreSQL + Stage13E DB contract;
3. Stage13E authorization/action/review/concurrency/stable-review/review-history regressions;
4. Stage12 execution/capacity/control/lifecycle + auth regressions;
5. fresh DB, real Admin, deterministic fixtures/invariants;
6. Chromium complete history pagination + lifecycle/review/auth/390px.

Latest runtime/test run:

- run `34275316004`;
- head `6a9e9df01ecdab8a6298f0a47c05001d4cb8dd6b`;
- job `102226771007`;
- `runner_id=0`, `runner_name=""`, `steps=[]`;
- no checkout or product command executed.

No executed product/test failure exists on the latest candidate.

## 11. Verification blocker

`CI-001` P1:

- hosted job terminates before checkout;
- external/account/platform root cause remains `NOT YET VERIFIED` with available permissions;
- do not weaken tests or alter product code merely because runner never starts;
- no local PASS is claimed.

## 12. Exact next action

1. Keep Stage13E outside `main`.
2. Retain all four P1 root fixes/regressions.
3. Re-run unchanged Stage13E combined gate when a real runner is allocated.
4. Any executed failure → root-cause fix in owning layer + regression.
5. Combined PASS → wider same-head Stage9/10/OCR/11/12/13/13D/Full Rebuild matrix.
6. Wider PASS → integrate Stage13E runtime into `main`, update Legacy Coverage/Roadmap/closure docs and Issue #16.
7. Only then begin Stage13F.
8. Hosting stays deferred until explicit VPS command.

## 13. Open findings

- `CI-001` P1 — runner before checkout.
- `AI-013E-DB-001` P1 — fixed, execution pending.
- `AI-013E-REVIEW-002` P1 — fixed, execution pending.
- `AI-013E-OPS-003` P1 — fixed, execution pending.
- `AI-013E-OPS-004` P1 — fixed, execution pending.
- `AI-011-005` P2 — Stage13F direct-question persistence.
- `AI-012-019` P2 — live provider benchmark/routes/credentials/bootstrap unverified.
- remaining later Admin/Student/product stages incomplete.
