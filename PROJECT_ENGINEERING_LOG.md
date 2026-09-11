# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Engineering source of truth for project understanding, architecture decisions, findings, changes, verification and remaining work. Code/migrations/executable CI outrank prose.

Last consolidated: **2026-09-11 — Stage14/15 closed; Stage16 active; protected materialization verified; cold-offline authorization hardening active.**

Historical detail remains in Git history and specialized docs. Current continuation lives in `docs/workstreams/STAGE16_STUDENT_HANDOFF.md`.

## 1. Project understanding

**الوسيلة الذكية** منصة تعليمية عربية ذات Student Web + Super Admin Web فوق Fastify/PostgreSQL. Browser surfaces are presentation/resilience layers; canonical Auth, devices, entitlements, curriculum publication, Question Bank/Quiz publication and assessment scoring/history remain server/PostgreSQL authority.

Primary runtime surfaces:

- `apps/student-web` — Student product / PWA.
- `apps/admin-web` — Super Admin.
- `apps/api` — authoritative API.
- `database/migrations` — PostgreSQL integrity authority.

Track A owns Backend/Admin/AI/Question Bank/Quiz Builder/Stage13G by default. Track B owns Student Product. Issue #16 is the shared ledger. Deployment remains deferred.

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
                     └── Stage16 Offline Lease + Explicit Materialization + future signed cold-offline/sync
```

Stable rules:

- Browser is not durable canonical business authority.
- returning Student uses password + bound P-256 device proof.
- `media ready != published`; Student direct content requires `published_at <= now()`.
- Reader protected media is server-authorized; raw storage keys stay private.
- assessment scoring/finalization remains server-owned.
- `/v1` is never Service Worker Cache API authority.
- transient offline UX is not equivalent to protected cold-offline authority.

## 3. Stage ledger

| Stage / Area | State |
|---|---|
| Stage1–10 + OCR | VERIFIED |
| Stage11 AI contracts | VERIFIED |
| Stage12 durable AI runtime | VERIFIED backend/runtime; live provider bootstrap still open |
| Stage13A–F | VERIFIED / CLOSED; Stage13F promoted |
| Stage13G | VERIFIED / CLOSED on Track A branch; not promoted |
| Stage14 Student | CLOSED / VERIFIED @ `ac55f143...` |
| Stage15 Student assessment | CLOSED / VERIFIED @ `9a787b7...` |
| Stage16 Offline/PWA | **ACTIVE / PARTIALLY VERIFIED** |
| Stage17+ | blocked/later by sequence |
| Release/deployment | FUTURE / DEFERRED |

## 4. Relevant architecture decisions

- **AD-170** — Stage16 Service Worker caches app shell/static assets only; `/v1` excluded.
- **AD-171** — no automatic `skipWaiting` / forced lesson reload.
- **AD-172** — protected Reader responses remain `private,no-store`; offline learning uses explicit materialization.
- **AD-173** — offline lease is server-issued, profile/device-bound and uses PostgreSQL time.
- **AD-174** — max offline lease 24h, clipped by session; grants clipped by entitlement expiry.
- **AD-175** — Stage16 offline DB must not contain password/session cookie/token/device private key.
- **AD-176** — revision/tombstone/checkpoint schema remains dormant until proven wired.
- **AD-177** — >5-minute backward wall-clock movement invalidates local lease use.
- **AD-178** — online login correctness does not depend on optional offline persistence.
- **AD-179** — offline cleanup is exact-scope; rebind removes stale devices only within same profile.
- **AD-180** — session-scoped reload cleanup pointer may contain only non-secret `{profileId,deviceId}`.
- **AD-181** — protected bytes require explicit manifest with stable IDs/revision/provenance/checksum/byte size and bounded storage semantics.
- **AD-182** — no silent offline-content eviction. User removal/update is explicit; a new package replaces an old one only after complete verification.
- **AD-183** — Student `contentRevision` is a safe numeric API contract; PostgreSQL `BIGINT` representation must not leak into browser comparison semantics.
- **AD-184** — package freshness is monotonic relative to possibly stale catalog state: `storedRevision >= catalogRevision` is acceptable; only lower stored revision is stale.
- **AD-185** — **true cold-offline protected Reader requires server-authentic signed authorization. Unsigned mutable IndexedDB lease/package metadata may not be promoted to access authority.**
- **AD-186** — offline blob integrity must be rechecked against signed checksums at use/read time, not only at initial materialization.
- **AD-187** — browser security claim is authorization/integrity/expiry/isolation, not DRM against a hostile user controlling the browser.

## 5. Stage16 implementation

### 5.1 Safe PWA shell — VERIFIED

Runtime `c1ae86036d4d302b8ca8c411227f41c37b4063ef`, run `34430284173` SUCCESS.

### 5.2 Bounded server-issued lease — VERIFIED

Runtime `5b71aa2a3bfbf2a9b7d1c6ec7a3762033ac9cacd`; Stage16 `34430915847` + API Regression `34430915786` SUCCESS.

### 5.3 Client lease storage/lifecycle — VERIFIED FOR IMPLEMENTED BOUNDARY

Runtime `53aeb972c4c891c3eecafdde0716b544751d2711`; Stage16 `34551931757` and Stage14 `34551931610` attempt 2 SUCCESS.

### 5.4 Explicit protected lesson materialization — VERIFIED FOR DOWNLOAD/STORAGE BOUNDARY

Runtime `d350206710003da311693834db90e348d1a89bc3`.

Server:

- dedicated offline lesson manifest + revision-pinned asset route;
- manifest issued only through current Student session/device/entitlement/published Reader authority;
- stable lesson/asset IDs, numeric content revision, publication provenance, SHA-256 and exact byte sizes;
- responses remain `private,no-store`.

Client:

- `alwaslh-student-offline` upgraded to v2;
- `lessonPackages` keyed by account/device/lesson and indexed by scope;
- 64 MiB per lesson, 256 MiB per profile/device scope;
- replacement-aware accounting;
- no silent eviction;
- WebCrypto SHA-256 + byte-size verification before atomic commit;
- manual remove/update;
- scoped logout/session/rebind cleanup removes package bytes;
- Download UI follows Assessment and precedes Access.

Evidence:

- Stage16 `34557753480` — SUCCESS.
- Stage14 `34557753472` — SUCCESS on exact `d3502067...`.
- API Regression `34557536412` — SUCCESS for numeric Student revision fix.

## 6. Root-cause record

### IndexedDB v2 browser helper defect — FIXED / VERIFIED

Browser tests opened DB explicitly at v1 after runtime upgraded to v2, causing a version error unrelated to product behavior. Helpers now open the installed schema and create required legacy store only for a new DB.

### Student `contentRevision` BIGINT contract defect — FIXED / VERIFIED

PostgreSQL returned `BIGINT` as a string while Reader/browser code used numeric revision state. Result: `"1" !== 1` and a freshly downloaded package appeared stale. Fixed at API boundary by normalizing to a safe numeric value; API Regression passed.

### Renewable lease assertion defect — FIXED / VERIFIED

Download UI refreshes the lease. Acceptance previously required byte-for-byte timestamp equality. It now verifies stable profile/device/grant authority while allowing expected issue/expiry renewal.

### Learning hierarchy regression — FIXED / VERIFIED

Download management was initially placed between Curriculum and Assessment. Final order preserves the core learning flow: **Curriculum → Assessment → Downloads → Access**.

## 7. Audit findings

| ID | Sev | Area | Problem | Solution / next action | Status |
|---|---:|---|---|---|---|
| `STUDENT-014-API-001` | P1 | Curriculum | safe Student Curriculum contract absent | entitlement-filtered API | FIXED / VERIFIED |
| `STUDENT-014-READER-001` | P1 | Reader | safe publication/media/OCR delivery absent | protected Reader + integrity | FIXED / VERIFIED |
| `STUDENT-015-ASSESSMENT-001` | P1 | Assessment | Admin detail unsafe for Student | purpose-built Student runtime | FIXED / VERIFIED |
| `STUDENT-016-SYNC-001` | P1 | Sync | dormant revision/tombstone/checkpoint schema not wired | real writers/API/client later | OPEN / PROVEN |
| `STUDENT-016-LEASE-002` | P1 | Offline access | bounded lease/lifecycle | server lease + scoped client persistence | FIXED / VERIFIED FOR LEASE BOUNDARY |
| `STUDENT-016-CACHE-003` | P1 | Content | protected materialization absent | explicit manifest/materialization | FIXED / VERIFIED FOR DOWNLOAD/STORAGE BOUNDARY |
| `STUDENT-016-QA-004` | P1 | Build | strict TypeScript blocker | safe narrowing | FIXED / VERIFIED |
| `STUDENT-016-CLIENT-005` | P1 | Lifecycle | lease not tied to session lifecycle | sync + scoped cleanup | FIXED / VERIFIED |
| `STUDENT-016-DOWNLOAD-006` | P1 | Storage | manifest/budget/checksum/accounting/rollback/removal absent | explicit bounded atomic store | FIXED / VERIFIED |
| `STUDENT-016-REVOCATION-007` | P1 | Security | no protected-content reconnect purge | revalidate + purge | OPEN |
| `STUDENT-016-OUTBOX-008` | P1 | Sync | no delta/outbox authority | later after materialization | OPEN |
| `STUDENT-016-OFFLINE-AUTH-009` | P1 | Security | unsigned mutable local authorization cannot safely authorize cold-start Reader | signed server envelope + client verification + read-time integrity | OPEN / ACTIVE NEXT |
| `AI-012-019` | P2 | AI | live provider bootstrap not live-proven | separate future evidence | OPEN / nonblocking for published Student content |

## 8. Security analysis for cold-offline

Current package bytes are integrity-verified at write time, but the persisted authorization metadata is not cryptographically authenticated. `offlineLessonPackageAllowsUse()` consumes locally stored lease grants/timestamps. Therefore the current package must **not** be rendered as protected content after a cold browser restart solely from that mutable local metadata.

The next authority must be a server-signed canonical envelope covering profile/device/class/lesson/revision/publication/issued/expiry plus asset IDs/checksums/sizes. Student Web verifies with a known public verification key and fails closed on any mismatch. Stored blobs are rehashed before use.

Important limitation: web clients are not trusted execution environments against a hostile user who controls DevTools/browser storage. The product security goal is authentic server authorization, tamper detection in normal application operation, bounded expiry, account/device isolation and reconnect revocation—not DRM.

## 9. Known issues / remaining work

- signed offline authorization + key lifecycle;
- durable non-secret active scope discovery across browser restart;
- true cold-start offline Reader from signed materialized bytes;
- reconnect session/device/entitlement/publication/revision revalidation + purge;
- authoritative revision writers/tombstones/server cursor/delta client application;
- bounded outbox only for later product-authorized offline writes;
- Stage17 blocked until Stage16 closes;
- deployment deferred.

## 10. Exact next action

Implement signed server-authentic lesson authorization → client signature + signed-field verification → read-time blob checksum → durable non-secret scope selector → real Chromium cold browser restart with network unavailable → reconnect purge → delta/tombstone/outbox → Stage16 closure.
