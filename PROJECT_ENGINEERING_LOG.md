# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains in Git history, merged PRs and specialized workstream documents.

Last consolidated: **2026-09-13 — Content Rebuild through ROADMAP-RETURN; Student resumed at STUDENT-016I / PR #57**.

## 1. Stable product / architecture authority

الوسيلة الذكية منصة تعليمية عربية تتكون من Student Web/PWA، Super Admin Web، Fastify API، PostgreSQL، وسلطات content/media/OCR/AI/question-bank/assessment/offline.

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

## 2. Binding Student product decisions retained

- final primary navigation: `الرئيسية / التعلّم / التدريب / مكتبتي`;
- `مكتبتي` owns learner personal/offline collections;
- learner copy must not expose implementation/security/storage/stage jargon;
- one Student shell owns global chrome;
- browser tests assert user outcomes, not obsolete copy/selectors;
- future surfaces may exist before backend integration only as honest zero-data surfaces;
- no fabricated notes/counts/progress/scores/statistics/achievements/rankings/streaks/recommendations;
- destination-level code splitting protects initial bundle size;
- clickable elements must look clickable, static must look static, touch targets remain >=44px;
- Library overview is summary-first and does not duplicate navigation.

Canonical Student product documents:

- `docs/product/STUDENT_PRODUCT_ARCHITECTURE.md`
- `docs/product/STUDENT_FUTURE_SURFACES_SPEC.md`
- `docs/product/STUDENT_LIBRARY_OVERVIEW_REDESIGN.md`

## 3. Verified merged Student baseline

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

### PR #55 — Library Overview Refinement

- MERGED;
- accepted head `8ceb4d5a5f70f7896f6cb358e05605479942d442`;
- merge commit `343ff1fd7b3d64d7e990b72606695365f520fa58`.

Feature-level lazy loading retained the accepted initial Student JS reduction from approximately `599.61 KB / 148.83 KB gzip` to `225.89 KB / 71.24 KB gzip`.

## 4. Active Student Stage16 checkpoint — STUDENT-016I

ROADMAP-RETURN live reconciliation found that concurrent Student execution had already progressed beyond the stale PR #55 prose.

Active PR:

- PR #57 — `feat(student): close cold-start offline Reader gap`;
- branch `stage16/student-016i`;
- exact head observed `4624dcc824555c1d29e9d697a7474bf76223468b`;
- base when opened `343ff1fd7b3d64d7e990b72606695365f520fa58`.

Scope remains limited to true cold-start offline Reader for previously saved, still-authorized lessons after browser/app restart with network unavailable, using durable non-secret scope recovery plus the existing signed package/blob integrity authority.

Security constraints retained:

- no synthetic server session;
- no `/v1` cache authority;
- no persisted password/session token/device private key;
- explicit online denial remains server-authoritative;
- signature/checksum/profile-device/time/authorization failures remain fail-closed.

Observed exact-head CI state for `4624dcc...` is **NOT GREEN**. At least `Stage 8 · Student activation browser E2E` is failing. Do not merge until the live exact-head matrix, especially Stage16 real Chromium acceptance, is green.

Next roadmap after this PR remains:

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17 → Stage18 → Stage19`.

## 5. Content Rebuild execution — queue closed through ROADMAP-RETURN

Canonical execution documents live on `7eaur/alwaslh-go@content/legacy-staging-rebuild`:

- `content-staging/CONTENT_REBUILD_EXECUTION_STATUS.md`
- `content-staging/CONTENT_REBUILD_HANDOFF.md`

Fixed rules remain:

- RAW immutable;
- provenance and SHA-256 preserved;
- no automatic page-title-to-Lesson assumption;
- no `69 -> 62` heuristic as curriculum truth;
- no anomaly deletion for cosmetic counts;
- no AI/legacy auto-publication;
- DB mutation fails closed on identity/count/provenance drift;
- media derivatives accepted only with measured byte/quality evidence.

Completed sequence:

- `BATCH-001 = DONE / COMMITTED_STATE_VERIFIED`
- `STRUCTURE-001 = DONE / SECTION_BOUNDARY_VERIFIED`
- `STRUCTURE-002 = DONE / SECTION_BOUNDARY_VERIFIED`
- `CURATION-001 = DONE / LESSON_BOUNDARY_VERIFIED`
- `CURATION-002 = DONE / LESSON_BOUNDARY_VERIFIED`
- `CONTENT-GAPS-001 = DONE / GAP_INVENTORY_VERIFIED`
- `MEDIA-001 = DONE / MEDIA_PROFILE_VERIFIED_PARTIAL_ACCEPTANCE`
- `IMPORT-001 = DONE / COMMITTED_STATE_VERIFIED`
- `VERIFY-001 = DONE / DELIVERY_ISOLATION_AND_PROVENANCE_VERIFIED`
- `ROADMAP-RETURN = DONE / STUDENT-016I_HANDOFF_VERIFIED`

### Retained content truth

Grade 9 English:

- 69 RAW pages/images;
- 104 legacy questions;
- 8 recovered sections;
- reviewed Lesson-boundary coverage 10 pages;
- unresolved boundary candidates 59 pages;
- manifest-only page 70 remains evidence-only;
- 0 Grade 9 English duplicate page-number anomalies;
- 6 corpus-wide duplicate-position anomalies preserved;
- historical 62 Draft lessons remain reconciliation evidence only, not curriculum truth.

### CURATION-001 imported/verified slice

- Unit 2 lesson `Describing people and animals`;
- book pages `5..8`, source pages `9..12`;
- exact Section ID `434f9978-efae-471e-b37d-6b151edecc5b`;
- exact Lesson ID `1a6e3a6e-06e8-496e-8d18-c8d4545d1da9`;
- 4 exact Lesson Assets;
- 4 ready Media Assets with exact source path/checksum provenance;
- 12 legacy Question Revisions preserved unpublished;
- target Lesson/assets remain unpublished;
- Student Reader eligible lesson rows 0;
- Student Reader publication-guard eligible asset rows 0;
- no publication/RAW/media-binary/question mutation during VERIFY-001.

VERIFY-001 evidence:

- verifier commit `12fb1a5268e97f0a0d70eee4d33322c139e3deb5`;
- Railway deployment `e5e8fef8-f8e7-467e-b3d8-60529c1a652a`;
- marker `VERIFY001_PASS`.

ROADMAP-RETURN then performed documentation/execution reconciliation only. It did not mutate Content Rebuild business data and did not authorize publication.

## 6. Open / deferred product work

### Student Stage16+

`STUDENT-016I` is active in PR #57. After it: reconnect revalidation/purge (`016R`), revision/tombstone/cursor/delta sync (`016S`), conditional bounded outbox (`016O`), Stage16 closure (`016G`), then Stage17–19 authoritative integrations.

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

For Content Rebuild, additionally read the live work-branch copies of the execution status and handoff, then live-check both repository heads before editing.
