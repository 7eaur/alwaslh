# PROJECT STATUS — الوسيلة الذكية

> Concise execution truth. Code/migrations/executable CI and live runtime evidence outrank prose. Anything not executed = `NOT YET VERIFIED`.

Last synchronized: **2026-09-12**.

## Active candidate batch — 2026-09-12

`fix/stage16-read-time-authority` from live `main@dee9ebda9c56900421754228ad0db34a4b6a40e7`: STUDENT-016H durable selector + asynchronous read-time ES256/metadata/blob verification + late-refresh/logout guard implemented locally. Student lint/typecheck/build and 34/34 unit tests PASS. Exact-head CI/browser gate pending; **not merged, Stage16 still OPEN**. Full audit remains progressive. See latest batch in `PROJECT_ENGINEERING_LOG.md`.

## Current position

- Repository: `7eaur/alwaslh`.
- Execution ledger: GitHub Issue #16.
- Canonical baseline: **live `main`**.
- Old Track A / Track B long-lived branches are historical after full integration.
- Stage13G + current Student Product integrated through PR #33.
- PR #33 verification head `dcdae7579a40878c71f64593280a0df2f8363ee2`: **19/19 workflows SUCCESS**.
- PR #33 merge commit: `5e22c3ff157b42b6da47febe205dd91fcb264eed`.
- Before this docs sync, live `main`: `8006a7c4b2fa66bcac9cfb3addcd52fa831c42df`.
- Railway inspection/dev stack is live; final Stage28 production cutover is not declared.

## Stage ledger

| Stage | State |
|---|---|
| Stage1–10 + OCR | VERIFIED |
| Stage11 | VERIFIED |
| Stage12 | VERIFIED backend/runtime; `AI-012..AI-019` live provider readiness OPEN |
| Stage13A–G | VERIFIED / CLOSED / integrated into `main` |
| Stage14 Student | CLOSED / VERIFIED |
| Stage15 Practice/Assessment | CLOSED / VERIFIED |
| **Stage16 Offline/PWA** | **ACTIVE / PARTIALLY VERIFIED** |
| Stage17 Personal Learning | BLOCKED BY Stage16 closure |
| Stage18–25 | pending in roadmap order |
| Stage26–29 release/ops | pending; hosted inspection stack exists |

## Stage16 current verified boundary

Integrated code currently verifies:

- safe PWA app shell; `/v1` never cached/intercepted;
- bounded server-issued profile/device lease;
- account/device IndexedDB lifecycle and exact-scope cleanup;
- protected lesson manifest + revision-pinned asset download;
- Published + entitled material only;
- numeric content revision at Student boundary;
- SHA-256 + exact byte-size validation;
- 64 MiB lesson / 256 MiB scope budgets;
- atomic package commit/replacement/removal;
- server-signed P-256/ES256 offline authorization envelope;
- Student-side key-ID/signature/canonical signed-manifest verification before storage;
- signed-manifest tamper rejection and asset-byte tamper rejection in real Chromium.

Exact integrated evidence:

- PR #33 Stage16 workflow `34560999667` — all three Stage16 jobs SUCCESS.
- PR #33 wider matrix — 19/19 workflows SUCCESS.

## Stage16 open P1 boundaries

- `STUDENT-016-OFFLINE-AUTH-009` — **PARTIAL FIX**: signing + download verification done; cold-start/read-time authority still OPEN.
- durable non-secret active scope across real browser restart — OPEN; current selector uses `sessionStorage`.
- read-time re-verification of stored signed authorization — OPEN.
- read-time SHA-256 verification of stored blobs against signed checksums — OPEN.
- true cold-start offline Reader with network unavailable — OPEN.
- `STUDENT-016-REVOCATION-007` reconnect session/device/entitlement/publication/revision revalidation + purge — OPEN.
- `STUDENT-016-SYNC-001` authoritative revision/tombstone/cursor/delta flow — OPEN.
- `STUDENT-016-OUTBOX-008` bounded durable outbox for future authorized offline writes — OPEN.

Detailed source: `docs/workstreams/STAGE16_STUDENT_HANDOFF.md`.

## Railway live inspection/dev state

Current public surfaces:

- Student: `https://alwaslh-dev-student-7eaur-production.up.railway.app`
- Admin: `https://alwaslh-dev-admin-7eaur-production.up.railway.app`
- API: `https://alwaslh-dev-api-7eaur-production.up.railway.app`

Latest known status at this sync:

- API `5b889f87-24a5-4fc4-b061-9aeea3f5bea6` — **SUCCESS**, `/ready` = 200.
- Admin — **SUCCESS**.
- Student — **SUCCESS**.
- PostgreSQL — **SUCCESS**.
- API media volume is mounted persistently at `/app/runtime-data/media`.

Hosting details: `docs/operations/RAILWAY_LIVE_STATE.md`.

The Railway environment is useful for inspection and controlled content proofs, but Stage27/28 final release/cutover remains uncompleted.

## Live content state

Canonical source:

`7eaur/alwaslh-go@f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`

Full Stage9 inventory:

- **48 documents**;
- **5,552 images**.

Live Grade 9 English proof:

- source document: `تاسع انجليزي/الانجليزي_تاسع`;
- source images: **75**;
- source bytes: **8,390,689**;
- ready media assets: **75**;
- variants: **300**;
- lesson assets: **75**;
- lessons: **10**;
- publication state: **Draft only**;
- bootstrap deployment: `8428981b-aa6d-4927-b1f9-31545265e3f9`.

No automatic Student publication and no automatic question generation occurred.

Old Supabase content/database import is out of current scope by Product Owner direction.

Content details: `docs/content/LIVE_CONTENT_IMPORT_STATUS.md`.

## AI / Question Bank status

Stage13G G-D authoring is integrated and verified, including lesson/quiz generation orchestration, question regeneration, reviewed-output application and specialized exports.

Safe chain remains:

`AI output → human AI review → Question Bank Draft → QB Review/Published → immutable Quiz version`.

`AI-012..AI-019` live provider/model/routes/credentials/bootstrap remains `NOT YET VERIFIED` and must not be inferred from test fixtures.

## Exact next work

### Stage16 code closure

1. Durable non-secret active offline scope selector.
2. Re-verify stored signed authorization at use/render time.
3. Re-hash stored blobs against signed checksums at use time.
4. Implement explicit cold-start offline library/Reader.
5. Real Chromium: browser restart + network unavailable + valid render + tamper/expiry/clock rollback/account isolation rejection.
6. Reconnect session/device/entitlement/publication/revision revalidation + purge.
7. Authoritative revision/tombstone/server cursor/delta/client application.
8. Bounded outbox only where later offline writes require it.
9. One exact-head Stage16 closure matrix + docs/Issue #16.
10. Begin Stage17 only after closure.

### Content review batch

Separately from Stage16 architecture:

1. inspect Grade 9 English Draft mapping/order/rendering in Admin;
2. publish only approved lessons/assets through normal Admin publication;
3. smoke-test published content in Student Reader on Railway;
4. only then choose another bounded subject;
5. measure/provision media capacity before attempting the full 5,552-image materialization.

## Later roadmap

After Stage16:

`Stage17 Personal Learning → Stage18 Notifications → Stage19 Progress/Statistics/Achievements → Stage20 Import/Export/Reporting closure → Stage21 Performance → Stage22 Security → Stage23 Tests/CI → Stage24 Accessibility/Device QA → Stage25 Initial Content Load → Stage26 Staging → Stage27 Release Gate → Stage28 Production Cutover → Stage29 Monitoring/Operations`.
