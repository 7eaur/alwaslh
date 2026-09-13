# CURRENT PRODUCT OVERRIDES — الوسيلة الذكية

> Current Product Owner decisions below supersede any older conflicting prose. Code, PostgreSQL migrations, executable CI and verified runtime remain implementation Source of Truth.

Last updated: **2026-09-13**.

## PO-OVR-001 — `main` is the integration baseline

- new work starts from live `main` on short-lived branches;
- old long-lived stage/track branches are historical unless explicitly reactivated;
- do not force-push shared history;
- before editing, live-check `main`, open PRs and relevant CI.

## PO-OVR-002 — Repository documentation is official project memory

For current Student continuation read first:

`PROJECT_HANDOFF.md → PROJECT_STATUS.md → PROJECT_ENGINEERING_LOG.md → STUDENT_PRODUCT_ARCHITECTURE.md → STUDENT_FUTURE_SURFACES_SPEC.md → STUDENT_LIBRARY_OVERVIEW_REDESIGN.md → actual code/tests/CI`

Historical recovery docs remain supporting references only after current-state docs.

## PO-OVR-003 — No patching around proven defects

- do not weaken tests to hide product defects;
- do not bypass auth/validation/security contracts;
- do not add duplicate durable authority;
- fix root cause in the owning layer and add regression evidence.

## PO-OVR-004 — Student product refoundation is accepted

PR #53 Student Experience Rebuild is merged and verified.

It established Welcome/Auth/Help/Support, one Student shell, Home/Learn/Reader/Practice/Assessment/Downloads/Account, learner-safe copy, motion/reduced-motion and clearer error scenarios.

Do not restore the old account wrapper, duplicate shell chrome, permanent online-status noise or implementation-facing copy.

## PO-OVR-005 — Future Student surfaces are intentionally prebuilt

Product Owner confirmed no production learner will use the Student app before the remaining roadmap is complete.

Therefore approved final UI surfaces may be built before backend integration when they remain honest.

Allowed:

- Library / Notes / Saved / Needs Review surfaces;
- Notifications surface;
- Progress/Statistics/Achievements surface;
- reserved Account structure.

Forbidden:

- fake notes;
- fake unread badges;
- fake progress percentages;
- fake scores/statistics;
- fake achievements/rankings/streaks;
- invented recommendations;
- invented security/account controls.

## PO-OVR-006 — Final Student navigation

Primary mobile navigation is fixed to:

1. `الرئيسية`
2. `التعلّم`
3. `التدريب`
4. `مكتبتي`

Secondary global destinations:

- Notifications bell;
- Account;
- Progress from Home/Account/desktop secondary navigation.

Focused Reader/Assessment may suppress global navigation.

## PO-OVR-007 — Student interaction affordance

Binding rule:

**Clickable must look clickable. Static must look static. Primary action visually strongest. Destructive action distinct.**

- touch targets >=44px where interactive;
- affordance visible on touch devices without depending on hover;
- static informational cards/statistics must not mimic destination cards.

## PO-OVR-008 — Student motion

Use restrained micro-interactions only:

- short surface entry;
- press/hover feedback;
- lightweight depth;
- no decorative continuous motion;
- `prefers-reduced-motion` always wins.

## PO-OVR-009 — Student performance / code splitting

Destination-level lazy loading is required for large Student feature surfaces.

Accepted refoundation reduced initial main bundle from about `599.61 KB / 148.83 KB gzip` to about `225.89 KB / 71.24 KB gzip`.

Do not regress to eager imports of Learn/Assessment/Library/Account into the initial shell without measured reason.

## PO-OVR-010 — Library overview composition

Current active decision for `/app/library`:

1. concise heading;
2. honest `ملخص مكتبتي`;
3. one `أقسام مكتبتي` destination grid;
4. child section has one clear return-to-Library action.

Do **not** repeat the same four Library destinations as both horizontal tabs and cards on the overview.

Library statistics:

- Downloads count may use the real offline package store;
- Notes/Saved/Needs Review stay zero until Stage17 authoritative repositories exist;
- statistics are informational/non-clickable;
- destination cards are the clickable elements;
- one quiet divided summary surface, not a KPI card wall;
- no decorative gradient.

This override supersedes any older sentence that recommends Library overview tabs.

Detailed decision: `docs/product/STUDENT_LIBRARY_OVERVIEW_REDESIGN.md`.

## PO-OVR-011 — Active batch

Active PR: **#55 — Library Overview Refinement**

Branch: `ux/student-library-overview`

Do not redesign it again from scratch. Final required work is exact-head CI + phone/desktop Visual QA + merge if evidence is green.

## PO-OVR-012 — Backend roadmap is still not completed by prebuilt UI

Prebuilt UI does not close service/backend stages.

Return sequence remains:

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17 → Stage18 → Stage19`

Stage17 later connects Notes/Saved/Needs Review ownership/CRUD/provenance/offline/sync.

Stage18 later connects Notifications feed/unread/deep links/lifecycle.

Stage19 later connects trusted Progress/Statistics/Achievements.

## PO-OVR-013 — Super Admin is a separate rebuild workstream

Do not restart old B06–B14 Admin implementation from Student work.

Dedicated Super Admin Product Rebuild owns Admin IA/workflows/frontend/product architecture. Synchronize shared design foundations only when required.

## PO-OVR-014 — Railway/content/Supabase

- Railway remains a hosted inspection/dev environment until release gates declare final production cutover.
- PostgreSQL migrations/current contracts are DB authority.
- legacy Supabase is not current operating/content authority unless a new explicit Product Owner decision reactivates it.
- imported content remains subject to normal Draft/review/publication authority.
