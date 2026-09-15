# Admin + Backend AB-03 Execution — End-to-end vertical slices

Date: **2026-09-14**  
Branch: `rebuild/super-admin-foundation`  
Draft PR: #52 — remain Draft / unmerged / no auto-merge.  
Status: **ACTIVE — AB-03.3 AI Jobs / Review / Authoring**

## Scope and order

AB-03 migrates complete Admin vertical slices in canonical order: Overview + Operations → Curriculum + Content + OCR → AI Jobs/Review/authoring → Question Bank → Quiz Builder → Students → Access Codes.

Each slice follows `job → DB/API/security → backend boundary correction → IA/states/actions → frontend owner → integration/browser parity → switch → delete legacy`.

## AB-03.1 — Overview + Operations — DONE / EXACT-SOURCE VERIFIED

Final executable source checkpoint: `7eda86fbbd7cbdcd5f2197ef35db7557c0d210dc`.

## AB-03.2 — Curriculum + Content + OCR — DONE / EXACT-HEAD VERIFIED

### AB-03.2.1 Curriculum frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
Implementation ownership lives in `features/curriculum/api/admin-curriculum-api.ts`, exposed through `features/curriculum/public`.

### AB-03.2.2 Content ingestion frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
Implementation ownership lives in `features/content/api/content-ingestion-api.ts`, exposed through `features/content/public`.

### AB-03.2.3 Content operations + OCR frontend API ownership — DONE / EXACT-HEAD VERIFIED
Implementation ownership lives in `features/content/api/content-operations-api.ts`, exposed through `features/content/public`.

### AB-03.2.4 Content operations compatibility facade retirement — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
Corrected executable checkpoint: `045c1e63b7b34121492c2a26b5017aab4ec35055`.

### AB-03.2.5 Content ingestion compatibility facade retirement — DONE / EXACT-HEAD VERIFIED
Exact checkpoint: `7f4a07ebd138106e1c7701bc9820bf978c233643`.

### AB-03.2.6 Same-slice direct-owner consumption — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
Executable checkpoint: `2dd1ca2a94f03b8299bc2f8759f634c56fc10f78`.

### AB-03.2.7 Final lesson Content/Curriculum transport ownership — DONE / EXACT-HEAD VERIFIED
Final executable/source checkpoint: `3a45d18d5e4e69ef77a818e4917450c9c2b94214`.

The final closure moved lesson-content publication into `features/content` and lesson summary/export into `features/curriculum`; endpoint/payload/business/UI/security behavior remained unchanged. Exact-head Architecture Guard, Frontend, Admin AI, Combined and Stage13G/PostgreSQL/Chromium all passed.

## AB-03.3 — AI Jobs / Review / Authoring — ACTIVE

### AB-03.3.1 AI operations feature-owner foundation — DONE / EXACT-HEAD VERIFIED

Worker A sequence 75 created the real AI owner rather than retaining root implementation ownership:

- `features/ai/operations/ai-application-api.ts` owns the AI application capability transport;
- `features/ai/operations/ai-operations-api.ts` owns jobs/review transport and contracts;
- `features/ai/operations/ai-operations-adapter.ts` owns API-to-view mapping;
- `features/ai/operations/ai-operations-view-model.ts` owns the review presentation model;
- the four associated tests are colocated with the owner;
- `features/ai/public/index.ts` exposes the controlled public boundary;
- prior root AI operations modules are compatibility facades only.

Core/test checkpoint: `c82ef8e298103d010a8421ab2df3eecaad038ea5`. Exact-head Architecture Guard, Frontend, Admin AI, Combined real Chromium and Stage13G Real API + PostgreSQL + Chromium all passed.

### AB-03.3.2 AI review presentation ownership transfer — DONE / EXACT-HEAD VERIFIED

Executable/source checkpoint: `c4f44953a6d16473e24f8a4188eb36943452812c`.

Worker A moved the review presentation into the same feature owner conservatively:

- `admin/reviews/AiOperationsPage.tsx` implementation → `features/ai/AiOperationsPage.tsx`;
- `admin/reviews/AiReviewWorkspace.tsx` → `features/ai/AiReviewWorkspace.tsx` as a byte-identical rename;
- `features/ai/public` now exports `AiOperationsPage`;
- old `admin/reviews/AiOperationsPage.tsx` is a one-line compatibility facade so routing behavior is unchanged during the handoff.

The large presentation files were moved using their existing blobs. No JSX, product copy, routing behavior, endpoint, payload, backend, PostgreSQL, authorization or styling behavior changed.

Exact-head evidence on `c4f44953...`:

- Architecture Guard `34989303067` — SUCCESS;
- Frontend Preparation `34989303106` — SUCCESS;
- Admin AI `34989303059` — SUCCESS;
- Combined Integration `34989303098` — SUCCESS including real Admin Chromium;
- Stage13G `34989303031` — SUCCESS across Admin UI, backend, PostgreSQL/security integrations and Real API + PostgreSQL + Chromium.

### AB-03.3.3 Compatibility-facade retirement + direct-owner consumption — NEXT

Next worker B must perform a fresh consumer scan on live HEAD, repoint legitimate consumers of the root AI operations facades and old review-page facade to the real `features/ai` owner/public boundary, and delete only proven-unused facades. `AiStructuredOutputEditor.tsx` is a known root consumer and must be handled deliberately. Keep Question Bank and Quiz Builder transports for their later canonical slices, and do not mix broad AI-authoring application-hook ownership into this cleanup unless the root-cause boundary can be corrected without crossing those domains.

## Main reconciliation

Live `main`: `3646a63e36d9d9d967bdeb0c8a97ee65055cd672`. It contains authoritative offline-content API/PostgreSQL changes. Reconciliation remains `REQUIRED / DEFERRED` before overlapping backend/database mutation and before AB-08 final verification.
