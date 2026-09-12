# FPA-002 — Assessment access repair

Base: `3eb6b18ac5f403cb10463864c3c4b9e86f68b249`. Audit report: PR #49, commit `674519d9ff391de73828ea6b055c0301e63e3b1f`; Issue #16 checkpoint `5648551853`.

This independent backend branch does not edit Student UI, UX roadmap, content import or migrations. PR #47 explicitly excludes assessment API changes.

The first commit adds real PostgreSQL/HTTP regression assertions before changing the service: already-abandoned sessions after expiry must return 404; cancellation after expiry stays available but does not restore questions; completed result history remains available. The existing test already proves that an authorized abandoned session is readable.

Status: RED PHASE — exact-head CI pending. No claim of PostgreSQL reproduction until the failing job is inspected. The source defect is the `in_progress`-only check in `sessionView`; the intended fix rechecks all non-completed content reads.

## Red reproduction — verified

- PR #50 head: `0e084600ad412984fbe6750a664cf71cf24ace4f`.
- Stage15 run: [34717836123](https://github.com/7eaur/alwaslh/actions/runs/34717836123).
- PostgreSQL job: `103618140853`. All 27 migrations applied successfully.
- Actual checkout was GitHub's PR merge ref `5e00045d2ac0a66c15aad45d8c3368203941bfd8`, combining that exact head with baseline main.
- Regression failed at `student-assessment.integration.test.ts:505`: actual HTTP `200`, expected `404`. Publication-time test passed. This is now real PostgreSQL + HTTP reproduction, not only a query double.

## Root-cause repair

`sessionView` now rechecks `accessibleQuiz` for every non-completed session read. Completed result history remains unchanged. Cancellation still succeeds after expiry but cannot restore content delivery. No scoring, snapshot, ownership, UI or migration behavior is changed. Local API typecheck passes; green-phase CI is pending for the next commit.

## Additional QA observation

The red job's container logs also show existing fixture cleanup statements failing foreign-key checks (quiz/question audit-event references), with errors swallowed by the test cleanup. This did not cause the regression assertion and is not a production failure. Track under audit FPA-011: isolate test databases or repair scoped fixture teardown without disabling production integrity constraints. This repair deliberately does not combine unrelated teardown changes.
