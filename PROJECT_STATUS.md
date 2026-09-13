# PROJECT STATUS — الوسيلة الذكية

> Source of truth order: repository code + PostgreSQL migrations + executable CI + verified runtime + canonical project documentation.

**Branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — remains Draft; no automatic merge.  
**Live main checked this run:** `5b6fbfecade3abd52a5c4203e47c4f5b69444a86`.  
**Current stage:** AR-09 Cleanup / architecture enforcement — ACTIVE.  
**Latest verified Batch 7A production state:** root Content Ingestion seam removed and verified by Frontend `34778944908` on code-head `7b4106f82ab6f1c152ac20caf11c70779224acde`, plus Admin AI `34779021476`, Combined `34779021471`, Stage13G `34779021457` on documentation descendant `803e9b55c2496998358cf257a959bc4a6799a90f` carrying identical production code — SUCCESS.  
**Current Batch 8A code-head:** `155759bf1cd9558a976ed1dca77dcce8186fff4e`.

## Super Admin stage ledger

- AR-01 — Architecture baseline + route-driven shell — DONE / VERIFIED.
- AR-02 — Overview + Operations split — DONE / VERIFIED.
- AR-03 — Curriculum — DONE / VERIFIED.
- AR-04 — Content + OCR — DONE / VERIFIED.
- AR-05 — Reviews + AI — DONE / VERIFIED.
- AR-06 — Question Bank — DONE / VERIFIED.
- AR-07 — Quiz Builder — DONE / VERIFIED.
- AR-08 — Students + Access Codes — DONE / VERIFIED.
- AR-09 — Cleanup / architecture enforcement — **ACTIVE**.
  - Batch 1 — Quiz metadata ownership relocation — VERIFIED.
  - Batch 2 — Lesson authoring tools ownership relocation — VERIFIED.
  - Batch 3 — Access-code reports ownership relocation — VERIFIED.
  - Batch 4A — AI review ownership relocation — VERIFIED.
  - Batch 5A — Curriculum ownership relocation + root seam removal — VERIFIED.
  - Batch 6A — Content review ownership relocation + root seam removal — VERIFIED.
  - Batch 7A — Content ingestion ownership relocation + root seam removal — **DONE / VERIFIED**.
  - Batch 8A — Lesson publication panel ownership relocation — **ACTIVE / IMPLEMENTATION MOVED / PARITY PENDING**.
- AR-10 — A11y / RTL / performance / visual QA — NOT STARTED.

## What was reconciled before this mutation

This run re-fetched live `main`, current Admin branch HEAD, the three continuity files, recent commits, Draft PR #52 and exact-head CI before modifying code.

Inherited documentation HEAD `803e9b55c2496998358cf257a959bc4a6799a90f` had all workflows it triggered green: Admin AI `34779021476`, Combined `34779021471`, Stage13G `34779021457`. The seam-removal code-head `7b4106f82ab6f1c152ac20caf11c70779224acde` also had Frontend `34778944908` SUCCESS; its longer gates were superseded by documentation-only commits, not assertion failures. Therefore Batch 7A is now closed as DONE / VERIFIED.

## Fresh AR-09 inventory and decision

A fresh route/feature ownership inventory was performed after Batch 7A closure.

Evidence:
- `App.tsx` routes Content Ingestion through `admin/content/ContentIngestionPage`.
- `admin/content/ContentIngestionWorkspace.tsx` still imported `LessonPublicationPanel` from the app root.
- `LessonPublicationPanel` is exclusively the lesson-content publication decision surface and calls the canonical `lesson-content-api` server contract.
- its behavior includes loading server-owned lesson publication state, submit-review, return-to-draft, publish confirmation, blocked-review handling, and missing-session handling.

This is a justified AD-ADMIN-029 seam because Content is the established feature owner. The separate root `AdminAiAuthoringWorkspace` was also observed, but no parallel work was started; Batch 8A is the smaller and unambiguous ownership fix.

Classification for Batch 8A:
- **KEEP:** lesson publication behavior, confirmation, review-blocking rules, session handling, API/PostgreSQL authority and existing tests.
- **IMPROVE:** feature ownership.
- **REFACTOR:** move real `LessonPublicationPanel` implementation under `admin/content/`.
- **REBUILD:** none.
- **REMOVE:** root compatibility seam only after executable parity proves no regression.
- **NO CHANGE:** backend, migrations, Student workstream, auth/security or test strength.

## Batch 8A code changed

1. `333ed22db2a9708560845cfcc496a81fc18fd743` — `refactor(admin): add content-owned lesson publication panel`
   - added `apps/admin-web/src/admin/content/LessonPublicationPanel.tsx` with behavior preserved and only relative import paths adjusted.
2. `155759bf1cd9558a976ed1dca77dcce8186fff4e` — `refactor(admin): route lesson publication through content owner`
   - reduced root `apps/admin-web/src/LessonPublicationPanel.tsx` to a compatibility re-export of the content-owned implementation.

No backend, migration, API-contract, Student, security or test file changed.

## Verification currently running

Exact code-head `155759bf1cd9558a976ed1dca77dcce8186fff4e` triggered:
- Frontend `34780494748` — PENDING at checkpoint;
- Admin AI `34780494751` — PENDING at checkpoint;
- Combined `34780494746` — PENDING at checkpoint;
- Stage13G `34780494761` — PENDING at checkpoint.

No failure was observed before documentation. Batch 8A is therefore not COMPLETE and no caller rewrite/root deletion is allowed yet.

## Current blocker / next step

The only blocker is exact-head parity for Batch 8A on `155759bf1cd9558a976ed1dca77dcce8186fff4e` or a newer documentation-only descendant carrying identical production code.

Next task A/B must:
1. re-fetch live `main`, branch HEAD, all three continuity docs, Draft PR #52 and exact-head CI;
2. resolve the Batch 8A matrix first;
3. if green, inspect all callers of root `LessonPublicationPanel.tsx`;
4. if `admin/content/ContentIngestionWorkspace.tsx` is the only relevant caller, switch it to local `./LessonPublicationPanel`, run exact-head parity, then delete the root compatibility seam only after that parity is green;
5. perform another fresh AR-09 inventory after Batch 8A is fully verified;
6. do not start AR-10 until AR-09 is formally closed.

## Shared resume point for task A/B

- AR-09 Batches 1–7A are DONE / VERIFIED; do not redo them.
- Batch 8A is ACTIVE at first relocation parity.
- Current production code-head: `155759bf1cd9558a976ed1dca77dcce8186fff4e`.
- Current exact-head runs: Frontend `34780494748`, Admin AI `34780494751`, Combined `34780494746`, Stage13G `34780494761`.
- Root `LessonPublicationPanel.tsx` is still intentionally present as a compatibility re-export; do not delete it before green parity + caller proof.
- Preserve server/PostgreSQL authority, Student isolation and current test strength.
- Keep PR #52 Draft; no merge or auto-merge.
