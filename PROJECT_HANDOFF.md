# PROJECT HANDOFF — الوسيلة الذكية

> نقطة البداية للمحادثة الهندسية التالية. لا تعتمد على ذاكرة المحادثات السابقة بدل المستودع. الكود + PostgreSQL migrations + الاختبارات/CI + verified runtime + الوثائق الحالية هي Source of Truth.

Last synchronized: **2026-09-13 — active batch `STUDENT-016I` on `stage16/student-016i`.**

## 1. Start here — mandatory

قبل أي تعديل جديد:

1. Confirm repository: `7eaur/alwaslh`.
2. Live-check `main`, open PRs and exact-head CI.
3. Read in order:
   - `PROJECT_HANDOFF.md`
   - `PROJECT_STATUS.md`
   - `PROJECT_ENGINEERING_LOG.md`
   - `docs/product/CURRENT_PRODUCT_OVERRIDES.md`
   - `docs/product/STUDENT_PRODUCT_ARCHITECTURE.md`
   - `docs/product/STUDENT_FUTURE_SURFACES_SPEC.md`
   - `docs/product/STUDENT_LIBRARY_OVERVIEW_REDESIGN.md`
   - `docs/workstreams/STAGE16_STUDENT_HANDOFF.md`
4. Inspect actual changed code/tests before editing.
5. Anything not inspected/executed = `NOT YET VERIFIED`.

---

## 2. Latest verified merged baseline

### PR #53

- MERGED / VERIFIED;
- accepted head `4c94063c5f09934353f5dbe1e2bb9509286e2812`;
- **23/23 workflows SUCCESS**;
- merge commit `d8ccb0b7ba004618cbcbdd96937d5cded47161dc`.

### PR #54

- MERGED / VERIFIED;
- accepted head `4b6f24c5cb9bd0da525ecfebc59b1ebbf156c903`;
- **23/23 workflows SUCCESS**;
- Visual QA accepted;
- merge commit `c3734366c132ea3919a925bdd0dd37cfd5d82104`.

### PR #55 — Library Overview Refinement

- **MERGED / VERIFIED**;
- accepted exact head `8ceb4d5a5f70f7896f6cb358e05605479942d442`;
- exact-head matrix **23/23 SUCCESS**;
- B05 phone/desktop Visual QA artifact inspected and accepted;
- stale B02 old-heading selector repaired without weakening navigation/focus/history/offline/no-overflow coverage;
- merge commit / current Stage16 base: `343ff1fd7b3d64d7e990b72606695365f520fa58`.

Library is now summary-first, has one destination grid, real Downloads count, no duplicate tabs and honest zero-state future collections.

---

## 3. ACTIVE NOW — `STUDENT-016I`

Branch: `stage16/student-016i`

Base: `main@343ff1fd7b3d64d7e990b72606695365f520fa58`

Goal: close the **true cold-start offline Reader** gap without creating a fake server session or weakening device/content authorization.

### Corrected Stage16 reality

The older Stage16 handoff is stale on three points. Direct inspection of current code proves these are already implemented:

- durable non-secret active scope (`profileId + deviceId`) persisted in localStorage;
- ES256/P-256 signed canonical lesson authorization reverified on protected use;
- stored blob byte-size + SHA-256 reverified on protected use.

Do **not** rebuild those layers.

The actual missing integration was:

1. `App.tsx` blocked the entire app at startup when offline;
2. `student-learning.tsx` required an online curriculum catalog before reaching a lesson route;
3. `student-reader.tsx` could not render a verified stored package;
4. Downloads had no direct `فتح الدرس` action.

### Current implementation on active branch

- `App.tsx`
  - restores a bounded local Student presentation identity only from the previously verified durable scope when bootstrap cannot reach the server;
  - does not persist or fabricate a server session/token;
  - online server authority remains unchanged.
- `student-learning.tsx`
  - offline lesson deep-links bypass the online catalog requirement and enter the stored Reader path only for lesson routes.
- `student-reader.tsx`
  - `StudentOfflineLessonReaderPage` calls `loadUsableOfflineLessonPackage(...)`;
  - protected content renders only after lease/scope/signature/time/blob verification succeeds;
  - invalid/tampered/expired packages fail closed with learner-safe copy;
  - local images use temporary object URLs after verification.
- `student-offline-downloads.tsx`
  - saved lessons now expose a direct `فتح الدرس` action.
- `.github/workflows/stage16-student-pwa.yml`
  - Stage16 Chromium gate now includes the cold-start Reader acceptance.

### New executable acceptance

`apps/student-web/e2e/offline-reader-cold-start.e2e.spec.mjs`

Required flow:

`download online → service-worker shell ready → clear HTTP session cookie → close Chromium → relaunch same persistent browser profile → set browser offline → direct-link to saved lesson → verified Reader renders`.

The same browser acceptance also rejects:

- corrupted stored ES256 signature;
- same-size blob corruption;
- different profile scope;
- different device scope;
- client clock rollback beyond tolerance;
- authorization expiry.

This is the merge gate. Do not weaken it merely to obtain green CI.

### Current verification state

- owning code/security discovery — COMPLETE;
- first coherent implementation batch — COMMITTED;
- top-level documentation — synchronized on branch;
- local execution in this environment — `NOT YET VERIFIED`;
- exact-head PR CI — `NOT YET VERIFIED`;
- merge readiness — **NO** until PR exact-head checks are green.

### Exact next action

1. synchronize `docs/workstreams/STAGE16_STUDENT_HANDOFF.md` with the corrected implementation reality;
2. open a focused PR to `main`;
3. inspect exact-head CI, especially `Stage16 Student PWA`;
4. fix any lint/type/build/browser failures in the owning layer without weakening security acceptance;
5. require all triggered workflows SUCCESS on the final head;
6. merge with expected-head SHA guard only after acceptance;
7. then continue immediately to `STUDENT-016R`.

---

## 4. Binding Student architecture

Final primary navigation:

1. `الرئيسية` — `/app/home`
2. `التعلّم` — `/app/learn`
3. `التدريب` — `/app/practice`
4. `مكتبتي` — `/app/library`

Secondary destinations: Notifications, Progress, Account.

Student is an educational application, not an Admin dashboard. Never expose raw IDs, crypto/storage jargon, roadmap vocabulary, fake metrics, fake badges or unsupported account/security controls.

Binding design order:

**Clarity → Ease of use → Flow → Visual comfort → Consistency → Polish**

Student feature trees remain destination-lazy. Preserve the accepted initial bundle reduction.

---

## 5. Stable backend/security authorities

Preserve unless new executable evidence explicitly changes them:

- API + PostgreSQL own canonical state;
- Auth/Authz/Entitlements are server-owned;
- returning Student uses password + bound device proof;
- Full Code = 6 digits; Class Code = 7 digits;
- curriculum: Class → Subject Offering → optional Section → Lesson;
- `media ready != published`;
- protected Reader/media remains authorized content;
- raw storage keys never become frontend contract;
- AI never auto-publishes learner content/questions;
- Question Bank publication + immutable Quiz version remain delivery authority;
- Assessment scoring/finalization/history remain server-owned;
- `/v1` never becomes Service Worker Cache authority;
- offline access remains bounded by active scope + stored lease + signed manifest + expiry + blob integrity;
- no password/session token/device private key is persisted as offline learning data.

Offline mode is a continuation of previously authorized learning only. It must never convert an explicit online 401/403/revocation into offline authorization.

---

## 6. Roadmap after `016I`

`STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17 → Stage18 → Stage19`

- `016R` — reconnect revalidation/purge;
- `016S` — revision/tombstone/cursor/delta synchronization;
- conditional `016O` — bounded outbox only if future offline writes require it;
- `016G` — Stage16 closure matrix;
- Stage17 — authoritative Notes / Saved / Needs Review;
- Stage18 — Notifications authority;
- Stage19 — trusted Progress / Statistics / Achievements.

Do not claim Stage16 closed at `016I`.

---

## 7. Super Admin governance

Super Admin remains owned by its dedicated rebuild workstream. Do not restart legacy Admin batches from this Student branch.

---

## 8. Continuation rule

A replacement engineer must read evidence, live-check refs/CI, continue from the exact active batch, update documentation during work, preserve contracts, and fix proven problems in the owning layer. No blind rewrite, and no preservation of bad UX merely because it already exists.
