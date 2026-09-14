# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth for the current Admin + Backend workstream. Repository code, PostgreSQL migrations/schema, executable CI and verified runtime evidence outrank prose.

Last consolidated: **2026-09-14 — AB-01.3 product-state primitive verified green and closed; AB-01.4 discovery is next.**

## A. Durable authority invariants

- `apps/admin-web` — Super Admin product.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- `apps/student-web` — separate Student frontend workstream; not an implementation target here.
- Student-facing backend contracts remain owned here.
- Browser state is never canonical business authority.
- Auth/authorization/entitlement/publication/revision/provenance/audit/assessment/offline authority remains server-owned.
- Tests represent production contracts; validation/security is never weakened to satisfy fixtures.

## B. Frozen safety baseline

- Admin initial JS: **968.68 kB / 193.92 kB gzip**;
- Admin CSS: **91.38 kB / 13.68 kB gzip**;
- Admin unit tests: **71/71**;
- API unit tests: **66/66**;
- clean PostgreSQL 16 migration sequence: green;
- baseline real Chromium Admin acceptance: **9/9 green**.

## C. Root architecture findings retained

- `AB-ARCH-001` Admin composition root too broad: move toward app providers/router/layout and feature public routes.
- `AB-ARCH-002` oversized initial Admin bundle caused by eager workflow imports: substantial route-level lazy boundaries; never hide warnings.
- `AB-ARCH-003` incomplete feature ownership: feature-local contracts/styles/tests plus narrow true shared owners.
- `AB-ARCH-004` private cross-feature coupling: use explicit public contracts/app orchestration.
- `AB-ARCH-005` large feature compositions: rebuild internal ownership where needed rather than moving giant files unchanged.
- `AB-ARCH-101` backend `apps/api/src/app.ts` is a composition hotspot mixing technical setup and broad service/module construction.
- `AB-ARCH-102` backend private cross-module coupling requires narrow public application/read contracts where genuinely needed.

## D. AB-00 — CLOSED

AB-00.1 ownership/boundary map — DONE; AB-00.2 migration/dependency inventory — DONE; AB-00.3 Architecture Guard — DONE/ratchet active; AB-00.4 measured baseline — DONE; AB-00.5 readiness — PASS.

Architecture Guard lives at `scripts/verify-architecture-boundaries.py` + `.github/workflows/admin-backend-architecture-guard.yml`. It rejects new Admin root dumping, shared→app/features, feature→app, app→private feature, private cross-feature, backend app→private module and private cross-module debt. Advance its ratchet only after accepted exact-head-green cleanup.

## E. Branch governance

Work branch: `rebuild/super-admin-foundation`; PR #52 remains Draft.

- never auto-merge;
- never force-reset/force-push shared history;
- never import separate Student frontend implementation;
- compare live `main` before structural phase boundaries;
- if `main` introduces overlapping Admin/API/migrations/shared-contract changes, pause and reconcile.

Latest reconciled `main`: `258c5bc2c09a049afb57c0593b5b6ca9db532c62` after Student V2 merge #58; no overlapping implementation conflict for AB-01.3.

## F. Permanent decisions

Keep one Fastify modular monolith, PostgreSQL/API authority, feature-owned Admin with thin app composition, user-job IA, substantial route code splitting, approved Design System/brand, RTL/a11y/responsive/reduced-motion/product states, controlled replacement with legacy deletion, `packages/ui` only for true cross-product primitives, Admin `shared/ui` for Admin-only patterns, selective backend layers, verified `/app` base, evidence-based performance budgets.

Rejected without evidence: microservices, DI/service locator, generic repositories everywhere, new global state/query library, styling-stack rewrite, artificial tiny splitting and big-bang rewrite.

## G. AB-01 implementation ledger

### AB-01.1 — Shared API transport boundary — DONE

Owner: `apps/admin-web/src/shared/api/client.ts`. Owns fetch/credentials, JSON/blob transport, network/service errors, `ApiRequestError` and missing-session classification. Root `admin-api.ts` re-exports remain transitional only.

### AB-01.2 — Auth/session ownership — DONE

Owners: `features/auth/api/admin-auth-api.ts`, `features/auth/model/AdminSessionProvider.tsx`, `features/auth/public/index.ts`. `App.tsx` no longer owns session state, restore/logout calls or auth error interpretation.

Closure checkpoint `d955a34087552377dc8b426ec1712e57f59fd8f6`: Admin AI `34800888706` SUCCESS; Combined `34800888690` SUCCESS; Stage13G `34800888723` SUCCESS including real Chromium; Architecture Guard `34799891149` SUCCESS on last code head with later docs-only changes.

### AB-01.3 — Product-state primitives — DONE

Source implementation checkpoint: `cfa2016e056f6dc4f9669236414a7acbd9551011`.

Evidence for extraction:
- Overview and Operations had duplicate loading/error/retry presentation containers and styling.
- Added `apps/admin-web/src/shared/ui/AdminProductState.tsx` as Admin-only presentation owner.
- Added `apps/admin-web/src/shared/ui/admin-product-state.css` as sole styling owner.
- Overview and Operations consume it; local duplicate components and Operations-owned legacy state CSS were removed.
- Feature `LoadState`, copy, API/server truth, session handling and retry semantics remain feature-owned.
- Empty/permission/conflict/unavailable/success were intentionally not generalized without evidence.

Verification/closure:
- Architecture Guard `34804704619` — SUCCESS on source head;
- Frontend Preparation `34804704759` — SUCCESS on source head;
- original Admin AI/Combined/Stage13G source-head runs were cancelled by later documentation pushes, not failures;
- compare `cfa2016e...06127e90` proved all later commits were documentation-only;
- superseding Admin AI `34805721218` — SUCCESS;
- superseding Combined `34805721217` — SUCCESS, including quality, clean PostgreSQL, backend/auth regressions and real Admin Chromium;
- superseding Stage13G `34805721226` — SUCCESS, including Admin/API quality, clean PostgreSQL, all listed integration/auth regressions and real API + PostgreSQL + Chromium.

Conclusion: AB-01.3 closed **DONE** with no verification-time source fix required.

### AB-01.4 — NEXT: Backend app composition discovery

Do not begin with a folder move. First inspect `apps/api/src/app.ts` plus direct config/plugin/composition collaborators and establish:

1. actual app-level responsibilities;
2. module-owned responsibilities that must remain module-owned;
3. construction/registration order and behavior-sensitive dependencies;
4. smallest useful extraction seam;
5. tests/gates protecting that seam;
6. Student-consumer impact, if any.

Only then implement one smallest coherent extraction. Keep modular monolith; no DI/repository/interface ceremony and no schema change for structure alone.

### AB-01.5 — PENDING

Only justified common backend technical ownership.

### AB-01.6 — PENDING

Full foundation closure after remaining AB-01 work.

## H. Alternating execution governance

Binding protocol: `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_PROTOCOL_2026-09-14.md`. Live handoff: `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`.

Workers A/B/C share one roadmap and branch, execute one smallest coherent increment at `:00/:20/:40`, and leave exact HEAD/CI/next-step evidence. After verified AB-08 completion, the proving worker disables all three scheduled tasks.

## I. Remaining roadmap

- AB-00 — DONE
- AB-01 — ACTIVE; AB-01.4 next
- AB-02 — thin Admin shell/router/providers/layouts + major lazy routes
- AB-03 — vertical slices: Overview+Operations → Curriculum+Content+OCR → AI → Question Bank → Quiz Builder → Students → Access Codes
- AB-04 — remaining backend modular-monolith normalization
- AB-05 — Admin design/interaction convergence audit
- AB-06 — performance/delivery validation and evidence-based budgets
- AB-07 — legacy deletion + hard dependency enforcement
- AB-08 — final Admin + Backend verification and live-main reconciliation

## J. Exact continuation

Never infer the next mutation from this log alone. Read `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` first. Current durable continuation: **AB-01.4 discovery** — inspect backend composition and identify the smallest real extraction seam before mutation.
