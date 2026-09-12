# PROJECT STATUS — الوسيلة الذكية

> Concise execution truth. Code, PostgreSQL migrations, executable CI and live runtime evidence outrank prose. Anything not executed or inspected is `NOT YET VERIFIED`.

Last synchronized: **2026-09-12**.

## Current management state

**NORMAL ROADMAP: PAUSED**

**ACTIVE TRACK: UX/UI REFOUNDATION + DESIGN SYSTEM + STUDENT/ADMIN EXPERIENCE REMEDIATION**

**CURRENT UX BATCH: `UX-B03 — Student Learning Hierarchy and Reader Shell`**

**EXACT RETURN POINT AFTER THIS TRACK: `STUDENT-016I — True cold-start offline Reader`**

Canonical roadmap: `docs/workstreams/UX_UI_REFOUNDATION_IMPLEMENTATION_ROADMAP.md`.

## Live main baseline

UX-B00, UX-B01 and UX-B02 are closed and integrated. Do not redo them.

### UX-B02 final acceptance

- PR #44 final head: `b956248418303618120d02cda562bf179cd7071b`
- exact-head workflows: **20/20 SUCCESS**
- key final runs:
  - `UX B02 Student Shell and Navigation` `34711941779` — SUCCESS
  - `Stage14 Student Product` `34711941781` — SUCCESS after rerunning one transient Chromium timeout job only
  - `Stage15 Student Assessment` `34711941813` — SUCCESS
  - `Stage16 Student PWA` `34711941769` — SUCCESS
  - `Stage 13 Admin Product Verification` `34711941728` — SUCCESS
  - `Stage 13G Admin Operations Verification` `34711941761` — SUCCESS
  - `Rebuild Stage Verification` `34711941790` — SUCCESS
- PR #44 merge commit: `ced57cb4dd45daedbe9a95c4897d1b073ec9e4e9`
- verified live `main`: `ced57cb4dd45daedbe9a95c4897d1b073ec9e4e9`

The initial Stage14 failure on the final docs head was a single Assessment E2E timeout. Stage15 was green on the same SHA, 11/12 Stage14 browser tests passed, and rerunning only the failed Chromium job passed with no code change. It is recorded as transient timing rather than a product regression.

## UX-B03 current state

Branch: `ux/student-learning`

Base: `main@ced57cb4dd45daedbe9a95c4897d1b073ec9e4e9`

Status: **IMPLEMENTATION IN PROGRESS / VERIFICATION PENDING**.

Target boundaries:

- `/app/learn` — choose an entitled subject;
- `/app/learn/subjects/:subjectId` — one subject curriculum/lesson sequence;
- `/app/learn/lessons/:lessonId` — focused Reader;
- direct subject/lesson URLs must resolve only through the server-authorized curriculum catalog;
- Reader keeps existing protected-media, speech, search, loading/error/session contracts;
- Reader suppresses global Student navigation while active;
- learner-facing copy must not expose publication/review/MIME/revision internals.

Implemented on the branch so far:

- added `student-learning-model.ts` for authorized subject/lesson lookup and route helpers;
- added unit coverage for authorized route lookup;
- added `student-learning.tsx` with real Learn/Subject/Lesson route composition;
- added `student-reader.tsx` as a dedicated focused Reader shell;
- removed the legacy state-driven `student-curriculum.tsx` giant surface;
- updated Student shell orchestration so Learn descendants are route-driven and access management stays only at the Learn root during migration;
- hidden global bottom/adaptive navigation while the Reader is active;
- added `student-learning.css` for Learn/Subject/Reader layouts and responsive reading width;
- cleaned Reader copy such as “النص المعتمد/منشور/مسودات/MIME” from the Student surface;
- migrated Reader/activation E2E selectors to semantic links and real route hierarchy;
- added dedicated `UX B03 Student Learning and Reader` CI gate.

## UX-B03 explicit non-goals

Not part of this batch:

- `STUDENT-016I` true cold-start offline Reader or any new Stage16 capability;
- Assessment route/shell redesign — UX-B04;
- full Downloads/Account/offline technical-copy cleanup — UX-B05;
- Admin refoundation — UX-B06+;
- API/PostgreSQL/Railway contract changes unless a separately proven root-cause defect requires its own batch.

## Product contracts preserved

- API/PostgreSQL remain canonical authority;
- Auth/Authorization remain server-owned;
- Entitlements remain authoritative;
- `media ready != published`;
- AI never auto-publishes;
- human review chain remains mandatory;
- assessment scoring/finalization remains server-owned;
- `/v1` is not Service Worker Cache API authority;
- signed offline authorization/integrity/device/session rules remain unchanged.

## Stage ledger

| Stage | State |
|---|---|
| Stage1–10 + OCR | VERIFIED |
| Stage11 | VERIFIED |
| Stage12 | VERIFIED backend/runtime; `AI-012..AI-019` live provider readiness OPEN |
| Stage13A–G | VERIFIED / CLOSED / integrated |
| Stage14 Student | CLOSED / VERIFIED |
| Stage15 Practice/Assessment | CLOSED / VERIFIED |
| **Stage16 Offline/PWA** | **OPEN / PARTIALLY VERIFIED — paused during UX refoundation** |
| Stage17 | BLOCKED BY Stage16 closure |
| Stage18–29 | pending in roadmap order |

`STUDENT-016H`: **DONE / VERIFIED / MERGED**.

Exact normal-roadmap continuation after UX-B17 remains:

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17`

## UX-B03 verification required before acceptance

- Student lint;
- strict typecheck;
- unit tests;
- production build;
- direct Learn → Subject → Lesson route hierarchy in real Chromium;
- direct authorized lesson URL refresh/deep-link behavior;
- unauthorized/not-in-catalog subject and lesson state;
- Reader protected media headers/content parity;
- Reader speech/search/loading/error/offline honesty;
- Reader global-navigation suppression;
- browser back/history and route focus;
- phone/tablet/desktop no-overflow verification;
- Stage14 regression;
- Stage15 regression;
- Stage16 regression without new Stage16 implementation;
- Rebuild regression;
- exact-head full path-triggered GitHub Actions matrix.

Current result: **NOT YET VERIFIED — implementation branch exists; PR/exact-head CI pending.**

## Known open items outside B03

- Student hosted live authenticated same-origin E2E after PR #39 — `NOT YET VERIFIED` as a hosted-runtime item.
- `AI-012..AI-019` live provider readiness — `NOT YET VERIFIED`.
- Assessment focused route/shell — B04.
- Downloads/Account and technical offline-copy closure — B05.
- Admin grouped IA/workflow migration — B06–B15.
- final visual/responsive/device/accessibility closure — B16/B17.
- Stage28 Production Cutover — not complete.

## Next action

Open the independent UX-B03 PR, run exact-head CI and Chromium verification, fix any real regression at root cause, and do not start UX-B04 until B03 is accepted and integrated.


## Parallel audit checkpoint — 2026-09-12 (AUDIT-01)

Audit-only baseline `3eb6b18ac5f403cb10463864c3c4b9e86f68b249`; UX #47 and Legacy Content ownership preserved. See [full product/architecture audit](docs/audits/FULL_PRODUCT_ARCHITECTURE_AUDIT_2026-09-12.md) and [complete surface/route/test inventory](docs/audits/FULL_PRODUCT_ARCHITECTURE_INVENTORY_2026-09-12.md). Scoped decision C: partial rebuild of Admin task composition/source review, retain backend/domain with targeted refactors (B). This does **not** stop UX Refoundation or mark the product complete.

Fresh baseline checks: API 62 unit tests, Student 37, Admin 63 passed; all three builds passed; API lint passed with one unused importer-variable warning. FPA-001 shared-subject/class navigation was reproduced in the actual module; FPA-002 abandoned-session access omission was reproduced in the actual service with a query double, not PostgreSQL. Real production journeys and the exact new PostgreSQL scenario remain `NOT YET VERIFIED` in this initial batch. Audit findings are separate from normal roadmap completion. Issue #16 kickoff: `5648443655`; FPA-001 notice: `5648464422`. Publication SHA and Actions runs are recorded in the audit execution addendum/Issue #16 after publication.
