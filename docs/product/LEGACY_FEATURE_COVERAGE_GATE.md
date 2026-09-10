# LEGACY FEATURE COVERAGE GATE

Purpose: prevent any valuable capability from legacy **الوسيلة الذكية** from disappearing during the rebuild because architecture/screens are redesigned.

Canonical inventory: `PRODUCT_FEATURE_PARITY_MATRIX.md`.

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

- Stage13E AI Operations/Review: `d5ebc7f25a369430387a758c7c0bb89350963d67`.
- Stage13F Question Bank/Quiz Builder runtime checkpoint: `afbe552710b3f1cf79ee70594f691fa836c05a45`.

Stage13F stage-specific runs:

- Backend/PostgreSQL `34420441878` — SUCCESS.
- Admin/PostgreSQL/real Chromium `34420441837` — SUCCESS.

Runtime verification-only PR #27 executed **13/13 SUCCESS** on `afbe5527...` and was closed unmerged. Wider runs: `34420900598`, `34420900550`, `34420900527`, `34420900592`, `34420900501`, `34420900492`, `34420900547`, `34420900488`, `34420900522`, `34420900503`, `34420900520`, `34420900476`, `34420900482`.

## Previously Verified Admin Coverage

### Curriculum / Content / Media / OCR

Previously verified Curriculum/Admin rows remain verified under recorded KEEP/IMPROVE/REBUILD dispositions.

Stage13C verified operational source/media/OCR search/filter/detail/review/correction/approve/reject.

Stage13D verified:

- `LES-A-010` image upload;
- `LES-A-011` PDF upload/page extraction;
- `LES-A-012` mixed PDF/image selected order;
- `LES-A-013` single Stage10 pipeline reuse;
- `LES-A-014` durable progress/status/error/retry;
- `LES-A-015` history/reopen/archive;
- `CONTENT-013-002` media-ready is not Lesson publication; Draft→Review→Published is explicit.

### Stage13E Admin AI Operations / Review

Verified rows remain:

- `LES-A-035` background AI jobs visible;
- `LES-A-036` cancel generation task;
- `LES-A-037` retry failed generation;
- `AIRULE-025` human edit before terminal review;
- `AI-OPS-012` cancel;
- `AI-OPS-013` retry;
- `AI-OPS-014` server-derived progress/status;
- `AI-OPS-015` safe telemetry where available;
- `AI-OPS-017` complete Admin AI operations/review surface without a second queue.

Stage13E approval remains review approval only, not Question Bank publication.

## Stage13F Question Bank / Quiz Builder — VERIFIED CORE BOUNDARY

Verified Stage13F flow:

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

### `AI-011-005`

**VERIFIED** — reviewed `direct` output now persists safely in canonical Question Bank and direct delivery snapshots. Student direct-answer interaction is intentionally Stage15, not part of the Stage13F authoring boundary.

### Lesson-generated question authoring rows

| Capability | State | Evidence / remaining boundary |
|---|---|---|
| `LES-A-022` generate interactive questions | **FOUNDATION VERIFIED** | Stage11 typed generation + Stage12/13E + Stage13F import exist, but complete Lesson authoring trigger UX is later Admin/AI authoring work |
| `LES-A-023` MCQ type | **VERIFIED** | Stage11 validation + Question Bank manual/AI persistence + Quiz snapshots |
| `LES-A-024` True/False type | **VERIFIED** | typed validation + Question Bank + snapshots |
| `LES-A-025` mixed question types | **FOUNDATION VERIFIED** | Stage11 count/type contract exists; no complete current Lesson generation trigger UX |
| `LES-A-026` source-image question extraction | **FOUNDATION VERIFIED** | Stage11 exact extraction/source evidence + Stage13E review + Stage13F import; initiating Admin authoring flow remains open |
| `LES-A-027` replica/exact generation | **FOUNDATION VERIFIED** | exactness/uncertainty contracts verified; full Admin authoring orchestration remains open |
| `LES-A-028` comprehensive generation | **FOUNDATION VERIFIED** | contract/runtime foundation exists; complete authoring orchestration remains open |
| `LES-A-031` edit generated question | **VERIFIED** | AI-imported Question Bank item can be edited as a new immutable revision then reviewed/published |
| `LES-A-032` delete generated question | **NOT YET VERIFIED** | non-destructive archive/removal product outcome is not complete as a dedicated Question Bank action |
| `LES-A-033` add/manual question | **VERIFIED** | dedicated Question Bank manual editor + lifecycle |
| `LES-A-034` bulk generate selected lessons | **NOT YET VERIFIED** | Stage13G/AI authoring |

No summary-authoring rows are closed merely by Question Bank work.

## Admin Quiz Parity (`QADMIN-001..033`)

Stage13F deliberately does not mark the whole group green. Exact mapping:

| ID | State | Current rebuilt outcome / next boundary |
|---|---|---|
| `QADMIN-001` List quizzes | **VERIFIED** | server pagination/filter/search + Admin list |
| `QADMIN-002` Create quiz | **VERIFIED** | dedicated Quiz Builder |
| `QADMIN-003` Edit quiz title/metadata | **FOUNDATION VERIFIED** | typed API client exists; complete current Admin edit-metadata UX not closed |
| `QADMIN-004` Delete quiz | **FOUNDATION VERIFIED** | explicit archive exists; final delete/archive product semantics remain to be reconciled with legacy wording |
| `QADMIN-005` Select class/subject | **VERIFIED** | canonical offering scope |
| `QADMIN-006` Select one/multiple lessons | **VERIFIED** | normalized `quiz_lessons` + Admin multi-select |
| `QADMIN-007` Build quiz from lesson summary/text | **NOT YET VERIFIED** | Stage13G/AI authoring trigger |
| `QADMIN-008` Generate MCQ count | **FOUNDATION VERIFIED** | Stage11 strict count rules; no complete Quiz Builder generation trigger |
| `QADMIN-009` Generate True/False count | **FOUNDATION VERIFIED** | Stage11 strict count rules; trigger open |
| `QADMIN-010` Mixed counts | **FOUNDATION VERIFIED** | Stage11 contract; trigger open |
| `QADMIN-011` Generate from images | **FOUNDATION VERIFIED** | source/media/AI contracts exist; Builder trigger open |
| `QADMIN-012` Exact exam-paper extraction | **FOUNDATION VERIFIED** | exact extraction + review + import authority exists; full Builder user flow open |
| `QADMIN-013` Multiple quiz versions | **VERIFIED** | stable `quiz_versions` + Admin models |
| `QADMIN-014` Per-version lesson/source selection | **NOT YET VERIFIED** | current versions inherit quiz scope; explicit per-version sources not implemented |
| `QADMIN-015` Per-version question count/settings | **FOUNDATION VERIFIED** | version label/shuffle + explicit question selection exist; typed generation counts/settings UI open |
| `QADMIN-016` Generate one version | **NOT YET VERIFIED** | Stage13G/AI authoring |
| `QADMIN-017` Generate all versions | **NOT YET VERIFIED** | bounded durable orchestration remains later work |
| `QADMIN-018` Add/remove version | **VERIFIED** | stable version IDs, Draft-only add/remove |
| `QADMIN-019` Edit generated question | **VERIFIED** | edit AI-imported Question Bank item as replacement revision; published quiz snapshots remain immutable |
| `QADMIN-020` Add manual question | **VERIFIED** | Question Bank manual authoring then publish/select |
| `QADMIN-021` Remove question | **VERIFIED** | Draft version question selection can be replaced/unchecked; Published snapshot immutable |
| `QADMIN-022` Regenerate one question | **FOUNDATION VERIFIED** | safe same-item apply path is VERIFIED, but creating the Stage12 regeneration job from a one-click Builder authoring action remains open |
| `QADMIN-023` Preserve explanation/method/source/page | **VERIFIED** | canonical Question Bank + delivery snapshot provenance |
| `QADMIN-024` Export quiz to Excel | **VERIFIED** | exact-version UTF-8 BOM CSV with safe escaping and provenance |
| `QADMIN-025` Export quiz to PDF | **FOUNDATION VERIFIED** | safe RTL print template + browser Save as PDF; no server-generated binary PDF acceptance claimed |
| `QADMIN-026` Export selected versions | **FOUNDATION VERIFIED** | exact single-version scope is explicit; multi-selection batch export remains open |
| `QADMIN-027` PDF questions + all options | **FOUNDATION VERIFIED** | print/PDF template contains questions/options; binary-PDF-specific acceptance not claimed |
| `QADMIN-028` PDF questions only | **NOT YET VERIFIED** | specialized variant open |
| `QADMIN-029` PDF questions + correct answers | **FOUNDATION VERIFIED** | full template includes answers but dedicated variant open |
| `QADMIN-030` PDF answers + explanations | **FOUNDATION VERIFIED** | full template includes both; dedicated variant open |
| `QADMIN-031` PDF answer key only | **NOT YET VERIFIED** | specialized variant open |
| `QADMIN-032` PDF lesson images only | **NOT YET VERIFIED** | specialized variant open; must not silently truncate images |
| `QADMIN-033` PDF lesson names only | **NOT YET VERIFIED** | specialized source-metadata variant open |

The remaining rows are carried to Stage13G/AI authoring or later reporting/export work. None are removed.

## Stage13F Security / Integrity Coverage

Verified:

- Admin-only API + Origin protection for unsafe requests;
- PostgreSQL lifecycle/shape/idempotency guards;
- no raw provider response/credentials in Question Bank browser contracts;
- no Stage13E approve → auto-publish;
- no mutation of published bank revisions or published quiz snapshots;
- concurrent AI import convergence;
- stable regenerate-one identity + replay;
- Draft export rejected;
- real session expiry and mobile responsive browser behavior.

## Student Coverage Status

Track B separately verifies Student Product. Its current status records:

- activation/login/recovery/device foundation verified;
- Access/entitled Curriculum/protected Reader verified;
- final Stage14 shell/copy/a11y closure active;
- Stage15 Practice/Test/Models must wait until Track B incorporates the promoted Stage13F `main` checkpoint;
- Stage16 offline, Stage17 personal data, Stage18 notifications and Stage19 progress remain later work.

## AI Capability Boundary Still Open

`AI-012-019`: live provider/model benchmark/routes/credentials/bootstrap = **NOT YET VERIFIED**. Provider-neutral prompts/rules and durable execution do not prove production provider readiness.

## Final Release Gate

For every legacy row release must answer:

1. Where is it in the new product?
2. What changed and why?
3. Which Product/Architecture Decision supports it?
4. Which executable test proves the outcome?
5. If removed, where is Product Owner approval?

Anything without these answers remains `NOT YET VERIFIED` and cannot be silently treated as complete.