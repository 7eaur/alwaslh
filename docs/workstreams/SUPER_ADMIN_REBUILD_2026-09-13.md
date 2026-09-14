# Super Admin Rebuild — 2026-09-13

Status: **HISTORICAL / SUPERSEDED FOR FUTURE EXECUTION**

Branch: `rebuild/super-admin-foundation`  
Draft PR: `#52 — refactor(admin): rebuild Super Admin foundation`  
Verified AR-09 production exact-head: `c755b209bfa67980afee0ed150bd43b3574b0a3b`.  
Verified final Admin accessibility/runtime baseline before architecture pivot: `302127c3223d00715f1d960f37c7d25044b6b20e`, Stage13G `34793896054` — SUCCESS.

> This document preserves the verified AR-01..AR-10 history. It is no longer the active execution roadmap after the 2026-09-14 platform architecture decision.

## Superseding workstream

Active architecture roadmap:

`docs/workstreams/PLATFORM_ARCHITECTURE_REBUILD_2026-09-14.md`

The former rule that AR-10 must make only the smallest accessibility/RTL/performance/visual fix and must not redesign/rebuild already-working surfaces is **superseded**.

The new requirement is to evaluate the platform from first principles and rebuild structural ownership, data flow, design-system boundaries and application composition in a controlled, parity-proven migration.

Do not resume the old AR-10 polish loop.

## Verified roadmap history

- AR-01 — DONE / VERIFIED.
- AR-02 — DONE / VERIFIED.
- AR-03 — DONE / VERIFIED.
- AR-04 — DONE / VERIFIED.
- AR-05 — DONE / VERIFIED.
- AR-06 — DONE / VERIFIED.
- AR-07 — DONE / VERIFIED.
- AR-08 — DONE / VERIFIED.
- AR-09 — Cleanup + architecture ownership enforcement — DONE / VERIFIED.
- AR-10 accessibility/runtime baseline — valid work preserved; final baseline `302127c3223d00715f1d960f37c7d25044b6b20e` passed Stage13G `34793896054` including Admin UI, backend/integration and Real API + PostgreSQL + Chromium.

## Important preserved decisions

The architecture rebuild must not silently discard the product truths established by this workstream:

- primary Admin work is route-owned and deep-linkable;
- Overview is attention-first;
- Operations owns Health/Audit/Diagnostics;
- technical IDs/provider/runtime/storage/hash/raw JSON stay advanced-only unless a scenario genuinely requires them;
- Student and Access Codes remain separate task owners;
- server authority remains canonical for publication/review/revision/access/security/assessment;
- test contracts are not weakened to ease migration;
- a legacy owner is removed only after its replacement has executable parity.

These are product/authority decisions, not permission to preserve the old file structure.

## AR-09 closure evidence

Final AR-09 production exact-head `c755b209bfa67980afee0ed150bd43b3574b0a3b` passed:

- Frontend `34789114130` — SUCCESS;
- Admin AI `34789114112` — SUCCESS;
- Combined `34789114110` — SUCCESS;
- Stage13G `34789114192` — SUCCESS;
  - backend `103809925133`;
  - Admin UI `103809925136`;
  - Real API + PostgreSQL + Chromium `103810061281`.

## Final AR-10 accessibility/runtime evidence before pivot

Accessibility work established shared focus visibility and reduced-motion behavior, added real-browser accessibility checks, and exposed a real focus-management defect after authentication because the session transition happened without a pathname change.

The product defect was fixed at:

`302127c3223d00715f1d960f37c7d25044b6b20e` — `fix(admin): restore route focus after authentication`

Stage13G `34793896054` completed fully green:

- Admin UI `103823172953` — SUCCESS;
- Admin operations backend `103823173114` — SUCCESS;
- Real API + PostgreSQL + Chromium `103823326277` — SUCCESS.

This baseline is the executable safety point used by the new architecture workstream.

## Handoff

Continue only from `PLATFORM_ARCHITECTURE_REBUILD_2026-09-14.md`, beginning at PA-00. Preserve the verified behavior above as migration evidence, but do not use the historical Admin file layout as the target architecture.

PR #52 remains Draft. No merge or auto-merge.