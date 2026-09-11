# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Engineering source of truth for project understanding, architecture decisions, findings, changes, verification and remaining work. Code/migrations/executable CI outrank prose.

Last consolidated: **2026-09-11 — Stage14/15 closed; Stage16 active.**

Historical detail remains in Git history and specialized docs. Current Stage16 continuation lives in `docs/workstreams/STAGE16_STUDENT_HANDOFF.md`.

## 1. Project understanding

**الوسيلة الذكية** منصة تعليمية عربية ذات Student Web + Super Admin Web فوق Fastify/PostgreSQL. Browser surfaces are UX/presentation; canonical Auth, devices, entitlements, curriculum publication, Question Bank/Quiz publication and assessment scoring/history remain server/PostgreSQL authority.

Primary runtime surfaces:

- `apps/student-web` — Student product / PWA.
- `apps/admin-web` — Super Admin.
- `apps/api` — authoritative API.
- `database/migrations` — PostgreSQL integrity authority.

Operating model:

- Track A owns Backend/Admin/AI/Question Bank/Quiz Builder/Stage13G.
- Track B owns Student Product on `parallel/stage14-student-product`.
- Issue #16 is shared execution ledger.
- Small Track B shared API additions must be minimal, proven and non-duplicative.
- deployment remains deferred.

## 2. Stable architecture

```text
Student Web ─┐
             ├── Fastify API ── PostgreSQL
Admin Web ───┘       │
                     ├── Auth / Device / Session
                     ├── Access / Entitlements
                     ├── Curriculum / Publication
                     ├── Media / OCR
                     ├── AI Contracts + Durable Runtime + Human Review
                     ├── Question Bank / Immutable Quiz Snapshots
                     ├── Student Assessment Runtime
                     └── Stage16 Offline Lease / Sync contracts
```

Stable rules:

- Browser is not durable business authority.
- Full Code = 6 digits; Class Code = 7 digits.
- returning Student = password + bound P-256 device proof.
- `media ready != published`.
- Student direct content access requires `published_at <= now()`.
- Reader protected media is re-authorized server-side and does not expose raw storage keys.
- Question Bank published revisions + quiz snapshots are immutable authority.
- Student assessment scoring/finalization remains server-owned.
- transient offline UX is not durable Stage16 authority.

## 3. Verified stage ledger

| Stage / Area | State |
|---|---|
| Stage1–10 + OCR | VERIFIED |
| Stage11 AI contracts | VERIFIED |
| Stage12 durable AI runtime | VERIFIED backend/runtime; live provider bootstrap still open |
| Stage13A–F | VERIFIED / CLOSED; Stage13F promoted |
| Stage13G | Track A follow-on |
| Stage14 Student | CLOSED / VERIFIED @ `ac55f143...` |
| Stage15 Student assessment | CLOSED / VERIFIED @ `9a787b7...` |
| Stage16 Offline/PWA | **ACTIVE / PARTIALLY VERIFIED** |
| Stage17+ | blocked/later by sequence |
| Release/deployment | FUTURE |

## 4. Relevant architecture decisions

Historical ADs remain in Git history. Current decisions include:

- **AD-159** — Reader consumes only server-authorized published assets backed by ready media; raw storage keys/non-approved OCR remain private.
- **AD-160** — transient network loss may preserve in-session context but never claims durable offline authority.
- **AD-163** — Stage15 reuses one durable assessment runtime; no duplicate attempt engine.
- **AD-165** — Student assessment has purpose-built safe API; Admin authoring detail is not a Student contract.
- **AD-168** — Student Reader/Assessment share publication-time rule `published_at <= now()`.
- **AD-170** — Stage16 Service Worker caches app shell/static assets only; `/v1` is excluded from SW interception/cache.
- **AD-171** — Service Worker updates do not auto-`skipWaiting`; activation is explicit to avoid forced reload during lessons/assessments.
- **AD-172** — protected Reader responses remain `private,no-store`; offline learning requires explicit authorized materialization, never opportunistic API caching.
- **AD-173** — offline entitlement lease is server-issued, profile/device-bound and uses server/PostgreSQL time; browser clock/cookie TTL is not authority.
- **AD-174** — current maximum offline lease is 24h, clipped by session expiry; each grant is additionally clipped by entitlement expiry.
- **AD-175** — Stage16 client storage is a dedicated account/device-scoped IndexedDB and must not contain password/session cookie/token/device private key.
- **AD-176** — existing `content_revisions` / `content_tombstones` / `sync_checkpoints` are dormant schema until verified writers/API/client consumers exist; schema presence does not equal sync authority.
- **AD-177** — large backward wall-clock movement invalidates local lease use; current client design allows 5-minute rollback tolerance and estimates server time from server-issued time + elapsed client time.

## 5. Stage16 implementation completed so far

### 5.1 Safe PWA shell — VERIFIED

Files include:

- `apps/student-web/public/manifest.webmanifest`
- `apps/student-web/public/sw.js`
- `apps/student-web/src/pwa.ts`
- `apps/student-web/src/pwa.test.ts`
- `apps/student-web/e2e/pwa-shell.e2e.spec.mjs`
- `apps/student-web/playwright.pwa.config.mjs`
- `.github/workflows/stage16-student-pwa.yml`

Verified behavior:

- registration only HTTPS/loopback;
- app-shell + static asset cache;
- `/v1` excluded;
- no protected API response cached;
- no credential copied;
- explicit waiting-worker activation only;
- real Chromium offline reload.

Runtime `c1ae86036d4d302b8ca8c411227f41c37b4063ef`.
Run `34430284173` SUCCESS.

### 5.2 Bounded server-issued lease — VERIFIED

Files:

- `apps/api/src/offline/service.ts`
- `apps/api/src/offline/http.ts`
- `apps/api/src/app.ts`
- `apps/api/tests/integration/student-offline.integration.test.ts`

Endpoint: `GET /v1/student/offline/lease`.

Security/correctness:

- authenticated Student only;
- current session token hash identifies same active session;
- non-revoked bound device required;
- PostgreSQL `now()` is lease time authority;
- max 24h, clipped by session expiry;
- entitlement grants clipped by entitlement expiry;
- metadata only;
- `private,no-store` / `Pragma:no-cache`;
- no migration required.

Verified runtime: `5b71aa2a3bfbf2a9b7d1c6ec7a3762033ac9cacd`.

Evidence:

- Stage16 `34430915847` SUCCESS — PostgreSQL lease + PWA Chromium.
- API Regression `34430915786` SUCCESS.

### 5.3 Client lease store — IMPLEMENTED / NOT VERIFIED

Code checkpoint: `2c44a363638221ee2985ecb6b8fb71c3e757a333`.

Files:

- `apps/student-web/src/offline-api.ts`
- `apps/student-web/src/offline-api.test.ts`
- `apps/student-web/src/offline-store.ts`
- `apps/student-web/src/offline-store.test.ts`

Intended model:

- DB `alwaslh-student-offline` v1;
- store `leases`;
- key `profileId:deviceId`;
- lease metadata + observed/last-seen client times only;
- server-time estimate;
- 5-minute clock rollback tolerance;
- class grant evaluation.

No protected lesson/media bytes are stored.

Current code is not wired into authenticated session lifecycle yet.

## 6. Audit findings

| ID | Sev | Area | Problem / evidence | Impact | Solution / next action | Status |
|---|---:|---|---|---|---|---|
| `STUDENT-014-API-001` | P1 | Curriculum | no safe Student Curriculum contract | access leak risk | entitlement-filtered API | FIXED / VERIFIED |
| `STUDENT-014-READER-001` | P1 | Reader | no safe publication/media/OCR delivery | trust/storage risk | protected Reader + integrity | FIXED / VERIFIED |
| `STUDENT-015-ASSESSMENT-001` | P1 | Assessment | Admin detail unsafe for Student | answer leak | purpose-built Student runtime | FIXED / VERIFIED |
| `STUDENT-015-PUBLISH-002` | P1 | Publication | future-published direct paths | early exposure | enforce `published_at <= now()` | FIXED / VERIFIED |
| `STUDENT-016-SYNC-001` | P1 | Sync | revision/tombstone/checkpoint schema not wired | false sync authority | build real writer/API/client later | OPEN / PROVEN |
| `STUDENT-016-LEASE-002` | P1 | Offline access | bounded server lease absent | offline authorization gap | server-issued bounded lease | SERVER FIXED / VERIFIED; CLIENT NOT VERIFIED |
| `STUDENT-016-CACHE-003` | P1 | Content | Reader is `no-store`; no explicit offline materialization | cannot safely store protected lessons | new explicit download contract | OPEN |
| `STUDENT-016-QA-004` | P1 | Build | TS18047 at `offline-store.ts:85` | latest Student build red | fix narrowing, preserve strictness | OPEN / NEXT FIX |
| `STUDENT-016-CLIENT-005` | P1 | Lifecycle | lease store not refreshed/saved/cleared by session lifecycle | dead/untrusted client state | wire restore/login/activation/logout/rebind | OPEN |
| `STUDENT-016-DOWNLOAD-006` | P1 | Storage | no budget/checksum/eviction/download contract | unsafe/unbounded blobs | define explicit materialization | OPEN |
| `STUDENT-016-REVOCATION-007` | P1 | Security | future protected cache has no purge/revalidation | stale entitlement risk | reconnect revalidate + purge | OPEN |
| `STUDENT-016-OUTBOX-008` | P1 | Sync | no outbox/delta reconciliation | offline writes/sync incomplete | later after content boundary | OPEN |
| `AI-012-019` | P2 | AI | live provider bootstrap not live-proven | production generation path unverified | separate future evidence | OPEN / nonblocking for published Student content |

## 7. Current verification evidence

### Stage15 closure

Runtime `9a787b7c0f6bd3ed12f24de92546c33fcc21e26d`:

- API `34427900263` SUCCESS;
- Stage15 Assessment `34427900257` SUCCESS;
- Student Product `34427900209` SUCCESS.

### Stage16 verified boundary

Runtime `5b71aa2a3bfbf2a9b7d1c6ec7a3762033ac9cacd`:

- Stage16 `34430915847` SUCCESS;
- API Regression `34430915786` SUCCESS.

### Latest code checkpoint failure

`2c44a363638221ee2985ecb6b8fb71c3e757a333`:

- Student Product `34431220808` FAILURE at strict typecheck.
- Stage16 `34431220827` overall FAILURE from same build error.
- exact error: `src/offline-store.ts(85,38) TS18047` — `evaluation.estimatedServerTimeMs` possibly null.
- ESLint PASS.
- Vitest **22/22 PASS**.
- Stage16 PostgreSQL lease job PASS.
- browser jobs not evidence on this head because Student build stopped them.

## 8. Known issues / remaining work

- Fix strict TS narrowing before any new Stage16 feature code.
- Wire lease lifecycle.
- Browser-test IndexedDB account/device isolation and cleanup.
- Define explicit protected lesson download + storage budgets/checksum/eviction.
- Revalidate/purge on reconnect/revocation/expiry.
- Wire revisions/tombstones/delta/outbox only after materialization contract.
- Stage17 blocked until Stage16 closes.
- deployment deferred.

## 9. Exact next action

1. In `offline-store.ts`, after the existing `fresh` + non-null guard, assign the non-null estimated server time to a local constant or otherwise narrow it in a type-safe way; do not use non-null assertions as a shortcut unless proven necessary.
2. Rerun exact-head Student Product + Stage16 PWA.
3. If green, wire online authenticated lifecycle to fetch/save lease and scoped cleanup.
4. Add real Chromium IndexedDB evidence.
5. Continue explicit protected download design incrementally.
