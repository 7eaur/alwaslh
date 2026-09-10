# Corpus Extraction Status

## Branch

`content-prep/full-corpus-extraction`

## Source Corpus

`7eaur/alwaslh-go@f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`

## Current Stage

Stage 1 — Source Inventory

## Completed

- Independent corpus branch created from the tested local-content preparation tooling.
- Real source repository and exact commit pinned.
- Inventory schema defined.
- Stage 1 inventory generator implemented.
- Stage 1 GitHub Actions workflow implemented.

## Remaining

- Verify generated full inventory and subject/source-kind counts.
- Stage 2 textbook OCR batching and persistent page JSON/JSONL outputs.
- Stage 3 text verification/normalization.
- Stage 4 government-exam question extraction.
- Stage 5 answer verification.
- Stage 6 question-to-page linking.
- Final reviewed import package.

## Critical Rules

- Do not write to the Alwaslh database from this branch.
- Do not modify source images in `alwaslh-go`.
- Do not start exam question linking before a reliable textbook page corpus exists.
- Never treat OCR confidence as measured accuracy.
- Ambiguous text/questions/links must remain reviewable instead of being guessed.

## Last Verification

Stage 1 workflow: PENDING first run.

## Next Step

Run Stage 1 against the complete pinned image corpus and commit generated inventory files.
