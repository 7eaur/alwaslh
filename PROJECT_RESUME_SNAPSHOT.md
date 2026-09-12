# PROJECT RESUME SNAPSHOT — الوسيلة الذكية

> Replacement-conversation checkpoint. GitHub/code/CI/live Railway evidence outrank this file. Anything not inspected/executed = `NOT YET VERIFIED`.

Last synchronized: **2026-09-12**.

## Resume identity

- Repo: `7eaur/alwaslh`
- Canonical baseline: **live `main`**
- Ledger: GitHub Issue #16
- Active stage: **Stage16 Offline/PWA**
- Detailed handoff: `docs/workstreams/STAGE16_STUDENT_HANDOFF.md`
- Deployment state: Railway inspection/dev stack LIVE; final Stage28 cutover NOT declared.
- Content state: Grade 9 English proof imported as Draft; full canonical source bytes not loaded.

## Current integration truth

PR #33 merged Stage13G + current Student Product into `main`.

- PR head: `dcdae7579a40878c71f64593280a0df2f8363ee2`
- matrix: **19/19 workflows SUCCESS**
- merge commit: `5e22c3ff157b42b6da47febe205dd91fcb264eed`
- before this documentation sync, `main`: `8006a7c4b2fa66bcac9cfb3addcd52fa831c42df`

Do not resume from the old long-lived Track branches. Start from live `main` and create a short-lived branch.

## Stage state

- Stage1–10 + OCR — VERIFIED.
- Stage11 — VERIFIED.
- Stage12 — VERIFIED backend/runtime; `AI-012..AI-019` live provider readiness OPEN.
- Stage13A–G — CLOSED / VERIFIED / integrated.
- Stage14 — CLOSED / VERIFIED.
- Stage15 — CLOSED / VERIFIED.
- **Stage16 — ACTIVE / NOT CLOSED.**
- Stage17+ — pending Stage16 closure.

## Stage16 verified now

- safe PWA shell; `/v1` excluded from SW cache;
- server-issued bounded lease;
- exact profile/device IndexedDB scope lifecycle;
- protected lesson manifest/assets;
- Published + entitled issuance only;
- numeric content revision;
- exact byte-size + SHA-256 validation;
- 64 MiB lesson / 256 MiB scope budgets;
- atomic package commit/replacement/removal;
- ES256 server-signed canonical authorization envelope;
- client key-ID + signature + canonical signed payload + manifest equality verification before storing;
- real Chromium rejection of tampered manifest and tampered bytes.

Evidence:

- Stage16 run on PR #33 head: `34560999667` — SUCCESS for all Stage16 jobs.
- wider PR #33 matrix: 19/19 SUCCESS.

## Stage16 exact remaining work

1. durable non-secret active scope; current scope lives in `sessionStorage` and does not survive true browser restart;
2. re-verify stored authorization envelope at offline use time;
3. derive trusted metadata from signed payload and reject stored-field mismatch;
4. SHA-256 stored blobs at offline read/use time against signed checksums;
5. true cold-start offline library/Reader;
6. real Chromium restart + network-off + tamper/expiry/clock-rollback/account-isolation acceptance;
7. reconnect session/device/entitlement/publication/revision revalidation + purge/disable;
8. authoritative revision writers + tombstones + bounded server cursor/delta + client apply;
9. bounded outbox only for later product-authorized offline writes;
10. Stage16 exact-head closure matrix and documentation.

Do not start Stage17 before these are closed with evidence.

## Railway state

Public surfaces:

- Student: `https://alwaslh-dev-student-7eaur-production.up.railway.app`
- Admin: `https://alwaslh-dev-admin-7eaur-production.up.railway.app`
- API: `https://alwaslh-dev-api-7eaur-production.up.railway.app`

Latest known service state:

- API deployment `5b889f87-24a5-4fc4-b061-9aeea3f5bea6` SUCCESS; `/ready` 200.
- Admin SUCCESS.
- Student SUCCESS.
- PostgreSQL SUCCESS.

API uses repo-root Dockerfile build, pre-deploy migrations and persistent media volume. Read `docs/operations/RAILWAY_LIVE_STATE.md` before deployment changes.

## Content state

Canonical source:

`7eaur/alwaslh-go@f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`

Stage9 inventory: 48 documents / 5,552 images.

Grade 9 English live proof:

- 75 source images / 8,390,689 bytes;
- 75 ready media assets;
- 300 variants;
- 75 Draft lesson assets;
- 10 lessons;
- not Student-visible yet;
- no automatic AI question generation/publication.

Next content action: human Admin review + publish approved sample + Student Reader smoke. Do not bulk materialize all source content until mapping and media capacity are checked.

Supabase legacy import is out of current scope.

## Current security findings

- `STUDENT-016-OFFLINE-AUTH-009` — PARTIAL FIX: signature at issuance/download verified; read-time/cold-start authority OPEN.
- `STUDENT-016-REVOCATION-007` — OPEN.
- `STUDENT-016-SYNC-001` — OPEN.
- `STUDENT-016-OUTBOX-008` — OPEN.
- `AI-012..AI-019` — OPEN / `NOT YET VERIFIED`.

## Mandatory startup order

1. `README.md`
2. `DOCUMENTATION_INDEX.md`
3. `PROJECT_HANDOFF.md`
4. `PROJECT_STATUS.md`
5. `PROJECT_RESUME_SNAPSHOT.md`
6. `PROJECT_ENGINEERING_LOG.md`
7. `PROJECT_INTEGRATION_CONTINUITY.md`
8. `PROJECT_EXECUTION_QUEUE.md`
9. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`
10. `docs/workstreams/STAGE16_STUDENT_HANDOFF.md`
11. `docs/operations/RAILWAY_LIVE_STATE.md`
12. `docs/content/LIVE_CONTENT_IMPORT_STATUS.md`
13. `MASTER_REBUILD_ROADMAP.md`
14. latest Issue #16
15. live `main` + Actions + Railway
16. actual Stage16 source/tests/workflow.

## Exact continuation

Live-check unified state → branch from `main` → durable scope → read-time signed authorization verification → read-time blob hash → cold-start offline Reader → real Chromium offline restart/tamper/expiry evidence → reconnect purge → delta/tombstone/outbox → Stage16 closure → Stage17.

A separate bounded content batch may review/publish Grade 9 English Draft media without changing this Stage16 sequence.
