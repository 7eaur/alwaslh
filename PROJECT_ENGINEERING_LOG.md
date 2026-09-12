# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Engineering source of truth for project understanding, architecture decisions, findings, changes, verification and remaining work. Current code/migrations/executable CI/live runtime evidence outrank prose.

Last consolidated: **2026-09-12 — unified `main`; Stage13G+Student integrated; Stage16 active; Railway live inspection/dev; Grade 9 English Draft media proof verified.**

Historical detail remains in Git history, Issue #16 and specialized stage docs. Current continuation is `docs/workstreams/STAGE16_STUDENT_HANDOFF.md`.

## 1. Project understanding

**الوسيلة الذكية** منصة تعليمية عربية تتكون من Student Web/PWA + Super Admin Web فوق Fastify/PostgreSQL. Browser surfaces are presentation/resilience layers; canonical durable authority remains server/PostgreSQL.

Primary runtime surfaces:

- `apps/student-web` — Student Web/PWA;
- `apps/admin-web` — Super Admin;
- `apps/api` — Fastify/TypeScript authoritative API;
- `database/migrations` — PostgreSQL integrity/schema authority;
- `packages/*` — shared domain/design/validation primitives.

Canonical durable authorities:

- Auth / Device / Session;
- Access / Entitlements;
- Curriculum / Publication;
- Media / OCR;
- AI execution/review;
- Question Bank immutable revisions/publication;
- Quiz Builder immutable published versions;
- Student assessment scoring/finalization/history.

## 2. Current execution model

The parallel Track A / Track B model is historical after full integration.

PR #33 integrated Stage13G + current Student Product:

- verification head `dcdae7579a40878c71f64593280a0df2f8363ee2`;
- **19/19 workflows SUCCESS**;
- merge commit `5e22c3ff157b42b6da47febe205dd91fcb264eed`.

Product Owner direction now assigns the remaining product after Stage13 to one continuation owner. New work starts from live `main` using short-lived branches. One owner does not mean one layer: backend/DB/frontend/Admin responsibilities still live in their correct modules.

Before this documentation sync, live `main` was `8006a7c4b2fa66bcac9cfb3addcd52fa831c42df`.

## 3. Stable architecture

```text
Student Web/PWA ─┐
                 ├── Fastify API ── Railway PostgreSQL
Admin Web ───────┘       │
                         ├── Auth / Device / Session
                         ├── Access / Entitlements
                         ├── Curriculum / Publication
                         ├── Media / OCR
                         ├── AI / Question Bank / Quiz
                         ├── Student Assessment
                         └── Offline authorization/materialization/sync
```

Stable rules:

- Browser is never durable canonical business authority.
- returning Student uses password + bound P-256 device proof.
- `media ready != published`.
- protected Reader/media remains server-authorized; raw storage keys stay private.
- AI output never auto-publishes Student questions/content.
- assessment scoring/finalization remains server-owned.
- `/v1` never becomes Service Worker Cache API authority.
- hosting provider configuration does not become product business logic.
- source inventory, uploaded media, lesson draft, reviewed lesson and published Student content are distinct states.

## 4. Current stage ledger

| Stage / Area | State |
|---|---|
| Stage1–10 + OCR | VERIFIED |
| Stage11 AI contracts | VERIFIED |
| Stage12 durable AI runtime | VERIFIED backend/runtime; `AI-012..AI-019` open |
| Stage13A–G | VERIFIED / CLOSED / integrated into `main` |
| Stage14 Student | CLOSED / VERIFIED |
| Stage15 Student assessment | CLOSED / VERIFIED |
| **Stage16 Offline/PWA** | **ACTIVE / PARTIALLY VERIFIED** |
| Stage17–25 | pending sequentially |
| Railway inspection/dev hosting | LIVE / VERIFIED for current stack |
| Stage27/28 final release/cutover | NOT DECLARED |

## 5. Architecture decisions

- **AD-170** — Service Worker caches app shell/static assets only; `/v1` excluded.
- **AD-171** — no automatic `skipWaiting` / forced study reload.
- **AD-172** — protected Reader responses remain `private,no-store`; offline learning uses explicit materialization.
- **AD-173** — offline lease is server-issued, profile/device-bound and uses PostgreSQL time.
- **AD-174** — max offline lease 24h, clipped by session; grants clipped by entitlement expiry.
- **AD-175** — offline DB must never contain password/session cookie/token/device private key.
- **AD-176** — revision/tombstone/checkpoint schema is not authority until real writers/API/client flow is proven.
- **AD-177** — >5-minute backward client-clock movement invalidates local lease use.
- **AD-178** — online login correctness does not depend on optional offline persistence.
- **AD-179** — cleanup is exact-scope; rebind removes stale devices only within the same profile.
- **AD-180** — session-scoped pointer may contain only non-secret `{profileId,deviceId}`.
- **AD-181** — protected bytes require explicit manifest with stable IDs/revision/provenance/checksum/byte size and bounded storage.
- **AD-182** — no silent offline-content eviction; replacement is atomic after complete verification.
- **AD-183** — Student `contentRevision` is a safe numeric API contract; PostgreSQL `BIGINT` representation must not leak to browser comparison semantics.
- **AD-184** — package freshness is monotonic against possibly stale catalog state: `storedRevision >= catalogRevision` is acceptable.
- **AD-185** — protected cold-offline Reader requires server-authentic signed authorization; mutable IndexedDB records cannot become authority by themselves.
- **AD-186** — blob integrity must be checked against signed checksums at use/read time, not only at initial materialization.
- **AD-187** — browser security goal is authorization/integrity/expiry/isolation, not DRM against a hostile local user.
- **AD-188** — server signs canonical offline lesson manifests using P-256/ES256; Student verifies only with a public SPKI identity. Private signing material remains API-only.
- **AD-189** — download-time signature verification is necessary but does not close cold-start authority; stored authorization must be re-verified at use time and stored blobs rehashed before render.
- **AD-190** — post-Stage13 work uses unified `main` as baseline; old long-lived track branches are historical.
- **AD-191** — Railway deployment must build monorepo apps from repository-root Docker contexts; adapting application dependencies to an accidentally selected root Railpack build is not an acceptable fix.
- **AD-192** — canonical content bootstrap is source-revision-pinned, allow-listed, bounded, idempotent, uses existing Media Pipeline and creates Draft links only; it never auto-publishes Student content.
- **AD-193** — old Supabase is not current runtime DB/content source; Railway PostgreSQL + repository source inventory are current authorities unless Product Owner explicitly reopens legacy import.

## 6. Stage16 implemented boundary

### 6.1 PWA shell — VERIFIED

- app shell/static assets only;
- `/v1` excluded;
- offline shell acceptance in real Chromium;
- no forced `skipWaiting`.

### 6.2 Bounded lease/lifecycle — VERIFIED

- server-issued session/device/entitlement-bound lease;
- PostgreSQL time;
- max 24h and clipped expiries;
- account/device IndexedDB scope;
- activation/login/restore refresh;
- exact logout/session/rebind cleanup;
- backward-clock rejection.

### 6.3 Protected materialization — VERIFIED for download/storage

- explicit manifest + revision-pinned asset route;
- Published + entitled only;
- stable IDs/revision/provenance/checksum/byte size;
- IndexedDB v2 `lessonPackages`;
- 64 MiB lesson / 256 MiB scope budgets;
- exact byte/checksum before atomic commit;
- failed/tampered package cannot replace valid prior package;
- manual removal and exact-scope cleanup.

### 6.4 Signed authorization — VERIFIED at issuance/download boundary

Server:

- `apps/api/src/offline/signing.ts` canonicalizes the full manifest and signs with ES256/P-256;
- key ID is SHA-256 of public SPKI;
- production manifest issuance fails closed without signing config.

Student:

- `apps/student-web/src/offline-authorization.ts` checks configured public key identity;
- verifies WebCrypto ES256 signature;
- decodes and re-canonicalizes signed payload;
- requires outer manifest equality;
- rejects malformed/key/signature/payload/mismatch states.

Evidence:

- PR #33 Stage16 run `34560999667` — all three jobs SUCCESS;
- wider integration matrix — 19/19 workflows SUCCESS.

## 7. Stage16 open findings

| ID | Sev | Problem | Status / next action |
|---|---:|---|---|
| `STUDENT-016-OFFLINE-AUTH-009` | P1 | cold-start still cannot trust mutable local lease/package fields | **PARTIAL FIX** — signing/download verification done; durable scope + read-time signature/field authority remains OPEN |
| `STUDENT-016-REVOCATION-007` | P1 | no full reconnect session/device/entitlement/publication/revision purge | OPEN |
| `STUDENT-016-SYNC-001` | P1 | revision/tombstone/checkpoint schema lacks proven writers/API/client delta flow | OPEN / PROVEN |
| `STUDENT-016-OUTBOX-008` | P1 | no bounded durable outbox authority | OPEN |
| `AI-012..AI-019` | P2 | live AI provider/model/routes/credentials/bootstrap not proven | OPEN / NOT YET VERIFIED |

Additional exact gaps:

- current active offline scope uses `sessionStorage` and does not survive real browser restart;
- stored signed authorization is not re-verified at render/use time;
- stored blobs are not re-hashed on every offline use;
- no complete real Chromium `restart + network unavailable + offline Reader` acceptance exists.

## 8. Railway live inspection/dev state

Railway project `charming-peace` hosts:

- API — SUCCESS; deployment `5b889f87-24a5-4fc4-b061-9aeea3f5bea6`; `/ready` returned 200;
- Admin — SUCCESS;
- Student — SUCCESS;
- PostgreSQL — SUCCESS.

Public domains:

- `https://alwaslh-dev-api-7eaur-production.up.railway.app`
- `https://alwaslh-dev-admin-7eaur-production.up.railway.app`
- `https://alwaslh-dev-student-7eaur-production.up.railway.app`

API uses repository-root `apps/api/Dockerfile`, pre-deploy migrations, normal server start and persistent media volume `/app/runtime-data/media`.

Root deployment fixes:

- API app-only build context was wrong because Dockerfile needs repository root + migrations;
- Admin/Student Railpack build could not safely consume shared packages; repo-root Docker builds fixed it;
- frontend quality gates were separated from production Vite env injection;
- a Railway manual redeploy was observed incorrectly selecting root Railpack despite Dockerfile configuration; commit-based deploy respected Dockerfile. Do not modify app dependencies to satisfy the wrong builder.

This hosted stack is inspection/development evidence, not Stage28 final production completion.

See `docs/operations/RAILWAY_LIVE_STATE.md`.

## 9. Canonical content proof

Approved content source:

`7eaur/alwaslh-go@f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`

Stage9 inventory: **48 documents / 5,552 images**.

Grade 9 English live materialization proof:

- source document `تاسع انجليزي/الانجليزي_تاسع`;
- 75 images / 8,390,689 bytes;
- 75 ready media assets;
- 300 `source/display/thumbnail/ai` variants;
- 75 Draft lesson assets;
- 10 lessons;
- bootstrap deployment `8428981b-aa6d-4927-b1f9-31545265e3f9`;
- stable API restored afterward.

Publication boundary:

- imported lesson assets remain **Draft**;
- no Student visibility until normal Admin review/publication;
- no automatic question generation/publication;
- full 5,552-image byte materialization is NOT YET EXECUTED.

Old Supabase import was explicitly cancelled and is out of current scope.

See `docs/content/LIVE_CONTENT_IMPORT_STATUS.md`.

## 10. Root-cause record

### API/PostgreSQL BIGINT Student revision mismatch — FIXED

PostgreSQL `BIGINT` leaked as string while browser compared numeric revision. Fixed at API boundary.

### IndexedDB browser helper pinned old schema — FIXED

Tests opening v1 after runtime upgraded to v2 caused version errors. Helpers now open installed schema.

### Lease renewal assertion expected immutable timestamps — FIXED

Download activity intentionally renews lease. Acceptance asserts stable authority/scope, not identical issue/expiry timestamps.

### Download UI disrupted learning hierarchy — FIXED

Final order remains **Curriculum → Assessment → Downloads → Access**.

### Railway wrong build context / Railpack path — FIXED / DOCUMENTED

Repository-root Docker builds are the accepted deployment path. Manual redeploy that chooses root Railpack is a platform-path mismatch, not reason to change product architecture.

### Content bootstrap server chaining assumption — FIXED / DOCUMENTED

One-shot bootstrap successfully completed, but chained start behavior was not used as final runtime. API was restored to direct normal server start and health verified.

## 11. Remaining roadmap

### Immediate Stage16

1. durable non-secret scope selector;
2. read-time stored-signature verification + signed-field consistency;
3. read-time blob checksum verification;
4. true cold-start offline Reader;
5. real Chromium restart/network-off/tamper/expiry/clock-rollback/account isolation;
6. reconnect revalidation/purge;
7. authoritative revisions/tombstones/cursor/delta;
8. bounded outbox only when later offline writes require it;
9. exact-head Stage16 closure matrix + docs/Issue #16.

### Content

- human-review Grade 9 English Draft mappings/order/rendering;
- publish only approved content through Admin;
- Student Reader hosted smoke;
- then another bounded subject;
- measure/resize media capacity before full-source import.

### Later stages

Stage17 Personal Learning → Stage18 Notifications → Stage19 Progress/Statistics/Achievements → Stage20 Import/Export/Reporting closure → Stage21 Performance → Stage22 Security → Stage23 Tests/CI → Stage24 Accessibility/Device QA → Stage25 Initial Content Load → Stage26 Staging → Stage27 Release Gate → Stage28 Production Cutover → Stage29 Monitoring/Operations.

## 12. Exact next engineering action

Start from live `main`, create a short-lived Stage16 completion branch, inspect current signed offline code/tests, then implement **durable scope + read-time signed authorization + read-time blob integrity + cold-start Reader** before reconnect/sync closure. Do not begin Stage17 until Stage16 closes on one executable-proven HEAD.
