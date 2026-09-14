# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose.

Last consolidated: **2026-09-14 — Student Experience V2 core implementation verified on exact head `1dd6222...`; documentation/merge closure active**.

## Stable architecture authority

- `apps/student-web` — Student Web/PWA
- `apps/admin-web` — Super Admin boundary
- `apps/api` — authoritative Fastify API
- `database/migrations` — PostgreSQL schema/integrity authority
- API + PostgreSQL own canonical business state
- `media ready != published`
- AI/legacy output never auto-publishes learner content/questions
- RAW/provenance/checksum authority must be preserved
- browser is not canonical durable business authority

## 2026-09-14 — Student Experience V2 verified implementation checkpoint

Active branch:

`ux/student-experience-v2`

PR:

`#58 — refactor(student): establish Student Experience V2 foundation`

Last fully verified implementation head before documentation-only synchronization:

`1dd6222bc21cab615ca9b93416666bfa16d1bf04`

### Product/UX foundation delivered

- four primary phone destinations fixed to Home / Learn / Practice / Library;
- official Student brand in Home App Bar;
- shared App Bar title contract for other destinations/nested subject context;
- Home rebuilt as authoritative overview rather than duplicate navigation;
- Library rebuilt as direct access rather than article/dashboard;
- scalable Learn hierarchy with adaptive search + accordion units/sections;
- focused Reader and focused Assessment flows;
- no fabricated learner name, permanent grade identity, progress, streak, rank or library counts;
- real quiz versions presented as learner-facing Models without inventing new backend authority.

### Frontend architecture delivered

Direction:

`app → features → shared`

Implemented boundaries include:

- `app/layout/*` for App Shell / App Bar / Bottom Nav / Desktop Nav;
- `app/routing/*` + `app/session/*` for app composition;
- `shared/ui/*` for reusable presentation primitives;
- `shared/icons/*` + `shared/brand/*` for canonical visual boundaries;
- `shared/data/student-runtime-cache.ts` for profile-scoped read-through caching;
- `features/auth/*`, `features/home/*`, `features/learn/*`, `features/reader/*`, `features/practice/*`, `features/library/*`, `features/account/*`, `features/notifications/*`, `features/progress/*` for feature ownership.

Practice was split out of the old root assessment monolith into catalog/detail/attempt feature modules; the replaced `student-assessment.tsx` was removed after executable evidence.

Reader and Downloads now have feature boundaries while security-critical Stage16 storage/materialization implementation remains stable rather than being moved only for folder aesthetics.

### Runtime/cache behavior

- curriculum TTL: 120s;
- quiz catalog TTL: 60s;
- recent attempts TTL: 30s;
- cache profile-scoped;
- duplicate concurrent reads deduplicated;
- access changes invalidate affected read models;
- successful assessment completion invalidates recent attempts;
- logout/session expiry clears active-profile runtime cache;
- Downloads reuses shared curriculum caching rather than issuing an independent catalog path.

Stage16 remains the only lesson-download storage authority.

### Stage16 reconciliation

The cold-start Offline Reader behavior previously isolated in PR #57 was reconciled into V2 without weakening auth/security boundaries:

- durable verified profile/device scope;
- signed/verified stored package semantics;
- integrity/tamper/time/scope checks;
- direct open from Downloads;
- cold-start Reader acceptance;
- no synthetic server session/token/entitlement authority while offline.

### Visual QA

B04 screenshot artifacts were manually inspected.

A real phone issue was found after code-level tests passed: attempt previous/next controls, remaining-question status and finish action compressed/touched each other at 390px.

The layout was repaired with stable grid composition + narrow-screen stacking/full-width finish CTA. A later exact-head B04 artifact was inspected and the overlap was gone in attempt and result views.

### Exact-head evidence

On `1dd6222bc21cab615ca9b93416666bfa16d1bf04`, the following Student workflows completed successfully:

- `UX B01 Shared Frontend Foundation`
- `UX B02 Student Shell and Navigation`
- `UX B03 Student Learning and Reader`
- `UX B04 Student Practice and Assessment`
- `UX B05 Student Downloads and Account`
- `Stage14 Student Product`
- `Stage15 Student Assessment`
- `Stage16 Student PWA`

Stage14 lint/typecheck/unit/build and real Chromium auth/access/curriculum acceptance at 390px passed.

A Stage12 AI-control failure seen on an earlier head was unrelated to Student UI and passed on a later exact-head run without Student business-rule changes.

### Cleanup

Removed after reference/test evidence:

- old root assessment monolith;
- obsolete root compatibility implementations for migrated Student surfaces;
- temporary root icon/runtime-cache wrappers;
- obsolete Library overview stylesheet;
- dead future-surface CSS rules.

Remaining legacy CSS/root internals are not assumed dead; several still support Reader/Downloads/Stage16 contracts and must only be removed with executable evidence.

### Closure status

`STUDENT V2 CORE IMPLEMENTATION = VERIFIED ON 1dd6222...`

PR #58 remains Draft while documentation-only synchronization commits receive their normal exact-head CI. After that, normal protected-branch PR review/merge is the next action; the approved V2 foundation should not be redesigned again without new evidence.

## 2026-09-14 — Reviewed Grade 9 Unit 2 publication

The user explicitly authorized changing only the already-reviewed Grade 9 English Unit 2 Lessons/questions to reviewed/published state so the Lessons can be delivered to students.

### Pre-publication verification

The full Grade 9 English technical import was already complete: `69` RAW-backed pages, `69` RAW images, `104` Question Revisions and `8` recovered Units/Sections.

The publication scope was constrained to:

1. `curated-english9-pb3-u2-describing-people-and-animals` — pages `5..8`, 4 Lesson Assets, 12 reviewed questions.
2. `curated-english9-pb3-u2-time-and-meeting` — pages `9..10`, 2 Lesson Assets, 7 reviewed questions.

A live read-only PostgreSQL inspector resolved all 19 Question Revisions through source provenance. It corrected two stale assumptions from earlier staging work:

- all `19` revisions had exactly one legacy Lesson link at publication time;
- canonical true/false options in PostgreSQL are `['صح','خطأ']`; `Ali weighs 27 kilos.` correctly has option index `1` / answer `خطأ`.

No write was accepted from earlier migration attempts that used stale revision UUIDs or incorrect option representation; those attempts failed closed before mutation.

### Semantic question review

`19` questions were reviewed against the source pages:

- `18` approved unchanged
- `1` corrected before publication

Corrected page-10 item:

- old prompt: `When is Rashid meeting mentioned in the dialogue?`
- reviewed prompt: `When is Fuad helping Dad on Saturday?`
- answer: `at six o'clock`
- reviewed explanation: `Fuad says he is helping Dad at six o'clock.`

The prompt/explanation correction was guarded before publication; the final publisher then re-resolved the question from immutable source provenance rather than stale IDs.

### Delivery semantics verified from live code/schema

Student Reader eligibility requires active class/subject/offering and Lesson/Section, `lessons.published_at`, published Lesson Assets and ready Media Assets. Normal auth/entitlement rules still apply.

Question Bank publication requires review metadata, known answer, publisher metadata and `status='published'`. Published/known revisions linked to Lessons are eligible input for Quiz Builder. Publishing Question Bank revisions does not itself create a standalone student Quiz/version.

### Publication execution

Publisher source commit:

`ea5a19b7086eb8779701be2b1f47fc073b38aa12`

Reviewed correction/final execution head:

`7d17e19bef37835d500de492053e728f0cdb9f1b`

Railway deployment:

`5024b218-32e0-49fe-b9f8-20ee82c5bcd0` — `SUCCESS`

The runner used fail-closed state/provenance checks, review transitions, a rollback gate, controlled apply and post-commit verification.

Final runtime markers:

- `G9_U2_PUBLISH_APPLY_PASS`
- `G9_U2_PUBLISH_FULL_PASS`
- `COMMITTED_STATE_VERIFIED_AND_PUBLISHED`

Post-verify result:

- published Lessons: `2`
- published Lesson Assets: `6`
- published Question Revisions: `19`
- Reader-eligible target assets: `6`
- Quiz-Builder-eligible target questions: `19`
- question ownership: `12` linked to the describing Lesson + `7` linked to the time/meeting Lesson

The Grade 9 English publication totals after the gate are exactly `2 / 6 / 19`, which proves no other imported Grade 9 English Lesson/Asset/Question was published by this run.

Isolation retained:

- RAW mutations `0`
- media-binary mutations `0`
- page 70 fabrication `0`
- unrelated publication `0`
- prohibited `69 -> 62` heuristic not used

The Railway content service was returned to an idle start command after verification so documentation commits cannot replay publication logic.

Canonical report:

`7eaur/alwaslh-go@content/legacy-staging-rebuild/content-staging/GRADE9_UNIT2_REVIEWED_PUBLICATION_REPORT.md`

## 2026-09-13 — Full Grade 9 English bulk import

User priority was switched from scheduled Student-roadmap continuation to the fastest safe complete Grade 9 English import. The hourly automation was disabled before content work continued.

### Source authority

Grade 9 English source scope is the immutable legacy Supabase reconstruction for subject:

`1794eea5-4772-4c94-bd2b-b08e5815e733`

Canonical reconstruction manifest:

`7eaur/alwaslh-go@content/legacy-staging-rebuild/content-staging/curated/grade-9/english/pupil-book-3/reconstruction-candidates.json`

The exact original Grade 9 reference is also available on `alwaslh-go@master` under `تاسع انجليزي/الانجليزي_تاسع`. `master` contains unrelated corpora as well, including Third Secondary/Pupil's Book 6, so the exact path must be resolved before using it as reference evidence.

### Execution

Content source commit:

`9e58ab3e882b883bddd016099949881801eedc28`

Railway deployment:

`de7f9883-b2f0-483d-a7c1-ffbfb15ac30c` — `SUCCESS`

Runtime sequence:

`inspect -> rollback-only transaction gate -> controlled apply -> committed-state verify`

Markers:

- `BULK_G9_EN_INSPECT_PASS`
- `BULK_G9_EN_TRANSACTION_GATE_PASS`
- `BULK_G9_EN_APPLY_PASS`
- `BULK_G9_EN_VERIFY_PASS`
- `BULK_G9_EN_RUNNER_PASS`

Verified imported scope:

- 69 RAW-backed pages
- 69 RAW images / SHA-256 verified
- 69 content source identities
- 69 ready Media Assets
- 69 Lesson Assets
- 8 recovered Units/Sections
- 104 Question Revisions preserved
- page 70 manifest-only/evidence-only

At the bulk checkpoint publication was `0`; only the later reviewed Unit 2 publication gate changed publication state.

The historical live `59` asset-owning Lesson identities were not derived from the prohibited `69 -> 62` heuristic. Modern curation may group multiple source pages under one modern Lesson while preserving provenance.

## Content checkpoints retained

- BATCH-001 — DONE / COMMITTED_STATE_VERIFIED
- STRUCTURE-001 — DONE / SECTION_BOUNDARY_VERIFIED
- STRUCTURE-002 — DONE / SECTION_BOUNDARY_VERIFIED
- CURATION-001 — DONE / COMMITTED_STATE_VERIFIED / PUBLISHED
- CURATION-002 — DONE / COMMITTED_STATE_VERIFIED / PUBLISHED
- CONTENT-GAPS-001 — DONE / GAP_INVENTORY_VERIFIED
- MEDIA-001 — DONE / MEDIA_PROFILE_VERIFIED_PARTIAL_ACCEPTANCE
- IMPORT-001 — DONE / COMMITTED_STATE_VERIFIED
- VERIFY-001 — DONE / DELIVERY_ISOLATION_AND_PROVENANCE_VERIFIED
- ROADMAP-RETURN — DONE / STUDENT-016I_HANDOFF_VERIFIED
- FULL-GRADE9-ENGLISH-BULK-IMPORT — DONE / FULL_ASSET_COVERAGE_VERIFIED
- REVIEWED-UNIT2-PUBLICATION — DONE / COMMITTED_STATE_VERIFIED_AND_PUBLISHED

## Student workstream retained

PR #57 remains a separate Student `STUDENT-016I` workstream, but its required cold-start Offline Reader behavior has been reconciled into PR #58's V2 branch. Re-fetch live PR #57 before deciding whether it should be closed as superseded or contains any remaining unique change.

## Continuation rule

Do not rerun the Grade 9 bulk import or the reviewed Unit 2 publication. The remaining imported Grade 9 English content remains unpublished and must pass evidence-backed pedagogical/question review before any future explicit publication gate.

Never mutate RAW, fabricate page 70, hide anomalies, use `69 -> 62` as curriculum truth, or auto-publish unreviewed legacy/AI content.
