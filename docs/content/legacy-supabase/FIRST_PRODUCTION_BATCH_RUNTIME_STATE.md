# First Production Batch Runtime State

Status: `VERIFIED_COMPLETE`

## Batch

- Legacy subject: `1794eea5-4772-4c94-bd2b-b08e5815e733`
- Target: `grade-9 / english`
- Verified page/image records: `69`
- Verified logical lessons: `62`
- Verified questions: `104`

## Source identity

- Source: `supabase://zhbgbmqhonqmzpqfiehs`
- Manifest SHA-256: `3f92d04fe746328df426a9a911446ababd4077caa09f79459ef382332c140f23`
- Import run ID: `89e213e3-2235-457c-9fe6-76e2b54ef10d`
- Replay import run ID: `89e213e3-2235-457c-9fe6-76e2b54ef10d`

## Pre-reset backup

- Snapshot: `/app/runtime-data/media/backups/production-legacy-transition/2026-09-12T19-53-17-020Z-d39d35179972.json`
- Snapshot SHA-256: `d39d351799728c84dfde8eaee5aca65fc113c76a6426968b00ea9394ca9cb170`
- Experimental reset backup: `/app/runtime-data/media/backups/experimental-content-reset/2026-09-12T19-53-17-063Z-453629c3eed6.json`
- Reset backup SHA-256: `453629c3eed66172a6bafef3f122abcd579744de35f637f849ad4c55aabc1e06`

The old experimental media variants passed byte-size and SHA-256 integrity checks before reset. The snapshot itself was read back and SHA-256 verified before deletion began.

## Reset result

The strict experimental-content reset completed with these post-reset counts:

- classes: `1`
- subjects: `1`
- subject_class_links: `1`
- lessons: `0`
- lesson_assets: `0`
- media_assets: `0`
- media_variants: `0`
- content_import_runs: `0`
- content_source_documents: `0`
- content_source_assets: `0`

The guarded run also verified protected curriculum/account/auth/access invariants before the durable completion marker could be written.

## First import

- lessons: `62`
- source assets: `69`
- lesson assets: `69`
- unique media assets used: `69`
- new media assets: `69`
- exact media reuse: `0`
- questions imported: `104`
- unresolved questions skipped: `0`
- question duplicates collapsed: `0`
- all lesson assets Draft: `true`
- all question revisions Draft: `true`

## First verification

- lessons: `62`
- lesson assets: `69`
- unique media assets: `69`
- duplicate ready-media checksum rows: `0`
- questions: `104`
- published lessons: `0`
- non-Draft lesson assets: `0`
- published question revisions: `0`
- storage variants verified by byte-size + SHA-256: `276`
- source pages verified: `69`
- question source links verified: `104`
- verified: `true`

The verifier additionally checked deterministic lesson ordering, page/image ordering within each logical lesson, source-page linkage, media checksums and sizes, all four storage variants per used media asset, question options/correct answer/status/difficulty/explanation, and question-to-lesson/source/media linkage.

## Replay

Replay proved idempotency:

- same import run ID: `89e213e3-2235-457c-9fe6-76e2b54ef10d`
- new media assets: `0`
- exact media assets reused: `69`
- lessons: `62`
- source assets: `69`
- lesson assets: `69`
- questions: `104`
- duplicate ready-media checksum rows: `0`
- second verification: `true`

## Draft / Student publication fence

- published lessons: `0`
- non-Draft lesson assets: `0`
- published question revisions: `0`

The live publication fence completed before the completion marker was written. Under the Student Reader authority contract, unpublished lessons/assets are not returned to students; the batch therefore remains hidden until an explicit future publication action.

## Git / CI / Railway evidence

- Importer PR #45 exact CI head: `b78cdbbcd4a44623a93fc17fb2b6acf4c1cc4974`
- Importer merge SHA: `2e0da2992b4ff36efe90228c1031586bd998b3b7`
- Migration 0026 deployment: `c7cded73-4d88-4b24-b812-775c197cfde8`
- Guarded bootstrap exact CI head: `f57771d67e2151e726cdeca0b348e07ccf9969f8`
- Guarded bootstrap CI: `17/17 SUCCESS`
- Guarded bootstrap merge SHA: `d113dc02212884b93fa0cd2ac8f75aae6bdb7258`
- Normal pre-flag deployment: `dfdb2f1d-93d0-42b4-8605-0f8d3359d664` — `SUCCESS`
- Production batch deployment: `e58f7861-7d55-4783-8bb2-8a3b1ccd66a7` — `SUCCESS`
- Post-batch flag-disabled deployment: `e3adc7ab-8da1-49e9-bbdf-efd8ca89ea87` — `SUCCESS`
- Post-batch API readiness: `/ready = 200`

## Completion marker

Durable marker:

`/app/runtime-data/media/legacy-import-markers/grade9-english-textbook-v1.complete.json`

It was atomically written and read back only after first verification, replay, second verification, Draft publication fence, and protected-state verification all succeeded.

## Cleanup state

`LEGACY_CONTENT_STARTUP_BATCH` was disabled immediately after the successful run. Deployment `e3adc7ab-8da1-49e9-bbdf-efd8ca89ea87` started normally with no `legacy_startup_*` events and returned `/ready = 200`.

The temporary startup runner and server wiring are removed by the follow-up cleanup PR. The generic Legacy importer, CLI, verifier, migration 0026 support, completion evidence, and persistent backups remain.
