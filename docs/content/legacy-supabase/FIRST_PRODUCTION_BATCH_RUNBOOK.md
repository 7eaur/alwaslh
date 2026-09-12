# First Production Legacy Content Batch Runbook

## Scope

Temporary guarded startup bootstrap for the first bounded Production import only:

- Legacy subject: `1794eea5-4772-4c94-bd2b-b08e5815e733`
- Target: `grade-9 / english`
- Batch flag: `grade9-english-textbook-v1`
- Expected source/page image records: `69`
- Expected logical lessons: `62`
- Expected questions: `104`

## Safety gates before mutation

1. The runner is dormant unless `LEGACY_CONTENT_STARTUP_BATCH=grade9-english-textbook-v1` exactly.
2. The Legacy Supabase source is dry-run first and the immutable 69/62/104 contract must match.
3. Blocking source conditions, unresolved pages/questions, duplicate question collapse, or source drift abort before mutation.
4. The current experimental content scope is proven by the existing strict reset guardrails.
5. A complete JSON snapshot of all affected database rows is written to the persistent media volume.
6. Every referenced experimental media variant is read and verified by byte size and SHA-256 before reset.
7. The snapshot file is read back and its SHA-256 is verified before reset.
8. Protected reference/auth/access state is captured. Core curriculum reference rows and protected account/access counts must remain unchanged by the batch.

## Recovery and replay

- A persistent attempt journal records the exact manifest SHA, verified snapshot path/hash, phase, and failures.
- If the process stops after reset, a restart may resume only when the verified snapshot journal exists and the source manifest is unchanged.
- All imported lessons/assets/questions remain Draft.
- A first full verification is mandatory before replay.
- Replay must reuse the same import run, create zero new media assets, and leave all target counts unchanged.
- A second full verification is mandatory after replay.
- The completion marker is written atomically and read back before the bootstrap is considered complete.

## Cleanup after success

After the first Production batch is verified:

1. Disable/remove `LEGACY_CONTENT_STARTUP_BATCH`.
2. Deploy the API with normal startup.
3. Remove the temporary startup wiring and runner from the normal API startup path.
4. Keep the completion marker, attempt journal, and backup/snapshot artifacts on persistent storage as evidence.

The generic importer/CLI remains the supported importer; this startup bootstrap is not a permanent content-import architecture.
