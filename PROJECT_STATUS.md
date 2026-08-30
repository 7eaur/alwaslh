# PROJECT STATUS

- **Current Phase:** Stage 4 — Database Reality Verification is the next roadmap gate; **BLOCKED until the database platform is connected**.
- **Stage Order Rule:** stages are executed sequentially. Do not skip Stage 4 into final schema/Auth/RLS implementation using assumptions.
- **Stage 2 Brand Identity:** **COMPLETE / PASS.** Canonical owned identity is based on the original turquoise/open-book product logo, not TailAdmin assets.
- **Brand Source of Truth:** `packages/brand/BRAND_GUIDELINES.md`, `packages/brand/BRAND_STAGE_DOD.md`, `packages/brand/assets/`, `packages/brand/src/tokens.css`, `packages/brand/src/tokens.ts`.
- **Brand Assets:** primary/horizontal/inverse/monochrome/white logo variants; favicon; PWA 192/512/maskable icons; identity manifest.
- **Brand Palette:** primary teal `#00B5A9`, dark teal `#007F78`, brand ink `#123C43`, mint `#E6F7F6`, surface `#F2F4F7`, charcoal `#1F2937`; Cairo primary Arabic typography with Tajawal/Noto fallbacks.
- **Stage 3 UX Architecture:** **COMPLETE / PASS.** Admin and Student IA, navigation, legacy-to-target screen mapping, critical user flows, async/offline/error/permission states, responsive/accessibility contracts and low-fidelity wireframe references are committed.
- **UX Source of Truth:** `docs/ux/UX_ARCHITECTURE.md`, `docs/ux/UX_FEATURE_PARITY_REVIEW.md`, `docs/ux/UX_STAGE_DOD.md`, `docs/ux/wireframes/`.
- **UX Parity:** all feature groups in the existing parity contract have a target UX destination/flow. This is architecture coverage only; implementation parity is not yet claimed.
- **Admin Direction:** operational/data-dense; grouped into Overview, Content, Assessment & AI, Students & Access, Communication, Reports, System.
- **Student Direction:** calm mobile-first PWA with five primary destinations: Home, Lessons, Quizzes, Notes, More; lower-frequency statistics/achievements/notifications/access/install remain under More.
- **Implementation Branch:** `rebuild/foundation`.
- **Database Connection:** **NOT YET CONNECTED / NOT YET VERIFIED.** Required Stage 4 output is `DATABASE_REALITY_AUDIT.md` covering actual schema, RLS, functions/RPCs/triggers, Auth, Storage policies, Realtime, indexes/constraints and data/schema drift before any final migrations.
- **Legacy Product:** remains **NO-GO** for production and remains the behavior/feature reference until tested replacement parity is achieved.
- **Last Verification:** brand repository assets and Stage 2/3 documentation gates verified from committed source. Full rebuilt React/Vite runtime/build is still **NOT YET VERIFIED**; no build-pass claim is made.
- **Next Action:** connect the database platform. Immediately after connection: inventory/backup/reality audit, compare deployed state with migrations, then produce the target migration/RLS plan. No later roadmap stage starts before this gate.
