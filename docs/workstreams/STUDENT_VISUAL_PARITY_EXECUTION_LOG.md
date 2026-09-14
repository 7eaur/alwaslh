# Student Visual Parity Execution Log

## 2026-09-14 — Visual reference adopted

Approved reference screens are the visual source of truth for the Student experience. Product/backend authority remains unchanged.

### V01–V09 implementation
- Defined `STUDENT_VISUAL_SOURCE_OF_TRUTH.md`.
- Defined ordered `STUDENT_VISUAL_PARITY_PLAN.md` batches V01–V10.
- Added reusable botanical SVG motif and final Student visual-parity CSS layer.
- V01 shared shell: calm canvas, App Bar icon wells, four-destination phone nav, desktop rail, shared border/elevation language.
- V02 Home: reference-style welcome/quote, grouped real stats, Library/subjects/last-attempt using authoritative data only.
- V03 Welcome/Auth: centered official brand lockup, botanical framing, compact auth surface, activation/login switch, consistent fields/actions.
- V04 Learn: compact subject rows, mint icon wells, grouped surfaces, scale-aware search.
- V05 Subject: entity hero, class/count context, compact lesson rows, first populated unit behavior, no empty-unit card wall.
- V06 Reader: focused canvas; no global nav; no heavy card framing around canonical lesson media.
- V07 Practice: reference-family catalog/detail/mode surfaces while preserving assessment contracts.
- V08 Library: grouped list, real Downloads state only; Notes/Saved/Review stay fake-free.
- V09 Account/secondary: grouped surfaces, consistent links, isolated destructive logout.

### V10 — artifact-backed visual QA

Implementation head verified:

`ebb0434b80c192c610731a946ceaeb563683b15c`

All returned PR-triggered workflows completed successfully on that exact head, including UX B01–B05, Stage14, Stage15, Stage16 and Rebuild Stage Verification.

Exact-head artifacts manually inspected:
- B03 Subject + Reader: `390x844`, `768x1024`, `1366x900`;
- B04 Practice: attempt/result/detail/library at phone + desktop;
- B05 Welcome/Auth/Library/Account/secondary surfaces at phone + desktop.

Defects found and fixed during V10 rather than accepted as "green":
1. **Welcome horizontal overflow at 390px** — fixed by constraining decorative overflow/entry composition.
2. **Phone bottom-nav floating over Subject content** — root cause was visual-parity child positioning overriding the shell fixed-nav contract; fixed by restoring explicit fixed positioning/z-order.
3. **Tablet secondary navigation leakage** — `تقدمي / الحساب` were appearing beside the four primary tablet destinations; fixed so secondary links remain desktop-rail-only.
4. **Focused Reader decoration** — app-shell botanical framing was visible in Reader; fixed so focused Reader is content-first.
5. **Reader media framing** — residual card treatment around canonical lesson source media removed.
6. **Practice phone completion controls** — prior overlap remained absent in the final exact-head artifact.

B03 was upgraded to upload repeatable Subject/Reader screenshots at phone/tablet/desktop, so future regressions can be reviewed from CI artifacts instead of one-off screenshots.

### Final visual observations
- phone Subject bottom nav is fixed at viewport bottom and does not cover lesson content;
- tablet adaptive nav exposes exactly Home/Learn/Practice/Library;
- desktop rail exposes the primary destinations plus `تقدمي / الحساب` secondary links;
- Reader hides all global navigation and botanical shell decoration;
- canonical lesson media stays backend-published authority;
- Library/Account/Welcome follow the same approved visual family;
- no fabricated Stage17–19 data was introduced for appearance.

### Closure status

`V01–V10 = VERIFIED ON IMPLEMENTATION HEAD ebb0434...`

Documentation-only synchronization commits may follow. They do not change Student runtime behavior; if repository checks run on those commits, consume them before merge.

### No-go rules retained
- Do not invent Notes/Saved/Review/Progress/Notification data for visual parity.
- Do not replace canonical lesson media with decorative mockups.
- Do not add a fifth bottom navigation destination.
- Do not restore empty-unit card walls or heavy Reader media cards merely to match legacy selectors.
- Do not reopen the visual redesign after merge without new evidence or an explicit product decision.
