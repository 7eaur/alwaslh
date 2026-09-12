# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains in Git history, merged PRs, Issue #16 and specialized workstream documents.

Last consolidated: **2026-09-13 — Student Experience Rebuild on PR #53.**

## Project Understanding

الوسيلة الذكية منصة تعليمية عربية تتكون من Student Web/PWA + Super Admin Web فوق Fastify/PostgreSQL.

Student is an installed educational app experience. The product is broader than the currently implemented visible destinations; final architecture must accommodate verified/preserved Notes, Saved Questions/Favorites/Needs Review, Notifications, Progress/Statistics/Achievements and richer Reader tools without exposing fake destinations before their roadmap stages exist.

Canonical Student architecture: `docs/product/STUDENT_PRODUCT_ARCHITECTURE.md`.

Admin B06–B14 are not active here. A dedicated **Super Admin Product Rebuild** workstream owns Admin product responsibilities, backend workflow mapping, IA, navigation, frontend architecture and UX/UI decisions.

## Stable Architecture / Authority

- `apps/student-web` — Student Web/PWA.
- `apps/admin-web` — Super Admin; rebuild delegated to dedicated Admin workstream.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- `packages/brand` — canonical brand/tokens.
- `packages/ui` — shared presentation primitives/foundation.

Stable authority contracts:

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

## Binding Product / Design Decisions

- **AD-230** — legacy visuals are not a preservation contract; preserve correct flows/contracts, not presentation debt.
- **AD-231..AD-237** — B04 routed Practice/Assessment, humanized question-set language, focused attempts, Practice/Test semantics, API-owned restore, no decorative perf debt, result scroll/focus acceptance remain active.
- **AD-239 — Student future-complete IA.** Mobile primary navigation is intentionally bounded to `الرئيسية | التعلّم | التدريب | مكتبتي`. Account and Notifications are secondary global actions. Progress gets its own route only when Stage19 exists.
- **AD-240 — Library ownership.** `مكتبتي` is the future owner of Downloads + Stage17 Notes/Saved/Needs Review. Existing `/app/downloads` remains compatible until executable migration exists.
- **AD-241 — no fake future routes.** Stage17–19 capabilities have reserved placement but remain hidden until implementation/contracts exist.
- **AD-242 — learner-copy boundary.** Normal Student UI must not expose cryptography, cache/storage/session implementation, raw IDs, Admin vocabulary, stage names, roadmap status or internal diagnostics.
- **AD-243 — support honesty.** Help/Support are real product surfaces. No phone/email/WhatsApp/contact channel may be invented when repository contracts do not provide an approved value.
- **AD-244 — installed Welcome.** Welcome is a first-launch experience for installed/standalone PWA, not a forced extra page on every anonymous web visit.
- **AD-245 — Account ownership.** Account is the sole normal visible owner of class access, logout and account help links; access panels must not be duplicated on Home/Learn.
- **AD-246 — shell ownership.** One Student shell owns global chrome. Account wrappers around every route and permanently visible online-status chrome are removed.
- **AD-247 — tests assert outcomes, not obsolete copy.** Browser tests verify successful auth/access/navigation/device behavior rather than force redundant UI text such as persistent “تم تسجيل الدخول”.
- **AD-248 — learner error boundary.** API/PostgreSQL own error truth/codes, but Student presentation owns the explanation. Raw backend messages are never a UI contract; Student maps code/status/context to a clear explanation plus a realistic next action.
- **AD-249 — predictable-failure acceptance.** Expected invalid/offline/expired/unavailable/storage scenarios are first-class product states and must be tested, not left to a generic catch-all.

Binding design order:

**Clarity → Ease of use → Flow → Visual comfort → Consistency → Polish**

Acceptance:

**Functional + Clear + Easy + Comfortable + Consistent + Fast + Maintainable + Professional**

## Student Product Placement

### Visible/current responsibilities

- Entry: activation / login / recovery.
- Home: orientation and next real action; no fake metrics.
- Learn: class/subject/lesson browsing.
- Reader: focused lesson workspace.
- Practice: catalog → quiz choice → focused attempt → result/review.
- Downloads: saved/available offline packages under existing Stage16 authority.
- Account: identity/access/class-code/logout/help.
- Help / Support: reusable routes with learner-only content.

### Reserved future responsibilities

- Stage17: Notes, Saved/Favorites, Needs Review under `مكتبتي` and contextual Reader/Assessment entry points.
- Stage18: notification bell + feed/deep links when real unread/action contracts exist.
- Stage19: Progress/Statistics/Achievements route using trusted metrics only.

## Completed UX Refoundation Baseline

- UX-B00 — DONE / VERIFIED / MERGED — PR #42, final head `203882a934dfcb68df4a1e1e4f972583317cabf1`, 15/15 SUCCESS.
- UX-B01 — DONE / VERIFIED / MERGED — PR #43, final head `781e70eb31a48b76e50a1bad490f7aa947d2d7ce`, 20/20 SUCCESS.
- UX-B02 — DONE / VERIFIED / MERGED — PR #44, final head `b956248418303618120d02cda562bf179cd7071b`, 20/20 SUCCESS.
- UX-B03 — DONE / VERIFIED / MERGED — PR #46, accepted head `42bf4e28b448ee27dff628c43e6db8ce564db805`, 21/21 SUCCESS; merge `56ee51ab0d5669b4a38f9efec991ea79971d3503`.
- UX-B04 — DONE / VERIFIED / MERGED — final synchronized head `56f19b88169160c8edd90c9cad8cf129a834b76e`; 23/23 SUCCESS after one same-SHA transient Chromium focus rerun; PR #47 merged; current work started from live main `f44d5f72eaeb0acd8ca5c67d2816a56596761f21`.

Parallel audit/security work preserved in that baseline includes the Full Product Architecture Audit and `FPA-002` Assessment authorization repair.

## Active Work — PR #53 Student Experience Rebuild

PR #53 began as UX-B05 Downloads/Account/Copy Closure. Product Owner expanded it into an end-to-end learner experience rebuild while retaining the B05 offline/account responsibilities.

Implemented/refactored:

- Downloads rebuilt into saved + available learner library while preserving signed authorization, checksum/storage limits, materialization and cleanup contracts.
- Account is the only normal visible owner of entitlement/class-code management, logout and help/support links.
- access panel duplication removed from Home and Learn.
- `App.tsx` reduced to session orchestration.
- old authenticated Account wrapper removed.
- first installed-app Welcome created.
- activation/login/recovery rebuilt into `student-entry.tsx`.
- public `/help` and `/support` routes added without invented support contact details.
- unified Student app bar / adaptive desktop navigation / four-item mobile navigation.
- persistent “online” chrome removed; network state appears only when degraded/actionable.
- Home simplified around real destinations.
- Learn/Subject presentation rebuilt with calmer hierarchy and actionable unavailable-route states.
- focused Reader presentation rebuilt; search exposes result count and can move DOM focus to the first result using button or Enter, closing `FPA-013` behavior.
- Practice/Assessment preserves server-owned scoring/finalization while unavailable sessions and write/finalize errors use learner-safe messages.
- Downloads distinguish storage budget, device quota, integrity/incomplete download, device verification and network failures with specific next actions.
- centralized `student-error-copy.ts` maps API error code/status/context to Student copy and is unit-tested against raw backend leakage.
- activation/access browser tests now cover incomplete codes and password mismatch before requests are sent.
- Stage14/15/16 and B03/B04 browser suites are being migrated from obsolete copy selectors to real user outcomes.
- production-realistic Reader fixture data replaces Student-visible Stage/Reader test wording.
- `stage14.css` removed.
- `assessment-polish.css` removed; live integration rules separated.

## Predictable Error Scenario Matrix

| Area | Expected scenario | Learner response / action | Verification |
|---|---|---|---|
| Activation | code shorter than 6 digits | submit disabled + 6-digit hint | browser |
| Activation | invalid/expired code | explain invalid/expired; verify/request new | browser + unit mapper |
| Activation | password mismatch | inline mismatch + submit disabled | browser |
| Login | invalid credentials | verify account ID/password | mapper unit + auth contracts |
| Login | temporary password | require private replacement password | browser |
| Login | device verification/rebind | open Support/request re-link; no crypto jargon | mapper unit + browser contract |
| Entry | offline/service unavailable/rate limit | connect/retry or wait/retry | PWA + mapper unit |
| Session | expired | login again | browser |
| Account | malformed class code | submit disabled + 7-digit instruction | browser |
| Account | invalid/expired/changed access | contextual access message + retry/support | mapper |
| Learn | no authorized content | explain class-code route to Account | browser/UI |
| Learn | unavailable subject/lesson | return to available Learn route | UI |
| Reader | media fail | verify connection + reload page | UI |
| Reader | no search result | explicit no-result state | browser |
| Reader | search result | count + focus first result | browser / FPA-013 closure |
| Practice | no quiz | clear empty state | UI |
| Assessment | offline | answer writes/finalize blocked until reconnect | browser |
| Assessment | session unavailable | return to Practice; raw API detail hidden | browser |
| Downloads | scope/device storage full | remove content/free device space then retry | UI + contracts |
| Downloads | integrity/incomplete asset | discard incomplete download + retry | browser/contracts |
| Downloads | offline | manage saved content only | browser |

## Findings Register

| ID | Severity | Area | Problem | Evidence / Solution | Status |
|---|---:|---|---|---|
| `UX-IA-101` | P1 | Routing | apps lacked route navigation | BrowserRouter + route foundation | FIXED / B01 |
| `UX-IA-102` | P1 | Student shell | Student was aggregate/account-wrapped surface | stable single shell | FIXED / REVALIDATING |
| `UX-IA-104` | P1 | Learn | subject/lesson local navigation | routed hierarchy | FIXED / B03 |
| `UX-IA-105` | P1 | Reader | Reader embedded/visually coupled | focused Reader | FIXED / REVALIDATING |
| `UX-IA-106` | P1 | Practice | dashboard-like catalog/detail/attempt/result | routed hierarchy | FIXED / B04 |
| `UX-COPY-103` | P1 | Assessment | implementation/version language exposed | learner language | FIXED / B04 |
| `UX-COPY-104` | P1 | Entry | technical device/storage/internal language | learner-safe Entry copy + scan | FIXED / REVALIDATING |
| `UX-COPY-105` | P1 | Error UX | Student components could surface `ApiRequestError.message` directly | centralized contextual error mapper + tests | FIXED / FINAL CI PENDING |
| `UX-IA-107` | P1 | Entry | Welcome/Auth/Help/Support lacked coherent flow | Student Entry Experience | FIXED / REVALIDATING |
| `UX-IA-108` | P1 | Shell | duplicate brand/account/network chrome | single shell | FIXED / REVALIDATING |
| `UX-ARCH-104` | P2 | CSS | historical stage/polish overrides | stage14/polish removed; remaining dead CSS is non-blocking cleanup only if parity proves safe | IMPROVED / P3 RESIDUAL |
| `UX-ARCH-105` | P2 | Future IA | future features lacked placement | Student architecture doc | FIXED / ARCHITECTURE |
| `UX-OFFLINE-104` | P1 | Reader | true cold-start offline Reader not yet closed | return to `STUDENT-016I`; do not fake completion | OPEN / PAUSED CONTRACT |
| `FPA-002` | P1 | Assessment authz | abandoned-session authorization omission | independent server repair | FIXED / MERGED |
| `FPA-013` | P2 | Reader a11y | active search match did not move DOM focus | focusable first result + explicit jump / Enter | FIXED / FINAL CI PENDING |
| `UX-IA-103` | P1 | Admin | Admin needs dedicated architecture/rebuild | Super Admin Product Rebuild | DELEGATED |
| `AI-012..AI-019` | P2 | AI | live provider readiness not proven | separate verification | NOT YET VERIFIED |

## Verification Policy / Current Evidence

The large Entry/Shell/Reader refactor passed Student lint/typecheck/unit/build on an intermediate head. A previous exact-head matrix showed non-Student backend/Admin workflows green while Student browser failures were localized to obsolete presentation assertions and a fixture that leaked “Stage14” into Student-visible text; those causes were explicitly corrected rather than reintroducing obsolete UI.

The current implementation is now frozen for final verification unless CI identifies a real regression. Final acceptance requires one stable exact head with:

- lint;
- strict typecheck;
- unit tests including Student error-copy boundary;
- production build;
- clean PostgreSQL contracts where triggered;
- Stage14 activation/access/curriculum browser flow;
- B01/B02/B03/B04/B05 browser regressions;
- Stage15 Assessment;
- Stage16 offline/PWA;
- Rebuild workflow;
- all other triggered workflows;
- responsive/no-overflow checks;
- production-copy scan;
- manual phone/desktop Visual QA artifact inspection.

A green build alone is not product acceptance.

## Known Remaining Work Before PR #53 Merge

- complete stable exact-head CI;
- fix only evidence-backed regressions discovered by that matrix;
- manually inspect final visual artifacts for Welcome/Auth/Help/Support/Home/Learn/Reader/Practice/Downloads/Account where fixture coverage exists;
- keep implementation/stage/roadmap language blocked in Student production copy;
- synchronize with live `main` if it moved materially;
- update PR #53 / Issue #16 with final evidence;
- merge only with exact expected-head guard.

Potential dead selectors in legacy `styles.css` / historical Assessment shell rules are classified as low-risk cleanup after executable parity; they are not justification to destabilize a functionally accepted Student product. Bundle size >500 kB remains a performance debt for later route-level code-splitting evaluation after structural closure.

## Admin Governance

Do not implement legacy B06–B14 from this branch. Preserve shared brand/UI foundations and server contracts for the dedicated Super Admin rebuild. After Admin integration, resynchronize shared cross-product cleanup, responsive/RTL/accessibility and visual-regression closure.

## Roadmap Return

After UX refoundation closes, normal roadmap resumes exactly at:

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17`

Stage17–19 must follow `STUDENT_PRODUCT_ARCHITECTURE.md` rather than inventing new top-level navigation.
