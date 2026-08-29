# PROJECT STATUS

- **Current Phase:** Full product rebuild planning completed; ready for execution sequencing and production database reality verification.
- **Release Decision on Current Product:** **NO-GO for production/final handover.** Existing source remains the behavioral reference, not the target implementation.
- **Completed:** repository discovery; deep static production-readiness audit; full problem catalog; feature parity matrix; target rebuild blueprint; master end-to-end rebuild roadmap; initial verification of `7eaur/alwaslh-go` as the structured curriculum/content source repository.
- **Rebuild Direction:** preserve the product idea and important scenarios while rebuilding unsafe/fragile subsystems and separating the product into a dedicated Admin application and a lightweight Student PWA sharing domain/design foundations.
- **Content Source:** `7eaur/alwaslh-go` is verified at repository/README level as a large structured content source containing curriculum books, government exam pages, images and helper manifests/index files. Full directory/manifest inventory is still required before the canonical importer is finalized.
- **Critical Engineering Tracks:** database reality/RLS; auth/recovery; entitlement/code redemption; data ownership/FKs; Gemini job/provider orchestration; content/media pipeline; admin UX; student UX; offline/PWA; performance; automated QA.
- **Brand Direction:** build a new owned identity and design system before final UI implementation; remove production dependency on Miaoda-hosted brand assets.
- **AI Direction:** preserve current generation rules and task types, extract them into versioned prompt/schema contracts, move orchestration server-side, add persistent jobs/retries/observability, and support multiple provider projects/credentials safely. API-key rotation must not be treated as quota multiplication when credentials belong to the same provider project.
- **Last Test/Build Result:** **NOT RUN** for the rebuilt architecture because implementation has not started. Current repo still lacks a complete automated release gate.
- **Production Database:** **NOT YET VERIFIED.** This becomes the first execution checkpoint as soon as the database platform is connected.
- **Production AI credentials/projects/quotas:** **NOT YET VERIFIED.** Secrets must be provided through platform secret management, not committed to repository source.
- **Current Branch:** `audit/repository-discovery`
- **Documentation PR:** `#1` — audit/planning documentation branch.
- **Key Docs:** `PROJECT_DEEP_AUDIT.md`, `PROJECT_FULL_AUDIT_CATALOG.md`, `PRODUCT_FEATURE_PARITY_MATRIX.md`, `PROJECT_REBUILD_BLUEPRINT.md`, `MASTER_REBUILD_ROADMAP.md`.
- **Next Step:** connect and audit the real database; reconcile actual schema/RLS/functions/storage with repository migrations; then freeze the target data/authorization model before implementation branches begin.
