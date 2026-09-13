# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains in Git history, merged PRs and specialized workstream documents.

Last consolidated: **2026-09-13 — Stage16 / STUDENT-016I cold-start offline Reader**.

## 1. Project understanding

الوسيلة الذكية منصة تعليمية عربية تتكون من Student Web/PWA + Super Admin Web + Fastify API + PostgreSQL + content/media/OCR/AI/question-bank/assessment/offline authorities.

Student is an installed educational application, not an Admin dashboard. It must remain Arabic/RTL-first, learner-facing, clear, calm, responsive, accessible, fast and visually comfortable.

Admin remains a separate product workstream.

## 2. Stable architecture / authority

- `apps/student-web` — Student Web/PWA.
- `apps/admin-web` — Super Admin boundary.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- `packages/brand` — canonical brand/tokens.
- `packages/ui` — shared presentation primitives.

Stable contracts:

- API + PostgreSQL own canonical business state;
- browser is not canonical durable business authority;
- Auth/Authz/Entitlements remain server-owned;
- Full Code = 6 digits; Class Code = 7 digits;
- `media ready != published`;
- AI output never auto-publishes Student content/questions;
- protected Reader/media remains server-authorized;
- Question Bank publication + immutable Quiz version remain delivery authority;
- Assessment scoring/finalization/history remain server-owned;
- `/v1` is never Service Worker Cache authority;
- offline authorization remains bounded by server-issued lease + signed lesson authorization + device/profile scope;
- no password/session token/device private key is persisted as offline learning data.

## 3. Binding product/design decisions

- **AD-230** — preserve valid behavior/contracts, not legacy presentation debt.
- **AD-239** — mobile primary navigation is intentionally bounded.
- **AD-240** — `مكتبتي` owns learner personal/offline collections; `/app/downloads` is compatibility-only.
- **AD-242** — Student copy never exposes implementation/security/storage/stage/roadmap jargon.
- **AD-244** — Welcome is a first-installed/standalone experience, not a forced page on every anonymous web visit.
- **AD-245** — Account owns normal visible access/class-code/logout/help responsibilities.
- **AD-246** — one Student shell owns global chrome.
- **AD-247** — browser tests assert user outcomes, not obsolete copy/selectors.
- **AD-248** — raw API messages are not learner presentation copy.
- **AD-249** — invalid/offline/expired/unavailable/storage scenarios are first-class product states.
- **AD-250** — motion remains restrained and honors reduced motion.
- **AD-251** — future Student surfaces may exist before backend integration only as honest zero-data surfaces.
- **AD-252** — no fabricated learner metrics or records.
- **AD-253** — primary nav = `الرئيسية / التعلّم / التدريب / مكتبتي`.
- **AD-254** — destination-level code splitting protects initial bundle size.
- **AD-255** — interactive affordance must be obvious; targets >=44px.
- **AD-256** — Library overview is summary-first, not duplicated navigation.
- **AD-257** — Library statistics are informational; only authoritative real values may be connected.
- **AD-258** — continuation authority starts from top-level handoff/status/log + current Student product docs, then live GitHub state.
- **AD-259** — offline Reader access is a bounded continuation of previously authorized learning, not a synthetic server session. Server-authoritative online behavior must remain authoritative when reachable.
- **AD-260** — a persisted offline scope may identify the previously verified Student/device locally, but protected content is rendered only after current read-time lease, signed-manifest, time-bound and blob-integrity verification succeeds.

Binding design order:

**Clarity → Ease of use → Flow → Visual comfort → Consistency → Polish**

## 4. Verified merged Student baseline

### PR #53 — Student Experience Rebuild

- MERGED / VERIFIED;
- exact head `4c94063c5f09934353f5dbe1e2bb9509286e2812`;
- **23/23 workflows SUCCESS**;
- merge commit `d8ccb0b7ba004618cbcbdd96937d5cded47161dc`.

### PR #54 — Future Student Surfaces

- MERGED / VERIFIED;
- exact head `4b6f24c5cb9bd0da525ecfebc59b1ebbf156c903`;
- **23/23 workflows SUCCESS**;
- Visual QA accepted;
- merge commit `c3734366c132ea3919a925bdd0dd37cfd5d82104`.

### PR #55 — Library Overview Refinement

- MERGED / VERIFIED;
- accepted exact head `8ceb4d5a5f70f7896f6cb358e05605479942d442`;
- final exact-head matrix **23/23 SUCCESS**;
- B05 phone/desktop Visual QA artifact inspected and accepted;
- stale B02 old-heading acceptance fixed without weakening behavior;
- merge commit `343ff1fd7b3d64d7e990b72606695365f520fa58`.

Library outcome:

- one summary-first overview;
- one destination grid;
- no duplicate tabs;
- real Downloads count (`٠ → ١` acceptance);
- Notes/Saved/Needs Review remain honest zero states until Stage17.

Performance baseline remains approximately **225.89 KB minified / 71.24 KB gzip** initial Student JS after accepted feature-level code splitting.

## 5. Active work — `STUDENT-016I`

Branch: `stage16/student-016i`

Base: `main@343ff1fd7b3d64d7e990b72606695365f520fa58`

Purpose: close `UX-OFFLINE-104` by making a previously saved authorized lesson readable after a true browser/app restart while the network is unavailable, without weakening server/device/content security.

### Finding `OFFLINE-016I-101`

- **Severity:** P1
- **Area:** Student / PWA bootstrap
- **Problem:** `App.tsx` stopped the product at the connection gate whenever startup occurred offline, even when a durable Student/device scope and previously downloaded package existed.
- **Evidence:** pre-016I `checkSession()` immediately set phase `offline`; the offline phase always rendered `ConnectionGate`.
- **Impact:** a valid protected download could not be reached after restart.
- **Solution:** restore a bounded offline presentation identity only from the persisted non-secret `profileId + deviceId` scope; keep server session/auth authority untouched.
- **Status:** IMPLEMENTED ON ACTIVE BRANCH / CI PENDING.

### Finding `OFFLINE-016I-102`

- **Severity:** P1
- **Area:** Student / learning route
- **Problem:** lesson routes required online curriculum catalog loading before Reader routing.
- **Evidence:** `StudentLearningExperience` returned the generic offline state before resolving lesson context.
- **Impact:** deep-linking to a valid stored lesson offline was impossible.
- **Solution:** for an offline lesson route only, bypass online catalog dependency and enter the protected stored-lesson Reader path.
- **Status:** IMPLEMENTED ON ACTIVE BRANCH / CI PENDING.

### Finding `OFFLINE-016I-103`

- **Severity:** P1
- **Area:** Student / Reader
- **Problem:** the Reader knew only the online API representation and had no stored-package rendering path.
- **Solution:** add `StudentOfflineLessonReaderPage`; it calls `loadUsableOfflineLessonPackage(...)` and renders local Blob URLs only after the package passes all existing read-time checks.
- **Security:** no protected blob is rendered when lease/signature/time/scope/integrity verification fails.
- **Status:** IMPLEMENTED ON ACTIVE BRANCH / CI PENDING.

### Finding `OFFLINE-016I-104`

- **Severity:** P2
- **Area:** Student / Downloads UX
- **Problem:** saved lesson rows exposed update/remove only; there was no direct `فتح الدرس` learner action.
- **Solution:** add a clear lesson link using the existing canonical lesson route.
- **Status:** IMPLEMENTED ON ACTIVE BRANCH / CI PENDING.

### Corrected Stage16 understanding

The old Stage16 handoff listed durable scope, read-time signature and read-time hash verification as if still missing. Direct inspection of current post-PR55 code proves they are already implemented:

- `offline-session.ts` persists validated non-secret active scope in localStorage;
- `offline-authorization.ts` verifies ES256/P-256 signed canonical manifests;
- `offline-content-store.ts` rechecks package/profile/device/class/lease/time/signature plus stored blob byte-size/SHA-256 on every protected use.

Therefore `016I` does **not** rebuild these primitives. It connects the runtime to them.

## 6. `STUDENT-016I` executable acceptance

New browser acceptance:

`apps/student-web/e2e/offline-reader-cold-start.e2e.spec.mjs`

Target flow:

`download online → service-worker shell ready → delete HTTP session cookie → close Chromium → relaunch same persistent browser profile → force browser offline → direct lesson route → verified stored Reader renders`.

The same acceptance asserts fail-closed behavior for:

- stored signature mutation;
- same-size stored blob corruption;
- different profile scope;
- different device scope;
- client clock rollback beyond tolerance;
- authorization expiry.

`Stage16 Student PWA` workflow now runs this test alongside the existing lease/materialization suites in real Chromium.

Existing unit coverage already verifies canonical manifest tamper rejection, class/device bounds, signed expiry bounds, blob mutation, signature mutation and clock rollback policy.

## 7. Current verification state

- repository/code discovery for `016I` owning layers — COMPLETE;
- first implementation batch — COMMITTED;
- documentation synchronization — IN PROGRESS;
- local execution in this environment — NOT YET VERIFIED;
- exact-head PR CI — NOT YET VERIFIED;
- merge readiness — NO.

Do not downgrade the new cold-start browser test merely to get CI green. Fix failures in the owning runtime/test setup while preserving the security boundary.

## 8. Next roadmap

After `STUDENT-016I` is exact-head green and merged:

`STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17 → Stage18 → Stage19`

- `016R` — reconnect revalidation/purge;
- `016S` — revision/tombstone/cursor/delta sync;
- `016O` — bounded outbox only if future offline writes need it;
- `016G` — Stage16 closure matrix;
- Stage17 — Notes/Saved/Needs Review authority;
- Stage18 — Notifications authority;
- Stage19 — trusted Progress/Statistics/Achievements.

Super Admin remains a separate workstream.

## 9. Documentation precedence

Read current Student continuation in this order:

1. `PROJECT_HANDOFF.md`
2. `PROJECT_STATUS.md`
3. `PROJECT_ENGINEERING_LOG.md`
4. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`
5. `docs/product/STUDENT_PRODUCT_ARCHITECTURE.md`
6. `docs/product/STUDENT_FUTURE_SURFACES_SPEC.md`
7. `docs/product/STUDENT_LIBRARY_OVERVIEW_REDESIGN.md`
8. `docs/workstreams/STAGE16_STUDENT_HANDOFF.md`

Then live-check `main`, active PR and exact-head CI. Anything not inspected/executed is `NOT YET VERIFIED`.
