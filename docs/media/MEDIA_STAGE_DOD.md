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

## Verified executable code-head evidence

Final executable code head before documentation closure:

`f9f58ed4b9cf599d992a08b9c9eb33d3ae1a17c3`

- Stage 10 dedicated workflow `33302062208` — **SUCCESS**.
- Stage 9 deterministic import regression `33302062209` — **SUCCESS**.
- Complete `Rebuild Stage Verification` `33302062216` — **SUCCESS**, including the real Chromium Stage 8 E2E flow.

The dedicated gate proves PostgreSQL 16 migration `0009_media_pipeline.sql`, Sharp transforms, deterministic storage identities, Stage 9 provenance linkage, source-byte-bound idempotency, storage/metadata failure cleanup, abort cleanup, Poppler runtime, full two-page PDF extraction → transform → storage → metadata, exact replay, quality bounds, malformed-PDF rejection and stable numeric page order.

## Final documentation-head regression gate

Final Stage 10 documentation head:

`27c6a2ef1118ee44d2e63471e4f925e1296283e0`

- [x] Stage 10 dedicated workflow `33302270707` — **SUCCESS**.
- [x] Stage 9 deterministic import regression `33302270692` — **SUCCESS**.
- [x] Complete `Rebuild Stage Verification` `33302270695` — **SUCCESS**, including Chromium E2E.
- [x] Documentation contains exact commit/run evidence.

**Stage 10 is formally closed at `CLI + PostgreSQL + MEDIA RUNTIME PASS`.**

## Preview synchronization status

Preview synchronization is an operational integration gate after Stage 10 closure, not a missing Stage 10 runtime proof.

- Temporary Preview branch `preview/supabase-vercel` is still pre-Stage-10.
- `0009_media_pipeline.sql` has not yet been applied there.
- Stage 10 code has not yet been mirrored there.
- Direct Vercel builds from the Stage 10 branch currently fail because the Vercel project expects an output directory named `dist`.
- The known READY Preview deployment still answers `/api/health` with HTTP 200.
- Vercel serverless filesystem is not a durable media volume and Poppler/media-upload runtime on Vercel remains `NOT YET VERIFIED`.

Preview synchronization remains required before relying on Stage 10 in the live temporary environment, but it does not invalidate the dedicated Linux/PostgreSQL/Sharp/Poppler runtime proof above.

## Production-only later release gates

These do not reopen Stage 10 code closure but remain `NOT YET VERIFIED` until staging/release:

- real production volume durability/permissions;
- host disk capacity alerts;
- backup/restore of media volume;
- production-sized PDF load/performance budget;
- CDN/reverse-proxy delivery policy;
- malware scanning if product deployment threat model requires it.

## Product-review note

The current Product Evolution Review may change how media is exposed or authored in Admin/Student UX. If it changes Stage 10's technical invariants or business ownership model, Stage 10 must be explicitly reopened with impact analysis and new executable gates. UI/product changes that consume the existing media contract belong to later revised stages and do not by themselves reopen this stage.
