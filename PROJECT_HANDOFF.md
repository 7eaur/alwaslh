# PROJECT HANDOFF — الوسيلة الذكية

> **Purpose:** أي محادثة هندسية بديلة يجب أن تستطيع استئناف المشروع بالكامل من GitHub بدون ذاكرة Chat سابقة.

Last synchronized: **2026-09-08 — Single Owner active; hosting deferred; Stage13E combined candidate hardened by three P1 root fixes and awaiting executable verification.**

## 0. Mandatory startup

Before changing code:

1. confirm repo `7eaur/alwaslh`;
2. treat `main` as latest Integration-approved **development baseline**;
3. read `README.md`;
4. read `DOCUMENTATION_INDEX.md`;
5. read this file;
6. read `PROJECT_STATUS.md`;
7. read `PROJECT_ENGINEERING_LOG.md`;
8. read `PROJECT_INTEGRATION_CONTINUITY.md`;
9. read **`PROJECT_EXECUTION_QUEUE.md`**;
10. read `docs/product/CURRENT_PRODUCT_OVERRIDES.md`;
11. read `docs/workstreams/SINGLE_OWNER_OPERATING_MODEL.md`;
12. read latest comments in active Issue `#16`;
13. read current stage specialized docs + actual code/migrations/tests;
14. live-check `main`, active branch HEADs and Actions.

Anything not inspected/executed = `NOT YET VERIFIED`. If repository docs are insufficient to resume, fix documentation before feature work.

## 1. Operating model

Product Owner retired the multi-chat Backend/Frontend team model.

Current model:

- **one replaceable engineering conversation owns the whole product**;
- Product/Architecture/Backend/Frontend/UX/Security/Performance/QA/Git/Documentation are one responsibility;
- Issue `#16` is the sole active Project Execution Board;
- `PROJECT_EXECUTION_QUEUE.md` is ordered task authority;
- `PROJECT_INTEGRATION_CONTINUITY.md` is detailed current memory.

Historical only: Issues #13/#14/#15 and former Team/Backend/Frontend/Integration workstream files.

## 2. Hosting / deployment

**Hosting and deployment are completely deferred until Product Owner provides a VPS and explicitly reopens deployment.**

No Render/Vercel/Railway/Supabase hosting work, no hosted-runtime acceptance gate, and no cutover work now. Keep normal portability without premature infrastructure abstraction.

## 3. Repository / verified state

- Repository: `7eaur/alwaslh`.
- `main`: Integration-approved development baseline; live-check its HEAD.
- Legacy archive: `archive/legacy-main-2026-09-08 @ 5d16c9ae5e4aa84a13c128da34b0e62f4ae28c06`.
- Latest fully executable green product baseline: `4eca7de8877ac9e2289b9c7990c912d33c256935`.

Verified through Stage13D:

- Stages 1–10;
- OCR Foundation;
- Stage11 Provider-neutral AI Contracts;
- Stage12 durable AI backend/runtime;
- Stage13A Curriculum Backend;
- Stage13B Admin Curriculum UI;
- Stage13C Content/Media/OCR Operations;
- Stage13D Upload/History/Publication Linking incl. Chromium.

Green same-head runs are recorded in `PROJECT_STATUS.md`.

## 4. Product / stable architecture

**الوسيلة الذكية** Arabic education platform with Student Web/PWA + Super Admin over Fastify API + PostgreSQL.

Stable rules:

- Browser owns presentation/session UX, not durable canonical state.
- Full Code = 6 digits; Class Code = 7 digits.
- activation verification non-consuming; finalization atomic.
- returning Student = password + registered P-256 proof.
- Curriculum = Class → Subject Offering (`subject_class_links`) → optional Section → Lesson.
- source inventory = provenance, not curriculum hierarchy.
- `media ready != published`.
- Stage13D content publication = Draft → Review → Published.
- raw AI/provider output is never Student/Question Bank authority automatically.
- provider/network calls stay outside long DB transactions.
- durable workers use PostgreSQL leases/capacity/control and remain separate from HTTP polling.
- credentials/raw provider metadata/internal provider errors never Frontend contract.
- no duplicate queue/pipeline/state authority.
- Admin durable operational history must be completely reachable through bounded server pagination.
- no patching/test weakening/auth bypass/fake API/sleep race masking.

## 5. Current Stage13E — Admin AI Operations / Review

Status:

**COMBINED INTEGRATION CANDIDATE / NOT YET VERIFIED / OUTSIDE `main`**.

Active combined branch:

`integration/stage13e-ai-operations @ 70f6fe218124498ccb6667e3aefa2e8dd21599a4`

Latest runtime/test HEAD beneath that docs commit:

`ae772db53e218037a2b140e9dc08e6528f1a1ac8`

Historical source branches are evidence only:

- Backend `348c02646d0ff873fd305beff16f41c46d9c0285`;
- Frontend `1eb141e950e96c9f53ffd103a386d59166113c16`, Product/Test `7bf2f8c32907032551aace9f3aa27681040c4b0f`.

Stage13E candidate provides:

- Admin-only Job/Unit/Attempt/Output views;
- server-derived progress + action availability;
- Stage12 pause/resume/cancel/retry reuse;
- provider/model/project observability without secrets;
- source/page/checksum provenance;
- append-only edit/approve/reject review;
- Stage11 semantic validation;
- row-lock concurrency protection;
- authenticated Admin UI + canonical refresh after mutation/409;
- bounded polling;
- bounded Jobs/Units/Attempts server pagination;
- real browser regressions;
- no Stage13F publication.

## 6. Stage13E P1 root fixes

### AI-013E-DB-001 — durable reject reason

Original HTTP/service required nonblank reject reason but PostgreSQL did not.

Fix:

- DB check `ai_output_review_events_reject_note_required`;
- direct NULL/blank insert regressions;
- redundant latest-review index removed.

Key commits: `730989b8...`, `6589d6e5...`, workflow `bc1bf508...`.

### AI-013E-REVIEW-002 — human review vs retry replacement

Stage12 can update the same `ai_outputs` row during retry. Review events remain append-only, so human review must never attach to replaceable execution output.

Fix:

- review actions only when owning unit is `completed | review_required`;
- other output states remain inspection-only;
- review transaction locks output+unit and rechecks stability before writing;
- failed/retrying regressions prove `409` + zero audit side effect.

Key commits: `5c03fa27...`, `6494a0ee...`, contract `1e19ef06...`.

### AI-013E-OPS-003 — durable history inaccessible after first page

Original Frontend discarded Backend pagination and exposed only first 30 Jobs / 50 Units / 50 Attempts, while Stage12 supports plans up to 5,000 units.

Fix:

- retain `total/limit/offset` through API → adapter → view model → controller → UI;
- accessible Previous/Next at Jobs/Units/Attempts levels;
- parent-page changes clear only lower-level selection;
- refresh/poll current pages rather than reset to page 1;
- never load unbounded history.

Regression fixture:

- Happy Job = 51 Units;
- review Unit = 51 durable Attempts;
- old pagination marker + 30 newer filler Jobs;
- real Chromium proves Jobs page 2, Unit 51, and Attempt page 2.

Key commits: `92f4d0f8...`, `8b932faa...`, `0974142f...`, `3411c1fd...`, `38272670...`, tests `3ab137c9...` / `27de2d6f...` / `8dd1d712...`, fixtures `66ac7bd3...` / `ae772db5...`, workflow `a9e97e34...`, Chromium `c3420181...`, docs `70f6fe21...`.

All three are **FIXED IN CANDIDATE / EXECUTION PENDING**.

## 7. Current real Chromium contract

Fixture variables:

- `STAGE13E_E2E_JOB_TYPE=stage13e_e2e_happy`;
- `STAGE13E_E2E_RACE_JOB_TYPE=stage13e_e2e_race`;
- `STAGE13E_E2E_PAGINATION_JOB_TYPE=stage13e_e2e_pagination_marker`.

Suite covers:

1. complete durable Jobs/Units/Attempts pagination;
2. pause/resume;
3. approve + reload durability;
4. real session expiry through same BrowserContext;
5. real stale-review `409` + canonical refresh;
6. 390px no-horizontal-overflow.

No mock API, route interception, fake 401/409, test-only Backend endpoint, manual cookie mutation or sleep-based race.

## 8. Executable blocker

Workflow: `.github/workflows/stage13e-integration.yml`.

Latest runtime/test run:

- run `34249182219`;
- head `ae772db53e218037a2b140e9dc08e6528f1a1ac8`;
- job `102138902680`;
- `runner_id=0`, `runner_name=""`, `steps=[]`;
- no checkout or repository command executed.

This is **not product failure evidence**. Available GitHub permissions do not expose account Billing/Actions administration, so the external root cause remains `NOT YET VERIFIED`. Do not weaken gates or claim PASS.

## 9. Exact next work

Read `PROJECT_EXECUTION_QUEUE.md` for canonical order.

Current sequence:

1. keep Stage13E outside `main`;
2. retain the three P1 fixes/regressions;
3. rerun unchanged combined gate when a real hosted runner starts;
4. any executed failure → root-cause fix in owning layer + regression;
5. combined PASS → wider Stage9/10/OCR/11/12/13/13D/Full Rebuild same-head matrix;
6. wider PASS → promote Stage13E runtime to `main` while preserving central docs;
7. update Legacy Coverage/Roadmap/central docs + Stage13E Closure Report in Issue #16;
8. only then begin Stage13F.

## 10. Later roadmap

- Stage13F — Question Bank / Quiz Builder / Publish; resolves `AI-011-005`.
- Stage13G — Remaining Admin.
- Stage14–20 — Student Product → Assessment → Offline/PWA → Personal Data → Notifications → Progress/Statistics → Import/Export.
- Stage21–25 — Performance → Security → CI/test expansion → Accessibility/device QA → initial content load.
- Stage26–29 — only when VPS/deployment is explicitly reopened.

## 11. Open findings

- `CI-001` P1 — hosted runner terminates before checkout; external cause not verified.
- `AI-013E-DB-001` P1 — fixed in candidate; execution pending.
- `AI-013E-REVIEW-002` P1 — fixed in candidate; execution pending.
- `AI-013E-OPS-003` P1 — fixed in candidate; execution pending.
- `AI-011-005` P2 — direct generated-question persistence; Stage13F.
- `AI-012-019` P2 — live provider benchmark/routes/credentials/bootstrap unverified.
- later product stages remain incomplete.

## 12. End-of-batch continuity rule

After meaningful work update:

1. `PROJECT_EXECUTION_QUEUE.md`;
2. `PROJECT_INTEGRATION_CONTINUITY.md`;
3. `PROJECT_STATUS.md`;
4. `PROJECT_ENGINEERING_LOG.md`;
5. specialized stage docs/contracts;
6. Issue #16 `EXECUTION REPORT`;
7. this Handoff/Index/Roadmap/Legacy Coverage when their truth changes.

Record exact branch/HEAD/run IDs and explicit `NOT YET VERIFIED`. Never leave continuation-critical information only in chat.
