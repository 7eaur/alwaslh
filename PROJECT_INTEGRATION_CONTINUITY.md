# PROJECT INTEGRATION CONTINUITY — الوسيلة الذكية

> **Purpose:** الذاكرة التشغيلية التفصيلية لأي محادثة هندسية بديلة. يجب أن تستطيع الاستمرار من GitHub فقط بدون Chat history.
>
> **Authority:** current code + PostgreSQL migrations + executable evidence أعلى من هذا الملف. أي شيء غير مفحوص/غير منفذ = `NOT YET VERIFIED`.

Last synchronized: **2026-09-08 — Single Owner; Stage13E candidate has four P1 root fixes plus two P2 read-snapshot consistency hardenings; executable runner still unavailable before checkout.**

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
- **every Stage13E Admin AI response assembled from multiple PostgreSQL queries uses one short `REPEATABLE READ` snapshot**. Page/total, progress/actions, latest-attempt and review authority must not come from mixed concurrent commits.

## 4. Verified application baseline

Latest fully executable green head:

`4eca7de8877ac9e2289b9c7990c912d33c256935`

Verified through Stage13D. Same-head runs remain recorded in `PROJECT_STATUS.md`. Never replace this baseline with unexecuted/docs-only heads.

## 5. Git / current stage state

- Stage13E runtime is **not** in `main`.
- active candidate: `integration/stage13e-ai-operations`.
- current candidate/docs HEAD: `dd723f2451a0b2edcdaab2e6045a626cae44c15d`.
- latest runtime/test HEAD below docs: `10f32c72a684a8243a789a3561426a68dad1bcea`.
- legacy archive: `archive/legacy-main-2026-09-08 @ 5d16c9ae5e4aa84a13c128da34b0e62f4ae28c06`.

Historical source branches are evidence only: Backend `348c02646d0ff873fd305beff16f41c46d9c0285`; Frontend `1eb141e950e96c9f53ffd103a386d59166113c16`; Product/Test `7bf2f8c32907032551aace9f3aa27681040c4b0f`.

Administrative note: an accidental temporary file `tmp-ignore` was created on `main` in `5916ac42f1d6ed216e0efe336b20a8f030d1f45e` while changing GitHub write method, then removed immediately in `52fa960155964903290a78657029b3cb950bd6ee`. The resulting tree returned to the intended state; no runtime/product file or behavior was affected.

## 6. Stage13E candidate scope

Candidate provides Admin Jobs/Units/Attempts/Outputs read models, server-derived progress/actions, Stage12 pause/resume/cancel/retry reuse, safe provider/model/project telemetry, provenance, append-only Stage11-validated edit/approve/reject review, stable-unit review boundary, authenticated Admin UI, canonical refresh after 409, bounded Jobs/Units/Attempts/Review History pagination, and real browser fixtures. It does **not** publish to Stage13F Question Bank.

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

**Original defect:** after OPS-004, output row, requested history page, count and canonical latest event were still separate top-level reads under PostgreSQL `READ COMMITTED`.

**Impact:** a concurrent review commit could produce one internally mixed HTTP response (for example newer current review state with older `reviewedByProfileId/reviewedAt` or page/count metadata). No durable corruption, but audit/read-model correctness was weakened.

**Root fix:** commit `9d59f84fb516db5cfaf89382f548c3eea595e365` moves all four reads into one short `REPEATABLE READ` transaction. Parsing/schema/provenance mapping occurs after commit. No write lock and no provider/network call are introduced.

**Regression:** `apps/api/tests/ai-admin-output-detail-snapshot.test.ts` rejects any Output Detail read outside that snapshot, asserts repeatable-read is the first transaction operation, and preserves approved state/actor/time/pagination mapping.

Status: `FIXED IN CANDIDATE / EXECUTION PENDING`.

### AI-013E-OPS-006 — P2 Admin multi-query read-model consistency

**Original defect:** List Jobs page/total, Job Detail progress/units/`allowedActions`, and Unit Detail unit/latest-attempt/attempt-page/total were assembled from separate top-level reads.

**Impact:** a worker or lifecycle commit between those reads could make one HTTP response internally contradictory despite correct durable rows; e.g. progress from one state with action advice from another.

**Root fix:** commit `6a146c26b771a991530f12b1c1c12b6e3b43263b` adds one private `readSnapshot()` helper in `AdminAiOperationsService`. List Jobs, Job Detail, Unit Detail and Output Detail all use short `REPEATABLE READ` read transactions. Job Detail calls Stage12 `getAllowedActions(tx, jobId)` inside the same snapshot. Mutations keep existing write transactions; read snapshots add no write locks/provider calls.

**Regression:** `apps/api/tests/ai-admin-read-snapshots.test.ts` added in `f5c5dddfdcb807b87fd18796e8b1154118a51f6e`; hardened at `10f32c72a684a8243a789a3561426a68dad1bcea` so the Stage12 allowed-action query is matched explicitly rather than by a generic fixture branch. It fails any top-level read and requires repeatable-read as first operation for List/Job/Unit responses.

Status: `FIXED IN CANDIDATE / EXECUTION PENDING`.

## 8. Browser / executable gate

Real fixtures: Happy Job = 51 Units + 51 Attempts + 101 review edits; Race Job = terminal execution + open output for real stale-review 409; Pagination Marker = old Job + 30 newer fillers.

Chromium contract covers complete Jobs/Units/Attempts/Review History navigation, latest-authority isolation while old page is open, pause/resume, approve/reload, session expiry, stale-review 409, and 390px overflow. No mock/fake API or sleep race.

Workflow: `.github/workflows/stage13e-integration.yml`.

Latest runtime/test-head run:

- `34279168308` on `10f32c72a684a8243a789a3561426a68dad1bcea`;
- job `102239495903`;
- `runner_id=0`, `runner_name=""`, `steps=[]`.

Latest candidate/docs-head run:

- `34279304388` on `dd723f2451a0b2edcdaab2e6045a626cae44c15d`;
- job `102239938382`;
- `runner_id=0`, `runner_name=""`, `steps=[]`.

No executed product/test failure exists on the current candidate. `CI-001` remains P1 external hosted-runner allocation; exact external/account cause is `NOT YET VERIFIED`.

## 9. Exact next action

1. Keep Stage13E outside `main`.
2. Retain all four P1 fixes and OPS-005/OPS-006 P2 snapshot hardenings/regressions.
3. Execute unchanged Combined Gate when a real runner is allocated.
4. Any command that actually executes and fails → root-cause fix + regression.
5. Combined PASS → wider same-head Stage9/10/OCR/11/12/13/13D/Full Rebuild matrix.
6. Wider PASS → integrate Stage13E runtime into `main`, update Legacy Coverage/Roadmap/closure docs and Issue #16.
7. Only then begin Stage13F.
8. Hosting stays deferred until explicit VPS command.

## 10. Open findings

- `CI-001` P1 — runner terminates before checkout; external cause unverified.
- `AI-013E-DB-001` P1 — fixed, execution pending.
- `AI-013E-REVIEW-002` P1 — fixed, execution pending.
- `AI-013E-OPS-003` P1 — fixed, execution pending.
- `AI-013E-OPS-004` P1 — fixed, execution pending.
- `AI-013E-OPS-005` P2 — fixed, execution pending.
- `AI-013E-OPS-006` P2 — fixed, execution pending.
- `AI-011-005` P2 — Stage13F direct-question persistence.
- `AI-012-019` P2 — live provider benchmark/routes/credentials/bootstrap unverified.
- remaining later Admin/Student/product stages incomplete.
