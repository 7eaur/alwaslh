# PROJECT HANDOFF — الوسيلة الذكية

> هذه الوثيقة هي نقطة البداية للمحادثة الهندسية التالية. لا تعتمد على ذاكرة المحادثات السابقة بدل المستودع. الكود + PostgreSQL migrations + الاختبارات/CI + verified runtime + الوثائق الحالية هي Source of Truth.

Last synchronized: **2026-09-13 — PR #55 exact-head closure in progress; stale browser acceptance repaired.**

## 1. Start here — mandatory

قبل أي تعديل جديد:

1. Confirm repository: `7eaur/alwaslh`.
2. Live-check `main` HEAD and open PRs. Do not assume SHAs in prose are still latest.
3. Read, in this order:
   - `PROJECT_HANDOFF.md` — this file;
   - `PROJECT_STATUS.md` — immediate execution truth;
   - `PROJECT_ENGINEERING_LOG.md` — decisions/findings/evidence;
   - `docs/product/CURRENT_PRODUCT_OVERRIDES.md`;
   - `docs/product/STUDENT_PRODUCT_ARCHITECTURE.md` — binding Student IA/UX architecture;
   - `docs/product/STUDENT_FUTURE_SURFACES_SPEC.md` — Stage17–19 pre-integration surface rules;
   - `docs/product/STUDENT_LIBRARY_OVERVIEW_REDESIGN.md` — active PR #55 Library decision.
4. For current work, inspect actual changed code/tests before editing.
5. Anything not inspected or executed = `NOT YET VERIFIED`.

---

## 2. Verified merged Student baseline

### PR #53 — Student Experience Rebuild

MERGED / VERIFIED.

- accepted head: `4c94063c5f09934353f5dbe1e2bb9509286e2812`;
- exact-head matrix: **23/23 SUCCESS**;
- merge commit: `d8ccb0b7ba004618cbcbdd96937d5cded47161dc`.

Established Welcome/Auth/Recovery/Help/Support, unified shell, Home/Learn/Reader, Practice/Assessment/Result, Downloads/Account, learner-safe errors and reduced-motion-safe interaction.

### PR #54 — Future Student Surfaces

MERGED / VERIFIED.

- accepted head: `4b6f24c5cb9bd0da525ecfebc59b1ebbf156c903`;
- exact-head matrix: **23/23 SUCCESS**;
- merge commit/current pre-PR55 baseline: `c3734366c132ea3919a925bdd0dd37cfd5d82104`;
- phone/desktop Visual QA accepted.

Final Student primary navigation is:

1. `الرئيسية` — `/app/home`
2. `التعلّم` — `/app/learn`
3. `التدريب` — `/app/practice`
4. `مكتبتي` — `/app/library`

Secondary global destinations: Notifications, Account and Progress. Library/Notifications/Progress future surfaces are prebuilt but must never fabricate learner data.

Student destination features remain lazily loaded; do not regress the accepted initial-bundle reduction by eagerly importing feature trees into the shell.

---

## 3. ACTIVE NOW — PR #55 Library Overview Refinement

PR: **#55 — `refactor(student): redesign Library overview hierarchy`**

Branch: `ux/student-library-overview`

Base when opened: `main@c3734366c132ea3919a925bdd0dd37cfd5d82104`

State: **OPEN / final exact-head CI + Visual QA required before merge**.

### Approved Library hierarchy

`/app/library` is a personal overview, not a duplicated section switcher:

1. concise page heading;
2. `ملخص مكتبتي` — honest informational statistics;
3. `أقسام مكتبتي` — one destination grid;
4. child sections expose one explicit return-to-Library action instead of repeating all destinations.

Collections remain Downloads / Notes / Saved / Needs Review.

### Statistics truth

- Downloads count is real and read from the existing offline package store for the active profile/device.
- Browser acceptance saves a real lesson and must observe Downloads `٠ → ١`.
- Notes / Saved / Needs Review remain honest zero states until Stage17 repositories exist.
- No fake progress, activity, streaks, recommendations, achievements or engagement metrics.

### Visual rules

- one quiet divided summary surface, not four KPI cards;
- summary/stat cells are static/non-clickable;
- destination cards are clearly clickable before hover;
- phone uses compact 2×2 summary + one-column destinations;
- desktop keeps a one-glance summary + destination grid;
- no duplicate Library tabs;
- no decorative gradient/card wall;
- >=44px interactive targets and reduced-motion behavior remain binding.

### Exact-head CI evidence already inspected

Head inspected: `aca9a2f72ecede120d1d87889f9a3fb0660ea712`.

Result: **20/23 workflows SUCCESS**.

Failures:

- UX B02 Student Shell and Navigation;
- Stage14 Student Product;
- Rebuild Stage Verification.

Classification:

- B02 quality/build/migrations/Chromium setup passed; its Playwright step still expected old Library heading `كل ما يخص تعلمك في مكان واحد` after PR #55 intentionally changed it to `محتواك الشخصي، مرتب في مكان واحد`.
- Stage14 quality succeeded and failed only in full `npm run test:e2e`.
- Rebuild backend/build/migration stages succeeded and only Stage8 browser full `npm run test:e2e` failed.
- Those aggregate suites include the stale B02 spec, so they necessarily inherit its failure.
- This evidence does not show a backend/PostgreSQL/auth/access/curriculum/offline-integrity regression.

Repair applied:

- `apps/student-web/e2e/student-shell-navigation.e2e.spec.mjs` was aligned with the approved current Library heading only.
- navigation, focus, history, actionable offline state and no-overflow assertions remain unchanged.
- B05 and offline-download integrity coverage remain intact.

Because this fix and documentation commits moved the branch head, **the `aca9a2f...` matrix cannot be used as merge evidence**.

### Exact next action

1. live-fetch current PR #55 head and live `main`;
2. require every triggered workflow SUCCESS on that exact head;
3. inspect exact-head B05 Visual QA artifact at phone and desktop sizes;
4. verify no duplicate Library tabs;
5. verify real Downloads statistic updates `0 → 1` after saving a real lesson;
6. verify statistics remain static/non-clickable and collection cards remain obvious actions;
7. verify no horizontal overflow, learner-safe copy and reduced-motion acceptance;
8. merge PR #55 only with expected-head SHA guard after acceptance;
9. after merge, return immediately to normal roadmap at `STUDENT-016I`.

Do not redesign Library again without new evidence.

---

## 4. Binding Student architecture

Canonical docs:

- `docs/product/STUDENT_PRODUCT_ARCHITECTURE.md`
- `docs/product/STUDENT_FUTURE_SURFACES_SPEC.md`
- `docs/product/STUDENT_LIBRARY_OVERVIEW_REDESIGN.md`

Binding design order:

**Clarity → Ease of use → Flow → Visual comfort → Consistency → Polish**

Acceptance:

**Functional + Clear + Easy + Comfortable + Consistent + Fast + Maintainable + Professional**

Student is an educational application, not an Admin dashboard. Do not expose raw IDs, device keys/crypto terms, storage/service-worker jargon, roadmap/stage vocabulary, fake metrics, fake notification badges or unsupported account/security controls.

---

## 5. Stable backend/security authorities

Preserve unless new evidence explicitly changes them:

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
- `/v1` never becomes Service Worker Cache authority;
- offline authorization/signature/checksum/device/session contracts remain security authority;
- no password/session token/device private key is persisted as offline learning content.

---

## 6. Roadmap return after PR #55

The final Student UI locations are established, but Stage17–19 backend/service work is not complete.

Normal return sequence:

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17 → Stage18 → Stage19`

### `STUDENT-016I`

Exact return point after PR #55. It owns the **true cold-start offline Reader** closure: a previously saved authorized lesson must remain safely readable after app/browser restart while the network is unavailable, using durable non-secret scope recovery plus existing signed package/blob integrity authority. Inspect current Stage16 code/tests/docs before implementing; do not assume older prose is fully current.

### Later Stage16

- `016R` — reconnect revalidation/purge;
- `016S` — revision/tombstone/cursor/delta synchronization;
- conditional `016O` — bounded outbox only if later offline writes actually require it;
- `016G` — Stage16 closure matrix.

### Stage17–19

- Stage17 connects authoritative Notes/Saved/Needs Review ownership, CRUD/provenance and offline/sync rules into the already-built Library surfaces.
- Stage18 connects Notifications feed/unread/deep links/lifecycle.
- Stage19 connects only server-defined trusted Progress/Statistics/Achievements.

Do not claim Stage16 closed merely because Downloads UI works.

---

## 7. Super Admin governance

Do not implement legacy B06–B14 Admin batches from the Student branch. Dedicated Super Admin Product Rebuild owns Admin product architecture, workflows, API/data visibility, IA, frontend architecture and UX/UI.

---

## 8. Specialized docs when relevant

- Railway/deployment: `docs/operations/RAILWAY_LIVE_STATE.md`
- imported content: `docs/content/LIVE_CONTENT_IMPORT_STATUS.md`
- broad historical recovery: `docs/workstreams/UNIFIED_PROJECT_RESUME_PROTOCOL.md`, `PROJECT_RESUME_SNAPSHOT.md`, `PROJECT_INTEGRATION_CONTINUITY.md`, `PROJECT_EXECUTION_QUEUE.md`
- original feature coverage: `PRODUCT_FEATURE_PARITY_MATRIX.md`, `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md`

For current Student continuation, the top-level handoff/status/log plus current Student product docs outrank stale historical stage prose.

---

## 9. Continuation rule

A replacement engineer should read evidence, live-check refs/CI, continue from the exact active batch, update documentation during work, preserve contracts, fix proven problems in the owning layer, and avoid both blind rewrite and preserving bad UX merely because it already exists.
