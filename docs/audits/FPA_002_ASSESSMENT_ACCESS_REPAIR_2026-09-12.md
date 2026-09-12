# FPA-002 — Assessment access repair

Base: `3eb6b18ac5f403cb10463864c3c4b9e86f68b249`. Audit report: PR #49, commit `674519d9ff391de73828ea6b055c0301e63e3b1f`; Issue #16 checkpoint `5648551853`.

This independent backend branch does not edit Student UI, UX roadmap, content import or migrations. PR #47 explicitly excludes assessment API changes.

The first commit adds real PostgreSQL/HTTP regression assertions before changing the service: already-abandoned sessions after expiry must return 404; cancellation after expiry stays available but does not restore questions; completed result history remains available. The existing test already proves that an authorized abandoned session is readable.

Status: RED PHASE — exact-head CI pending. No claim of PostgreSQL reproduction until the failing job is inspected. The source defect is the `in_progress`-only check in `sessionView`; the intended fix rechecks all non-completed content reads.
