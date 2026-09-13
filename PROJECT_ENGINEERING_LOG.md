# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains preserved in Git history, merged PRs, Issue #16 and specialized workstream documents.

Last consolidated: **2026-09-13 — AR-01 through AR-06 DONE / VERIFIED. AR-07 Quiz Builder is next and has not started.**

## Project and authority invariants

الوسيلة الذكية منصة تعليمية عربية تتكون من Student Web/PWA + Super Admin Web فوق Fastify/PostgreSQL.

- `apps/student-web` — parallel Student product; not owned by this Admin workstream.
- `apps/admin-web` — Super Admin product under staged rebuild.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- Browser state is never canonical business authority.
- AI never auto-publishes Student content/questions.
- Human review remains mandatory where contracts require it.
- Published/revision/audit/provenance authority remains server-owned.
- Student/audit work must not be overwritten by the Admin rebuild.

## Binding Admin architecture decisions

- **AD-ADMIN-001:** primary work is route-owned and deep-linkable.
- **AD-ADMIN-002:** Overview is attention-first.
- **AD-ADMIN-003:** Operations owns Health/Audit/Diagnostics; Governance is not a normal workspace.
- **AD-ADMIN-004:** technical IDs/provider/runtime/storage/hash/raw JSON are advanced-only.
- **AD-ADMIN-005:** content publication belongs to lesson content, not ingestion-task identity.
- **AD-ADMIN-006:** OCR review requires visible source evidence.
- **AD-ADMIN-007:** removing legacy/parity UI must not remove legitimate capability.
- **AD-ADMIN-008:** approved AI output is applied contextually under server authority.
- **AD-ADMIN-009:** `/app/questions/:questionId` owns canonical Question Bank entity detail/review/history.
- **AD-ADMIN-010:** Question Bank migration is parity-first; capabilities move only with executable proof.
- **AD-ADMIN-011:** question editing is entity-owned while revision authority stays server-side.
- **AD-ADMIN-012:** approved question regeneration is entity-owned while approval/provenance/idempotency stay server-side.
- **AD-ADMIN-013:** routed Question Bank ownership requires real PostgreSQL + Chromium proof.
- **AD-ADMIN-014:** manual question creation and approved-AI import are focused creation-flow responsibilities, not responsibilities of a giant list/detail/review workspace.
- **AD-ADMIN-015:** a legacy workspace is removed once all production route ownership has moved and exact-head compile/API/PostgreSQL/real-browser gates prove no hidden dependency remains.

## Super Admin stage ledger

### AR-01 — DONE / VERIFIED
Route-driven shell/deep links and task-oriented navigation.

### AR-02 — DONE / VERIFIED
Attention-first Overview and Operations split.

### AR-03 — DONE / VERIFIED
Curriculum domain preserved; giant composition decomposed and browser-verified.

### AR-04 — DONE / VERIFIED
OCR/source evidence, lesson-owned publication and contextual legitimate authoring/export capabilities.

Verified checkpoint: `ba74c17902827805d6be0ab91c0ff384fc3e2530`.

### AR-05 — DONE / VERIFIED
Content-first AI review, contextual apply/import, preserved review/provenance/idempotency authority and browser-proven histories/application behavior.

Verified checkpoint: `cda2c3a683c6101db12f0c7cfad772226c234e0d`.
Runs: Frontend `34729512441`, Admin AI `34729512433`, Combined `34729512404` — SUCCESS.

## AR-06 — Question Bank — DONE / VERIFIED

### Previously verified ownership batches

- Batch 1 route-owned detail — `1677770dc6402e4b2825c1b8dd50f546fdf74d0c`.
- Batch 2A focused list/entity routing — `ed40fafd74baba3934e2ee4834bc0b61c2fe70ac`.
- Batch 2B route-owned edit — `43162f9b4f0468af96ae726f16054a868aff605a`.
- Batch 2C route-owned approved regeneration — `60cb917e88e92ae8c3e3b64c6a5c8b8e7eb2928e`.
- Batch 2D explicit routed Chromium ownership — `424bb1054fbd1a21991aa937be0f4338e08c7f09`.
  - Stage 13F Question Bank `34736985564` — SUCCESS.
  - Stage 13F Admin Question Bank `34736985648` — SUCCESS.
- Batch 2E focused Manual Create + Approved AI Import — `0d9b84a4c389ed0cef1a579e7772e2bde75a3cee`.
  - Frontend `34739142677` — SUCCESS.
  - Combined `34739142686` — SUCCESS.

### Batch 2F — legacy ownership cleanup + AR-06 closure — VERIFIED

#### State received

1. Re-read `PROJECT_STATUS.md`, this engineering log and `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md` before mutation.
2. Received feature documentation HEAD `a87c3340ca121eb6973d84090d5f0bcacc1e0c9e`; prior Batch 2E was documented/verified and AR-06 was the only open Admin stage.
3. Re-read live `main`; the Student track had advanced independently. Final live-main read before closure was `343ff1fd7b3d64d7e990b72606695365f520fa58`. No Student/audit code was modified or rebased into this batch.
4. Confirmed Draft PR #52 remained Draft.
5. Inspected current exact routes and owners instead of trusting the old workspace filename.

#### Inspection and classification

Actual `App.tsx` routing proved:

- `/app/questions` → `QuestionBankListPage`;
- `/app/questions/manage` → `QuestionBankCreatePage`;
- `/app/questions/:questionId` → `QuestionBankDetailPage`.

`QuestionBankCreatePage` already owned the focused Manual Create + Approved AI Import flow. The routed detail page already owned entity detail/edit/review/history/regeneration. `QuestionBankWorkspace.tsx` was therefore no longer a production route owner or required parity adapter.

Classification:

- **KEEP:** `QuestionBankListPage`, `QuestionBankDetailPage`, `QuestionBankCreatePage`.
- **KEEP:** `/app/questions/manage` because it remains a useful focused create/import route; it was not removed merely to reduce routes.
- **KEEP:** PostgreSQL/API lifecycle, revisions, publication, review, provenance, validation and idempotency authority.
- **REMOVE:** orphaned `apps/admin-web/src/QuestionBankWorkspace.tsx` because it duplicated migrated responsibilities and had no production route ownership.
- **NO CHANGE:** migrations, API business rules, Student/audit workstream.

#### Implementation

- `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1` — deleted `apps/admin-web/src/QuestionBankWorkspace.tsx` only.
- No route or navigation semantics changed in this cleanup batch, so existing real Chromium Question Bank scenarios remained the correct executable parity proof.

#### Exact-head verification

On code head `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`:

- Stage 13E Frontend Preparation `34740148367` — **SUCCESS**.
  - lint — success;
  - strict typecheck — success;
  - unit tests — success;
  - production build — success.
- Stage 13E Admin AI Operations `34740148382` — **SUCCESS**.
  - API quality/build — success;
  - clean PostgreSQL migrations/contracts — success;
  - authorization/observability/review-race/control tests — success;
  - Stage12 durable execution + auth security regressions — success.
- Stage 13E Combined Integration `34740148361` — **SUCCESS**.
  - API/Admin quality — success;
  - clean PostgreSQL migrations + DB contract — success;
  - backend authority/security regressions — success;
  - deterministic browser fixtures — success;
  - real Admin Chromium suite — success.

No hidden import dependency surfaced after deletion; compile/build and the full real-browser integration matrix stayed green.

#### AR-06 closure decision

AR-06 is **DONE / VERIFIED**. The giant Question Bank owner is gone, valid capabilities are owned by focused routes, server authority was preserved, and the final routed structure is green on exact code-head. Starting AR-07 is now allowed only after the documentation closure commits themselves are reconciled.

## Explicit resume point for B / next Admin task

1. Re-read `PROJECT_STATUS.md`, this log and the Super Admin workstream first.
2. Fetch current feature HEAD, live `main`, Draft PR #52 and exact-head CI.
3. The AR-06 documentation closure commits occur after verified code head `02cf24d5…`; inspect any CI they trigger before code mutation.
4. Treat **AR-06 as closed** unless a real regression is found.
5. Start **AR-07 — Quiz Builder only**.
6. Before modifying Quiz Builder, inspect migrations/schema, API/services/routes, frontend owner(s), tests and real browser flows; classify KEEP/IMPROVE/REFACTOR/REBUILD/REMOVE.
7. Preserve quiz lifecycle/composition/versioning and server authority; do not mirror tables or weaken tests.
8. Do not begin AR-08 until AR-07 exact-head green and documentation are synchronized.
9. Keep PR #52 Draft; no automatic merge.

## Current audit/findings register

| ID | Severity | Area | Problem | Status |
|---|---:|---|---|---|
| `ADMIN-001` | P1 | Admin IA | no durable route ownership | FIXED / AR-01 |
| `ADMIN-002` | P1 | Overview | generic metrics vs attention | FIXED / AR-02 |
| `ADMIN-003` | P1 | Curriculum | giant composition | FIXED / AR-03 |
| `ADMIN-004` | P1 | Content publication | task-ID-coupled UI | FIXED / AR-04 |
| `ADMIN-005` | P1 | OCR review | missing visible evidence | FIXED / AR-04 |
| `ADMIN-006` | P1 | AI review | pipeline internals in normal UX | FIXED / AR-05 |
| `ADMIN-007` | P1 | AI authoring | manual internal-ID handoff | FIXED / AR-05 |
| `ADMIN-008` | P1 | Question Bank | list/create/edit/review/history in one giant owner | FIXED / AR-06 |
| `FPA-013` | P2 | Student Reader | active search match lacks DOM focus | OPEN / Student-audit track |

## Remaining Super Admin sequence

`AR-07 Quiz Builder → AR-08 Students + Access Codes → AR-09 Cleanup/architecture enforcement → AR-10 A11y/RTL/performance/visual QA → final release/merge-readiness verification`

No later AR stage starts before the current stage is verified and documented. PR #52 remains Draft.