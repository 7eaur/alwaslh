# STUDENT UX/UI V2 — EXECUTION LOG

Date: 2026-09-14
Branch: `ux/student-experience-v2`
PR: `#58`
Status: **ACTIVE / DRAFT / NOT MERGE-READY UNTIL CI + VISUAL QA**

## Approved direction

Product Owner approved the Student Experience V2 visual/interaction direction after review of current hosted Student UI and generated high-fidelity direction screens.

Primary problems being corrected:

- editorial/newspaper-like page composition;
- oversized repeated headings and helper copy;
- duplicated navigation destinations;
- card/border overload;
- teal overuse reducing hierarchy;
- weak app-like page transitions/affordance;
- Account destructive action over-prioritization;
- Library overview duplication;
- bottom-navigation overlap/safe-area risk;
- inconsistent page chrome across Student surfaces;
- route-level re-fetch/flicker risk;
- future feature surfaces being arranged before authoritative data is available.

## V2-00 — Architecture freeze

**DONE on branch**

Created:

- `docs/product/STUDENT_EXPERIENCE_V2.md`
- `docs/product/STUDENT_DATA_RESIDENCY_AND_CACHE_V2.md`
- `docs/workstreams/STUDENT_UX_V2_EXECUTION_PLAN.md`

Decisions:

- Home is the Student overview, not a duplicate menu.
- Home App Bar shows official mark + `الوسيلة الذكية`.
- Other primary pages show page title in App Bar.
- phone bottom navigation remains exactly Home/Learn/Practice/Library.
- Reader/active assessment suppress global bottom navigation.
- no assumed student name or fixed class card.
- no fabricated metrics.
- neutral-first palette with teal as accent/orientation.
- Cairo is the intended self-hosted Student font before release.
- one outline icon system.
- UI reserves future capability placement without fabricating backend behavior.

## V2-01 — Foundation / Shell / Home

**IMPLEMENTATION STARTED**

Created:

- `apps/student-web/src/student-theme-v2.css`
- `apps/student-web/src/student-icons.tsx`
- `apps/student-web/src/student-runtime-cache.ts`

Updated:

- `apps/student-web/src/main.tsx`
- `apps/student-web/src/student-access.tsx`
- `apps/student-web/src/student-shell.css`

### Shell changes

- Home uses the existing official Student app mark plus `الوسيلة الذكية`.
- Non-Home primary destinations use page title in App Bar.
- notification/account actions are compact icon controls.
- four-item mobile bottom navigation rebuilt with safe-area ownership, persistent labels, subtle selected state and press feedback.
- removed blur/glass processing from the bottom navigation for lower rendering cost and visual restraint.
- mobile content bottom padding is owned by the shell so pages do not need independent overlap hacks.

### Home changes

Old destination-card wall was removed.

Home now composes from real available sources only:

- generic greeting;
- subject count;
- lesson count;
- available quiz/practice count;
- real local download count when active offline scope exists;
- up to three subject shortcuts;
- last real attempt when available.

Stage17 Notes/Saved/Needs Review values are intentionally not fabricated.

### Runtime cache foundation

Added profile-scoped memory read-through caching:

- curriculum TTL: 2 minutes;
- quiz catalog TTL: 1 minute;
- recent attempts TTL: 30 seconds;
- concurrent identical requests share the same pending Promise;
- access changes invalidate curriculum/practice cache entries;
- cache is display optimization only and cannot grant authorization.

Durable curriculum/quiz IndexedDB snapshots are deferred until authoritative Stage16 revision/tombstone/cursor semantics exist.

## Local-data direction

Planned device-local/account-scoped personal data after Stage17 contract closure:

- Notes;
- Saved/bookmarked questions;
- Needs Review state;
- reader/device preferences.

Rules:

- IndexedDB for personal records and media Blobs;
- stable source identity/provenance;
- no base64 attachment store;
- no cross-account visibility;
- explicit logout/reset retention semantics;
- no fake sync queue before server backup/sync is approved.

Existing downloaded lesson packages remain in the verified Stage16 offline package store. No duplicate lesson-byte cache is introduced.

## PR #57 boundary

Open PR #57 (`stage16/student-016i`) changes `App.tsx`, `student-learning.tsx`, `student-reader.tsx`, offline Reader files/tests and top-level status/handoff/log.

Therefore this initial V2 batch intentionally does **not** rewrite Learn/Reader or the top-level status/handoff/log files. Those changes must be reconciled after PR #57 exact-head outcome to avoid overwriting verified cold-start offline Reader work.

## Next implementation order

1. verify exact-head PR #58 CI for current foundation;
2. Welcome / Activation / Login V2;
3. reconcile PR #57;
4. Learn / Subject scalability;
5. focused Reader;
6. Practice / Models / Result;
7. Library / Account / Notifications / Progress / Help;
8. Stage17 local-personal repositories;
9. performance/accessibility/device visual QA;
10. synchronize top-level `PROJECT_STATUS.md`, `PROJECT_HANDOFF.md`, `PROJECT_ENGINEERING_LOG.md` after overlapping Student branch reconciliation.

## Current verification state

GitHub Actions was triggered for PR #58. At this log point the exact-head matrix has not been accepted as green yet.

Do not mark this PR ready or merge it until:

- lint/typecheck/unit/build pass;
- affected browser flows pass;
- phone/desktop visual QA passes;
- bottom safe-area and overflow are verified;
- no Stage16/offline/security regression is introduced.
