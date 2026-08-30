# Stage 10 — Media Pipeline Definition of Done

Stage 10 may close only when every required executable item below passes. Anything not run is `NOT YET VERIFIED`.

## Architecture / contract

- [x] Media processing is server-side; legacy browser PDF/compression pipeline is not reused.
- [x] Stable input/page order is assigned before concurrency.
- [x] Stage 9 provenance survives into media identity.
- [x] Storage uses backend-generated opaque relative keys.
- [x] Unsupported media is rejected explicitly.
- [x] PDF runtime is local/server-owned, not external CDN.

## CLI / unit gate

- [x] media path/key traversal tests PASS.
- [x] deterministic storage key tests PASS.
- [x] bounded concurrency order test PASS with deliberately reversed completion timing.
- [x] unsupported/malformed media rejection tests PASS.
- [x] source checksum/dimensions metadata tests PASS.
- [x] transform-profile tests PASS.
- [x] abort/failure cleanup tests PASS.
- [x] API lint/typecheck/unit/build PASS.

## Image runtime gate

- [x] `sharp` loads on clean CI runner.
- [x] real fixture image is decoded.
- [x] display variant generated and remains readable/high-resolution.
- [x] thumbnail generated.
- [x] AI variant generated.
- [x] all variant SHA-256 values/byte sizes/dimensions are computed from produced bytes.
- [x] deterministic retry does not corrupt/reorder variants.

## PDF runtime gate

- [x] `pdfinfo` and `pdftoppm` availability checked in CI.
- [x] multi-page fixture PDF is inspected.
- [x] extracted page count equals PDF page count.
- [x] extracted pages preserve 1..N order through downstream transforms/storage.
- [x] PDF/render error is explicit and leaves no successful metadata rows.

## PostgreSQL / storage gate

- [x] clean PostgreSQL applies Stage 10 migration(s).
- [x] source/imported media identity can reference `content_source_assets` without changing Stage 9 inventory.
- [x] required media variants have unique storage keys/checksums/metadata.
- [x] filesystem adapter writes only inside configured root.
- [x] metadata commit occurs only after required objects exist.
- [x] identical retry/reprocessing is idempotent according to Stage 10 contract and conflicts reject different input ownership.
- [x] test cleanup removes temporary/staged files and failure-injection proves partial object cleanup.

## Verified code-head evidence

Final executable code head before documentation closure:

`f9f58ed4b9cf599d992a08b9c9eb33d3ae1a17c3`

- Stage 10 dedicated workflow `33302062208` — **SUCCESS**.
- Stage 9 deterministic import regression `33302062209` — **SUCCESS**.
- Complete `Rebuild Stage Verification` `33302062216` — **SUCCESS**, including the real Chromium Stage 8 E2E flow.

The dedicated gate proves PostgreSQL 16 migration `0009_media_pipeline.sql`, Sharp transforms, deterministic storage identities, Stage 9 provenance linkage, source-byte-bound idempotency, storage/metadata failure cleanup, abort cleanup, Poppler runtime, full two-page PDF extraction → transform → storage → metadata, exact replay, quality bounds, malformed-PDF rejection and stable numeric page order.

## Regression gate

- [x] Stage 10 dedicated workflow PASS on final code head.
- [x] complete `Rebuild Stage Verification` PASS on same code head.
- [x] documentation updated with exact commit/run evidence.
- [ ] Stage 10 dedicated + Stage 9 regression + complete rebuild workflows PASS again on the final documentation head.

## Production-only later release gates

These do not block Stage 10 code closure but remain `NOT YET VERIFIED` until staging/release:

- real production volume durability/permissions;
- host disk capacity alerts;
- backup/restore of media volume;
- production-sized PDF load/performance budget;
- CDN/reverse-proxy delivery policy;
- malware scanning if product deployment threat model requires it.

## Preview-platform limitation

The temporary Supabase/Vercel preview is required to receive every stable schema/code stage, but Vercel's serverless filesystem is not the final durable media volume and Poppler availability there is not assumed. Stage 10's production media-runtime proof is therefore the dedicated Linux/PostgreSQL CI runtime above; live Admin media upload on the temporary preview remains `NOT YET VERIFIED` until the Admin upload boundary and an appropriate preview storage/runtime path are introduced in the later product stages.
