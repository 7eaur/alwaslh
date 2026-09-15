# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-15 — Worker A sequence 75 established AI operations + review presentation ownership through exact-head checkpoint `c4f44953...`; facade retirement/direct-owner cleanup is the next isolated increment.**

## Durable invariants

- `apps/admin-web` — Super Admin product.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL integrity authority.
- `apps/student-web` frontend implementation remains a separate workstream; Student-facing backend contracts remain owned here.
- Auth/authorization/entitlement/publication/revision/provenance/audit/assessment/offline authority stays server-owned.
- Never weaken tests/security/validation to satisfy a migration.

## Governance

Branch `rebuild/super-admin-foundation`; PR #52 remains Draft. Workers A/B/C use `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` as serial handoff authority. Never auto-merge or rewrite shared history.

Live `main`: `3646a63e36d9d9d967bdeb0c8a97ee65055cd672`. It contains authoritative offline-content API/PostgreSQL changes; reconciliation is `REQUIRED / DEFERRED` before overlapping backend/database mutation and before AB-08 final verification.

## AB-00 — DONE
## AB-01 — DONE / EXACT-HEAD VERIFIED
## AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

## AB-03 — ACTIVE

### AB-03.1 Overview + Operations — DONE / EXACT-SOURCE VERIFIED

Final executable source checkpoint: `7eda86fbbd7cbdcd5f2197ef35db7557c0d210dc`.

### AB-03.2 Curriculum + Content + OCR — DONE / EXACT-HEAD VERIFIED

Final executable/source checkpoint: `3a45d18d5e4e69ef77a818e4917450c9c2b94214`.

Sequence 74 moved the final real lesson Content/Curriculum root transports into `features/content` and `features/curriculum` and closed AB-03.2 at exact-head green.

### AB-03.3 AI Jobs / Review / Authoring — ACTIVE

#### Sequence 75 — AI operations feature owner + review presentation ownership

Source evolution:

- `b0b62f311eb7d8f90e9589d609f09f5cc6c9e5be` moved the real AI jobs/review application capability, transport, adapter and view-model implementations under `features/ai/operations`; root modules became compatibility facades.
- `c82ef8e298103d010a8421ab2df3eecaad038ea5` colocated the four AI operations tests with the owner; GitHub classified the moves as renames, with the transport test changing only its generic `ApiRequestError` import.
- `c4f44953a6d16473e24f8a4188eb36943452812c` transferred review presentation ownership: `AiOperationsPage.tsx` and `AiReviewWorkspace.tsx` now live under `features/ai`; `AiReviewWorkspace` is a byte-identical rename, and the old `admin/reviews/AiOperationsPage.tsx` is a one-line compatibility facade through `features/ai/public`.

The large review JSX/workflow files were not reconstructed. No endpoint, payload, backend, PostgreSQL, authorization, route, product-copy or styling behavior changed.

Exact-head CI on `c4f44953...` is fully green:

- Architecture Guard `34989303067` — SUCCESS.
- Frontend Preparation `34989303106` — SUCCESS.
- Admin AI `34989303059` — SUCCESS including clean migrations, PostgreSQL contracts, authorization/observability/review-race/control and Stage12/auth regressions.
- Combined Integration `34989303098` — SUCCESS including real Admin Chromium.
- Stage13G `34989303031` — SUCCESS across Admin UI, backend, PostgreSQL/security integrations and Real API + PostgreSQL + Chromium.

#### Exact next increment

**AB-03.3.3 — compatibility-facade retirement + direct-owner consumption.** Perform a fresh consumer scan on live HEAD, repoint remaining legitimate consumers of the root AI operations facades and the old review-page facade to `features/ai` private/public owners, and delete only proven-unused facades. `AiStructuredOutputEditor.tsx` is a known root consumer of AI operations/view-model contracts and must be handled deliberately. Do not absorb Question Bank or Quiz Builder transports into this cleanup, and do not move mixed AI-authoring application hooks unless ownership can be corrected without crossing those later slices.
