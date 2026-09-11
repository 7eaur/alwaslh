# LEGACY FEATURE COVERAGE GATE

Purpose: prevent any valuable capability from legacy **الوسيلة الذكية** from disappearing during rebuild because architecture/screens are redesigned.

Canonical inventory: `PRODUCT_FEATURE_PARITY_MATRIX.md`.

Last synchronized: **2026-09-11 — Stage13G VERIFIED/CLOSED on Track A; NOT PROMOTED to main.**

## Rule

Every legacy capability must end as:

```text
legacy ID
→ KEEP | IMPROVE | REFACTOR | REBUILD | REMOVE
→ target module/flow
→ implementation evidence
→ executable acceptance evidence
```

`REMOVE` requires explicit Product Owner approval and documented replacement/reason.

Evidence vocabulary:

- `VERIFIED` — user/business outcome exists and executable evidence passed.
- `FOUNDATION VERIFIED` — lower-level authority exists, but complete user flow is not closed.
- `NOT YET VERIFIED` — complete acceptance absent.
- `REMOVE APPROVED` — explicit Product Owner evidence exists.

Infrastructure never silently closes a later UI/business outcome.

## Current Verified Runtime Baselines

- Stage13E AI Operations/Review: previously verified and retained by wider regression.
- Stage13F Question Bank/Quiz Builder runtime: `afbe552710b3f1cf79ee70594f691fa836c05a45`; promoted `main` closure: `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`.
- Stage13G G-A: `4822f87d60ab7a467c4708b5f75bb24cb90e7738`, run `34425317912`, Chromium 4/4.
- Stage13G G-B: `bc19f6e198c8cfede62e9f1b7a7eb1b0fed121cb`, run `34428052472`, Chromium 7/7 total.
- Stage13G G-C1: `345e0712c45e9e4c0479dc65d96efc3fb7da33cd`, run `34430915626`, Chromium 10/10 total.
- Stage13G G-C2: `77350523f111398e2e008280938e60a4ad87130d`, run `34529871808`, all jobs SUCCESS.
- Stage13G G-D/parity dedicated closure: `80115ce27984a6f9098ab7e227f4b81e1f8aad39`, run `34554764124`, all jobs SUCCESS, Chromium 17/17.
- Stage13G wider closure code/workflow head: `dbb67a52c813aaf8b8d1af0faeacec65edde716b`; verification-only PR #30: **15/15 workflows SUCCESS**, closed unmerged.

Stage13G remains outside `main` until explicit promotion.

## Previously Verified Admin Coverage

### Curriculum / Content / Media / OCR

Previously verified Curriculum/Admin rows remain verified under recorded KEEP/IMPROVE/REBUILD dispositions.

Stage13D verified image/PDF/mixed selected-order ingestion, media pipeline reuse, durable progress/status/error/retry, history/reopen/archive and explicit Draft→Review→Published content publication.

### Stage13E Admin AI Operations / Review

Retained verified outcomes include durable jobs, cancellation, retry, server-derived progress/status, safe telemetry and complete Admin review surface over Stage12 authority. Approval remains review approval only, not Question Bank publication.

### Stage13F Question Bank / Quiz Builder

Verified core boundary remains:

```text
Stage11 typed generation
→ Stage12 durable execution
→ Stage13E latest human approve
→ Question Bank Draft
→ Review → Published
→ Quiz Builder published-revision selection
→ immutable quiz-version snapshots
→ reviewed/published export
```

Stage13G G-D extends authoring orchestration without replacing this boundary.

## Admin Lesson Authoring Parity (`LES-A-020..039` relevant G-D rows)

| ID | State | Current rebuilt outcome / evidence |
|---|---|---|
| `LES-A-020` Generate lesson summary | **VERIFIED** | G-D `lesson_summary` durable authoring plan over Stage12; human review required before apply |
| `LES-A-021` Extract text | **VERIFIED FOUNDATION retained** | OCR/content pipeline remains canonical extraction authority; G-D consumes approved OCR/vision provenance rather than inventing a second extractor |
| `LES-A-022` Generate interactive questions | **VERIFIED** | G-D `question_generation` trigger + typed Stage11 contract + review + Question Bank import |
| `LES-A-023` MCQ type | **VERIFIED** | typed generation + Question Bank + Quiz snapshots |
| `LES-A-024` True/False type | **VERIFIED** | typed generation + Question Bank + Quiz snapshots |
| `LES-A-025` Mixed question types | **VERIFIED** | typed target/count settings now exposed through complete Lesson authoring flow |
| `LES-A-026` Extract questions from source image | **VERIFIED** | exact/source modes use server-resolved canonical published media/OCR provenance; review remains mandatory |
| `LES-A-027` Replica/exact question generation | **VERIFIED** | `exact_question_extraction` / `replica_question_extraction` authoring modes + Stage11 exactness/uncertainty rules |
| `LES-A-028` Comprehensive generation | **VERIFIED** | `comprehensive_lesson_content` durable plan and review-gated summary/question apply |
| `LES-A-029` Edit summary | **VERIFIED** | Admin typed summary editor using canonical Curriculum mutation; real change advances content revision |
| `LES-A-030` Delete summary | **VERIFIED** | explicit clear-summary action; content revision consistency protected by migration 0025 |
| `LES-A-031` Edit generated question | **VERIFIED** | AI-imported Question Bank item supports immutable replacement revision + review/publish |
| `LES-A-032` Delete generated question | **VERIFIED — safer archive semantics** | non-destructive stable-ID archive with canonical Question Bank event; published history is not hard-deleted |
| `LES-A-033` Add/manual question | **VERIFIED** | Question Bank manual authoring + lifecycle |
| `LES-A-034` Bulk generate selected lessons | **VERIFIED** | G-D selected-lesson authoring bounded 1–32 with durable Stage12 units/idempotency |
| `LES-A-035` Background generation visible while navigating Admin | **VERIFIED** | Stage12 durable jobs + Stage13E operations retained by wider regression |
| `LES-A-036` Cancel generation task | **VERIFIED** | Stage13E durable cancellation retained |
| `LES-A-037` Retry failed generation | **VERIFIED** | Stage13E retry retained |
| `LES-A-038` Export selected lesson content | **VERIFIED** | Admin-only 1–32 lesson content CSV + RTL print projection with summaries/latest Question Bank questions; formula-safe output |
| `LES-A-039` Export history | **VERIFIED** | filterable Admin-only history CSV over current Curriculum/Question Bank/AI authorities; no duplicate history store or secret metadata leak |

## Admin Quiz Parity (`QADMIN-001..033`)

| ID | State | Current rebuilt outcome / evidence |
|---|---|---|
| `QADMIN-001` List quizzes | **VERIFIED** | server pagination/filter/search + Admin list |
| `QADMIN-002` Create quiz | **VERIFIED** | dedicated Quiz Builder |
| `QADMIN-003` Edit quiz title/metadata | **VERIFIED** | Draft Quiz metadata panel uses existing typed update authority |
| `QADMIN-004` Delete quiz | **VERIFIED — documented soft-delete replacement** | explicit non-destructive audited archive; no hard-delete of published history |
| `QADMIN-005` Select class/subject | **VERIFIED** | canonical offering scope |
| `QADMIN-006` Select one/multiple lessons | **VERIFIED** | normalized `quiz_lessons` + Admin multi-select |
| `QADMIN-007` Build quiz from lesson summary/text | **VERIFIED rebuilt source flow** | G-D Quiz generation resolves canonical selected Lesson published source/OCR context server-side |
| `QADMIN-008` Generate MCQ count | **VERIFIED** | typed per-version target/count settings + strict Stage11 validation |
| `QADMIN-009` Generate True/False count | **VERIFIED** | typed per-version target/count settings + strict validation |
| `QADMIN-010` Mixed counts | **VERIFIED** | mixed typed target counts through complete generation UI/orchestration |
| `QADMIN-011` Generate from images | **VERIFIED** | selected Lesson sources resolve canonical published media/OCR/vision provenance |
| `QADMIN-012` Exact exam-paper extraction | **VERIFIED** | `exact_exam_extraction` Quiz authoring mode preserves Stage11 exactness/unknown-answer rules |
| `QADMIN-013` Multiple quiz versions | **VERIFIED** | stable version model/snapshots |
| `QADMIN-014` Per-version lesson/source selection | **VERIFIED** | each generated version has explicit independent lesson scope constrained to Quiz lessons |
| `QADMIN-015` Per-version question count/settings | **VERIFIED** | independent target/count + label/shuffle settings per version |
| `QADMIN-016` Generate one version | **VERIFIED** | bounded durable Quiz plan supports a single requested version |
| `QADMIN-017` Generate all versions | **VERIFIED** | one bounded Stage12 plan supports 1–20 version units; browser does not serial-loop provider calls |
| `QADMIN-018` Add/remove version | **VERIFIED** | stable Draft-only add/remove authority |
| `QADMIN-019` Edit generated question | **VERIFIED** | Question Bank replacement revision workflow |
| `QADMIN-020` Add manual question | **VERIFIED** | Question Bank manual authoring then publish/select |
| `QADMIN-021` Remove question | **VERIFIED** | Draft version question selection can be replaced; published snapshot immutable |
| `QADMIN-022` Regenerate one question | **VERIFIED** | one-click G-D regeneration plan uses published question + preserved source/context; approved replacement follows existing safe apply path |
| `QADMIN-023` Preserve explanation/method/source/page | **VERIFIED** | canonical Question Bank/delivery snapshot provenance retained |
| `QADMIN-024` Export quiz to Excel | **VERIFIED for Excel-compatible CSV** | safe selected-version CSV with provenance/formula sanitization; binary `.xlsx` is not claimed |
| `QADMIN-025` Export quiz to PDF | **VERIFIED for browser Print/Save-as-PDF** | safe RTL print template; server-generated binary PDF is not claimed |
| `QADMIN-026` Export selected versions | **VERIFIED** | explicit 1–20 selected-version scope |
| `QADMIN-027` PDF questions + all options | **VERIFIED** | specialized `questions_options` print variant |
| `QADMIN-028` PDF questions only | **VERIFIED** | specialized `questions_only` variant |
| `QADMIN-029` PDF questions + correct answers | **VERIFIED** | specialized `questions_answers` variant |
| `QADMIN-030` PDF answers + explanations | **VERIFIED** | specialized `answers_explanations` variant |
| `QADMIN-031` PDF answer key only | **VERIFIED** | specialized `answer_key` variant |
| `QADMIN-032` PDF lesson images only | **VERIFIED for browser Print/Save-as-PDF** | all eligible published Quiz Lesson display assets are projected through authenticated asset route; no silent first-two truncation |
| `QADMIN-033` PDF lesson names only | **VERIFIED** | specialized `lesson_names` source metadata variant |

## Stage13G Admin Operations Coverage

### G-A Accounts / Access — VERIFIED

Canonical Student account status/detail, Auth-owned recovery/device-rebind, Access-owned entitlement revoke, Full/Class code inventory/generation/search/filter/pagination and non-destructive revoke with audit.

### G-B Notifications / Operations — VERIFIED

Shared Admin/Student notification authority over existing durable tables, Admin notification lifecycle, Student API visibility/read authority, and real Operations metrics/activity. Student notification UI remains later Student work.

### G-C1 Code Import / Export / Print — VERIFIED

Strict bounded CSV import, row-level errors/duplicates, CSV template, canonical safe BOM CSV exports and selected/filter/used scopes, plus RTL printable cards. Binary `.xlsx` and server-generated binary PDF are not claimed.

### G-C2 Reports / Settings / Security / Audit — VERIFIED

Runtime checkpoint `77350523f111398e2e008280938e60a4ad87130d`, run `34529871808`.

Verified:

- Content/OCR/AI/Question Bank/Quiz operational report aggregates;
- non-secret settings posture;
- aggregate security posture;
- bounded canonical audit projection across `auth_events`, `access_events`, `curriculum_events`, `ai_output_review_events`, `question_bank_events`, `quiz_builder_events`;
- source/event filters and pagination;
- no generic audit/settings truth store;
- no DB URL/storage path/origin values/provider aliases/review payload/secret metadata exposure.

### G-D Lesson / Quiz AI Authoring + Parity Closure — VERIFIED

Dedicated closure run `34554764124` at `80115ce27984a6f9098ab7e227f4b81e1f8aad39`: Backend/Admin/PostgreSQL/Chromium SUCCESS; Chromium 17/17.

Wider head `dbb67a52c813aaf8b8d1af0faeacec65edde716b`: verification-only PR #30 **15/15 workflows SUCCESS**, closed unmerged.

Key boundary remains human-in-the-loop:

```text
Admin authoring trigger
→ Stage12 durable job/unit
→ Stage13E review/approve
→ Question Bank Draft/Review/Published when questions exist
→ idempotent Quiz version materialization from Published revisions
```

No general AI chat/sidekick or second AI lifecycle was introduced.

## Export / Print Security Boundary

Verified Stage13G exports sanitize formula-leading CSV cells and HTML-escape print content. Lesson history export intentionally excludes event metadata/input manifests/notes; integration regression seeds secret markers and verifies they do not appear in browser/export response.

Current product-equivalent PDF path is browser Print/Save-as-PDF. Server-generated binary PDF remains unclaimed.

## Student Coverage Boundary

Track B separately owns Student Product. Do not mark Student-facing practice/test/notifications/offline/personal-data/progress rows green merely because Admin/backend authorities exist. Inspect Track B Source of Truth and its executable evidence independently.

## AI Capability Boundary Still Open

`AI-012-019`: live provider/model benchmark/routes/credentials/bootstrap = **NOT YET VERIFIED**. Provider-neutral prompts/rules, fixtures and durable execution do not prove production provider readiness.

## Final Release Gate

For every legacy row release must answer:

1. Where is it in the new product?
2. What changed and why?
3. Which Product/Architecture Decision supports it?
4. Which executable test proves the outcome?
5. If removed, where is Product Owner approval?

Anything without these answers remains `NOT YET VERIFIED`; infrastructure alone cannot silently close a product outcome.