# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Engineering source of truth for project understanding, architecture decisions, findings, changes, verification and remaining work. Code/migrations/executable CI outrank prose.

Last consolidated: **2026-09-11 — Stage14/15 closed; Stage16 active; lease lifecycle verified.**

Historical detail remains in Git history and specialized docs. Current continuation lives in `docs/workstreams/STAGE16_STUDENT_HANDOFF.md`.

## 1. Project understanding

**الوسيلة الذكية** منصة تعليمية عربية ذات Student Web + Super Admin Web فوق Fastify/PostgreSQL. Browser surfaces are presentation/resilience layers; canonical Auth, devices, entitlements, curriculum publication, Question Bank/Quiz publication and assessment scoring/history remain server/PostgreSQL authority.

Primary runtime surfaces:

- `apps/student-web` — Student product / PWA.
- `apps/admin-web` — Super Admin.
- `apps/api` — authoritative API.
- `database/migrations` — PostgreSQL integrity authority.

Operating model:

- Track A owns Backend/Admin/AI/Question Bank/Quiz Builder/Stage13G.
- Track B owns Student Product on `parallel/stage14-student-product`.
- Issue #16 is shared execution ledger.
- Small Track B shared API additions must be minimal, proven, compatible and non-duplicative.
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
                     ├── AI / Question Bank / Quiz
                     ├── Student Assessment Runtime
                     └── Stage16 Offline Lease + future explicit materialization/sync
```

Stable rules:

- Browser is not durable business authority.
- Full Code = 6 digits; Class Code = 7 digits.
- returning Student = password + bound P-256 device proof.
- `media ready != published`; Student direct content requires `published_at <= now()`.
- Reader protected media is server-authorized and raw storage keys stay private.
- assessment scoring/finalization remains server-owned.
- transient offline UX is not Stage16 protected-offline authority.

## 3. Stage ledger

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
| Release/deployment | FUTURE / DEFERRED |

## 4. Relevant architecture decisions

- **AD-159** — Reader consumes only server-authorized published assets backed by ready media; raw storage keys/non-approved OCR remain private.
- **AD-160** — transient network loss may preserve current UI context but never claims durable offline authority.
- **AD-163** — Stage15 reuses one durable assessment runtime; no duplicate attempt engine.
- **AD-165** — Student assessment has a purpose-built safe API; Admin authoring detail is not a Student contract.
- **AD-168** — Reader/Assessment share publication-time rule `published_at <= now()`.
- **AD-170** — Stage16 Service Worker caches app shell/static assets only; `/v1` is excluded from SW interception/cache.
- **AD-171** — Service Worker updates do not auto-`skipWaiting`; activation is explicit to avoid forced reload during lessons/assessments.
- **AD-172** — protected Reader responses remain `private,no-store`; offline learning requires explicit authorized materialization, never opportunistic API caching.
- **AD-173** — offline entitlement lease is server-issued, profile/device-bound and uses PostgreSQL/server time; browser clock/cookie TTL is not authority.
- **AD-174** — current maximum offline lease is 24h, clipped by session expiry; each grant is clipped by entitlement expiry.
- **AD-175** — Stage16 offline DB is account/device scoped and must not contain password/session cookie/token/device private key.
- **AD-176** — `content_revisions` / `content_tombstones` / `sync_checkpoints` are dormant until verified writers/API/client consumers exist.
- **AD-177** — >5-minute backward wall-clock movement invalidates local lease use; server time is estimated from server-issued time + elapsed client time.
- **AD-178** — authenticated online correctness must not depend on optional offline persistence; lease refresh/save is best-effort after successful online activation/login/restore.
- **AD-179** — offline cleanup is exact-scope cleanup. Logout/session expiry remove only active `profileId:deviceId`; device rebind may remove stale devices only within the same profile.
- **AD-180** — reload-safe cleanup may persist only a non-secret `{profileId,deviceId}` scope pointer in `sessionStorage`; no credential or lease payload is duplicated there.
- **AD-181** — protected lesson bytes cannot be stored until an explicit server-authorized manifest defines stable IDs, revision/provenance, checksum, byte size and bounded storage/accounting/rollback/eviction semantics.

## 5. Stage16 implementation

### 5.1 Safe PWA shell — VERIFIED

Runtime `c1ae86036d4d302b8ca8c411227f41c37b4063ef`, run `34430284173` SUCCESS.

Verified: HTTPS/loopback registration; app-shell/static caching; `/v1` exclusion; no protected API caching; no credentials; explicit worker activation; true Chromium offline reload.

### 5.2 Bounded server-issued lease — VERIFIED

Endpoint: `GET /v1/student/offline/lease`.

Runtime `5b71aa2a3bfbf2a9b7d1c6ec7a3762033ac9cacd`.
Evidence: Stage16 `34430915847` + API Regression `34430915786` SUCCESS.

Rules: authenticated Student; non-revoked bound device; PostgreSQL time; max 24h clipped by session; grants clipped by entitlement; metadata only; `private,no-store`.

### 5.3 Client lease storage/lifecycle — VERIFIED FOR IMPLEMENTED BOUNDARY

Runtime: `53aeb972c4c891c3eecafdde0716b544751d2711`.

Relevant files:

- `apps/student-web/src/offline-api.ts`
- `apps/student-web/src/offline-store.ts`
- `apps/student-web/src/offline-session.ts`
- `apps/student-web/src/auth-api.ts`
- `apps/student-web/src/App.tsx`
- `apps/student-web/e2e/offline-lease.e2e.spec.mjs`
- `.github/workflows/stage16-student-pwa.yml`

Model:

- DB `alwaslh-student-offline` v1;
- store `leases` only;
- key `profileId:deviceId`;
- metadata + observation timing only;
- authenticated activation/login/restore triggers best-effort lease sync;
- scoped logout/session-expiry/rebind cleanup;
- `sessionStorage` contains only a non-secret active scope pointer to survive reload;
- 5-minute clock rollback guard.

No protected lesson/media blob is stored yet.

## 6. Root-cause record

### STUDENT-016-QA-004 — FIXED / VERIFIED

Problem: `offline-store.ts:85` strict TS18047 despite a preceding null guard.

Fix: bind the guarded non-null `estimatedServerTimeMs` to a local constant after the guard; preserve strictness and behavior.

Initial repaired runtime `41fdcaeb...` passed exact-head Stage14 + Stage16.

### STUDENT-016-CLIENT-005 — FIXED / VERIFIED

Problem: server-issued lease existed but client lifecycle did not refresh/persist/clean it around authenticated session state.

Fix: lifecycle integration with best-effort online lease sync and exact-scope cleanup.

### Reload cleanup defect found by real Chromium — FIXED / VERIFIED

First lifecycle acceptance on `95954b...` proved a real defect: active offline scope identity existed only in module memory, so after reload an offline logout could not remove its own lease scope.

Fix in `53aeb972...`: persist only the non-secret active `{profileId,deviceId}` scope pointer in `sessionStorage`. Lease remains IndexedDB; no credential is copied. After fix the real Chromium lifecycle suite passed 3/3.

### Stage14 Assessment first-attempt failure — NON-REPRODUCIBLE / NO PRODUCT CHANGE

Stage14 `34551931610` attempt 1 failed one model-selection hint assertion in Assessment. Comparison showed no Assessment code changed from an earlier passing point. The unchanged failed browser job was rerun on exact `53aeb972...` and the full suite passed. No timeout/assertion/product change was made.

## 7. Audit findings

| ID | Sev | Area | Problem | Solution / next action | Status |
|---|---:|---|---|---|---|
| `STUDENT-014-API-001` | P1 | Curriculum | safe Student Curriculum contract absent | entitlement-filtered API | FIXED / VERIFIED |
| `STUDENT-014-READER-001` | P1 | Reader | safe publication/media/OCR delivery absent | protected Reader + integrity | FIXED / VERIFIED |
| `STUDENT-015-ASSESSMENT-001` | P1 | Assessment | Admin detail unsafe for Student | purpose-built Student runtime | FIXED / VERIFIED |
| `STUDENT-015-PUBLISH-002` | P1 | Publication | future-published direct paths | enforce `published_at <= now()` | FIXED / VERIFIED |
| `STUDENT-016-SYNC-001` | P1 | Sync | dormant revision/tombstone/checkpoint schema not wired | real writers/API/client later | OPEN / PROVEN |
| `STUDENT-016-LEASE-002` | P1 | Offline access | bounded lease/lifecycle absent | server lease + scoped client persistence | FIXED / VERIFIED FOR LEASE BOUNDARY |
| `STUDENT-016-CACHE-003` | P1 | Content | no explicit protected offline materialization | explicit authorized download contract | OPEN / NEXT DESIGN |
| `STUDENT-016-QA-004` | P1 | Build | TS18047 blocked strict build | safe narrowing | FIXED / VERIFIED |
| `STUDENT-016-CLIENT-005` | P1 | Lifecycle | lease not tied to session lifecycle | sync + scoped cleanup | FIXED / VERIFIED |
| `STUDENT-016-DOWNLOAD-006` | P1 | Storage | no manifest/budget/checksum/accounting/rollback/eviction | define before blobs | OPEN / NEXT |
| `STUDENT-016-REVOCATION-007` | P1 | Security | no protected-content reconnect purge | revalidate + purge | OPEN |
| `STUDENT-016-OUTBOX-008` | P1 | Sync | no delta/outbox authority | later after materialization | OPEN |
| `AI-012-019` | P2 | AI | live provider bootstrap not live-proven | separate future evidence | OPEN / nonblocking for published Student content |

## 8. Verification evidence

Current lease/lifecycle runtime `53aeb972...`:

- Stage16 `34551931757` — SUCCESS: PostgreSQL lease, strict Student build, PWA Chromium, IndexedDB lifecycle Chromium 3/3.
- Stage14 `34551931610`, attempt 2 — SUCCESS on same HEAD: lint, strict typecheck, Vitest 22/22, build, curriculum/Reader contracts, full real Chromium.

Therefore `STUDENT-016-QA-004`, `STUDENT-016-CLIENT-005` and the client portion of `STUDENT-016-LEASE-002` are verified for the implemented lease boundary.

## 9. Known issues / remaining work

- explicit protected lesson download manifest/materialization;
- stable content revision/provenance contract for downloaded bytes;
- account/device storage budget + byte accounting + checksum + rollback + deterministic eviction/removal;
- offline Reader from explicitly materialized bytes;
- reconnect entitlement/publication/device revalidation + purge;
- authoritative revision writers/tombstones/server cursor/delta client application;
- outbox only for product-authorized offline writes;
- Stage17 blocked until Stage16 closes;
- deployment deferred.

## 10. Exact next action

Recheck live Student/main/Issue → inspect canonical Reader/content/publication/media code + migrations → define explicit protected lesson download manifest and bounded storage semantics before any blob write → implement smallest compatible server contract → add scoped materialization + Chromium → reconnect purge → delta/tombstone/outbox → Stage16 closure.
