# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains in Git history, merged PRs, Issue #16 and specialized workstream documents.

Last consolidated: **2026-09-13 — Student Experience Rebuild / PR #53 final acceptance cycle.**

## Project Understanding

الوسيلة الذكية منصة تعليمية عربية تتكون من Student Web/PWA + Super Admin Web فوق Fastify/PostgreSQL.

Student is an installed educational app experience, not a dashboard. The visible product must remain bounded to implemented contracts while its architecture reserves correct placement for future Notes/Saved/Needs Review, Notifications and Progress without exposing fake destinations early.

Canonical Student architecture: `docs/product/STUDENT_PRODUCT_ARCHITECTURE.md`.

Admin B06–B14 are not active in this branch. A dedicated **Super Admin Product Rebuild** workstream owns Admin product architecture, backend workflow mapping, IA, frontend architecture and UX/UI.

## Stable Architecture / Authority

- `apps/student-web` — Student Web/PWA.
- `apps/admin-web` — Super Admin; rebuild delegated to dedicated Admin workstream.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- `packages/brand` — canonical brand/tokens.
- `packages/ui` — shared presentation primitives/foundation.

Stable contracts:

- browser is not canonical business authority;
- API + PostgreSQL own canonical state;
- Auth/Authz/Entitlements remain server-owned;
- `media ready != published`;
- AI output never auto-publishes Student content/questions;
- Assessment scoring/finalization remains server-owned;
- published immutable quiz-version authority remains server-owned;
- `/v1` is never Service Worker Cache authority;
- signed offline authorization/integrity/device/session rules remain unchanged;
- no password/session token/device private key is persisted as offline learning content.

## Architecture / Product Decisions

- **AD-230** — legacy visuals are not a preservation contract; preserve correct flows/contracts, not presentation debt.
- **AD-239** — Student future-complete IA keeps mobile primary navigation bounded to real learner destinations; future features remain reserved but hidden until contracts exist.
- **AD-240** — `مكتبتي` is the future owner of Downloads + Stage17 Notes/Saved/Needs Review; existing `/app/downloads` remains compatible until executable migration exists.
- **AD-241** — no fake future routes for Stage17–19.
- **AD-242** — Student production copy must not expose crypto/cache/storage/session implementation, raw IDs, Admin vocabulary, stage names, roadmap state or internal diagnostics.
- **AD-243** — Help/Support must not invent phone/email/WhatsApp or contact channels absent repository authority.
- **AD-244** — Welcome is an installed/standalone first-launch experience, not a forced page on every anonymous web visit.
- **AD-245** — Account owns class access, logout and account help; these controls are not duplicated across Home/Learn.
- **AD-246** — one Student shell owns global chrome; permanent online-status chrome and route wrappers are removed.
- **AD-247** — browser tests assert user outcomes and contracts rather than obsolete presentation copy.
- **AD-248** — API/PostgreSQL own error truth/codes; Student presentation owns safe learner explanation and next action. Raw backend messages are not presentation contracts.
- **AD-249** — predictable invalid/offline/expired/unavailable/storage failures are first-class product states and require executable acceptance.
- **AD-250** — motion is an affordance, not decoration: short opacity/transform/box-shadow transitions, no heavy animation framework or continuous decorative motion, and mandatory `prefers-reduced-motion` support.

Binding design order:

**Clarity → Ease of use → Flow → Visual comfort → Consistency → Polish**

Acceptance:

**Functional + Clear + Easy + Comfortable + Consistent + Fast + Maintainable + Professional**

## User Flows — Student

Current visible flow ownership:

- Entry → activation / returning login / temporary-password recovery.
- Home → orientation and next real learner action; no invented metrics.
- Learn → Class/Subject/Lesson.
- Reader → focused lesson workspace with protected media/search/listening states.
- Practice → quiz catalog/detail → focused attempt → result/review.
- Downloads → saved/available offline packages under Stage16 authority.
- Account → identity/access/class code/logout/help/support.
- Help/Support → reusable learner-only guidance.

Reserved future ownership:

- Stage17 Notes/Saved/Needs Review under `مكتبتي` and contextual Reader/Assessment entry points.
- Stage18 notification bell/feed only when real notification contracts exist.
- Stage19 Progress/Statistics/Achievements route using trusted metrics only.

## Changes Made — PR #53

PR #53 began as UX-B05 Downloads/Account/Copy Closure and was expanded into a coherent Student Experience Rebuild while preserving backend/security/business contracts.

Implemented/refactored:

- installed-app Welcome / first-run experience;
- activation/login/recovery rebuilt as learner-facing entry experience;
- public `/help` and `/support` routes without invented support channels;
- `App.tsx` reduced to session orchestration;
- unified app bar, adaptive navigation and four-item mobile navigation;
- Home simplified around real destinations;
- Learn/Subject hierarchy rebuilt with calmer information hierarchy;
- focused Reader rebuilt; search exposes result count and moves DOM focus to first result via button or Enter, closing `FPA-013` behavior;
- Practice/Assessment remains routed/focused while hiding raw API detail and preserving server scoring/finalization;
- Downloads rebuilt into saved + available learner library while preserving signed authorization, checksum, storage-budget, materialization and cleanup contracts;
- Account is the sole normal visible owner of access/class-code/logout/help/support;
- centralized `student-error-copy.ts` maps API code/status/context to safe learner copy;
- `stage14.css` and obsolete `assessment-polish.css` removed where executable parity proved safe;
- production-realistic Reader fixture wording replaces Student-visible stage/internal fixture language;
- `student-motion.css` adds restrained surface-entry motion, feedback appearance, hover/press response and lightweight depth/borders without adding JavaScript animation dependencies;
- reduced-motion collapses animation/transition duration and is covered by real Chromium acceptance.

## Predictable Error Scenario Matrix

| Area | Expected scenario | Learner outcome | Verification |
|---|---|---|---|
| Activation | incomplete/invalid/expired code | clear code guidance; no backend detail | browser + mapper |
| Activation | password mismatch | inline mismatch; submit disabled | browser |
| Login | invalid credentials | verify ID/password | mapper/contracts |
| Login | temporary password | replace with private password | browser |
| Login | device verification/rebind | safe support/re-link guidance | mapper/browser |
| Entry | offline/rate limit/service unavailable | connect/wait/retry action | PWA + mapper |
| Session | expired | return to login safely | browser |
| Account | malformed/invalid class code | format guidance / contextual failure | browser + mapper |
| Learn | no/unavailable content | Account or Learn recovery path | browser/UI |
| Reader | media/search/no result | actionable state; first-result focus | browser |
| Assessment | offline/unavailable session | block writes/finalize; reconnect/Practice recovery | browser |
| Downloads | storage budget/quota | remove content/free device space | UI/contracts |
| Downloads | tampered/incomplete asset | reject package; persist nothing; retry guidance | Chromium/contracts |
| Downloads | offline | manage saved content only | browser |

## Audit Findings

| ID | Severity | Area | Problem | Evidence / Solution | Status |
|---|---:|---|---|---|
| `UX-IA-101` | P1 | Routing | app lacked robust route navigation | BrowserRouter + routed foundation | FIXED / B01 |
| `UX-IA-102` | P1 | Student shell | aggregate/account-wrapped experience | one stable Student shell | FIXED |
| `UX-IA-104` | P1 | Learn | weak subject/lesson local navigation | routed hierarchy | FIXED / B03 |
| `UX-IA-105` | P1 | Reader | embedded/visually coupled Reader | focused Reader | FIXED |
| `UX-IA-106` | P1 | Practice | dashboard-like mixed flow | routed Practice/Assessment hierarchy | FIXED / B04 |
| `UX-COPY-103` | P1 | Assessment | implementation/version language | learner-facing terminology | FIXED / B04 |
| `UX-COPY-104` | P1 | Entry | technical device/storage copy | learner-safe entry copy + scanner | FIXED |
| `UX-COPY-105` | P1 | Error UX | raw API messages could become UI | contextual error mapper + tests | FIXED / FINAL HEAD CI PENDING |
| `UX-IA-107` | P1 | Entry | Welcome/Auth/Help/Support fragmented | coherent Entry Experience | FIXED |
| `UX-IA-108` | P1 | Shell | duplicate chrome/status | unified shell | FIXED |
| `UX-MOTION-101` | P2 | Interaction | surfaces felt static | restrained motion/depth + reduced-motion | FIXED / VISUALLY ACCEPTED |
| `UX-ARCH-104` | P2 | CSS | historical stage/polish overrides | obsolete layers removed where safe | IMPROVED / P3 residual cleanup only |
| `UX-OFFLINE-104` | P1 | Reader | true cold-start offline Reader authority not closed | resume at `STUDENT-016I`; do not fake completion | OPEN / ROADMAP |
| `FPA-002` | P1 | Assessment authz | abandoned-session authorization omission | server repair | FIXED / MERGED |
| `FPA-013` | P2 | Reader a11y | search match did not receive DOM focus | explicit first-result focus | FIXED |
| `UX-IA-103` | P1 | Admin | Admin requires dedicated rebuild | separate Super Admin Product Rebuild | DELEGATED |
| `AI-012..AI-019` | P2 | AI | live-provider readiness not proven | separate verification | NOT YET VERIFIED |

## Tests & Verification

Merged baseline:

- B00 PR #42 — verified/merged.
- B01 PR #43 — verified/merged.
- B02 PR #44 — verified/merged.
- B03 PR #46 — verified/merged.
- B04 PR #47 — final synchronized head `56f19b88169160c8edd90c9cad8cf129a834b76e`, **23/23 SUCCESS**, merged.

PR #53 acceptance evidence before the documentation-complete final head:

- code head `17b1c43915eb5b3c279b91727fc8f1c3bc4e1ca8` had B01/B02/B03/B04/B05, Stage15 and all Stage16 jobs SUCCESS;
- Stage16 proved PWA shell, PostgreSQL offline contracts, IndexedDB lease lifecycle, real protected materialization and tampered-asset rejection;
- offline corruption acceptance fetches the real manifest asset, mutates one byte without changing byte length, proves the request was intercepted, expects checksum rejection, and verifies zero package persisted;
- Student quality gates repeatedly passed: lint, strict typecheck, **41 unit tests**, production build;
- B05 Visual QA artifact: `10307419204`, digest `sha256:4fb6af5dd071d7dbf30bdfeea7704db9917a9185766ea8288aba526f6313405d`;
- manually inspected 16 B05 screenshots across Activation, Welcome, Help, Support, Downloads library/saved/offline and Account on phone + desktop: RTL, hierarchy, density, boundaries/depth, offline state and responsive composition are acceptable; no launch-blocking visual defect found;
- B05 real Chromium reduced-motion acceptance passed;
- Stage14 quality/build/migrations/curriculum/Reader contracts passed; the final browser failure was a test race that began watching the entitlement `401` after Account had already detected session expiry. The test now starts the observer before Account navigation and no product/security contract was changed.

### Browser-test corrections made during closure

The following failures were proven stale/brittle expectations rather than product-contract regressions:

- `التعلم` selector updated to production `التعلّم`;
- Reader result assertion narrowed to the actual result-count element;
- resumed Assessment selects question identity instead of blindly clicking Next;
- authenticated return accepts Home or Account rather than forcing Home;
- class activation proves redeem + routed curriculum outcome instead of transient success-banner copy;
- offline lifecycle uses current Auth labels and real entitlement expiry behavior;
- offline corruption uses the manifest `downloadPath`, real bytes and asynchronous interception;
- approved learner integrity message is asserted exactly;
- session-expiry test watches the real `401` before navigating to Account.

No browser-test correction weakened database, authorization, integrity, scoring or publication authority.

## Performance

Latest observed Student production build during closure:

- CSS: approximately `70.98 kB` minified / `12.08 kB` gzip.
- JS: approximately `568.80 kB` minified / `144.88 kB` gzip.
- Vite warns that the JS chunk exceeds 500 kB.

Classification: **P2/P3 performance debt, not current refoundation blocker.** Evaluate route-level code splitting after structural closure; do not add premature chunk complexity inside this acceptance cycle without measured cause.

The motion layer adds CSS only; no animation runtime dependency was introduced.

## Security

No security authority was relaxed by PR #53:

- no raw backend error leakage accepted as UI contract;
- no offline password/session token/private device key storage introduced;
- signed offline authorization and checksum validation remain mandatory;
- tampered assets are rejected before package persistence;
- API/PostgreSQL continue to own authorization and canonical state;
- Assessment scoring/finalization remain server-owned.

## Known Issues / Remaining Work

Before PR #53 merge:

1. run the complete workflow matrix on the final documentation-complete head;
2. require all triggered workflows, including Stage14/15/16, B01–B05 and Rebuild, to finish SUCCESS;
3. verify live `main` did not move materially;
4. record final acceptance in PR #53 and Issue #16;
5. merge with exact expected-head guard;
6. verify live-main merge SHA.

After merge:

- synchronize with the dedicated Super Admin Product Rebuild;
- shared responsive/RTL/accessibility/visual closure follows after Admin integration;
- resume normal roadmap exactly at `STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17`.

## Explicit Non-goals

- no premature Stage17 Notes/Favorites/Needs Review UI;
- no premature Stage18 Notifications UI;
- no premature Stage19 Progress/Statistics/Achievements UI;
- no silent implementation of cold-start offline Reader authority before `STUDENT-016I`;
- no Admin rebuild from this Student branch;
- no heavy animation framework, continuous decorative motion, bounce/glow effects or motion that obscures focus/state.
