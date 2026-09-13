# PROJECT HANDOFF — الوسيلة الذكية

> هذه الوثيقة هي نقطة البداية للمحادثة الهندسية التالية. لا تعتمد على ذاكرة المحادثات السابقة بدل المستودع. الكود + PostgreSQL migrations + الاختبارات/CI + verified runtime + الوثائق الحالية هي Source of Truth.

Last synchronized: **2026-09-13 — Student Future Surfaces merged; Library Overview refinement active on PR #55.**

## 1. Start here — mandatory

قبل أي تعديل جديد:

1. Confirm repository: `7eaur/alwaslh`.
2. Live-check `main` HEAD and open PRs. Do not assume SHAs in prose are still latest.
3. Read, in this order:
   - `PROJECT_HANDOFF.md` — this file;
   - `PROJECT_STATUS.md` — immediate execution truth;
   - `PROJECT_ENGINEERING_LOG.md` — decisions/findings/evidence;
   - `docs/product/STUDENT_PRODUCT_ARCHITECTURE.md` — binding Student IA/UX architecture;
   - `docs/product/STUDENT_FUTURE_SURFACES_SPEC.md` — Stage17–19 pre-integration surface rules;
   - `docs/product/STUDENT_LIBRARY_OVERVIEW_REDESIGN.md` — active PR #55 Library decision;
   - `docs/workstreams/UX_UI_REFOUNDATION_PAUSE_2026-09-12.md` — roadmap pause/return authority;
   - `MASTER_REBUILD_ROADMAP.md` — long roadmap;
   - `PRODUCT_FEATURE_PARITY_MATRIX.md` — legacy/product capability parity.
4. For current work, inspect actual changed code/tests before editing.
5. Anything not inspected or executed = `NOT YET VERIFIED`.

If working on deployment/content/AI/Admin, then additionally read the relevant specialized docs listed later in this file.

---

## 2. Current product state

### Student — rebuilt foundation

PR #53 — **Student Experience Rebuild** — MERGED / VERIFIED.

- accepted head: `4c94063c5f09934353f5dbe1e2bb9509286e2812`;
- exact-head matrix: **23/23 SUCCESS**;
- merge commit: `d8ccb0b7ba004618cbcbdd96937d5cded47161dc`.

It established:

- first-run Welcome;
- Activation / returning login / recovery;
- Help / Support;
- one Student shell;
- Home / Learn / Subject / Reader;
- Practice / Quiz / focused Assessment / Result;
- Downloads / Account;
- learner-safe error copy;
- restrained motion + `prefers-reduced-motion`;
- removal of technical/stage/internal copy from Student UI;
- FPA-013 Reader search-focus repair.

### Student — future-complete surfaces

PR #54 — **Future Library / Notifications / Progress surfaces** — MERGED / VERIFIED.

- accepted head: `4b6f24c5cb9bd0da525ecfebc59b1ebbf156c903`;
- exact-head matrix: **23/23 SUCCESS**;
- merged `main`: `c3734366c132ea3919a925bdd0dd37cfd5d82104`.

It established the final Student IA shell:

**Primary mobile navigation**

1. `الرئيسية` — `/app/home`
2. `التعلّم` — `/app/learn`
3. `التدريب` — `/app/practice`
4. `مكتبتي` — `/app/library`

Secondary global destinations:

- Notifications bell → `/app/notifications`;
- Account → `/app/account`;
- Progress → `/app/progress` from Home/Account/desktop secondary navigation.

Prebuilt, honest future surfaces:

- Library → Downloads / Notes / Saved / Needs Review;
- Notifications zero-data surface;
- Progress/Statistics/Achievements pre-integration surface;
- Account as personal-management hub.

Important Product Owner rule:

> No production learner will use the Student app before the remaining roadmap is complete. Therefore final approved UI surfaces may be built before backend integration, but **must never fabricate learner data or business outcomes**.

### Performance decision

Student feature destinations are lazily loaded. The main initial Student bundle was reduced from roughly **599.61 KB minified / 148.83 KB gzip** to roughly **225.89 KB minified / 71.24 KB gzip** on the accepted future-surfaces implementation, with Learn, Assessment, Library/personal surfaces and Account emitted as separate chunks.

Do not undo this architecture by re-importing large feature trees eagerly into the shell.

### Interaction affordance decision

Binding UX rule:

**Clickable must look clickable. Static must look static. Primary actions must be visually strongest. Destructive actions must be distinct.**

- touch targets >= 44px where interactive;
- interactive cards have clear border/icon/directional cue/pressed-focus behavior;
- static statistic/information surfaces must not pretend to be clickable;
- affordance must be visible on touch devices without depending on hover.

This rule is browser-tested.

---

## 3. ACTIVE NOW — PR #55 Library Overview Refinement

PR: **#55 — `refactor(student): redesign Library overview hierarchy`**

Branch: `ux/student-library-overview`

Base when opened: `main@c3734366c132ea3919a925bdd0dd37cfd5d82104`

State: **OPEN / mergeable at last inspection / FINAL EXACT-HEAD VERIFICATION STILL REQUIRED**.

### Why this PR exists

The first Future Surfaces version of `/app/library` repeated the same four destinations twice:

- horizontal tabs;
- four large destination cards.

This made the page feel like a repeated section switcher instead of an elegant personal overview.

### Approved Library hierarchy

`/app/library` now follows:

1. concise page heading;
2. **ملخص مكتبتي** — honest statistics only;
3. **أقسام مكتبتي** — one destination grid;
4. child sections use one explicit `العودة إلى مكتبتي` action instead of repeating the same tabs.

The four collections remain:

- التنزيلات;
- ملاحظاتي;
- المحفوظات;
- يحتاج مراجعة.

### Statistics truth

- **Downloads count is real**: it is read from the existing offline package store for the active profile/device.
- Browser acceptance downloads a real lesson and requires the Library Downloads number to change from `٠` to `١`.
- Notes / Saved / Needs Review remain honest `0` until Stage17 authoritative repositories exist.
- These zero values are placeholders for absence of authoritative records, **not fabricated usage statistics**.
- No fake streaks, activity counts, recommendations, progress percentages, achievement counts or engagement metrics.

### Visual composition

- statistics use **one quiet divided summary surface**, not four KPI cards;
- no decorative gradient;
- summary/stat cells are non-clickable;
- collection cards remain the only strong clickable destinations;
- phone: compact 2×2 summary + one-column collection destinations;
- desktop: one-glance summary + destination grid below;
- no duplicated Library tabs.

### Files changed / authority

Key implementation:

- `apps/student-web/src/student-future-surfaces.tsx`
- `apps/student-web/src/student-library-overview.css`
- `apps/student-web/src/main.tsx`
- `apps/student-web/e2e/student-b05.e2e.spec.mjs`
- `apps/student-web/e2e/offline-download.e2e.spec.mjs`
- `docs/product/STUDENT_LIBRARY_OVERVIEW_REDESIGN.md`

The old offline-download browser test initially failed because it still targeted the removed exact `التنزيلات` tab/old heading. The test was updated to follow the new Library destination while keeping all manifest/signature/checksum/tamper/removal/logout integrity assertions.

### Current verification state

Already verified on the implementation before the final documentation/test-sync commits:

- Student lint — SUCCESS;
- strict typecheck — SUCCESS;
- unit tests — **11 files / 41 tests SUCCESS**;
- production build — SUCCESS.

Final exact-head wide CI + regenerated phone/desktop Visual QA are still required because the branch head moved after test/documentation synchronization.

### Exact next action

Do **not** redesign Library again from scratch.

Next conversation should:

1. live-fetch PR #55 head and `main`;
2. run/inspect exact-head workflow matrix for PR #55;
3. specifically verify B05 Chromium and its Visual QA artifact;
4. confirm Library overview has no duplicate tabs;
5. confirm real saved-download stat changes 0 → 1;
6. confirm stat cells remain non-clickable and collection cards remain clearly clickable;
7. confirm responsive/no-overflow/reduced-motion/copy checks;
8. if all triggered workflows are SUCCESS and visuals are accepted, update final evidence and merge PR #55 with expected-head SHA guard;
9. if a failure appears, determine real product regression vs stale test before changing UI.

---

## 4. Binding Student architecture

Canonical docs:

- `docs/product/STUDENT_PRODUCT_ARCHITECTURE.md`
- `docs/product/STUDENT_FUTURE_SURFACES_SPEC.md`
- `docs/product/STUDENT_LIBRARY_OVERVIEW_REDESIGN.md`

Binding priorities:

**Clarity → Ease of use → Flow → Visual comfort → Consistency → Polish**

Acceptance target:

**Functional + Clear + Easy + Comfortable + Consistent + Fast + Maintainable + Professional**

Student is an educational application, not an Admin dashboard.

Do not show learners:

- raw IDs;
- device keys / crypto terms;
- cache/service-worker/storage implementation terms;
- stage/roadmap/internal API vocabulary;
- fake metrics;
- unsupported security controls;
- fake notifications or unread badges.

Every expected error state must answer:

1. what happened, in learner language;
2. what the learner can do now;
3. without leaking internal/admin details.

---

## 5. Stable backend/security authorities

Preserve these unless a new evidence-backed architecture decision explicitly replaces them:

- API + PostgreSQL own canonical state;
- browser is not durable business authority;
- Auth/Authz/Entitlements server-owned;
- returning Student uses password + bound device proof;
- Full Code = 6 digits; Class Code = 7 digits;
- curriculum: Class → Subject Offering → optional Section → Lesson;
- `media ready != published`;
- protected Reader/media remains server-authorized;
- raw storage keys never become frontend contract;
- AI output never auto-publishes learner content/questions;
- Question Bank publication + immutable Quiz version remain delivery authority;
- Assessment scoring/finalization/history server-owned;
- `/v1` never becomes Service Worker Cache API authority;
- offline authorization/signature/checksum/device/session contracts remain security authority;
- no password/session token/device private key is persisted as offline learning content.

---

## 6. Roadmap status after Student UI foundation

The UI is structurally prebuilt for Stage17–19, but their backend/product-service work is **not complete**.

Normal engineering return point remains:

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17 → Stage18 → Stage19`

### Stage16 remaining authority

Still open:

- true cold-start offline Reader;
- durable non-secret scope recovery across browser restart;
- read-time signed-authority verification;
- read-time blob size/checksum verification;
- reconnect revalidation/purge;
- revision/tombstone/cursor/delta/outbox closure where actually required.

Do not claim Stage16 closed because Downloads UI works.

### Stage17

Connect authoritative Personal Learning Data into already-designed UI:

- Notes CRUD/provenance;
- Saved/bookmarked questions;
- Needs Review;
- ownership/offline/sync/conflict rules.

### Stage18

Connect Notifications:

- feed;
- unread/last-seen;
- valid deep-link schema;
- lifecycle/quiet-hours/opt-out/Web Push where approved.

### Stage19

Connect trusted Progress/Statistics/Achievements:

- only server-defined metrics;
- no browser-invented mastery;
- privacy-safe achievement/ranking behavior.

---

## 7. Super Admin governance

Do not implement the legacy B06–B14 Admin batches from the Student branch.

A dedicated **Super Admin Product Rebuild** workstream owns:

- Admin product responsibilities;
- backend workflow mapping;
- API/data visibility;
- IA/navigation;
- frontend architecture;
- Admin UX/UI/design system.

Known parallel Admin PR from the redesign workstream: PR #52 (`rebuild/super-admin-foundation`) — live-check before relying on its historical SHA/state.

After Admin rebuild integration, shared cross-product responsive/RTL/accessibility/visual-regression cleanup may be synchronized.

---

## 8. Specialized docs only when relevant

For Railway/deployment:

- `docs/operations/RAILWAY_LIVE_STATE.md`

For imported content:

- `docs/content/LIVE_CONTENT_IMPORT_STATUS.md`

For broad historical project recovery/audit:

- `docs/workstreams/UNIFIED_PROJECT_RESUME_PROTOCOL.md`
- `PROJECT_RESUME_SNAPSHOT.md`
- `PROJECT_INTEGRATION_CONTINUITY.md`
- `PROJECT_EXECUTION_QUEUE.md`

For original feature coverage:

- `PRODUCT_FEATURE_PARITY_MATRIX.md`
- `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md`

These are supporting references. For **current Student continuation**, `PROJECT_HANDOFF.md` + `PROJECT_STATUS.md` + `PROJECT_ENGINEERING_LOG.md` + the three Student product docs above take precedence over stale historical stage prose.

---

## 9. Continuation rule

A new engineering conversation should not ask the Product Owner to restate decisions already documented here.

It should:

- read evidence;
- live-check current refs/CI;
- continue from the active batch;
- update documentation during work;
- preserve contracts;
- fix proven problems at their owning layer;
- avoid blind rewrite and avoid preserving bad UX merely because it already exists.
