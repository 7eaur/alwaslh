# First Production Batch Acceptance

The batch is complete only when all of the following are evidenced from the live Production run:

- Verified pre-reset snapshot path + SHA-256
- Experimental content reset completed under strict scope guardrails
- 69 source/page-image records imported
- 62 logical lessons present in deterministic order
- 104 questions present with expected options/answers and lesson links
- Lesson asset order matches source page order inside each logical lesson
- No duplicate ready media assets by source SHA-256
- Every used media variant passes byte-size + SHA-256 storage verification
- All lessons remain unpublished
- All lesson assets remain Draft
- All question revisions remain Draft
- Student publication fence returns zero visible lessons/assets from this batch
- Replay uses the same import run and creates zero new media assets
- Second verification matches the first verification
- Protected curriculum reference/account/access state is unchanged
- Completion marker is durable and read back successfully
- API returns to normal startup after the flag is disabled
- Admin and Student/Reader runtime smoke checks succeed

Record exact Git SHA, CI run IDs, Railway deployment ID, manifest SHA, import run ID, snapshot hash, counts, and verification output in `PROJECT_ENGINEERING_LOG.md`, `PROJECT_STATUS.md`, and this content workstream after success.
