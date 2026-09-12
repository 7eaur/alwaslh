# PROJECT STATUS — الوسيلة الذكية

> Concise execution truth. Code, PostgreSQL migrations, executable CI and live runtime evidence outrank prose. Anything not executed or inspected is `NOT YET VERIFIED`.

Last synchronized: **2026-09-12**.

## Current management state

**NORMAL ROADMAP: PAUSED**

**ACTIVE TRACK: UX/UI REFOUNDATION + DESIGN SYSTEM + STUDENT/ADMIN EXPERIENCE REMEDIATION**

**CURRENT UX BATCH: `UX-B04 — Student Practice / Assessment` — CODE + VISUAL ACCEPTED; FINAL DOCS-HEAD CI PENDING**

**NEXT BATCH: `UX-B05 — Student Downloads / Account / copy closure` — NOT STARTED; MUST WAIT FOR B04 MERGE**

**EXACT RETURN POINT AFTER UX-B17: `STUDENT-016I — True cold-start offline Reader`**

Canonical roadmap: `docs/workstreams/UX_UI_REFOUNDATION_IMPLEMENTATION_ROADMAP.md`.

## Live main baseline

Current live `main` before B04 merge:

`d113dc02212884b93fa0cd2ac8f75aae6bdb7258`

This includes merged PR #48 Legacy Content. UX-B04 was safely synchronized with that live main without dropping either workstream.

### Legacy Content preservation during B04 sync

PR #48 changed only its API/Legacy Content scope. The B04 file set was disjoint.

Safe merge commit on `ux/student-practice`:

`3082984ce5b4fa02bad98eb91d73d0a206342c6d`

Parents:

- prior B04 head `597f363877e6dee63b87732b449a3c51e8602e2a`;
- live main `d113dc02212884b93fa0cd2ac8f75aae6bdb7258`.

Verification by exact comparison:

- `d113dc... → 3082984...` contained B04 files only;
- `597f363... → 3082984...` contained PR #48 Legacy Content files only.

Therefore the guarded legacy startup path, `apps/api/src/server.ts` integration, tests and Legacy Content runbooks were preserved.

## Closed refoundation batches

| Batch | State | Merge / evidence |
|---|---|---|
| UX-B00 | DONE / VERIFIED / MERGED | PR #42 → `3997ac94b47100bc1557b7622ae3c6d47058d25d` |
| UX-B01 | DONE / VERIFIED / MERGED | PR #43 → `9866e3b3c332d4c83b15c6e20b4cfd2972008f1b` |
| UX-B02 | DONE / VERIFIED / MERGED | PR #44 → `ced57cb4dd45daedbe9a95c4897d1b073ec9e4e9` |
| UX-B03 | DONE / VERIFIED / MERGED | PR #46, 21/21 SUCCESS → `56ee51ab0d5669b4a38f9efec991ea79971d3503` |

Do not redo closed batches unless a real regression is proven.

## Binding design-quality rule from UX-B04 onward

The existing UI is **functional evidence, not a required visual reference**. The responsible engineer/designer owns final ship quality and may rebuild composition, hierarchy, spacing, typography, navigation, density, component patterns, data presentation and interaction patterns when that produces a better Alwaslh product while preserving identity and contracts.

A batch is not complete at “functional”. Changed screens must be:

**Functional + Clear + Elegant + Consistent + Fast + Maintainable + Professional**.

Student must feel like a modern Arabic educational app, not a dashboard. Admin may be dense, but dense must not become crowded.

## UX-B04 — accepted code/visual state

Branch: `ux/student-practice`

PR: **#47 — `feat(student): rebuild Practice and Assessment as focused routed flow`**

Synchronized base: `main@d113dc02212884b93fa0cd2ac8f75aae6bdb7258`

Accepted code head before this documentation sync:

`6bef406fdc00f0c3e127e6d5b418b18a8561b28e`

### Product structure

- `/app/practice` — focused Practice library + filters + recent attempts;
- `/app/practice/quizzes/:quizId` — quiz detail + learner-facing question-set choice + Practice/Test decision;
- `/app/practice/attempts/:sessionId` — focused in-progress attempt or completed result/review.

Implemented behavior:

- URL/session route replaces local `activeAssessment` as navigation authority;
- direct attempt refresh/deep-link restores from canonical API session state;
- explicit question-set choice remains because Stage15 proves it is a real contract, while server/version jargon is removed;
- Practice immediate feedback and Test deferred feedback preserved;
- server-owned answer/finalize/score authority unchanged;
- same-session resume preserved;
- offline writes blocked and reconnect refreshes the attempt;
- unavailable sessions expose a clear recovery path;
- active attempt/review suppresses distracting global Student navigation;
- result completion resets viewport to the result top and programmatically focuses the result heading;
- B04 uses existing React/CSS/router primitives; no heavy animation library, polling system or new product endpoint was introduced.

### Visual acceptance

Dedicated visual QA covers **Library / Quiz detail / Active attempt / Result** on:

- phone `390×844`;
- desktop `1366×900`.

Final accepted visual artifact for code head `6bef406...`:

- B04 run `34716757907` — SUCCESS;
- artifact `10305050307` — `ux-b04-visual-qa`;
- all eight screenshots were inspected manually.

Visual findings found and fixed before acceptance:

- duplicate Practice heading and duplicate online state;
- insufficient mobile clearance above bottom navigation;
- floating skip-link chrome appearing in focused result state;
- result remaining at the previous question scroll position after finalize;
- non-semantic attempt title;
- Latin option markers in Arabic flow.

Final inspection confirms coherent RTL hierarchy, focused attempt composition, correct result entry position, no duplicate chrome, no horizontal overflow and acceptable phone/desktop density.

### Exact-head executable acceptance for `6bef406...`

**22/22 workflows SUCCESS**.

Key runs:

- UX B04 Student Practice and Assessment `34716757907` — SUCCESS;
- Stage14 Student Product `34716757865` — SUCCESS;
- Stage15 Student Assessment `34716757890` — SUCCESS, including PostgreSQL contracts + real Chromium 390px;
- Stage16 Student PWA `34716757918` — SUCCESS;
- UX B03 Student Learning and Reader `34716757874` — SUCCESS;
- UX B02 Student Shell and Navigation `34716757979` — SUCCESS;
- UX B01 Shared Frontend Foundation `34716757924` — SUCCESS;
- Rebuild Stage Verification `34716757929` — SUCCESS;
- Stage 9 Content Import Verification `34716757904` — SUCCESS, covering the synchronized content path;
- all remaining Admin/AI/OCR/Media/Question Bank/Integration workflows on the same head — SUCCESS.

Because this documentation synchronization changes the PR head, **the new docs-synchronized exact head must pass its own triggered CI before PR #47 is merged**. No functional B04 code change is intended after `6bef406...` unless that final CI exposes a real regression.

## Product contracts preserved

- API/PostgreSQL remain canonical authority;
- Auth/Authorization remain server-owned;
- Entitlements remain authoritative;
- `media ready != published`;
- AI never auto-publishes;
- human review remains mandatory;
- Assessment scoring/finalization remains server-owned;
- published quiz/version snapshot behavior remains server-owned;
- `/v1` is not Service Worker Cache API authority;
- signed offline authorization/integrity/device/session rules remain unchanged;
- PR #48 Legacy Content startup gate remains preserved exactly through the B04 synchronization.

## Stage ledger

| Stage | State |
|---|---|
| Stage1–10 + OCR | VERIFIED |
| Stage11 | VERIFIED |
| Stage12 | VERIFIED backend/runtime; `AI-012..AI-019` live provider readiness OPEN |
| Stage13A–G | VERIFIED / CLOSED / integrated |
| Stage14 Student | CLOSED / VERIFIED |
| Stage15 Practice/Assessment | CLOSED / VERIFIED baseline; B04 UX migration accepted pending final merge |
| **Stage16 Offline/PWA** | **OPEN / PARTIALLY VERIFIED — paused during UX refoundation** |
| Stage17 | BLOCKED BY Stage16 closure |
| Stage18–29 | pending in roadmap order |

`STUDENT-016H`: **DONE / VERIFIED / MERGED**.

Normal-roadmap continuation after UX-B17 remains:

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17`

## Known open items outside B04

- Student hosted live authenticated same-origin E2E after PR #39 — `NOT YET VERIFIED` as a hosted-runtime item;
- `AI-012..AI-019` live provider readiness — `NOT YET VERIFIED`;
- Downloads/Account and remaining Student copy/state closure — UX-B05;
- Admin grouped IA/workflow migration — UX-B06–B15;
- final responsive/RTL/accessibility closure — UX-B16;
- final visual/regression/refoundation closure — UX-B17;
- Stage28 Production Cutover — not complete.

## Next action

Run exact-head CI on the documentation-synchronized PR #47 head. If green, update PR #47 / Issue #16 with final evidence, merge B04, verify the new live-main SHA, and **only then** branch UX-B05 from that new live main.
