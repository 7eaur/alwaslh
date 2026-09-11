# PROJECT RESUME SNAPSHOT — الوسيلة الذكية

> Replacement-conversation checkpoint. GitHub/code/CI outrank this file. Anything not inspected/executed = `NOT YET VERIFIED`.

Last synchronized: **2026-09-11**.

## Resume identity

- Repo: `7eaur/alwaslh`
- Student branch: `parallel/stage14-student-product`
- Ledger: Issue #16
- Detailed handoff: `docs/workstreams/STAGE16_STUDENT_HANDOFF.md`
- Deployment: deferred

## Verified checkpoints

- Stage14: `ac55f1435d232cadff334816407f1182125dda90` — CLOSED / VERIFIED.
- Canonical Stage13F baseline: `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`.
- Stage13F→Student: `4a476e1f29cb605fce294d7c34fd68e8218a32e8` — VERIFIED.
- Stage15: `9a787b7c0f6bd3ed12f24de92546c33fcc21e26d` — CLOSED / VERIFIED.
- Stage16 PWA: `c1ae86036d4d302b8ca8c411227f41c37b4063ef` — VERIFIED.
- Stage16 server lease: `5b71aa2a3bfbf2a9b7d1c6ec7a3762033ac9cacd` — VERIFIED.
- Stage16 current verified runtime boundary: `53aeb972c4c891c3eecafdde0716b544751d2711` — bounded lease client persistence/lifecycle VERIFIED.

## Exact executable evidence

- Stage16 run `34551931757` — SUCCESS:
  - PostgreSQL bounded lease PASS;
  - strict Student build PASS;
  - PWA shell real Chromium PASS;
  - IndexedDB lifecycle/rollback real Chromium 3/3 PASS.
- Stage14 run `34551931610`, attempt 2 — SUCCESS on the same exact runtime:
  - lint/typecheck/Vitest 22/22/build PASS;
  - curriculum/Reader contracts PASS;
  - full Student Chromium suite PASS.

Attempt 1 had one isolated Assessment selector assertion failure that was not reproducible on unchanged rerun and occurred without any Assessment code change from an earlier passing point. Do not classify it as a product regression unless it reproduces; no test was weakened.

## What Stage16 currently guarantees

- Service Worker caches app shell/static assets only; `/v1` excluded.
- protected Reader/API remains `private,no-store`.
- offline lease is server-issued and bound to profile/device/server time/session/entitlement.
- maximum lease 24h; grants clipped by entitlement expiry.
- IndexedDB `alwaslh-student-offline` v1 currently stores only `leases`, scoped `profileId:deviceId`.
- activation/login/restore refresh and persist lease metadata best-effort.
- logout/session expiry/device rebind cleanup is precisely scoped.
- reload-safe cleanup uses only a non-secret `{profileId,deviceId}` pointer in `sessionStorage`.
- >5 minute backward wall-clock movement rejects local lease use.
- no protected lesson/media blobs exist yet.

## Open Stage16 boundary

Protected offline content is **NOT YET VERIFIED / NOT YET IMPLEMENTED**. Before any blob is stored the system must define:

- explicit authorized download manifest;
- stable lesson/asset IDs;
- content revision/provenance;
- SHA-256/checksum;
- byte sizes;
- account/device storage budget;
- exact per-download accounting;
- failure rollback;
- deterministic eviction/removal.

Reconnect must later revalidate lease/entitlements/publication and purge revoked/expired/unpublished material.

`content_revisions`, `content_tombstones`, `sync_checkpoints` remain dormant/unwired; they are not current sync authority.

## Findings

- `STUDENT-016-LEASE-002` — FIXED / VERIFIED for lease boundary.
- `STUDENT-016-QA-004` — FIXED / VERIFIED.
- `STUDENT-016-CLIENT-005` — FIXED / VERIFIED.
- `STUDENT-016-CACHE-003` — OPEN / NEXT DESIGN.
- `STUDENT-016-DOWNLOAD-006` — OPEN / NEXT.
- `STUDENT-016-REVOCATION-007` — OPEN.
- `STUDENT-016-SYNC-001` — OPEN / PROVEN.
- `STUDENT-016-OUTBOX-008` — OPEN.

## Mandatory startup order

1. `README.md`
2. `DOCUMENTATION_INDEX.md`
3. `docs/workstreams/STAGE14_PLUS_STUDENT_TRACK.md`
4. `docs/workstreams/STUDENT_PRODUCT_TRACK_STATUS.md`
5. `docs/workstreams/STAGE16_STUDENT_HANDOFF.md`
6. `PROJECT_HANDOFF.md`
7. `PROJECT_STATUS.md`
8. `PROJECT_RESUME_SNAPSHOT.md`
9. `PROJECT_ENGINEERING_LOG.md`
10. `PROJECT_INTEGRATION_CONTINUITY.md`
11. `PROJECT_EXECUTION_QUEUE.md`
12. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`
13. `MASTER_REBUILD_ROADMAP.md` Stage16
14. latest Issue #16
15. live Student branch + main + Actions
16. actual Reader/content/media/offline code/tests/workflows

## Exact continuation

Recheck live shared state → inspect canonical Reader/content/publication/media implementation → define explicit protected download manifest + budget/checksum/accounting/rollback/eviction → implement smallest compatible contract → materialize account/device-scoped content + real Chromium → reconnect revalidation/purge → revision/tombstone/delta/outbox → Stage16 closure. Do not start Stage17 or deployment.
