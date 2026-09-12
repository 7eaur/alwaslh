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
- **AD-247 — tests assert outcomes, not obsolete copy.** Browser tests must verify successful auth/access/navigation/device behavior rather than force redundant UI text such as persistent “تم تسجيل الدخول”.

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
- UX-B04 — DONE / VERIFIED / MERGED — final synchronized head `56f19b88169160c8edd90c9cad8cf129a834b76e`; 23/23 SUCCESS after one same-SHA transient Chromium focus rerun; PR #47 merged; branch for current work started from live main `f44d5f72eaeb0acd8ca5c67d2816a56596761f21`.

Parallel audit/security work preserved in that baseline includes the Full Product Architecture Audit and `FPA-002` Assessment authorization repair. `FPA-013` Reader active-search-match DOM focus finding remains OPEN unless current Reader work proves/fixes it separately.

## Active Work — PR #53 Student Experience Rebuild

PR #53 began as UX-B05 Downloads/Account/Copy Closure. Product Owner explicitly expanded it into an end-to-end learner experience rebuild while retaining the B05 offline/account responsibilities.

Implemented/refactored so far:

- Downloads rebuilt from single-selector UI into saved + available library while preserving materialization, signed authorization, checksum/storage limits and cleanup contracts.
- Account is the only normal visible owner of entitlement/class-code management.
- access panel duplication removed from Home and Learn.
- `App.tsx` reduced to session orchestration.
- old authenticated `AccountPage` wrapper removed.
- first installed-app Welcome created.
- activation/login/recovery rebuilt into `student-entry.tsx` with learner-facing language.
- public `/help` and `/support` routes added.
- support copy intentionally does not invent contact details.
- unified Student app bar / adaptive desktop navigation / four-item mobile bottom navigation.
- persistent “online” chrome removed; network state appears only when degraded/actionable.
- Home simplified around real destinations.
- Learn/Subject presentation rebuilt with calmer hierarchy.
- focused Reader presentation decoupled from removed AccountPage CSS and rebuilt around controlled reading width.
- B05 visual/copy Chromium test expanded to Welcome/Auth/Help/Support/Downloads/Account on phone+desktop where fixtures permit.
- production-copy test blocks implementation/stage/roadmap vocabulary.
- Stage14 activation E2E changed from obsolete copy assertions to learner outcome assertions while keeping Arabic digit normalization, device key continuity/rebind, recovery, class redemption and curriculum behavior.
- `stage14.css` removed from production architecture.
- historical `assessment-polish.css` removed; live integration rules moved to `assessment-integration.css`.
- generic Practice heading is no longer rendered only to be hidden by CSS; Practice owns its own hierarchy.

## Findings Register

| ID | Severity | Area | Problem | Evidence / Solution | Status |
|---|---:|---|---|---|
| `UX-IA-101` | P1 | Routing | apps lacked route navigation | BrowserRouter + route foundation | FIXED / B01 |
| `UX-IA-102` | P1 | Student shell | Student was aggregate/account-wrapped surface | stable shell, current rebuild removed AccountPage wrapper | FIXED / REVALIDATING |
| `UX-IA-104` | P1 | Learn | subject/lesson local navigation | routed hierarchy | FIXED / B03 |
| `UX-IA-105` | P1 | Reader | Reader embedded/visually coupled to browser shell | focused route; CSS ownership rebuilt | FIXED / REVALIDATING |
| `UX-IA-106` | P1 | Practice | dashboard-like catalog/detail/attempt/result | routed hierarchy | FIXED / B04 |
| `UX-COPY-103` | P1 | Assessment | implementation/version language exposed | learner language | FIXED / B04 |
| `UX-COPY-104` | P1 | Entry | cryptography/device/storage/internal language was shown to learner | rebuilt Entry copy + production-copy scan | FIXED / REVALIDATING |
| `UX-IA-107` | P1 | Entry | Welcome/Auth/Help/Support lacked one coherent experience | new Student Entry Experience + public Help/Support | FIXED / REVALIDATING |
| `UX-IA-108` | P1 | Shell | duplicate brand/account/network chrome from layered batches | single shell; account wrapper removed | FIXED / REVALIDATING |
| `UX-ARCH-104` | P2 | CSS | stage/polish styles override newer features | removed `stage14.css`; replaced `assessment-polish.css`; further `styles.css` cleanup after parity | IN PROGRESS |
| `UX-ARCH-105` | P2 | Future IA | Notes/Saved/Notifications/Progress had no final placement in current 5-route IA | `STUDENT_PRODUCT_ARCHITECTURE.md` | FIXED / ARCHITECTURE |
| `UX-OFFLINE-104` | P1 | Reader | Downloads promise cannot yet guarantee true cold-start offline Reader | do not fake completion; return to `STUDENT-016I` after refoundation | OPEN / PAUSED CONTRACT |
| `FPA-002` | P1 | Assessment authz | abandoned-session authorization omission | independent repair + DB/Chromium proof | FIXED / MERGED |
| `FPA-013` | P2 | Reader a11y | active search match does not move DOM focus | audit evidence | OPEN |
| `UX-IA-103` | P1 | Admin | Admin needs dedicated architecture/rebuild | Super Admin Product Rebuild | DELEGATED |
| `AI-012..AI-019` | P2 | AI | live provider readiness not proven | separate verification | NOT YET VERIFIED |

## Current Verification Evidence

During the expanded rebuild, Student lint/typecheck/unit/build has already passed on an intermediate refoundation head after the large Entry/Shell/Reader restructuring. Intermediate browser runs were frequently cancelled because newer commits superseded them; this is expected CI concurrency behavior and is not acceptance evidence.

Final acceptance requires one stable exact head with:

- lint;
- strict typecheck;
- unit tests;
- production build;
- clean PostgreSQL contracts where triggered;
- Stage14 real Chromium activation/access/curriculum;
- B01/B02/B03/B04/B05 browser regressions;
- Stage15 Assessment;
- Stage16 offline/PWA;
- Rebuild workflow;
- all other triggered repository workflows;
- responsive/no-overflow checks;
- manual Visual QA artifact inspection.

A green build alone is not product acceptance.

## Known Remaining Work in Current Refoundation

- wait for a stable final head instead of accepting superseded intermediate runs;
- root-cause any browser regression found by Stage14/B02/B03/B04/B05/Stage15/Stage16;
- finish Assessment integration cleanup where `assessment.css` still contains historical shell selectors;
- inspect and then remove dead Entry/Account/Curriculum selectors from `styles.css` only after executable parity confirms no caller;
- verify/resolve `FPA-013` during Reader/a11y closure;
- evaluate route-level code splitting after structure stabilizes; historical bundle exceeded 500 kB;
- inspect phone/desktop visual artifacts and correct actual composition problems rather than only DOM failures;
- synchronize branch with live `main` before merge if main moves;
- final status/log/Issue #16 update and exact-head guarded merge.

## Admin Governance

Do not implement legacy B06–B14 from this branch. Preserve shared brand/UI foundations and server contracts for the dedicated Super Admin rebuild. After Admin integration, resynchronize shared cross-product cleanup, responsive/RTL/accessibility and visual-regression closure.

## Roadmap Return

After UX refoundation closes, normal roadmap resumes exactly at:

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17`

Stage17–19 must follow the placements defined in `STUDENT_PRODUCT_ARCHITECTURE.md` rather than inventing new top-level navigation.