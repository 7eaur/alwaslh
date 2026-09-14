# Platform Architecture Decisions — Historical Rationale

Date: 2026-09-14  
Status: **SUPERSEDED FOR EXECUTION**

The original PA ADR set was written for a platform-wide Student + Admin rebuild. Student frontend is now explicitly owned by a separate workstream.

Do not use this file as the active roadmap or scope authority.

Current reviewed decision authority:

- `docs/architecture/ADMIN_BACKEND_ARCHITECTURE_REVIEW_2026-09-14.md`
- `docs/workstreams/ADMIN_BACKEND_ARCHITECTURE_REBUILD_2026-09-14.md`
- `docs/product/ADMIN_PRODUCT_DESIGN_ARCHITECTURE_RULES_2026-09-14.md`

The PA decisions remain historical rationale in Git history. Compatible decisions were re-evaluated rather than blindly copied; the current review also refined `/app` route compatibility, `packages/ui` vs Admin shared ownership, selective backend layering, and explicit rejection of unnecessary state/styling/DI abstractions.
