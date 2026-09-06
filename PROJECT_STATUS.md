# PROJECT STATUS

- **Current Phase:** OCR Extraction Foundation — **VERIFIED**; Stage11 Provider-Neutral AI Prompt / Output Contracts is active next work.
- **Planning branch / PR:** `planning/product-evolution-review` / draft PR #12.
- **Exact verified OCR implementation head:** `befdb8e5bd02aa33b12ce1098fac2678fe15acdd`.
- **Deployment:** `DEFERRED BY PRODUCT OWNER`. No Preview/Vercel deployment is required while this decision remains active.
- **Git auto-deployment:** intentionally disabled during this development period so ordinary commits/CI do not publish.
- **Verification policy:** executable evidence is mandatory. Hosted Preview surfaces remain `NOT YET VERIFIED` / `DEFERRED BY PRODUCT OWNER`; they are not reported as PASS.

## Verified foundation through OCR

Stages 1–10 remain green. Stage6/8 Auth/Activation/Device was previously closed on `016546eca5696337b52063903bb5ba2fb9631c33` and remains green under the OCR regression head.

OCR Foundation now adds a provider-neutral, durable derived-text layer without changing media/upload success semantics:

```text
ready media asset / AI image variant
→ durable ocr_extractions work item
→ OcrProvider
→ raw OCR text
→ conservative normalized text
→ confidence + provider/version metadata
→ review gate where required
→ approved searchable/reusable text
```

### OCR implementation contract

- canonical schema: `database/migrations/0011_ocr_foundation.sql`;
- OCR references deterministic Stage10 `media_variants` and their checksum instead of duplicating source/page provenance;
- enqueue accepts only a `ready` media asset with the expected AI variant;
- idempotency identity is bound to media variant + checksum + provider + provider version + extraction profile;
- durable states: `queued / running / retrying / completed / failed`;
- worker claims use PostgreSQL row locking with `FOR UPDATE SKIP LOCKED`;
- each running attempt has a UUID lease token and expiry;
- expired final attempts are closed as failed; expired retryable work can be reclaimed;
- stale workers cannot complete **or fail/retry** an extraction after losing the lease;
- the input media must still be `ready` at execution time and must match stored checksum/byte identity;
- OCR failure does not turn a successful Stage10 media asset into failed media;
- raw provider text is retained;
- normalization is deliberately conservative and preserves Arabic/source characters;
- empty output always requires review;
- missing/low provider confidence requires review according to profile threshold;
- sensitive/exact-source profiles can force review even with high confidence;
- only completed `not_required` or Admin-`approved` text is searchable/reusable;
- Admin-only review can approve/reject and optionally replace normalized text;
- `OcrProvider` is provider-neutral; Tesseract CLI/TSV is a verified reference adapter, not an architecture lock-in;
- real CI installs and exercises both Arabic and English Tesseract language packs.

## Exact OCR verification evidence

Exact head: `befdb8e5bd02aa33b12ce1098fac2678fe15acdd`.

- **OCR Foundation Verification `34003439653` — SUCCESS**
  - PostgreSQL + Tesseract Arabic/English runtime installation — PASS
  - API lint/typecheck/unit/build — PASS
  - clean migrations through `0011_ocr_foundation.sql` — PASS
  - OCR PostgreSQL table/index/constraint contracts — PASS
  - durable enqueue/replay — PASS
  - low-confidence review gating — PASS
  - approved-only search — PASS
  - retry/backoff state — PASS
  - media success independence from OCR failure — PASS
  - concurrent claim isolation — PASS
  - empty-output review — PASS
  - forced sensitive-profile review — PASS
  - media-ready execution guard — PASS
  - stale-lease write rejection — PASS
  - real Tesseract extraction smoke test — PASS
- **Stage 9 Content Import Verification `34003439660` — SUCCESS**
- **Stage 10 Media Pipeline `34003439659` — SUCCESS**
- **Rebuild Stage Verification `34003439669` — SUCCESS**
  - Stages 1–8 — PASS
  - API/Admin/Student builds — PASS
  - PostgreSQL migrations — PASS
  - Stage8 Chromium activation/returning-login/recovery/rebind E2E — PASS

## Auth/device baseline retained

The OCR batch did not weaken Stage6/8:

- two-step non-consuming 6-digit Full Code verification;
- final activation is one atomic account/credential/entitlement/redemption/device/audit transaction;
- ECDSA P-256 registered-device proof for Student sessions;
- password-only Student session bypass blocked;
- temporary-password recovery forces private-password replacement;
- Admin reset/rebind revokes old auth state and requires a new device key;
- browser private key remains non-extractable and account-scoped in IndexedDB.

## Stage10 media boundary retained

- Stage10 media remains authoritative source/image evidence;
- OCR is derived and cannot redefine media readiness;
- `MediaStorage` remains the storage abstraction;
- locally verified storage adapter remains `FileSystemMediaStorage`;
- hosted durable storage and hosted Poppler remain `NOT YET VERIFIED` while deployment is deferred.

## Deployment / Preview state

Development deployment remains intentionally postponed by Product Owner decision.

- no deployment was performed for Auth/Device or OCR work;
- previous Preview/Supabase/Vercel engineering evidence remains historical only;
- hosted Student/Admin/API/media/OCR behavior remains `NOT YET VERIFIED`;
- do not re-enable Git auto-deployment or publish a Preview without a new Product Owner instruction.

## Active next phase — Stage11 AI contracts

Stage11 must define the provider/model-neutral **content contract**, not the Stage12 scheduler/throughput system.

Required next work:

1. inventory actual AI code/schema and legacy generation modes before editing;
2. create a versioned Prompt Registry contract;
3. define typed provider-neutral generation inputs/outputs;
4. use approved OCR text + source/page provenance as the primary book-generation input;
5. require source/page evidence for book-generated questions;
6. define schema + semantic + provenance + duplicate validators;
7. encode Arabic/Fusha/scientific/chemistry/exact-source rules without silent answer invention;
8. define explicit uncertain/invalid/review-required outcomes;
9. build a source-controlled golden regression/benchmark harness that can compare provider adapters on identical cases;
10. keep provider execution/routing/queues/backpressure in Stage12 unless a minimal interface is needed by Stage11 tests.

Live provider credentials/cost routing are **NOT YET VERIFIED** and must not be invented or embedded in the repository.

## Remaining ordered work

1. Stage11 provider/model-neutral AI prompt/output contracts + golden benchmark/provenance/validators.
2. Stage12 durable provider/model-neutral high-throughput execution.
3. Curriculum structure extension and Stage13+ according to `MASTER_REBUILD_ROADMAP.md`.
4. When Product Owner explicitly re-enables deployment: deliberately restore/sync a stable validated head and verify exact hosted commit/`READY`/Student/Admin/API/media/OCR runtime before claiming PASS.

`PRODUCT_FEATURE_PARITY_MATRIX.md` + `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` remain hard gates before later Student/Admin feature closure. No valuable legacy capability may be removed without explicit Product Owner approval.

## Last build/test

**OCR exact implementation head `befdb8e5bd02aa33b12ce1098fac2678fe15acdd`: OCR Foundation + Full Rebuild + Stage9 + Stage10 all SUCCESS.**

## Next step

Begin Stage11 with repository/code discovery and legacy generation-mode inventory, then implement the smallest correct prompt/input/output/validation contracts and golden regression harness. Deployment remains deferred.
