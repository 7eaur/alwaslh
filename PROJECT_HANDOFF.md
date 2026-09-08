# PROJECT HANDOFF — الوسيلة الذكية

> **Purpose:** أي محادثة هندسية بديلة يجب أن تستطيع استئناف المشروع بالكامل من GitHub بدون ذاكرة Chat سابقة.

Last synchronized: **2026-09-08 — Single Owner active; hosting deferred; Stage13E combined candidate hardened by four P1 root fixes and awaiting executable verification.**

## 0. Mandatory startup

Before changing code:

1. confirm repo `7eaur/alwaslh`;
2. treat `main` as latest Integration-approved development baseline;
3. read `README.md`;
4. read `DOCUMENTATION_INDEX.md`;
5. read this file;
6. read `PROJECT_STATUS.md`;
7. read `PROJECT_ENGINEERING_LOG.md`;
8. read `PROJECT_INTEGRATION_CONTINUITY.md`;
9. read `PROJECT_EXECUTION_QUEUE.md`;
10. read `docs/product/CURRENT_PRODUCT_OVERRIDES.md`;
11. read `docs/workstreams/SINGLE_OWNER_OPERATING_MODEL.md`;
12. read latest comments in Issue `#16`;
13. read current Stage docs + actual code/migrations/tests;
14. live-check `main`, active branch HEADs and Actions.

Anything not inspected/executed = `NOT YET VERIFIED`. If repository docs are insufficient to resume, fix documentation before feature work.

## 1. Operating model

One replaceable engineering conversation owns Product/Architecture/Backend/Frontend/UX/Security/Performance/QA/Git/Documentation.

- Issue `#16` = sole active Project Execution Board.
- `PROJECT_EXECUTION_QUEUE.md` = ordered task authority.
- `PROJECT_INTEGRATION_CONTINUITY.md` = detailed current memory.
- Issues #13/#14/#15 and former workstream docs = historical only.

## 2. Hosting / deployment

**Hosting/deployment are fully deferred until Product Owner provides a VPS and explicitly reopens deployment.**

No hosted-runtime gate, cutover, or provider-hosting work now. Preserve normal portability only.

## 3. Repository / verified state

- Repository: `7eaur/alwaslh`.
- `main`: Integration-approved development baseline; central docs may advance independently of candidate runtime.
- Legacy archive: `archive/legacy-main-2026-09-08 @ 5d16c9ae5e4aa84a13c128da34b0e62f4ae28c06`.
- Latest fully executable green product baseline: `4eca7de8877ac9e2289b9c7990c912d33c256935`.

Verified through Stage13D: Stages1–10, OCR, Stage11, Stage12 backend/runtime, Stage13A/B/C/D including Chromium where applicable.

Do not replace verified baseline with docs-only/unexecuted heads.

## 4. Stable architecture / business rules

- Browser owns presentation/session UX, not durable canonical business state.
- Full Code = 6 digits; Class Code = 7 digits.
- activation verification non-consuming; finalization atomic.
- returning Student = password + registered P-256 device proof.
- Curriculum = Class → Subject Offering (`subject_class_links`) → optional Section → Lesson.
- source inventory = provenance, not curriculum hierarchy.
- `media ready != published`.
- Stage13D publication = Draft → Review → Published.
- raw AI/provider output never becomes automatic Student/Question Bank authority.
- provider calls stay outside long DB transactions.
- durable workers use PostgreSQL leases/capacity/control and remain separate from HTTP polling.
- credentials/provider metadata/internal provider errors never Frontend contract.
- no duplicate queue/pipeline/state authority.
- durable Admin operational/audit history must be reachable through bounded server pagination.
- **historical page selection never defines canonical current review authority**.
- no patching/test weakening/auth bypass/fake API/sleep-race masking.

## 5. Current Stage13E — Admin AI Operations / Review

Status: **COMBINED INTEGRATION CANDIDATE / NOT YET VERIFIED / OUTSIDE `main`**.

Active candidate branch:

`integration/stage13e-ai-operations @ b344c6cdc21ce71e5d8c6b34bb2dc7f6e42b5ebb`

Latest runtime/test HEAD below docs:

`6a9e9df01ecdab8a6298f0a47c05001d4cb8dd6b`

Historical source branches are evidence only:

- Backend `348c02646d0ff873fd305beff16f41c46d9c0285`;
- Frontend `1eb141e950e96c9f53ffd103a386d59166113c16`, Product/Test `7bf2f8c32907032551aace9f3aa27681040c4b0f`.

Candidate includes Admin Job/Unit/Attempt/Output observability, server-derived progress/actions, Stage12 controls, safe provider telemetry, provenance, append-only Stage11-validated review, stable-unit review boundary, authenticated Admin UI, canonical 409 refresh, bounded Jobs/Units/Attempts/Review History pagination, and real browser regressions. No Stage13F publication.

## 6. Stage13E P1 root fixes

### AI-013E-DB-001 — durable reject reason

DB now enforces nonblank reject reason; direct NULL/blank insert regression protects audit integrity.

### AI-013E-REVIEW-002 — human review vs retry replacement

Review actions exist only for stable `completed | review_required` units. Review transaction locks output+unit before decision. Non-stable outputs remain inspection-only.

### AI-013E-OPS-003 — Jobs/Units/Attempts inaccessible after first page

Frontend previously exposed only first 30 Jobs / 50 Units / 50 Attempts. Fixed with bounded server pagination end-to-end, current-page polling/refresh, accessible navigation, and real fixtures proving Jobs page 2, Unit 51, and Attempt page 2.

### AI-013E-OPS-004 — Review History inaccessible after 100 + historical-page authority coupling

Original `outputDetail()` returned only latest 100 review events with no total/offset and derived current state from `history[0]`.

Root fix:

- bounded `reviewLimit/reviewOffset`, max 100;
- `reviewPagination { total, limit, offset }`;
- history-page query separated from canonical latest-revision query;
- only canonical latest drives `reviewStatus`, `allowedReviewActions`, and `effectiveReviewedOutput`;
- independent Frontend Review offset preserved through polling/refresh/409;
- accessible Review History pagination, no unbounded loading.

Backend regression inserts 105 revisions, opens offset 100 (revisions 5..1), and proves revision 105 remains approved authority with no actions and latest effective output.

Real Chromium fixture inserts 101 edits, navigates all three pages, proves revision 1 reachable, approves while oldest page is visible, then proves revision 102/current approved state and reload durability.

Key runtime/test commits: `d242e054...`, `f04fe2be...`, `e33d43c1...`, `9c18826a...`, `2c82e879...`, `72711ec8...`, `de3a9dc2...`, `bf782c92...`, `d7830d18...`, `f64419fa...`, `a1ef3d7a...`, `f95c1a9e...`, `6a9e9df0...`.

All four findings are **FIXED IN CANDIDATE / EXECUTION PENDING**.

## 7. Current real Chromium contract

Fixtures:

- Happy Job = 51 Units + 51 Attempts + 101 append-only review edits.
- Race Job = terminal execution + open output for deterministic real stale-review 409.
- Pagination Marker = deliberately old Job + 30 newer fillers.

Suite contract covers:

1. complete Jobs/Units/Attempts pagination;
2. complete Review History >100 pagination;
3. canonical-latest review authority while oldest page is viewed;
4. pause/resume + approve + reload;
5. real session expiry;
6. real stale-review 409 + canonical refresh;
7. 390px no-horizontal-overflow.

No mock API, fake error, test-only Backend endpoint, manual cookie mutation, or sleep-based race.

## 8. Executable blocker

Workflow: `.github/workflows/stage13e-integration.yml`.

Latest runtime/test run:

- run `34275316004`;
- head `6a9e9df01ecdab8a6298f0a47c05001d4cb8dd6b`;
- job `102226771007`;
- `runner_id=0`, `runner_name=""`, `steps=[]`;
- no checkout/repository command executed.

This is **not product failure evidence**. External account/platform root cause remains `NOT YET VERIFIED`; do not weaken gates and do not claim PASS.

## 9. Exact next work

1. keep Stage13E outside `main`;
2. retain all four P1 fixes/regressions;
3. rerun unchanged combined gate when a real hosted runner starts;
4. any executed failure → root-cause fix + regression;
5. combined PASS → wider Stage9/10/OCR/11/12/13/13D/Full Rebuild same-head matrix;
6. wider PASS → integrate Stage13E runtime to `main`, update Legacy Coverage/Roadmap/central docs + Closure Report in Issue #16;
7. only then begin Stage13F;
8. hosting remains deferred.

## 10. Later roadmap

- Stage13F — Question Bank / Quiz Builder / Publish; resolve `AI-011-005`.
- Stage13G — Remaining Admin.
- Stage14–25 — Student/product/hardening stages.
- Stage26–29 — only when VPS/deployment explicitly reopens.

## 11. Open findings

- `CI-001` P1 — runner terminates before checkout; external cause not verified.
- `AI-013E-DB-001` P1 — fixed, execution pending.
- `AI-013E-REVIEW-002` P1 — fixed, execution pending.
- `AI-013E-OPS-003` P1 — fixed, execution pending.
- `AI-013E-OPS-004` P1 — fixed, execution pending.
- `AI-011-005` P2 — Stage13F.
- `AI-012-019` P2 — live provider bootstrap unverified.

## 12. End-of-batch continuity rule

After meaningful work update: Queue, Continuity, Status, Engineering Log, specialized docs, Issue #16 report, and Handoff/Index/Roadmap/Legacy Coverage when truth changes. Record exact branch/HEAD/run IDs and explicit `NOT YET VERIFIED`. Never leave continuation-critical information only in chat.
