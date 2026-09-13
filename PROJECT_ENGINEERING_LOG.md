# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains in Git history, merged PRs and specialized workstream documents.

Last consolidated: **2026-09-13 — Student Library + Content Rebuild through MEDIA-001**.

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

## 5. Content Rebuild execution

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
- DB mutation fails closed on identity/count/provenance drift;
- media derivatives are accepted only with measured byte/quality evidence, not by file format alone.

### BATCH-001 — CLOSED / COMMITTED_STATE_VERIFIED

Identity: `BATCH-001-G9-EN-PB3-U1`.

Scope: Grade 9 / English / Pupil Book 3 / `Unit 1 - Revision`.

Reviewed boundaries:

- `Presents from London` — page 1 — 4 questions;
- `What's my job?` — page 2 — 4 questions;
- `The holidays` — page 3 — 3 questions;
- `A postcard from London` — page 4 — 2 questions.

This boundary is batch-specific and is not a global one-page-equals-one-lesson rule.

Completed gates:

- 13 questions semantically reviewed: 6 unchanged / 7 corrected / 0 rejected;
- duplicate-safe target dry-run established exact intended direct effect: `1 section + 4 lesson updates + 7 question corrections = 12 business-row mutations`;
- controlled rollback transaction verified live before commit;
- publication mutation expected/observed: 0;
- unrelated mutation expected/observed: 0.

Legacy media evidence for BATCH-001:

- RAW JPEG total: `440,502` bytes;
- existing display WebP total: `549,794` bytes;
- WebP delta: `+24.81%`;
- therefore the existing WebP profile was not accepted as an optimization success.

Key commits:

- rollback/runtime source-identity fix: `3cd817414275aa31bcd67e7015ce48740409a43c`;
- SQL parity fix: `c8c15e1d04b7bb353f6ee0755beec7b33c66a7c2`;
- modern target dry-run: `557527bf59c71fdeb05c095bda1b4dedc94f8ea2`;
- duplicate-safe batch contract: `e008731860612a58d7e3b4a29ec97222ceb62305`;
- semantic review: `eae7b9d8b3b61b20f4ca74cb75f222aa5b6f9e60`;
- DB/media validation: `e90891c6395813609d0f0cefe726c1cc3d4ac893`.

Concurrent advancement was handled safely: the bounded apply executor commit `cebde403957b5932d4dd123784a6684e1be77bd3` failed closed before mutation after detecting live drift. Read-only inspection then established that another concurrent execution had already committed the exact intended state, so no duplicate apply was performed.

Final post-apply verifier:

- commit `1fdbb809da5030ce32a283c3765f90847d76ba0b`;
- Railway deployment `c3e609b3-f632-46e9-9fde-680330512eee` — SUCCESS;
- marker `BATCH001_POST_APPLY_VERIFY_PASS`.

Verified committed state:

- curriculum section: 1;
- reused lessons: 4;
- lesson assets: 4, draft;
- media assets: 4, ready;
- question revisions: 13 = 7 corrected + 6 unchanged;
- question provenance links: 13/13;
- duplicate target lesson slugs: 0;
- published lessons/assets/questions: 0/0/0;
- RAW/media mutation: 0.

The content remains intentionally unpublished.

### STRUCTURE / CURATION checkpoints — DONE

- `STRUCTURE-001`: Unit 2 `Describing: Making plans`, book pages `5..15`, source pages `9..19`, 11 source identities, 30 legacy questions; commit `4ff71ca280c432392c8d91737374c77232b3fe69`.
- `STRUCTURE-002`: Unit 3 `Other countries`, book pages `16..25`, source pages `20..29`, 10 source identities, 3 legacy questions; commit `9e92a4b4d7658f6ea43f1f0727ffb19e922c66cb`.
- `CURATION-001`: Lesson `Describing people and animals`, book pages `5..8`, source pages `9..12`, 4 ordered activities, 12 attached legacy questions; commit `67f630f42913528405246fad7c541b091a47959e`.
- `CURATION-002`: Lesson `Telling time and arranging a meeting`, book pages `9..10`, source pages `13..14`, 2 ordered activities, 7 attached legacy questions; commit `d14774adc68470e9eea48a1c388a14a66111bf57`.

No RAW/DB/publication mutation occurred in these structural/curation steps.

### CONTENT-GAPS-001 — DONE / GAP_INVENTORY_VERIFIED

Evidence commit: `dd86641decbcb3e3345d1aacfea7e2363fc60474`.

Verified Grade 9 English inventory:

- RAW page candidates/images: `69 / 69`;
- legacy questions: `104`;
- recovered sections: `8`;
- reviewed Lesson-boundary coverage: `10` pages;
- unresolved boundary candidates: `59` pages;
- immediate Unit 2 remainder pages `11..15`: 5 pages / 11 questions;
- manifest-only page 70 has no RAW identity and remains evidence-only;
- Grade 9 English duplicate page-number anomalies: 0;
- corpus-wide duplicate-position anomalies remain preserved: 6;
- only 4 modern page mappings are verified by this rebuild track; the other 65 remain `unverified`, not asserted missing.

Historical `62 Draft lessons` is reconciliation evidence only and was not used to derive `69 -> 62`.

### MEDIA-001 — DONE / MEDIA_PROFILE_VERIFIED_PARTIAL_ACCEPTANCE

Scope: smallest already-reviewed media batch, CURATION-001 book pages `5..8` / source pages `9..12`.

Reproducible execution evidence:

- deterministic probe script commit: `2f1849536738e3f877018539a80b73e83a969c3f`;
- workflow commit: `10ce6c2b250de28b5de9389cbcaf9b2e7cddad09`;
- GitHub Actions run `34761171601` — SUCCESS;
- artifact `media-001-evidence`, ID `10318976732`;
- artifact digest `sha256:9702cbac1ed18e1be1809eaf844685b78c24c150958da1781ce0b7f1ad75e91a`;
- decision contract commit `bb3dbbeff5d866930c1921124a8868b79af5703e`;
- contract path `content-staging/curated/grade-9/english/pupil-book-3/media-001-unit2-describing.json`.

Acceptance gate used:

- dimensions must match RAW;
- PSNR >= `32 dB`;
- byte reduction >= `20%`;
- manual contact-sheet legibility review required before acceptance.

Measured aggregate:

- RAW JPEG total: `457,747` bytes;
- WebP q82/method6 total: `464,290` bytes = `+1.43%` larger than RAW, rejected as a profile;
- WebP q76/method6 total: `387,774` bytes = `15.29%` smaller overall, but page-level acceptance remained mandatory.

Page-level decision:

- book page 5 / source page 9: RAW `93,793` -> q76 WebP `74,416` bytes = `20.66%` reduction; PSNR `39.52 dB`; dimensions unchanged `962×1360`; manual side-by-side review confirmed headings, body text, labels and numbers remained readable with no material readability regression. Candidate accepted with SHA-256 `4fdeb9e17a0a269481ee046bcbf67053f834c8e75fdb4d5bda445977b742a5e2`.
- page 6 q76 reduction `15.83%`: rejected; q82 was larger than RAW.
- page 7 q76 reduction `9.61%`: rejected; q82 was larger than RAW.
- page 8 q76 reduction `17.42%`: rejected; q82 reduction only `0.24%`.

Interpretation:

- q76 is not globally approved; only page 5 passed all gates.
- pages 6..8 retain RAW/preferred existing media until a separate candidate passes the same kind of gate.
- accepted page 5 derivative is reproducible from immutable RAW and must fail closed if regeneration does not yield the exact recorded SHA-256.
- no binary media was pushed to production by MEDIA-001.
- RAW mutation: 0;
- PostgreSQL mutation: 0;
- publication mutation: 0;
- unrelated-record mutation: 0.

Next Content Rebuild item is **`IMPORT-001` only**, followed by `VERIFY-001 → ROADMAP-RETURN`.

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
