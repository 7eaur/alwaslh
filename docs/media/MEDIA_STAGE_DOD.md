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

- [ ] media path/key traversal tests PASS.
- [ ] deterministic storage key tests PASS.
- [ ] bounded concurrency order test PASS with deliberately reversed completion timing.
- [ ] unsupported/malformed media rejection tests PASS.
- [ ] source checksum/dimensions metadata tests PASS.
- [ ] transform-profile tests PASS.
- [ ] abort/failure cleanup tests PASS.
- [ ] API lint/typecheck/unit/build PASS.

## Image runtime gate

- [ ] `sharp` loads on clean CI runner.
- [ ] real fixture image is decoded.
- [ ] display variant generated and remains readable/high-resolution.
- [ ] thumbnail generated.
- [ ] AI variant generated.
- [ ] all variant SHA-256 values/byte sizes/dimensions are computed from produced bytes.
- [ ] deterministic retry does not corrupt/reorder variants.

## PDF runtime gate

- [ ] `pdfinfo` and `pdftoppm` availability checked in CI.
- [ ] multi-page fixture PDF is inspected.
- [ ] extracted page count equals PDF page count.
- [ ] extracted pages preserve 1..N order even when downstream transforms finish out of order.
- [ ] PDF/render error is explicit and leaves no successful metadata transaction.

## PostgreSQL / storage gate

- [ ] clean PostgreSQL applies Stage 10 migration(s).
- [ ] source/imported media identity can reference `content_source_assets` without changing Stage 9 inventory.
- [ ] required media variants have unique storage keys/checksums/metadata.
- [ ] filesystem adapter writes only inside configured root.
- [ ] metadata commit occurs only after required objects exist.
- [ ] identical retry/reprocessing is idempotent according to Stage 10 contract.
- [ ] test cleanup removes temporary/staged files.

## Regression gate

- [ ] Stage 10 dedicated workflow PASS on final code head.
- [ ] complete `Rebuild Stage Verification` PASS on same head.
- [ ] documentation updated with exact commit/run evidence.
- [ ] both workflows PASS again on final documentation head.

## Production-only later release gates

These do not block Stage 10 code closure but remain `NOT YET VERIFIED` until staging/release:

- real production volume durability/permissions;
- host disk capacity alerts;
- backup/restore of media volume;
- production-sized PDF load/performance budget;
- CDN/reverse-proxy delivery policy;
- malware scanning if product deployment threat model requires it.
