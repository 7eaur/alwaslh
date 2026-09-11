# DOCUMENTATION INDEX — الوسيلة الذكية

> Official project memory map. A new engineering conversation starts here and does not rely on previous chat memory.

Last synchronized: **2026-09-11 — Track B Stage16 ACTIVE.**

## 1. Source-of-truth precedence

When sources conflict:

1. current code + PostgreSQL migrations + executable CI/test evidence;
2. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`;
3. branch-specific active-stage handoff/status;
4. `PROJECT_HANDOFF.md` + `PROJECT_STATUS.md`;
5. `PROJECT_RESUME_SNAPSHOT.md`;
6. `PROJECT_ENGINEERING_LOG.md`;
7. `PROJECT_INTEGRATION_CONTINUITY.md`;
8. `PROJECT_EXECUTION_QUEUE.md`;
9. specialized stage/product docs;
10. Roadmap + Legacy Coverage;
11. historical docs.

Anything not inspected/executed = `NOT YET VERIFIED`.

## 2. Mandatory startup — Track B Student Product

1. `README.md`
2. `DOCUMENTATION_INDEX.md`
3. `docs/workstreams/STAGE14_PLUS_STUDENT_TRACK.md`
4. `docs/workstreams/STUDENT_PRODUCT_TRACK_STATUS.md`
5. **`docs/workstreams/STAGE16_STUDENT_HANDOFF.md`**
6. `PROJECT_HANDOFF.md`
7. `PROJECT_STATUS.md`
8. `PROJECT_RESUME_SNAPSHOT.md`
9. `PROJECT_ENGINEERING_LOG.md`
10. `PROJECT_INTEGRATION_CONTINUITY.md`
11. `PROJECT_EXECUTION_QUEUE.md`
12. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`
13. `MASTER_REBUILD_ROADMAP.md` for current stage
14. latest GitHub Issue #16 body/comments
15. live current Student branch + `main` + GitHub Actions
16. current-stage DB/API/Frontend/tests/workflows

`NEXT_CONVERSATION_PROMPT.md` is a launcher only; if it conflicts with live GitHub, live evidence wins.

## 3. Operating model

- Track A: Backend/Admin/AI/Question Bank/Quiz Builder/Stage13G.
- Track B: Student Product on `parallel/stage14-student-product`.
- Issue #16 is shared execution ledger.
- Track B consumes canonical shared authority and must not duplicate it.
- minimal shared API changes are allowed only when a Student dependency is proven and the change is documented/non-conflicting.
- deployment/hosting remains deferred.

## 4. Central state files

| File | Purpose |
|---|---|
| `docs/workstreams/STUDENT_PRODUCT_TRACK_STATUS.md` | branch-specific Student stage state |
| `docs/workstreams/STAGE16_STUDENT_HANDOFF.md` | detailed current Stage16 architecture, evidence, blocker and exact continuation |
| `PROJECT_HANDOFF.md` | replacement-engineer startup and current handoff |
| `PROJECT_STATUS.md` | concise current status/gates |
| `PROJECT_RESUME_SNAPSHOT.md` | exact continuation snapshot |
| `PROJECT_ENGINEERING_LOG.md` | architecture decisions, findings, changes and verification |
| `PROJECT_INTEGRATION_CONTINUITY.md` | cross-track/shared-file continuity |
| `PROJECT_EXECUTION_QUEUE.md` | ordered next work |
| `docs/product/CURRENT_PRODUCT_OVERRIDES.md` | Product Owner overrides |
| `MASTER_REBUILD_ROADMAP.md` | stage sequence |
| `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` | legacy capability acceptance |
| `NEXT_CONVERSATION_PROMPT.md` | copy/paste launcher for a new conversation |

## 5. Current verified checkpoints

- Stage14 Student: `ac55f1435d232cadff334816407f1182125dda90` — CLOSED / VERIFIED.
- canonical Stage13F main: `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`.
- Stage13F→Student integration: `4a476e1f29cb605fce294d7c34fd68e8218a32e8` — VERIFIED.
- Stage15 Student: `9a787b7c0f6bd3ed12f24de92546c33fcc21e26d` — CLOSED / VERIFIED.
- Stage16 Batch 1 PWA shell: `c1ae86036d4d302b8ca8c411227f41c37b4063ef` — VERIFIED, run `34430284173`.
- Stage16 bounded server lease/PWA boundary: `5b71aa2a3bfbf2a9b7d1c6ec7a3762033ac9cacd` — VERIFIED:
  - Stage16 `34430915847` SUCCESS;
  - API Regression `34430915786` SUCCESS.

Latest code checkpoint before this documentation sync:

`2c44a363638221ee2985ecb6b8fb71c3e757a333` — **NOT VERIFIED** because Student strict typecheck fails in `offline-store.ts:85` with TS18047.

On that code checkpoint:

- ESLint PASS;
- Vitest 22/22 PASS;
- PostgreSQL offline lease contract PASS;
- Student Product `34431220808` FAIL at typecheck;
- Stage16 `34431220827` overall FAIL from same build error; PostgreSQL job PASS, Chromium skipped.

## 6. Current implementation sequence

```text
Stage14 CLOSED / VERIFIED
→ Stage15 CLOSED / VERIFIED
→ Stage16A safe PWA shell VERIFIED
→ Stage16B1 server-issued bounded lease VERIFIED
→ Stage16B2 client lease store: fix current TS error + exact-head verify
→ Stage16C lease lifecycle + IndexedDB browser acceptance
→ Stage16D explicit protected lesson download + budgets/checksum
→ Stage16E offline content + reconnect revocation/purge
→ Stage16F revisions/tombstones/delta/outbox
→ Stage16 closure
→ Stage17 only after Stage16 closes
```

## 7. Current Stage16 security rules

- `/v1` is not Service Worker cache authority.
- current Reader protected responses remain `private,no-store`.
- offline lease is server-issued metadata, not content.
- no auth credential or device private key in Stage16 IndexedDB.
- IndexedDB scope is account/device.
- browser clock is not entitlement authority.
- no auto `skipWaiting` / forced reload.
- existing sync tables are dormant until verified wiring exists.

## 8. Exact first action

Fix only the TS18047 narrowing in `apps/student-web/src/offline-store.ts` around line 85, preserve behavior/strictness, then rerun exact-head Student Product + Stage16 PWA before adding new Stage16 behavior.

## 9. Documentation maintenance

After every meaningful batch:

1. update `docs/workstreams/STAGE16_STUDENT_HANDOFF.md` and Student Track Status;
2. update central Status/Resume/Engineering Log/Continuity/Queue when truth changes;
3. update `NEXT_CONVERSATION_PROMPT.md` if the continuation point changes materially;
4. add execution report to Issue #16;
5. record exact HEAD + run IDs + failures/root cause/fix + open `NOT YET VERIFIED` work;
6. never leave continuation-critical state only in chat.
