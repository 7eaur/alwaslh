# PROJECT INTEGRATION CONTINUITY — الوسيلة الذكية

> Operational continuity for replacement engineering conversations. Current code + migrations + executable CI + live Railway evidence outrank prose.

Last synchronized: **2026-09-12**.

## Resume procedure

1. Confirm repo `7eaur/alwaslh` and live `main` HEAD.
2. Do not resume from historical long-lived Track branches unless inspecting history.
3. Read README + Documentation Index + Handoff/Status/Resume/Engineering Log/this file/Execution Queue.
4. Read Product Overrides + Stage16 handoff + Railway/content live-state docs + latest Issue #16.
5. Live-check Actions and Railway before changing shared/runtime behavior.
6. Create a short-lived branch from current `main` for the next batch.

## Current operating model

The former Track A/Track B split is historical after PR #33.

PR #33 integrated Stage13G + current Student Product:

- verification head `dcdae7579a40878c71f64593280a0df2f8363ee2`;
- **19/19 workflows SUCCESS**;
- merge commit `5e22c3ff157b42b6da47febe205dd91fcb264eed`.

Product Owner direction now assigns the entire remaining post-Stage13 product sequence to one continuation owner. This changes task routing, **not architecture boundaries**: shared server/DB authority must still be implemented in API/database layers, not duplicated in Student Web.

## Integrated baseline

Before this documentation sync, live `main` was:

`8006a7c4b2fa66bcac9cfb3addcd52fa831c42df`

It includes:

- Stage13G Admin/Backend/AI/Question Bank/Quiz work;
- Stage14 Student Product;
- Stage15 Student Assessment;
- current Stage16 PWA/offline signing/materialization work;
- Railway Docker deployment support;
- Grade 9 English scoped canonical media bootstrap;
- live-content proof documentation.

Always live-check after this docs branch merges.

## Stable integration boundaries

- Browser is not Auth/Access/Curriculum/Question Bank/Assessment durable authority.
- protected Reader/media is server-authorized and online responses remain `private,no-store`.
- `/v1` must not enter Service Worker Cache API.
- offline storage remains profile/device scoped and credential-free.
- private offline signing material is API-only; Student receives only the public verification identity.
- `content_revisions`, `content_tombstones`, `sync_checkpoints` are not a complete sync authority until writers/API/client flow is verified.
- `media ready` never implies `lesson published`.
- AI review never implies Question Bank publication.

## Stage16 shared files / conflict-sensitive surfaces

Backend:

- `apps/api/src/app.ts`
- `apps/api/src/offline/service.ts`
- `apps/api/src/offline/download.ts`
- `apps/api/src/offline/http.ts`
- `apps/api/src/offline/signing.ts`
- `apps/api/src/curriculum/student-reader.ts`
- `apps/api/src/config.ts`
- future sync writers/routes/migrations.

Student:

- `apps/student-web/src/offline-store.ts`
- `apps/student-web/src/offline-content-store.ts`
- `apps/student-web/src/offline-download*.ts`
- `apps/student-web/src/offline-authorization.ts`
- `apps/student-web/src/offline-session.ts`
- `apps/student-web/src/App.tsx`
- Stage16 E2E specs.

Conflict policy:

- preserve canonical business/server authority;
- resolve additively;
- do not duplicate state merely to avoid shared-file edits;
- rerun all affected API/Student/browser gates after conflicts.

## Current Stage16 authority boundary

Verified:

- bounded lease;
- explicit protected materialization;
- checksum/size/budget/atomic storage;
- ES256 signed server manifest;
- Student key-ID/signature/canonical payload verification before storage;
- tamper rejection at download time.

Not yet verified/closed:

- durable active scope across true browser restart;
- signed authorization re-verification at offline use/render time;
- blob SHA-256 recheck at use time;
- cold-start offline Reader;
- reconnect revocation/publication/revision purge;
- revision/tombstone/cursor/delta/client application;
- bounded outbox semantics.

## Deployment continuity

Railway project `charming-peace` is the current hosted inspection/dev stack.

Public surfaces:

- Student `https://alwaslh-dev-student-7eaur-production.up.railway.app`
- Admin `https://alwaslh-dev-admin-7eaur-production.up.railway.app`
- API `https://alwaslh-dev-api-7eaur-production.up.railway.app`

Latest known state: API/Admin/Student/PostgreSQL all SUCCESS.

API uses:

- repository root source;
- `apps/api/Dockerfile`;
- pre-deploy migrations;
- direct `node apps/api/dist/server.js` start;
- `/ready` healthcheck;
- persistent media volume `/app/runtime-data/media`.

Observed caveat: manual Railway redeploy may incorrectly choose root Railpack even when Dockerfile is configured. Commit-based deployment has correctly honored Dockerfile. If logs show root Railpack, correct deployment path rather than changing application architecture.

Full detail: `docs/operations/RAILWAY_LIVE_STATE.md`.

## Content continuity

Canonical source:

`7eaur/alwaslh-go@f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`

Stage9 full inventory: 48 documents / 5,552 images.

Live Grade 9 English proof:

- 75 images / 8,390,689 bytes;
- 75 ready media assets;
- 300 variants;
- 75 Draft lesson assets;
- 10 lessons.

Important continuity rules:

- assets remain Draft until Admin review/publish;
- no automatic AI question generation/publication;
- do not import old Supabase data without new explicit Product Owner instruction;
- before bulk media load, verify source-to-lesson mapping and Railway media capacity.

Full detail: `docs/content/LIVE_CONTENT_IMPORT_STATUS.md`.

## Stage transition continuity

Current sequence:

`Stage16 closure → Stage17 → Stage18 → Stage19 → Stage20 → Stage21 → Stage22 → Stage23 → Stage24 → Stage25 → Stage26 → Stage27 → Stage28 → Stage29`.

`AI-012..AI-019` remains an open cross-cutting live-provider requirement and must be explicitly verified before final release if live AI is part of the release candidate.

## Exact continuation

Live shared-state recheck → short-lived branch from `main` → durable offline scope → read-time signed authorization verification → read-time blob integrity → cold-start offline Reader + real Chromium → reconnect purge → authoritative delta/tombstone/outbox → Stage16 closure → Stage17.

A separate content-review batch may publish the already imported Grade 9 English Draft sample through normal Admin authority, but should not be mixed into the Stage16 architecture batch.
