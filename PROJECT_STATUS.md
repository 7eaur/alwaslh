# PROJECT STATUS — الوسيلة الذكية

> الحالة التنفيذية المختصرة. Code/migrations + executable CI evidence أعلى من prose. أي شيء غير مفحوص/غير منفذ = `NOT YET VERIFIED`.

Last synchronized: **2026-09-10 — Stage13F Question Bank / Quiz Builder implementation VERIFIED; closure documentation checkpoint prepared for exact-head re-verification and non-force promotion.**

## Current Position

- Repository: `7eaur/alwaslh`.
- Shared execution ledger: GitHub Issue `#16`.
- Current operating model: **parallel two-track execution**.
  - Track A: Backend/Admin/AI/Question Bank/Quiz Builder on `integration/stage13f-question-bank`.
  - Track B: Student Product on `parallel/stage14-student-product`.
- Production deployment/cutover remains future-only. No deployment was required or performed for Stage13F closure.
- Stage13E runtime/application authority: `d5ebc7f25a369430387a758c7c0bb89350963d67` — VERIFIED / CLOSED.
- Stage13F verified runtime checkpoint: `afbe552710b3f1cf79ee70594f691fa836c05a45`.
- Stage13F runtime verification-only PR: `#27` — **13/13 SUCCESS, closed unmerged**.
- Stage13F specialized same-head runs before the wider matrix:
  - Backend/PostgreSQL: `34420441878` — SUCCESS.
  - Admin/PostgreSQL/real Chromium: `34420441837` — SUCCESS.

## Stage13F — VERIFIED / CLOSED PRODUCT BOUNDARY

Stage13F now provides the reviewed assessment-authoring authority between Stage13E AI review and later Stage15 Student assessment consumption.

Verified flow:

```text
Stage11 typed generation/validation
→ Stage12 durable execution/output
→ Stage13E human approve
→ Stage13F Question Bank import as Draft
→ Question Bank Review → Published
→ Quiz Builder selects published immutable revisions
→ immutable quiz-version delivery snapshots
→ reviewed/published export
→ Stage15 later consumes published snapshots
```

Verified capabilities:

- canonical reusable Question Bank item UUID separate from delivery snapshots;
- immutable Question Bank revisions and durable lifecycle/audit history;
- `multiple_choice`, `true_false`, and `direct` question persistence;
- answer-shape and publication invariants in PostgreSQL;
- class/subject/lesson/source/page/checksum/OCR/content-source provenance;
- only the latest Stage13E `approve` revision is import-eligible;
- AI import is idempotent/concurrency-safe and always enters as Draft;
- manual create/edit plus Draft → Review → Published;
- published revision replacement without mutating historical authority;
- dedicated Admin Question Bank workspace with real loading/error/empty/filter/search/detail/edit/review/publish/session-expiry/responsive states;
- Quiz Builder with class/subject/multi-lesson scope, published Question Bank candidates, multiple models/versions, immutable snapshots, direct-question delivery support, review/publish/archive lifecycle;
- one-question regeneration applies only an approved Stage11 `regenerate_question` output to a **new revision of the same stable item**;
- regeneration replay is idempotent; generic AI import cannot create a standalone item from regeneration output;
- reviewed/published exact-version export: UTF-8 Excel-compatible CSV and RTL print/PDF template; Draft export is rejected server-side;
- real Chromium covers Question Bank pagination/lifecycle/manual direct/import/session-expiry/mobile and Quiz Builder create/select/model/review/publish/mobile flows.

## Stage13F Runtime Matrix — 13/13 SUCCESS

Verification-only PR `#27` executed the wider matrix on exact runtime HEAD `afbe552710b3f1cf79ee70594f691fa836c05a45` and was closed unmerged.

| Gate | Run | Result |
|---|---:|---|
| Stage9 Content Import | `34420900598` | SUCCESS |
| Stage10 Media Pipeline | `34420900550` | SUCCESS |
| OCR Foundation | `34420900527` | SUCCESS |
| Stage11 AI Contracts | `34420900592` | SUCCESS |
| Stage12 AI Execution | `34420900501` | SUCCESS |
| Stage13 Admin Product | `34420900492` | SUCCESS |
| Stage13D Content Ingestion | `34420900547` | SUCCESS |
| Stage13D Admin Upload UI | `34420900488` | SUCCESS |
| Stage13E Frontend Preparation | `34420900522` | SUCCESS |
| Stage13E Admin AI Operations | `34420900503` | SUCCESS |
| Stage13F Question Bank / Quiz Builder authority | `34420900520` | SUCCESS |
| Stage13F Admin + real Chromium | `34420900476` | SUCCESS |
| Rebuild Stage Verification | `34420900482` | SUCCESS |

The Rebuild gate also passed clean PostgreSQL, Auth/Access/Activation regressions, Admin/Student builds and real Student activation/returning-login/recovery Chromium.

## Stage Ledger

| Stage | State |
|---|---|
| Stage1–10 | VERIFIED |
| OCR Foundation | VERIFIED |
| Stage11 AI Contracts | VERIFIED |
| Stage12 Durable AI Execution | VERIFIED backend/runtime; live provider bootstrap remains `NOT YET VERIFIED` |
| Stage13A–D | VERIFIED |
| Stage13E Admin AI Operations / Review | VERIFIED / CLOSED |
| Stage13F Question Bank / Quiz Builder / Publish | **VERIFIED / CLOSED** |
| Stage13G Remaining Admin Product | **NEXT Track A work** |
| Stage14 Student Product | **parallel Track B: IN PROGRESS; Access/Curriculum/Reader verified, final shell/copy/a11y closure active** |
| Stage15 Practice / Assessment | BLOCKED until Track B incorporates the Stage13F main checkpoint |
| Stage16–25 | REQUIRED by roadmap |
| Stage26–29 | future release/deployment track |

## Findings State

- `AI-011-005` P2 — **FIXED + VERIFIED in Stage13F** for reviewed `direct` Question Bank persistence and delivery snapshot authority; Student direct-answer interaction remains Stage15.
- `QB-013F-IDENTITY-001` P1 — regeneration could break stable question identity — **FIXED + VERIFIED**.
- `QB-013F-REPLAY-002` P1 — regeneration replay initially conflicted with its own open Draft — **FIXED + VERIFIED** by replay-before-open-draft ordering.
- `QB-013F-EXPORT-003` P1 — Draft export could be mistaken for published authority — **FIXED + VERIFIED** by server status gate.
- `QB-013F-UI-004` P2 — nested candidate-search form / ambiguous browser locators — **FIXED + VERIFIED** without weakening assertions.
- `GIT-013F-005` P3 — accidental `.noop` create/delete before Stage13F branch — **RESOLVED / NO TREE OR RUNTIME EFFECT**. Cleanup `main @ 5fdb23030c77cae9bff5f8c33d4be466427eb6e5` restored tree `bcd433bd553b3e7eb539515cffd2a23a92f97192` exactly.
- `AI-012-019` P2 — live provider benchmark/routes/credentials/bootstrap remains **OPEN / NOT YET VERIFIED**.

## Legacy Coverage Boundary

Stage13F closes only outcomes with executable evidence. It does **not** silently claim every `QADMIN-001..033` row. Verified Stage13F mappings and remaining Admin/AI-authoring gaps are recorded in `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md`.

In particular, remaining direct generation orchestration inside Quiz Builder and specialized legacy export variants remain explicit later work rather than fake completion.

## Promotion Rule

The final Stage13F closure documentation commit containing this file must itself pass the same pull-request regression matrix. Only then may `main` be moved **non-force / fast-forward** to that exact commit. Do not merge the verification PR and do not create a merge commit.

Track B Stage15 must consume the exact promoted Stage13F authority from `main`; it must not duplicate Question Bank/Quiz authority locally.

## Exact Next Work After Promotion

1. Track A: Stage13G remaining Admin product and unresolved Admin parity/AI-authoring outcomes.
2. Track A: keep `AI-012-019` explicitly `NOT YET VERIFIED` until real provider benchmark/config/runtime evidence exists.
3. Track B: finish Stage14 closure, then incorporate the promoted Stage13F main checkpoint before Stage15.
4. Continue Stage15–25 in roadmap order; no production cutover before explicit release/deployment work.