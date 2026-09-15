# PROJECT STATUS — الوسيلة الذكية

> Source of truth: repository code + PostgreSQL migrations/schema + executable CI/tests + verified runtime + active scoped documentation.

**Active branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — Draft / unmerged / no auto-merge.  
**Current stage:** `OWNER PRIORITY OVERRIDE — AI generation operational closure`; ordered roadmap is paused immediately before `AB-03.6.1 Students` source implementation.

## Scope / permanent rules

This workstream owns the complete Super Admin plus full Fastify backend/API, PostgreSQL/migrations/integrity, security and server/shared contracts consumed by Admin or Student. `apps/student-web` frontend implementation itself is excluded. PostgreSQL/API remain canonical authority; backend stays a Fastify modular monolith; Admin `app` composes only; features own workflows and expose narrow public boundaries; tests/security/validation are never weakened; no permanent dual implementation ownership.

## Branch reconciliation

Live `main` latest observation: `3646a63e36d9d9d967bdeb0c8a97ee65055cd672` (`feat(stage16): add authoritative offline content delta`). Main reconciliation remains `REQUIRED / DEFERRED` before overlapping backend/database mutation and before AB-08 final verification.

## AB-00 — DONE
## AB-01 — DONE / EXACT-HEAD VERIFIED
## AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

## AB-03 — ACTIVE / TEMPORARILY PAUSED BEFORE AB-03.6.1 SOURCE MUTATION
Canonical record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

### AB-03.1 Overview + Operations — DONE / EXACT-SOURCE VERIFIED
Final executable source checkpoint: `7eda86fbbd7cbdcd5f2197ef35db7557c0d210dc`.

### AB-03.2 Curriculum + Content + OCR — DONE / EXACT-HEAD VERIFIED
Final executable/source checkpoint: `3a45d18d5e4e69ef77a818e4917450c9c2b94214`.

### AB-03.3 AI Jobs / Review / Authoring — DONE / EXACT-SOURCE VERIFIED
Final executable/source checkpoint: `9b38c9d2f803e220874a40e71ac06399e78435a3`.

### AB-03.4 Question Bank — DONE / EXACT-HEAD VERIFIED
Final executable/source checkpoint: `a5e76461234bd42a29984ffb5d1a587bdbc3092a`.

### AB-03.5 Quiz Builder — DONE / EXACT-HEAD VERIFIED
Final executable/source checkpoint: `f60a4b279fad9a011f9188005dd3ad075c7e3f00` (`refactor(admin): retire dead Quiz Builder page facades`).

Closure result:
- canonical Quiz Builder API/application ownership lives under `features/quizzes`;
- List/Create/Detail/Metadata presentation lives under `features/quizzes` with page-specific public lazy boundaries;
- specialized export/print transport and contracts live under the Quiz Builder feature;
- four dead `admin/quizzes/*` page facades were deleted in the closure commit;
- root `quiz-builder-api.ts` was intentionally retained as compatibility-only because the four feature-owned pages still consume it;
- mixed `admin-ai-authoring-api.ts` was intentionally retained as compatibility-only because `AdminAiAuthoringWorkspace` remains a real consumer;
- neither retained facade owns implementation, so there is no duplicate Quiz Builder implementation ownership;
- backend `apps/api/src/quiz-builder/*` remained canonical and required no database/backend rewrite.

Exact-head verification on `f60a4b279fad9a011f9188005dd3ad075c7e3f00`:
- Architecture Guard `35022098967` — SUCCESS.
- Frontend Preparation `35022099016` — SUCCESS.
- Admin AI `35022098946` — SUCCESS.
- Combined Integration `35022098947` — SUCCESS including clean PostgreSQL/security regressions and real Admin Chromium.
- Stage13G `35022099002` — SUCCESS including Admin backend/UI and Real API + PostgreSQL + Chromium.

### AB-03.6 Students — DEFERRED BEFORE SOURCE MUTATION / EXACT RESUME POINT

Sequence 88 opened `AB-03.6.1 — Students feature-owner foundation`, but no Student source implementation commit followed the sequence-open documentation commit. At the owner's explicit request on 2026-09-16, the ordered roadmap is temporarily paused here while AI question generation is made operational and verified end-to-end. When the generation closure is complete, the exact roadmap resume point remains `AB-03.6.1 — Students feature-owner foundation`; do not skip or silently replace it.

Previously established pre-scan remains useful only as resume context: the current Student Admin page is `admin/students/AdminStudentsPage.tsx` and its Student contracts/actions are mixed with Access Code contracts/actions inside root `admin-student-access-api.ts`. No implementation from that plan has been applied yet.

## Owner-priority workstream — AI generation operational closure — ACTIVE

This temporary workstream exists to turn the already-architected AI/content/question capabilities into a verified development-time operator flow before the remaining roadmap continues.

Definition of done:
- Admin can inspect content/lesson context and the questions already linked to it;
- Admin can request question generation from that canonical lesson/content;
- real runtime provider binding/config is verified rather than inferred from test adapters;
- prompt/rules/output schema are verified and compared against available old/original project generation evidence;
- generated structured results are received and validated;
- review/adopt/persist path stores accepted questions through canonical API/PostgreSQL authority with correct content linkage/provenance/authorization;
- persisted questions can be observed again from Admin/Question Bank;
- relevant unit/integration/security/PostgreSQL/Admin Chromium and exact-head CI are green.

At workstream open, two facts remain explicitly `NOT YET VERIFIED`: real external-provider runtime execution/config and exact old/original prompt/rule parity. These must not be represented as complete until repository/runtime evidence proves them.

## Remaining roadmap after generation closure

Resume exactly at: `AB-03.6.1 Students feature-owner foundation` → remaining Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final verification + live-main reconciliation.

No merge/readiness before AB-08 exact-head green. After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
