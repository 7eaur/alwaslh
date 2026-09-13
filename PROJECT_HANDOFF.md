# PROJECT HANDOFF — الوسيلة الذكية

> هذه الوثيقة هي نقطة البداية للمحادثة الهندسية التالية. لا تعتمد على ذاكرة المحادثات السابقة بدل المستودع. الكود + PostgreSQL migrations + الاختبارات/CI + verified runtime + الوثائق الحالية هي Source of Truth.

Last synchronized: **2026-09-13 — Content ROADMAP-RETURN closed; STUDENT-016I active in PR #57.**

## 1. Start here — mandatory

قبل أي تعديل جديد:

1. Confirm repository: `7eaur/alwaslh`.
2. Live-check `main`, open PRs and relevant exact-head CI. Do not assume SHAs in prose are still latest.
3. Read, in this order:
   - `PROJECT_HANDOFF.md`;
   - `PROJECT_STATUS.md`;
   - `PROJECT_ENGINEERING_LOG.md`;
   - `docs/product/CURRENT_PRODUCT_OVERRIDES.md`;
   - `docs/product/STUDENT_PRODUCT_ARCHITECTURE.md`;
   - `docs/product/STUDENT_FUTURE_SURFACES_SPEC.md`;
   - `docs/product/STUDENT_LIBRARY_OVERVIEW_REDESIGN.md`.
4. For Content Rebuild also read the two live files in `7eaur/alwaslh-go@content/legacy-staging-rebuild`.
5. Inspect actual changed code/tests before editing. Anything not inspected/executed = `NOT YET VERIFIED`.

---

## 2. Verified merged Student baseline

### PR #53 — Student Experience Rebuild

MERGED / VERIFIED.

- accepted head `4c94063c5f09934353f5dbe1e2bb9509286e2812`;
- exact-head matrix 23/23 SUCCESS;
- merge commit `d8ccb0b7ba004618cbcbdd96937d5cded47161dc`.

### PR #54 — Future Student Surfaces

MERGED / VERIFIED.

- accepted head `4b6f24c5cb9bd0da525ecfebc59b1ebbf156c903`;
- exact-head matrix 23/23 SUCCESS;
- merge commit `c3734366c132ea3919a925bdd0dd37cfd5d82104`;
- phone/desktop Visual QA accepted.

### PR #55 — Library Overview Refinement

MERGED.

- accepted head `8ceb4d5a5f70f7896f6cb358e05605479942d442`;
- merge commit `343ff1fd7b3d64d7e990b72606695365f520fa58`.

The final Student primary navigation remains:

1. `الرئيسية` — `/app/home`
2. `التعلّم` — `/app/learn`
3. `التدريب` — `/app/practice`
4. `مكتبتي` — `/app/library`

Secondary global destinations: Notifications, Account and Progress. Library/Notifications/Progress future surfaces must never fabricate learner data.

Student destination features remain lazily loaded; do not regress the accepted initial-bundle reduction by eagerly importing feature trees into the shell.

---

## 3. ACTIVE NOW — PR #57 / STUDENT-016I

PR: **#57 — `feat(student): close cold-start offline Reader gap`**

Branch: `stage16/student-016i`

Exact head observed during ROADMAP-RETURN: `4624dcc824555c1d29e9d697a7474bf76223468b`.

Base when opened: `main@343ff1fd7b3d64d7e990b72606695365f520fa58`.

State: **OPEN / exact-head CI NOT GREEN at the observed checkpoint**.

At least this exact-head check is failing:

- `Stage 8 · Student activation browser E2E`.

Do not merge until the final exact-head matrix is green, especially the Stage16 real Chromium acceptance. Re-fetch live head/checks before changing anything because concurrent work may already have advanced beyond the SHA above.

### STUDENT-016I scope

Close true cold-start offline Reader only:

- a previously saved and still-authorized lesson must remain safely readable after browser/app restart while network is unavailable;
- recover only bounded durable **non-secret** profile/device scope;
- Reader must use existing signed package/blob integrity authority;
- do not create a synthetic server session;
- do not cache `/v1` as business authority;
- do not persist password/session token/device private key as offline learning data;
- explicit online denial remains server-authoritative.

The current PR describes acceptance as:

`download online → service-worker shell ready → clear HTTP session cookie → close Chromium → relaunch same persistent profile → force offline → deep-link saved lesson → Reader renders`

plus fail-closed denial for signature tamper, same-size blob corruption, profile/device isolation, clock rollback and authorization expiry.

Do not expand this PR into `016R`, `016S`, `016O`, Stage17 or unrelated UI work.

---

## 4. Content Rebuild handoff

The requested Content Rebuild queue is complete through:

`BATCH-001 → STRUCTURE-001 → STRUCTURE-002 → CURATION-001 → CURATION-002 → CONTENT-GAPS-001 → MEDIA-001 → IMPORT-001 → VERIFY-001 → ROADMAP-RETURN`

Final status: **`ROADMAP-RETURN = DONE / STUDENT-016I_HANDOFF_VERIFIED`**.

ROADMAP-RETURN found that concurrent Student work had already opened PR #57 for exactly `STUDENT-016I`, so no duplicate implementation was started from the Content Rebuild branch.

Content publication remains closed. The verified imported Unit 2 slice remains unpublished and no RAW/media/question/publication mutation occurred during roadmap return.

Canonical Content Rebuild execution docs:

- `7eaur/alwaslh-go@content/legacy-staging-rebuild/content-staging/CONTENT_REBUILD_EXECUTION_STATUS.md`
- `7eaur/alwaslh-go@content/legacy-staging-rebuild/content-staging/CONTENT_REBUILD_HANDOFF.md`

---

## 5. Binding Student architecture

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

## 6. Stable backend/security authorities

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

## 7. Roadmap after STUDENT-016I

Do not skip ahead while PR #57 is unresolved.

Sequence:

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17 → Stage18 → Stage19`

- `016R` — reconnect revalidation/purge;
- `016S` — revision/tombstone/cursor/delta synchronization;
- conditional `016O` — bounded outbox only if later offline writes actually require it;
- `016G` — Stage16 closure matrix;
- Stage17 connects authoritative Notes/Saved/Needs Review ownership, CRUD/provenance and offline/sync into the existing Library surfaces;
- Stage18 connects Notifications feed/unread/deep links/lifecycle;
- Stage19 connects only server-defined trusted Progress/Statistics/Achievements.

Do not claim Stage16 closed merely because Downloads UI works.

---

## 8. Super Admin governance

Do not implement legacy B06–B14 Admin batches from the Student branch. Dedicated Super Admin Product Rebuild owns Admin product architecture, workflows, API/data visibility, IA, frontend architecture and UX/UI.

---

## 9. Continuation rule

A replacement engineer should read evidence, live-check refs/CI, continue from the exact active batch, update documentation during work, preserve contracts, fix proven problems in the owning layer, and avoid both blind rewrite and preserving bad UX merely because it already exists.
