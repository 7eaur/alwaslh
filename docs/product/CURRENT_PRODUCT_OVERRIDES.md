# CURRENT PRODUCT OVERRIDES — الوسيلة الذكية

> Current Product Owner decisions below supersede older conflicting prose. Code, PostgreSQL migrations, executable CI and verified runtime remain implementation Source of Truth.

Last updated: **2026-09-14**.

## PO-OVR-001 — `main` is the integration baseline

- new work starts from live `main` on short-lived branches;
- old long-lived stage/track branches are historical unless explicitly reactivated;
- do not force-push shared history;
- before editing, live-check `main`, open PRs and relevant CI.

## PO-OVR-002 — Repository documentation is official project memory

For current Student continuation read first:

`PROJECT_HANDOFF.md → PROJECT_STATUS.md → PROJECT_ENGINEERING_LOG.md → PROJECT_EXECUTION_QUEUE.md → this file → Student product docs → actual code/tests/CI → Issue #16 execution ledger`

Historical recovery docs remain supporting references only after current-state docs.

## PO-OVR-003 — No patching around proven defects

- do not weaken tests to hide product defects;
- do not bypass auth/validation/security contracts;
- do not add duplicate durable authority;
- fix root cause in the owning layer and add regression evidence.

## PO-OVR-004 — Student Experience V2 is the accepted foundation

PR #58 is merged into `main` as:

`258c5bc2c09a049afb57c0593b5b6ca9db532c62`

It supersedes older conflicting Student UI/refoundation prose.

Binding V2 rules:

- phone primary navigation = `الرئيسية / التعلم / التدريب / مكتبتي`;
- Home alone shows official الوسيلة الذكية brand lockup in App Bar;
- other top-level pages show destination title;
- Account and Notifications are secondary global destinations;
- Reader and active Assessment may suppress global navigation;
- no assumed student display name or permanent grade identity;
- no fabricated progress, streaks, ranks, achievements, recommendations or Library data;
- Home is the real overview; Library is direct access rather than an article/dashboard;
- Learn scales through compact lists/search/accordion disclosure;
- Reader remains focused/content-first;
- real quiz versions may be presented as learner-facing `نماذج` without creating separate backend authority.

Do not restore pre-V2 duplicate shell chrome, editorial page hierarchy, duplicated destination cards, the removed Library dashboard, or old compatibility files unless new executable evidence requires a product decision.

## PO-OVR-005 — Future Student surfaces remain honest

Approved future surfaces may exist before backend integration only when they are honest empty/reserved UI.

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

## PO-OVR-006 — Student interaction / accessibility

Binding rule:

**Clickable must look clickable. Static must look static. Primary action visually strongest. Destructive action distinct.**

- touch targets >=44px where interactive;
- affordance visible on touch devices without hover dependency;
- RTL and safe areas are first-class;
- `prefers-reduced-motion` always wins;
- static statistics must not mimic destination cards.

## PO-OVR-007 — Student performance / architecture

Direction is fixed:

`app → features → shared`

- destination-level lazy loading for large Student features remains required;
- shared App Shell/icons/primitives/cache/storage adapters remain centralized;
- feature-specific composition stays under `features/*`;
- no giant flat files mixing routing + API + cache + storage + large JSX;
- no duplicate runtime cache or offline package authority;
- optimize measured bottlenecks rather than speculative rewrites.

## PO-OVR-008 — Offline authority boundary

Stage16 protected offline content remains subordinate to current server authority.

- PostgreSQL/API Auth/Authz/device/entitlement/publication state is canonical;
- IndexedDB packages are bounded cached copies, never entitlement authority;
- signed ES256 manifest + read-time blob integrity must pass before offline Reader renders;
- no synthetic server session/token/entitlement offline;
- no private signing material in Student code/storage;
- Service Worker must not turn arbitrary `/v1` responses into business authority;
- one Stage16 lesson package store only.

## PO-OVR-009 — Cold-start Offline Reader is closed

`STUDENT-016H` and `STUDENT-016I` are closed through the merged V2 implementation.

Required cold-start behavior is verified:

`download online → close/restart browser → network unavailable → durable profile/device scope → signed manifest verification → blob size/SHA-256 verification → Reader renders only valid stored content`.

Tamper, expiry, backward-clock and account/device isolation fail closed.

PR #57 was superseded and closed unmerged after its required behavior was reconciled into PR #58.

## PO-OVR-010 — Active Stage16 batch

Active short-lived workstream:

`STUDENT-016R — reconnect revalidation / revocation purge`

Branch:

`stage16/student-016r-reconnect-revalidation`

PR:

`#59 — feat(student): revalidate offline packages on reconnect`

Implementation head `d6cd685006d8cbae27dfd9871af671634404b26d` passed Student quality gates and the Stage16 real-Chromium reconnect/revocation gate.

On reconnect the client must:

- restore current server session/device authority;
- refresh bounded offline lease;
- recheck entitlement/publication/revision via current server Reader/manifest authority;
- re-verify signed manifest and stored blob integrity;
- deterministically purge protected packages current authority no longer affirms;
- never continue showing protected content merely because bytes remain local.

PR #59 remains the active closure vehicle until documentation-head CI and merge are complete.

## PO-OVR-011 — Exact roadmap sequence

After PR #59 closes:

`STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17 → Stage18 → Stage19`

Do not skip `STUDENT-016S` because revision/tombstone-related schema names exist. Stage16 requires authoritative writers, cursor/delta semantics, client application and executable reconnect evidence.

`STUDENT-016O` is conditional. Do not invent an outbox until a product-authorized offline write path needs one.

Stage17 remains blocked until `STUDENT-016G` passes.

## PO-OVR-012 — Backend roadmap is not completed by prebuilt UI

Prebuilt UI does not close service/backend stages.

- Stage17 later connects Notes/Saved/Needs Review ownership/CRUD/provenance/offline/sync;
- Stage18 later connects Notifications feed/unread/deep links/lifecycle;
- Stage19 later connects trusted Progress/Statistics/Achievements.

## PO-OVR-013 — Super Admin remains a separate rebuild workstream

Do not restart old Admin implementation from Student work.

Dedicated Super Admin Product Rebuild owns Admin IA/workflows/frontend/product architecture. Synchronize shared foundations only when required.

## PO-OVR-014 — Railway/content authority

- Railway remains hosted inspection/dev until formal release gates declare cutover;
- PostgreSQL migrations/current contracts are DB authority;
- legacy Supabase is not current operating/content authority unless explicitly reactivated;
- imported content remains subject to normal Draft/review/publication authority;
- do not rerun closed Grade 9 bulk import or reviewed Unit 2 publication checkpoints.
