# PROJECT HANDOFF — الوسيلة الذكية — Admin + Backend Rebuild

Date: **2026-09-15**  
Purpose: resume the scoped Super Admin + Backend rebuild without relying on chat memory.

## Mandatory startup

Confirm repo/branch and live branch + `main` HEAD; read shared execution state, status, engineering log, this handoff, autonomous protocol and active AB-03 record; inspect code/tests/CI; confirm no active-worker collision. Code/migrations/executable CI/runtime evidence outrank prose.

## Scope

Owned: complete Super Admin, full Fastify backend/API, PostgreSQL/migrations/integrity, server capabilities consumed by Admin/Student, relevant shared contracts, architecture documentation and required CI/security/integration/browser verification. Excluded only: structural/design implementation of `apps/student-web` frontend.

## Branch / PR

- branch: `rebuild/super-admin-foundation`;
- PR #52 stays Draft and is never auto-merged;
- never force-reset or force-push shared history;
- live `main`: `d43fe2afe29b02093510177b921c0407e21a3de9`;
- main reconciliation need: `NONE CURRENTLY`.

## Current phase

- AB-00 — DONE
- AB-01 — DONE / EXACT-HEAD VERIFIED
- AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
- AB-03 — ACTIVE
  - AB-03.1 Overview + Operations — DONE / EXACT-SOURCE VERIFIED
  - AB-03.2 Curriculum + Content + OCR — ACTIVE
  - AB-03.2.1 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
  - AB-03.2.2 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
  - AB-03.2.3 — DONE / EXACT-HEAD VERIFIED
  - AB-03.2.4 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
  - AB-03.2.5 Content ingestion compatibility facade retirement — NEXT
- AB-04..AB-08 — PENDING

## Latest result

Corrected AB-03.2.4 executable/source checkpoint `045c1e63b7b34121492c2a26b5017aab4ec35055` is now closed. Green evidence: Architecture Guard `34908457279`; Frontend Preparation `34908457311`; Admin AI `34908457270`; successor Combined `34909883950`; successor Stage13G Admin Operations / PostgreSQL / Chromium `34909884028`.

Fresh Worker A sequence-58 discovery found one remaining evidence-backed Content-ingestion compatibility seam: `apps/admin-web/src/admin/content/ContentIngestionWorkspace.tsx` imports Content-ingestion functions/types from root `../../content-ingestion-api`, while that root module is only a compatibility re-export of feature-owned `features/content/public`.

## Exact continuation

Execute only **AB-03.2.5 — Content ingestion compatibility facade retirement**:

1. fetch live branch/main and respect the shared lease;
2. inspect all remaining consumers/tests of root `content-ingestion-api.ts` on the live branch;
3. repoint legitimate consumers to `features/content/public` without changing behavior/contracts;
4. delete root facade only if no consumer remains;
5. run Architecture Guard plus relevant Admin/API/PostgreSQL/integration/Chromium gates;
6. if CI is pending, hand off `WAITING_FOR_CI`;
7. do not start AI in the same increment.

## Remaining roadmap

AB-03.2.5 → fresh Content/OCR closure discovery → AI Jobs/Review/authoring → Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
