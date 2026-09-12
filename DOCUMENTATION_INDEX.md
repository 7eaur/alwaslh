# DOCUMENTATION INDEX — الوسيلة الذكية

> Official project memory map. A replacement engineering conversation starts here and must be able to continue from GitHub without prior chat memory.

Last synchronized: **2026-09-12 — unified `main`; Stage16 ACTIVE; Railway inspection/dev live.**

## 1. Source-of-truth precedence

When sources conflict, use this precedence:

1. current `main` code + PostgreSQL migrations + executable CI/test evidence;
2. live Railway state when the question is about the hosted runtime;
3. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`;
4. current-stage handoff/status (`docs/workstreams/STAGE16_STUDENT_HANDOFF.md`);
5. `PROJECT_HANDOFF.md` + `PROJECT_STATUS.md`;
6. `PROJECT_RESUME_SNAPSHOT.md`;
7. `PROJECT_ENGINEERING_LOG.md`;
8. `PROJECT_INTEGRATION_CONTINUITY.md`;
9. `PROJECT_EXECUTION_QUEUE.md`;
10. specialized deployment/content docs;
11. Roadmap + Legacy Coverage + historical workstream docs.

Anything not inspected/executed = `NOT YET VERIFIED`.

## 2. Mandatory startup order for the next conversation

Read in this order:

1. `README.md`
2. `DOCUMENTATION_INDEX.md`
3. **`docs/workstreams/UNIFIED_PROJECT_RESUME_PROTOCOL.md`** — full product/repository recovery + staged gap-audit protocol
4. `PROJECT_HANDOFF.md`
5. `PROJECT_STATUS.md`
6. `PROJECT_RESUME_SNAPSHOT.md`
7. `PROJECT_ENGINEERING_LOG.md`
8. `PROJECT_INTEGRATION_CONTINUITY.md`
9. `PROJECT_EXECUTION_QUEUE.md`
10. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`
11. **`docs/workstreams/STAGE16_STUDENT_HANDOFF.md`**
12. `docs/workstreams/STUDENT_PRODUCT_TRACK_STATUS.md`
13. `docs/workstreams/STAGE14_PLUS_STUDENT_TRACK.md`
14. `docs/operations/RAILWAY_LIVE_STATE.md`
15. `docs/content/LIVE_CONTENT_IMPORT_STATUS.md`
16. `MASTER_REBUILD_ROADMAP.md`
17. `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md`
18. `PRODUCT_FEATURE_PARITY_MATRIX.md`
19. latest GitHub Issue #16 body/comments
20. live `main` HEAD + Actions + Railway service state
21. actual current Stage16 API/Student code/tests/workflow before coding.

`NEXT_CONVERSATION_PROMPT.md` is the copy/paste launcher. It must send the new conversation through `UNIFIED_PROJECT_RESUME_PROTOCOL.md` before implementation. Live evidence wins if anything differs.

## 3. Current operating model

The old parallel Track A/Track B model is **historical for new work**.

Product Owner direction after Stage13G closure:

- Stage13G + latest Student Product were integrated into `main` through PR #33;
- PR #33 verification head `dcdae7579a40878c71f64593280a0df2f8363ee2` passed **19/19 workflows**;
- merge commit: `5e22c3ff157b42b6da47febe205dd91fcb264eed`;
- all remaining work after Stage13 is owned as one continuation;
- new batches start from live `main` using short-lived branches;
- old long-lived Stage13G/Student branches are historical/reference, not the integration baseline.

Detailed authority: `docs/product/CURRENT_PRODUCT_OVERRIDES.md` PO-OVR-009.

## 4. Central state files

| File | Purpose |
|---|---|
| `docs/workstreams/UNIFIED_PROJECT_RESUME_PROTOCOL.md` | mandatory full product/repository understanding, historical-stage verification, gap-audit and execution protocol for replacement conversations |
| `PROJECT_HANDOFF.md` | detailed replacement-engineer startup, current architecture, hosting/content status and exact continuation |
| `PROJECT_STATUS.md` | concise current state and open gates |
| `PROJECT_RESUME_SNAPSHOT.md` | compact exact restart snapshot |
| `PROJECT_ENGINEERING_LOG.md` | architecture decisions, findings, root fixes, verification and remaining work |
| `PROJECT_INTEGRATION_CONTINUITY.md` | unified-main/shared-contract/deployment continuity |
| `PROJECT_EXECUTION_QUEUE.md` | ordered remaining work through Stage29 |
| `docs/product/CURRENT_PRODUCT_OVERRIDES.md` | latest Product Owner execution decisions |
| `docs/workstreams/STAGE16_STUDENT_HANDOFF.md` | detailed active Stage16 implementation/security boundary |
| `docs/workstreams/STUDENT_PRODUCT_TRACK_STATUS.md` | Student/runtime stage status |
| `docs/operations/RAILWAY_LIVE_STATE.md` | Railway project/services/domains/build/deploy/volume/runbook |
| `docs/content/LIVE_CONTENT_IMPORT_STATUS.md` | canonical content source, Grade9 English proof, publication/bulk-import rules |
| `MASTER_REBUILD_ROADMAP.md` | Stage1–29 product sequence |
| `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` | legacy capability acceptance |
| `NEXT_CONVERSATION_PROMPT.md` | copy/paste master resume launcher |

## 5. Current integrated baseline

Master handoff checkpoint after PR #36:

`6ee5ad9d0bde8faa690b9eb7a923a1c8a12687b4`

PR #36 documentation/handoff verification passed **15/15 workflows SUCCESS** before merge.

This baseline includes:

- PR #33 integrated Stage13G + Student Stage14/15/current Stage16;
- Railway Docker/runtime fixes for API/Admin/Student;
- PR #34 Grade 9 English scoped canonical content bootstrap;
- PR #35 live-content documentation proof;
- synchronized unified project handoff in PR #36.

Always re-read live `main`; do not assume this SHA remains HEAD forever.

## 6. Verified stage state

- Stage1–10 + OCR — VERIFIED.
- Stage11 provider-neutral AI contracts — VERIFIED.
- Stage12 durable AI runtime — VERIFIED backend/runtime; `AI-012..AI-019` live provider readiness remains open.
- Stage13A–G — VERIFIED / CLOSED and integrated into `main`.
- Stage14 Student Product — CLOSED / VERIFIED.
- Stage15 Practice/Assessment — CLOSED / VERIFIED.
- **Stage16 Offline/PWA — ACTIVE / PARTIALLY VERIFIED.**
- Stage17+ — pending Stage16 closure.

### Stage16 current verified boundary

Current `main` contains and CI has verified:

- safe Service Worker shell; `/v1` excluded;
- bounded server lease;
- account/device IndexedDB lifecycle;
- protected lesson manifest/assets;
- exact bytes + SHA-256 verification;
- 64 MiB lesson / 256 MiB scope budget;
- atomic package storage/replacement/removal;
- ES256 server-signed offline authorization envelope;
- Student-side key-ID/signature/canonical-manifest verification before storage.

PR #33 head Stage16 run `34560999667` — all three Stage16 jobs SUCCESS, including API signing policy + PostgreSQL offline contracts + real Chromium protected materialization.

### Stage16 not yet closed because

- durable active offline scope still uses `sessionStorage` and disappears on a true browser restart;
- cold-start offline Reader is not implemented/accepted;
- stored signed authorization is not yet re-verified as read-time authority before rendering;
- stored blobs are not yet re-hashed at every offline use;
- reconnect revocation/publication/revision purge remains open;
- revision/tombstone/cursor/delta/outbox flow remains unwired.

## 7. Hosted runtime

Railway inspection/dev stack is live:

- Student: `https://alwaslh-dev-student-7eaur-production.up.railway.app`
- Admin: `https://alwaslh-dev-admin-7eaur-production.up.railway.app`
- API: `https://alwaslh-dev-api-7eaur-production.up.railway.app`
- PostgreSQL: Railway private service.

Latest known statuses at this sync: API/Admin/Student/PostgreSQL **SUCCESS**.

This is not Stage28 final cutover. Read `docs/operations/RAILWAY_LIVE_STATE.md` before changing deployment settings.

## 8. Content state

Canonical source: `7eaur/alwaslh-go@f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`.

- full Stage9 inventory: 48 documents / 5,552 images;
- live byte materialized sample: Grade 9 English only;
- sample result: 75 source images, 75 ready media assets, 300 variants, 75 Draft lesson assets, 10 lessons;
- Student visibility: **NO** until normal Admin review/publication;
- old Supabase content import: **OUT OF CURRENT SCOPE**.

Read `docs/content/LIVE_CONTENT_IMPORT_STATUS.md` before importing/publishing more content.

## 9. Remaining roadmap summary

Exact sequence after current work:

1. Stage16 closure.
2. Stage17 Personal Learning Data.
3. Stage18 Notifications.
4. Stage19 Progress / Statistics / Achievements.
5. Stage20 Import / Export / Reporting closure.
6. Stage21 Performance Engineering.
7. Stage22 Security Hardening.
8. Stage23 Tests & CI Expansion.
9. Stage24 Accessibility / Device QA.
10. Stage25 Initial Data / Content Load.
11. Stage26 Staging.
12. Stage27 Release Gate.
13. Stage28 Production Cutover.
14. Stage29 Monitoring & Operations.

`AI-012..AI-019` remains a cross-cutting open requirement before final release if live AI is part of the release candidate.

## 10. Exact first engineering action

Do **not** redesign or bulk-import content first, and do not trust historical CLOSED labels blindly.

First run the recovery/audit protocol in `docs/workstreams/UNIFIED_PROJECT_RESUME_PROTOCOL.md`:

- reconstruct product/users/flows/architecture/DB/API/frontend/deployment/content map from actual source;
- live-check current evidence;
- verify adjacent closed-stage contracts and executable coverage;
- open/fix any proven correctness/security/integrity gap in the owning layer;
- then finish the first incomplete `PROJECT_EXECUTION_QUEUE.md` item for Stage16.

Current expected Stage16 continuation:

- durable non-secret offline scope discovery;
- verify stored signed authorization at use time;
- re-hash stored blobs at use time;
- cold-start offline Reader with network unavailable;
- tamper/expiry/clock-rollback fail-closed behavior;
- reconnect revalidation/purge;
- revision/tombstone/cursor/delta/outbox;
- one exact-head Stage16 closure matrix + synchronized docs.

A separate controlled content task may review/publish the already imported Grade 9 English Draft sample without changing the Stage16 architecture.
