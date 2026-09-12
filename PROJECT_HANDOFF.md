# PROJECT HANDOFF — الوسيلة الذكية

> هذه الوثيقة يجب أن تمكّن أي محادثة هندسية جديدة من استئناف المشروع من GitHub بدون ذاكرة Chat سابقة.

Last synchronized: **2026-09-12 — unified `main`, Stage16 active, Railway inspection/dev live, Grade 9 English proof imported as Draft.**

## 1. Mandatory startup

قبل أي تعديل:

1. Confirm repository `7eaur/alwaslh`.
2. Confirm live `main` HEAD; do **not** assume an old Track branch is newer.
3. Read `README.md` then `DOCUMENTATION_INDEX.md`.
4. Read this file, then:
   - `PROJECT_STATUS.md`
   - `PROJECT_RESUME_SNAPSHOT.md`
   - `PROJECT_ENGINEERING_LOG.md`
   - `PROJECT_INTEGRATION_CONTINUITY.md`
   - `PROJECT_EXECUTION_QUEUE.md`
   - `docs/product/CURRENT_PRODUCT_OVERRIDES.md`
   - `docs/workstreams/STAGE16_STUDENT_HANDOFF.md`
   - `docs/workstreams/STUDENT_PRODUCT_TRACK_STATUS.md`
   - `docs/operations/RAILWAY_LIVE_STATE.md`
   - `docs/content/LIVE_CONTENT_IMPORT_STATUS.md`
   - `MASTER_REBUILD_ROADMAP.md`
5. Read latest GitHub Issue #16 body/comments.
6. Live-check GitHub Actions and Railway status before claiming current health.
7. Inspect actual current-stage source/tests/workflows before editing.

Code/migrations/executable CI/live runtime evidence outrank prose. Anything not inspected/executed = `NOT YET VERIFIED`.

## 2. Current operating model

The old parallel Track A / Track B routing is superseded for new work.

Product Owner direction now is:

- Stage13G + latest Student Product were integrated into `main`;
- the remaining product after Stage13 is owned as one sequential continuation;
- new work starts from **live `main`** on short-lived branches;
- one owner may touch Student/API/Admin/DB as needed, but must preserve layer boundaries and existing authorities;
- old branches `integration/stage13g-admin-product` and `parallel/stage14-student-product` are historical/reference after integration.

Integration evidence:

- PR #33 head: `dcdae7579a40878c71f64593280a0df2f8363ee2`
- PR #33 wider matrix: **19/19 workflows SUCCESS**
- PR #33 merge commit: `5e22c3ff157b42b6da47febe205dd91fcb264eed`
- before this docs sync, live `main`: `8006a7c4b2fa66bcac9cfb3addcd52fa831c42df`

Always live-check `main` after this documentation PR merges.

## 3. Product architecture / durable authorities

Runtime surfaces:

```text
Student Web/PWA ─┐
                 ├── Fastify API ── Railway PostgreSQL
Admin Web ───────┘       │
                         ├── Auth / Device / Session
                         ├── Access / Entitlements
                         ├── Curriculum / Publication
                         ├── Media / OCR
                         ├── AI execution / review
                         ├── Question Bank / Quiz Builder
                         ├── Student Assessment
                         └── Offline/PWA authorization/materialization/sync
```

Stable authority rules:

- Browser does not own canonical durable business state.
- returning Student requires password + bound P-256 device proof.
- Full Code = 6 digits; Class Code = 7 digits.
- Curriculum hierarchy remains Class → Subject Offering → optional Section → Lesson.
- `media ready != published`; Student content requires current publication + entitlement.
- protected Reader/media is server-authorized; raw storage keys never become frontend API.
- AI provider output never auto-publishes questions/content.
- human-reviewed Question Bank published revisions + published Quiz versions are Student delivery authority.
- assessment scoring/finalization/history remain server-owned.
- `/v1` never becomes Service Worker Cache API authority.

## 4. Stage state

| Stage | State |
|---|---|
| Stage1–10 + OCR | VERIFIED |
| Stage11 provider-neutral AI contracts | VERIFIED |
| Stage12 durable AI runtime | VERIFIED backend/runtime; `AI-012..AI-019` live-provider readiness OPEN |
| Stage13A–G | VERIFIED / CLOSED / integrated into `main` |
| Stage14 Student Product | CLOSED / VERIFIED |
| Stage15 Practice / Assessment | CLOSED / VERIFIED |
| **Stage16 Offline / PWA** | **ACTIVE / PARTIALLY VERIFIED** |
| Stage17–25 | pending in sequence |
| Stage26–29 release/ops | pending; hosted inspection stack exists but final cutover not declared |

## 5. Stage16 — current verified implementation

Current integrated code includes:

### Safe PWA

- installable app shell;
- static shell only in SW cache;
- `/v1` excluded;
- no automatic forced `skipWaiting`/reload.

### Offline lease

- server-issued bounded lease;
- valid Student session + device required;
- PostgreSQL/server time;
- max 24h and clipped by session/entitlement expiry;
- client scope keyed by `profileId:deviceId`;
- login/activation/restore refresh;
- exact logout/session-expiry/rebind cleanup;
- backward-clock rejection.

### Protected lesson materialization

- dedicated offline manifest/assets;
- Published + entitled only;
- stable lesson/asset IDs;
- content revision/publication provenance;
- exact byte sizes + SHA-256;
- 64 MiB lesson / 256 MiB account-device budget;
- atomic verified package storage;
- no silent eviction;
- manual removal and scope cleanup.

### ES256 signed authorization

Server:

- `apps/api/src/offline/signing.ts`;
- P-256/ES256 canonical manifest signing;
- key ID = SHA-256 of public SPKI;
- manifest issuance fails closed when production signing key is missing.

Client:

- `apps/student-web/src/offline-authorization.ts`;
- pinned/configured public verification key only;
- key-ID check + WebCrypto ES256 verification;
- canonical signed payload validation;
- outer manifest must equal signed manifest;
- tampered manifest rejected before package storage.

Exact integrated Stage16 evidence:

- PR #33 head `dcdae757...`;
- Stage16 run `34560999667` — app-shell real Chromium + API signing/PostgreSQL contracts + lifecycle/materialization real Chromium all SUCCESS.

## 6. Stage16 — exact remaining blockers

Stage16 is **not closed**.

### P1 — durable cold-start scope

Current active scope discovery in `offline-session.ts` uses `sessionStorage`, so it disappears on a true browser restart. Add a durable **non-secret** selector for profile/device scope only.

### P1 — read-time signed authority

The package stores the signed envelope, but `offlineLessonPackageAllowsUse()` still evaluates mutable stored lease/package fields. Before rendering offline:

- re-verify key ID/signature/canonical signed payload;
- derive trusted metadata from the signed manifest;
- reject any mismatch between stored package and signed fields.

### P1 — read-time blob integrity

Stored blobs are hashed during download. Cold-offline Reader must hash them again at use time and compare to signed checksums/size.

### P1 — true cold-start Reader

Need real acceptance:

`download online → close/restart browser → network unavailable → shell loads → durable scope → signed package verified → blobs verified → Reader renders`.

Also test tamper, expiry, backward clock and account/device isolation.

### P1 — reconnect revalidation/purge

On reconnect revalidate current:

- session/device;
- entitlement;
- publication state;
- content revision.

Disable/purge revoked, expired, unpublished or invalid local content according to the final documented policy.

### P1 — sync/delta/outbox

`content_revisions`, `content_tombstones`, `sync_checkpoints` exist but are not a complete verified authority. Still required:

- authoritative revision writers;
- tombstone semantics;
- bounded server cursor/delta API;
- client delta application + idempotency;
- bounded outbox only for later product-authorized offline writes.

## 7. Railway hosted inspection/dev state

Current public URLs:

- Student: `https://alwaslh-dev-student-7eaur-production.up.railway.app`
- Admin: `https://alwaslh-dev-admin-7eaur-production.up.railway.app`
- API: `https://alwaslh-dev-api-7eaur-production.up.railway.app`

Latest known service state at this sync:

- API — SUCCESS, stable deployment `5b889f87-24a5-4fc4-b061-9aeea3f5bea6`, `/ready` 200;
- Admin — SUCCESS;
- Student — SUCCESS;
- PostgreSQL — SUCCESS.

API deployment contract:

- repository-root Docker build using `apps/api/Dockerfile`;
- pre-deploy `node apps/api/dist/migrate.js`;
- start `node apps/api/dist/server.js`;
- persistent media volume at `/app/runtime-data/media`.

Read `docs/operations/RAILWAY_LIVE_STATE.md` before modifying Railway.

Important: environment is named `production`, but product status is **inspection/dev hosted stack**, not completed Stage28 production cutover.

## 8. Content state

Canonical source currently approved:

`7eaur/alwaslh-go@f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`

Stage9 full source inventory:

- 48 documents;
- 5,552 images.

Live materialization proof completed for Grade 9 English only:

- source document `تاسع انجليزي/الانجليزي_تاسع`;
- 75 source images / 8,390,689 bytes;
- 75 ready media assets;
- 300 variants;
- 75 Draft lesson assets;
- 10 lessons;
- bootstrap deployment `8428981b-aa6d-4927-b1f9-31545265e3f9`;
- stable API restored afterward.

**All imported lesson assets are Draft.** No automatic Student publication occurred.

Old Supabase content/database is out of current scope and was not imported after the Product Owner cancelled that path.

Read `docs/content/LIVE_CONTENT_IMPORT_STATUS.md` before any further content action.

## 9. Questions / AI state

Stage13G G-D feature-specific AI authoring exists and is integrated:

- lesson summary/question generation;
- quiz-version generation;
- question regeneration;
- human AI review;
- Question Bank Draft/Review/Published;
- immutable Quiz Builder snapshots;
- specialized exports.

Safety chain must remain:

`AI output → human AI review → Question Bank Draft → QB review/publish → Quiz immutable version`.

Grade 9 English media bootstrap generated **no questions** automatically.

`AI-012..AI-019` live provider/model/routes/credentials/bootstrap is still `NOT YET VERIFIED`. Do not claim live AI production readiness from fixtures.

## 10. Remaining roadmap after Stage16

Once Stage16 is closed:

1. Stage17 Personal Learning Data — Notes/Favorites/Needs Review + sync rule.
2. Stage18 Notifications — In-App + Web Push where supported, lifecycle/quiet hours/opt-out.
3. Stage19 Progress/Statistics/Achievements — trusted server-derived metrics/private achievements.
4. Stage20 Import/Export/Reporting closure — reuse Stage13G authorities and close remaining gaps.
5. Stage21 Performance Engineering.
6. Stage22 Security Hardening.
7. Stage23 Tests & CI Expansion.
8. Stage24 Accessibility / Device QA.
9. Stage25 Initial Data / Content Load — controlled canonical content completion.
10. Stage26 Staging.
11. Stage27 Release Gate.
12. Stage28 Production Cutover.
13. Stage29 Monitoring & Operations.

## 11. Content work that may proceed without confusing Stage16

The already imported Grade 9 English sample can be reviewed in Admin and published through normal publication authority as a **separate controlled content batch**.

Do not combine full 5,552-image bulk import with the Stage16 cold-offline architecture change.

Before large import:

- validate mappings on more representative subjects;
- calculate storage need versus 500 MB media volume;
- resize/provision storage if necessary;
- import idempotently and review before publication.

## 12. Exact continuation

For the next engineering conversation:

1. live-check `main`, Issue #16, Actions and Railway;
2. create a short-lived branch from `main`;
3. inspect current offline signing/session/content-store/App/E2E code;
4. implement durable non-secret scope;
5. implement read-time signature + signed-field + blob-integrity verification;
6. implement cold-start offline library/Reader;
7. add real Chromium restart/network-off/tamper/expiry/rollback/account isolation evidence;
8. implement reconnect revalidation/purge;
9. wire revision/tombstone/cursor/delta/outbox only from real backend authority;
10. run exact-head Stage16 + wider regressions;
11. synchronize docs + Issue #16 and close Stage16 only with evidence;
12. begin Stage17 only after closure.

Do not restart from an old Track branch and do not re-open Supabase import without a new Product Owner instruction.
