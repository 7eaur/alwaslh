# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Engineering source of truth for project understanding, architecture decisions, findings, changes, verification and remaining work. Code/migrations/executable CI outrank prose.

Last consolidated: **2026-09-11 — Stage14/15 closed; Stage16 active; protected materialization verified; scoped Grade 9 English live media proof verified.**

Historical detail remains in Git history and specialized docs. Current Student continuation lives in `docs/workstreams/STAGE16_STUDENT_HANDOFF.md`.

## 1. Project understanding

**الوسيلة الذكية** منصة تعليمية عربية ذات Student Web + Super Admin Web فوق Fastify/PostgreSQL. Browser surfaces are presentation/resilience layers; canonical Auth, devices, entitlements, curriculum publication, Question Bank/Quiz publication and assessment scoring/history remain server/PostgreSQL authority.

Primary runtime surfaces:

- `apps/student-web` — Student product / PWA.
- `apps/admin-web` — Super Admin.
- `apps/api` — authoritative API.
- `database/migrations` — PostgreSQL integrity authority.

Track A owns Backend/Admin/AI/Question Bank/Quiz Builder/Stage13G by default. Track B owns Student Product. Issue #16 is the shared ledger. Final release/cutover is not declared; a Railway inspection/dev stack is live and was used for the scoped Grade 9 English production-content proof recorded below.

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
- legacy/source media bootstrap may materialize bytes and create curriculum drafts, but may not auto-publish to Student.

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
| Railway inspection/dev deployment | **LIVE / VERIFIED** for current inspection stack and scoped Grade 9 English proof |
| Final release/cutover | NOT DECLARED / future product decision |

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
- **AD-188** — legacy media bootstrap must be source-revision pinned, explicitly allow-listed, bounded, idempotent, preserve canonical order/provenance, use the existing Media Pipeline, and link lesson assets as **Draft only**. It may never bypass Admin review/publication authority.
- **AD-189** — for the API monorepo deployment, accepted Railway builds must load `apps/api/Dockerfile`. A manual redeploy that falls back to root Railpack is not equivalent and must not be used as acceptance evidence. Commit-based source deployment is the verified fallback when Railway manual redeploy selects the wrong builder path.

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

## 6. Production content proof — Grade 9 English — VERIFIED

### 6.1 Scope and safety boundary

The first live media materialization was intentionally limited to one canonical subject rather than bulk-importing all 5,552 source images.

- source repository: `7eaur/alwaslh-go`;
- pinned source revision: `f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`;
- allow-listed scope: `grade-9 / english`;
- source document: `تاسع انجليزي/الانجليزي_تاسع`;
- manifest contract: exactly 75 ordered source entries;
- runtime feature merged through PR #34; `main` bootstrap checkpoint `ce36c0843bc7e6918afb1260ac21639cefc457cb`;
- source bytes pass through the existing `MediaPipelineService` / mounted media storage; no direct storage-key bypass;
- curriculum links are created with `publication_status='draft'`; no Student publication is implied by `media_assets.status='ready'`.

### 6.2 Executed result

Railway bootstrap execution `8428981b-aa6d-4927-b1f9-31545265e3f9` emitted `legacy_subject_bootstrap_complete` with the following exact values:

- source images: **75**;
- source bytes: **8,390,689**;
- ready media assets: **75**;
- media variants: **300** (`source/display/thumbnail/ai`);
- draft lesson assets: **75**;
- source-authored lessons: **10**;
- replayed media assets during first execution: **0**.

The temporary bootstrap execution did not constitute Student publication. Human review/publish remains required before these assets become Student-visible.

### 6.3 Stable runtime restoration

After the one-shot bootstrap, the API service was restored to its normal runtime contract:

- start command: `node apps/api/dist/server.js`;
- pre-deploy migration command retained;
- healthcheck: `/ready`, 120 seconds;
- restart policy: `ON_FAILURE`, max 5;
- build source: `apps/api/Dockerfile`;
- media volume remains mounted at `/app/runtime-data/media`.

Final stable deployment: `5b889f87-24a5-4fc4-b061-9aeea3f5bea6` — **SUCCESS**. Runtime log confirmed the server listening and Railway `/ready` healthcheck returned **HTTP 200**.

Full-source byte materialization remains **NOT YET VERIFIED / NOT EXECUTED**. Stage9 still proves the complete 5,552-image inventory/import metadata contract, while this live proof materialized bytes for only the allow-listed Grade 9 English subject.

## 7. Root-cause record

### Railway manual redeploy builder mismatch — MITIGATED / VERIFIED

After changing the API start command for the one-shot bootstrap, Railway manual redeploys `9b09e001-dcb8-4a54-b228-34da284b1cf4` and `2a3c6cf3-9657-43d6-b013-e0b04675a591` incorrectly built the repository root with Railpack even though service configuration exposed `dockerfilePath=apps/api/Dockerfile`. Root Railpack failed at `pnpm install --frozen-lockfile --prefer-offline` with `packages field missing or empty`.

This was not a product-code failure. A commit-based deployment of the same `ce36c084...` source through Railway used `apps/api/Dockerfile` correctly and executed the bootstrap. The final normal API deployment used the same verified Dockerfile path and succeeded.

### Railway start-command shell chaining assumption — CORRECTED

The temporary command included `&& node apps/api/dist/server.js`. The bootstrap completed, but Railway did not transition to the server process as expected. The CLI itself was verified to close PostgreSQL in a `finally` block, so no database connection leak existed. The runtime was restored with a single direct server start command. Future one-shot operations must not depend on implicit shell semantics in Railway start-command parsing; use a dedicated entrypoint or an explicitly invoked shell when chaining is actually required.

### IndexedDB v2 browser helper defect — FIXED / VERIFIED

Browser tests opened DB explicitly at v1 after runtime upgraded to v2, causing a version error unrelated to product behavior. Helpers now open the installed schema and create required legacy store only for a new DB.

### Student `contentRevision` BIGINT contract defect — FIXED / VERIFIED

PostgreSQL returned `BIGINT` as a string while Reader/browser code used numeric revision state. Result: `"1" !== 1` and a freshly downloaded package appeared stale. Fixed at API boundary by normalizing to a safe numeric value; API Regression passed.

### Renewable lease assertion defect — FIXED / VERIFIED

Download UI refreshes the lease. Acceptance previously required byte-for-byte timestamp equality. It now verifies stable profile/device/grant authority while allowing expected issue/expiry renewal.

### Learning hierarchy regression — FIXED / VERIFIED

Download management was initially placed between Curriculum and Assessment. Final order preserves the core learning flow: **Curriculum → Assessment → Downloads → Access**.

## 8. Audit findings

| ID | Sev | Area | Problem | Solution / next action | Status |
|---|---:|---|---|---|---|
| `CONTENT-PROD-001` | P1 | Media / Curriculum | canonical source inventory existed but no live bounded source-byte materialization proof existed | source-pinned allow-listed Grade 9 English bootstrap through existing Media Pipeline; Draft-only curriculum links | FIXED / VERIFIED FOR ONE-SUBJECT PROOF |
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

## 9. Security analysis for cold-offline

Current package bytes are integrity-verified at write time, but the persisted authorization metadata is not cryptographically authenticated. `offlineLessonPackageAllowsUse()` consumes locally stored lease grants/timestamps. Therefore the current package must **not** be rendered as protected content after a cold browser restart solely from that mutable local metadata.

The next authority must be a server-signed canonical envelope covering profile/device/class/lesson/revision/publication/issued/expiry plus asset IDs/checksums/sizes. Student Web verifies with a known public verification key and fails closed on any mismatch. Stored blobs are rehashed before use.

Important limitation: web clients are not trusted execution environments against a hostile user who controls DevTools/browser storage. The product security goal is authentic server authorization, tamper detection in normal application operation, bounded expiry, account/device isolation and reconnect revocation—not DRM.

## 10. Known issues / remaining work

- Grade 9 English imported media remains Draft and requires normal Admin review/publish before Student visibility;
- full 5,552-image source byte materialization remains a separate controlled batch and is NOT YET VERIFIED;
- signed offline authorization + key lifecycle;
- durable non-secret active scope discovery across browser restart;
- true cold-start offline Reader from signed materialized bytes;
- reconnect session/device/entitlement/publication/revision revalidation + purge;
- authoritative revision writers/tombstones/server cursor/delta client application;
- bounded outbox only for later product-authorized offline writes;
- Stage17 blocked until Stage16 closes;
- final release/cutover is not declared even though the Railway inspection/dev stack is live.

## 11. Exact next action

For Student engineering: implement signed server-authentic lesson authorization → client signature + signed-field verification → read-time blob checksum → durable non-secret scope selector → real Chromium cold browser restart with network unavailable → reconnect purge → delta/tombstone/outbox → Stage16 closure.

For imported content: perform human review of the 75 Grade 9 English Draft assets and publish only approved content through the existing Admin publication flow. Expand media materialization to additional subjects only as separate bounded, verified batches after this proof.
