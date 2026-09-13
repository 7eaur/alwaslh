# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains in Git history, merged PRs and specialized workstream documents.

Last consolidated: **2026-09-13 — Student Library + Content Rebuild BATCH-001 checkpoint**.

## 1. Stable product / architecture authority

الوسيلة الذكية منصة تعليمية عربية تتكون من:

- Student Web/PWA;
- Super Admin Web;
- Fastify API;
- PostgreSQL;
- content/media/OCR/AI/question-bank/assessment/offline authorities.

Core boundaries remain:

- `apps/student-web` — Student Web/PWA;
- `apps/admin-web` — Super Admin boundary;
- `apps/api` — authoritative Fastify API;
- `database/migrations` — PostgreSQL schema/integrity authority;
- `packages/brand` — canonical brand/tokens;
- `packages/ui` — shared presentation primitives.

Stable contracts:

- API + PostgreSQL own canonical business state;
- browser is not canonical durable business authority;
- Auth/Authz/Entitlements remain server-owned;
- Full Code = 6 digits; Class Code = 7 digits;
- `media ready != published`;
- AI output never auto-publishes Student content/questions;
- protected Reader/media remains server-authorized;
- Question Bank publication + immutable Quiz version remain Student delivery authority;
- Assessment scoring/finalization/history remain server-owned;
- `/v1` is never Service Worker Cache authority;
- offline signing/integrity/device/session rules remain unchanged;
- no password/session token/device private key is persisted as offline learning data.

Student remains an installed educational application, Arabic/RTL-first, learner-facing, clear, responsive, accessible and visually comfortable. Admin remains a separate product workstream.

## 2. Binding Student product decisions retained

Key accepted decisions remain in force, including:

- preserve valid behavior/contracts rather than legacy visual debt;
- Student primary navigation is `الرئيسية / التعلّم / التدريب / مكتبتي`;
- `مكتبتي` owns learner personal/offline collections;
- Student copy does not expose implementation/security/storage/stage jargon;
- one Student shell owns global chrome;
- browser tests assert user outcomes, not obsolete copy/selectors;
- backend errors map to learner explanation + next action;
- invalid/offline/expired/unavailable/storage are first-class states;
- motion is restrained and respects reduced motion;
- future Student surfaces may exist before backend integration only as honest zero-data surfaces;
- no fabricated notes/counts/progress/scores/statistics/achievements/rankings/streaks/recommendations;
- destination-level code splitting protects initial bundle size;
- clickable elements must look clickable and interactive touch targets remain >=44px;
- Library overview is summary-first and does not duplicate navigation;
- Library statistics are informational; only real connected values are shown.

Canonical Student product documents:

- `docs/product/STUDENT_PRODUCT_ARCHITECTURE.md`
- `docs/product/STUDENT_FUTURE_SURFACES_SPEC.md`
- `docs/product/STUDENT_LIBRARY_OVERVIEW_REDESIGN.md`

## 3. Verified merged Student baseline retained

### PR #53 — Student Experience Rebuild

- MERGED / VERIFIED;
- accepted head `4c94063c5f09934353f5dbe1e2bb9509286e2812`;
- exact-head matrix 23/23 SUCCESS;
- merge commit `d8ccb0b7ba004618cbcbdd96937d5cded47161dc`.

### PR #54 — Future Student Surfaces

- MERGED / VERIFIED;
- accepted head `4b6f24c5cb9bd0da525ecfebc59b1ebbf156c903`;
- exact-head matrix 23/23 SUCCESS;
- merge commit `c3734366c132ea3919a925bdd0dd37cfd5d82104`;
- phone/desktop Visual QA accepted.

Feature-level lazy loading reduced initial Student JS from approximately `599.61 KB / 148.83 KB gzip` to `225.89 KB / 71.24 KB gzip`.

## 4. Student Library workstream checkpoint

The approved Library redesign removes duplicated destination navigation and uses:

1. concise Library heading;
2. one honest summary/statistics region;
3. one destination grid;
4. one explicit return-to-Library action in child sections.

Collections: Downloads / Notes / Saved / Needs Review.

Only Downloads currently reads a real authoritative local offline-package count; Stage17-owned collections remain honest zero states until their repositories exist.

Implementation-level verification recorded:

- lint — SUCCESS;
- strict typecheck — SUCCESS;
- unit tests — 11 files / 41 tests SUCCESS;
- production build — SUCCESS.

Earlier exact-head `aca9a2f72ecede120d1d87889f9a3fb0660ea712` produced 20/23 workflows SUCCESS because a stale B02 browser expectation still asserted the removed Library heading. That expectation was aligned with the approved redesign without relaxing navigation/focus/history/offline/no-overflow acceptance. Live GitHub refs/CI outrank this historical checkpoint.

Normal Student roadmap return remains:
`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17 → Stage18 → Stage19`.

## 5. Content Rebuild execution — BATCH-001

Content Rebuild is an independent parallel workstream. Canonical execution documents live on `7eaur/alwaslh-go` branch `content/legacy-staging-rebuild`:

- `content-staging/CONTENT_REBUILD_EXECUTION_STATUS.md`
- `content-staging/CONTENT_REBUILD_HANDOFF.md`

Fixed rules:

- RAW immutable;
- provenance and SHA-256 preserved;
- no automatic page-title-to-Lesson assumption;
- no `69 -> 62` heuristic as curriculum truth;
- no anomaly deletion for cosmetic counts;
- no AI/legacy auto-publication;
- DB mutation fails closed on identity/count/provenance drift.

### BATCH-001 identity

`BATCH-001-G9-EN-PB3-U1`

Scope: Grade 9 / English / Pupil Book 3 / `Unit 1 - Revision`.

Reviewed boundaries:

- `Presents from London` — page 1 — 4 questions;
- `What's my job?` — page 2 — 4 questions;
- `The holidays` — page 3 — 3 questions;
- `A postcard from London` — page 4 — 2 questions.

This boundary is batch-specific and is not a global one-page-equals-one-lesson rule.

### Completed pre-commit gates

- 13 questions semantically reviewed: 6 unchanged / 7 corrected / 0 rejected;
- duplicate-safe target dry-run established exact intended direct effect: `1 section + 4 lesson updates + 7 question corrections = 12 business-row mutations`;
- no lesson/media/question identity duplication planned;
- publication mutation expected: 0;
- unrelated mutation expected: 0;
- controlled rollback transaction verified live before commit.

Media evidence:

- RAW JPEG total: `440,502` bytes;
- existing display WebP total: `549,794` bytes;
- WebP delta: `+24.81%`;
- therefore the current WebP profile was not accepted as optimization success and no BATCH-001 media rewrite was allowed.

Key prior commits:

- rollback/runtime source-identity fix: `3cd817414275aa31bcd67e7015ce48740409a43c`;
- SQL parity fix: `c8c15e1d04b7bb353f6ee0755beec7b33c66a7c2`;
- modern target dry-run: `557527bf59c71fdeb05c095bda1b4dedc94f8ea2`;
- duplicate-safe batch contract: `e008731860612a58d7e3b4a29ec97222ceb62305`;
- semantic review: `eae7b9d8b3b61b20f4ca74cb75f222aa5b6f9e60`;
- DB/media validation: `e90891c6395813609d0f0cefe726c1cc3d4ac893`.

### Concurrent advancement detected safely

This execution added a bounded apply executor at commit:
`cebde403957b5932d4dd123784a6684e1be77bd3`.

Railway apply deployment:
`90867b02-30af-4886-9dbf-b26f0c1d8281`.

The executor failed closed **before mutation** because the first canonical lesson no longer matched its expected legacy slug. The guard was not bypassed.

A read-only state inspector was added at:
`d0a7efff94683d5647c81b0589c6b2bfab822fa6`.

Verified Railway deployment:
`bb20e38e-4167-4706-9e0d-b3e514206704` — SUCCESS.

It established that another concurrent execution had already advanced PostgreSQL to the exact intended BATCH-001 target state. No duplicate apply was performed after detecting this.

Observed committed state:

- target curriculum section: exactly 1;
- section ID: `1b4a98df-014d-4815-b496-46891df3f3f7`;
- reused lessons: 4;
- lesson assets: 4, still draft;
- media assets: 4, ready;
- question revisions: 13 = 7 corrected + 6 unchanged;
- published lessons/assets/questions: 0/0/0.

Exact lesson IDs remained:

- `767ec1b0-1447-4cb6-824f-4a544d709837`;
- `2959accf-c984-44f1-9959-c3d1507c8ce7`;
- `bb066699-f2ba-4b7e-bcdb-d6b313cdbc84`;
- `df8d57bd-ff0c-4303-abe1-83874838bc88`.

### Final post-apply verification — PASS

Read-only verifier commit:
`1fdbb809da5030ce32a283c3765f90847d76ba0b`.

Railway deployment:
`c3e609b3-f632-46e9-9fde-680330512eee` — SUCCESS.

Required marker observed:
`BATCH001_POST_APPLY_VERIFY_PASS`.

Verified counts/invariants:

- lessons: 4;
- lesson assets: 4;
- media assets: 4;
- question revisions: 13;
- question source/provenance links: 13/13;
- corrected: 7;
- unchanged: 6;
- duplicate target lesson slugs: 0;
- display variants: 4;
- display WebP total unchanged: `549,794` bytes;
- all media variant rows for those four media: 16;
- published lessons: 0;
- published lesson assets: 0;
- published questions: 0.

Canonical source paths/checksums resolve uniquely and every reviewed question remains tied to the matching canonical source asset/checksum.

Mutation attribution for this execution:

- explicit apply executor committed writes: 0 because it failed closed before mutation;
- target state was detected already committed via concurrent advancement;
- duplicate re-apply after detection: 0;
- RAW/media mutations: 0;
- publication mutations: 0.

### BATCH-001 status

`CLOSED / COMMITTED_STATE_VERIFIED`.

The content remains intentionally unpublished. Closing BATCH-001 is not a publication event.

Next Content Rebuild item is `STRUCTURE-001`, followed by:
`STRUCTURE-002 → CURATION-001 → CURATION-002 → CONTENT-GAPS-001 → MEDIA-001 → IMPORT-001 → VERIFY-001 → ROADMAP-RETURN`.

Do not restart BATCH-001 unless new verified drift invalidates this checkpoint.

## 6. Open / deferred product work

### Student Stage16+

True cold-start offline Reader / remaining Stage16 authority remains open, followed by Stage17 Notes/Saved/Needs Review authority, Stage18 Notifications authority, and Stage19 trusted Progress/Statistics/Achievements.

### Admin

Super Admin redesign remains owned by its dedicated workstream. Do not conflate it with Student or Content Rebuild.

## 7. Documentation precedence

For Student continuation:

1. `PROJECT_HANDOFF.md`
2. `PROJECT_STATUS.md`
3. `PROJECT_ENGINEERING_LOG.md`
4. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`
5. `docs/product/STUDENT_PRODUCT_ARCHITECTURE.md`
6. `docs/product/STUDENT_FUTURE_SURFACES_SPEC.md`
7. `docs/product/STUDENT_LIBRARY_OVERVIEW_REDESIGN.md`

For Content Rebuild, additionally read the live work-branch copies of:

1. `content-staging/CONTENT_REBUILD_EXECUTION_STATUS.md`
2. `content-staging/CONTENT_REBUILD_HANDOFF.md`

Then live-check both repository heads before editing. Anything uninspected remains `NOT YET VERIFIED`.
