# PROJECT STATUS

- **Current Phase:** Stage6/8 Auth/Activation/Device Refactor — **VERIFIED**; OCR Extraction Foundation is next.
- **Planning branch / PR:** `planning/product-evolution-review` / draft PR #12.
- **Exact verified Stage6/8 head:** `016546eca5696337b52063903bb5ba2fb9631c33`.
- **Deployment:** `DEFERRED BY PRODUCT OWNER`. No Preview/Vercel deployment is required while this decision remains active.
- **Git auto-deployment:** intentionally disabled during this development period so normal commits/CI do not publish automatically.
- **Verification policy:** executable evidence is mandatory. Hosted Preview surfaces remain `NOT YET VERIFIED` / `DEFERRED BY PRODUCT OWNER`; they are not reported as PASS.

## Stage6/8 closure — VERIFIED

The final auth/activation/device implementation now matches the Product Review target:

- two-step 6-digit Full Code activation: eligibility verification does not consume the code;
- short-lived activation ticket;
- mandatory password creation;
- one final atomic transaction for account + credential + entitlement + redemption + audit + registered device;
- password-only Student sessions are blocked;
- returning Student login requires password + one-time registered-device challenge;
- cryptographic application-device identity uses ECDSA P-256, not IP/User-Agent/browser fingerprint;
- Student sessions are bound to an active registered device;
- Admin recovery issues a temporary password, revokes previous sessions/challenges and forces a private password change;
- Admin device reset revokes the old device/sessions and permits one rebind;
- historical device-key reuse for the same profile is rejected;
- Student Web stores a non-extractable private `CryptoKey` in account-scoped IndexedDB and sends only the public key/proof to the server;
- rebind rotates the browser key and the new session is bound to the new device.

## Exact verification evidence

Exact head: `016546eca5696337b52063903bb5ba2fb9631c33`.

- **Rebuild Stage Verification `34002283741` — SUCCESS**
  - Stage 1 Product contract — PASS
  - Stage 2 Brand identity — PASS
  - Stage 3 UX architecture — PASS
  - Stage 4 PostgreSQL clean build — PASS
  - Stage 5 Engineering foundation — PASS
    - API lint/typecheck/unit/build
    - clean migrations + idempotent rerun/count
    - Admin build
    - Student lint/unit/typecheck/build
  - Stage 6 Auth & authorization — PASS
    - PostgreSQL auth lifecycle
    - role isolation
    - registered-device proof
    - wrong-device rejection
    - password-only Student bypass rejection
    - temporary-password forced change
    - session revocation
    - explicit device reset/rebind
    - historical-key rejection / new-key success
  - Stage 7 Access codes & entitlements — PASS
    - renewal/no-waste/idempotency/race/revoke remain intact with device-bound Student sessions
  - Stage 8 Student activation backend — PASS
    - two-step activation atomicity
    - replay/idempotency
    - device-bound session creation
    - race safety
  - Stage 8 Chromium browser E2E — PASS
    - activation verification + completion
    - WebCrypto P-256 key creation
    - IndexedDB persistence
    - returning-device challenge login
    - temporary-password forced private-password change with the same key
    - session invalidation
    - device rebind and browser key rotation
    - successful login with the new key
    - responsive horizontal-overflow check
- **Stage 9 Content Import Verification `34002283819` — SUCCESS**
- **Stage 10 Media Pipeline `34002283817` — SUCCESS**

## Key implementation boundary

The browser never receives PostgreSQL credentials and does not authorize through direct Supabase/PostgREST access. `apps/api` remains the only business-data path. Device private keys remain browser-local; the server stores the public key/fingerprint only.

The Chromium recovery/rebind scenario uses a test-only `AuthService` fixture against the E2E PostgreSQL database to change support state without introducing a test HTTP endpoint or embedding Admin credentials. Admin HTTP authorization/recovery/rebind routes are separately verified by the PostgreSQL/API auth integration suite.

## Deployment / Preview state

Development deployment is intentionally postponed by Product Owner decision.

- previous Stage10 Preview engineering/Supabase work remains recorded as historical evidence;
- prior Vercel quota failure is no longer an engineering-order blocker while deployment is deferred;
- no Business Rule, authorization boundary, validation rule or DB permission was weakened;
- Preview `READY`, `/`, `/admin`, `/api/health`, `/api/ready`, hosted Poppler and durable hosted media remain `NOT YET VERIFIED` until deployment is explicitly re-enabled;
- do not re-enable Git auto-deployment or publish a Preview without a new Product Owner instruction.

## OCR Extraction Foundation — current next work

Repository discovery already confirms the correct integration boundary:

```text
ready media page / media_asset
→ durable OCR job
→ OcrProvider abstraction
→ raw text + optional normalized text
→ confidence/status/provider/version/provenance
→ PostgreSQL
→ searchable/reusable text
```

Existing Stage10 media identity already provides `media_asset_id`, `content_source_asset_id`, `source_page_number`, source checksum and deterministic media variants. OCR must reference this provenance rather than duplicate it.

Required OCR properties:

- upload/media processing remains successful even when OCR fails;
- retry and idempotency;
- source/page identity and checksum-aware provenance;
- original image remains canonical evidence;
- raw OCR text retained; normalization is separate/traceable;
- confidence and review/fallback state for low-confidence, sensitive or exact-source content;
- provider-neutral interface; no hard lock-in to one OCR vendor;
- searchable/reusable approved text;
- deterministic PostgreSQL/integration tests and regression gates;
- provider benchmark dataset/evidence before claiming provider quality.

## Stage10 media boundary retained

- media storage remains behind `MediaStorage`;
- locally verified adapter remains `FileSystemMediaStorage`;
- PDF extraction uses Poppler locally;
- Vercel filesystem is not accepted as durable production media storage;
- hosted Poppler/durable media behavior remains `NOT YET VERIFIED` and will not be faked to unblock OCR architecture.

## Remaining ordered work

1. OCR Extraction Foundation.
2. Stage11 provider/model-neutral AI prompt/output contracts + golden benchmark + provenance/validators.
3. Stage12 durable provider/model-neutral high-throughput execution.
4. Curriculum structure extension and Stage13+ according to `MASTER_REBUILD_ROADMAP.md`.
5. When Product Owner explicitly re-enables deployment: restore the deployment path deliberately, sync a stable validated head, verify exact hosted commit/`READY`/Student/Admin/API/runtime behavior, and record evidence.

`PRODUCT_FEATURE_PARITY_MATRIX.md` + `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` remain hard gates before later Student/Admin feature closure. No valuable legacy capability may be removed without explicit Product Owner approval.

## Last build/test

**Stage6/8 exact head `016546eca5696337b52063903bb5ba2fb9631c33`: Full Rebuild + Stage9 + Stage10 all SUCCESS.**

## Next step

Design and implement the smallest correct OCR Foundation on top of the existing Stage10 media identity/storage boundaries, then run PostgreSQL/API/media regression gates. Deployment remains deferred.
