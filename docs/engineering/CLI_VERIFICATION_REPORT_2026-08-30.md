# CLI VERIFICATION REPORT — 2026-08-30

## Scope

Re-verify completed rebuild Stages 1–4 using executable CLI gates instead of documentation-only claims.

Final verified commit: `64ee5bbb9489461583425ffa88e4b294638f4bfc`  
GitHub Actions run: `33285502614` — **SUCCESS**.

## Environment

GitHub-hosted runner:
- Ubuntu 24.04
- Git 2.55.0
- PostgreSQL service: 16.15 (`postgres:16-alpine`)
- PostgreSQL client: Ubuntu PostgreSQL 16 client
- Python 3 from runner image

Local assistant container was also inspected, but direct GitHub DNS and local PostgreSQL were unavailable. Therefore authoritative Stage 1–4 CLI evidence is the GitHub Actions run.

---

## First CI run — intentionally treated as failing gate

The first verification run did **not** pass and was not ignored.

### Stage 1 failure

`verify-product-contract.py` rejected `DS-001` because the checker assumed every parity table had at least three columns. The matrix intentionally contains section-specific table widths.

Resolution:
- kept strict uniqueness/non-empty feature validation;
- changed structural rule to accept variable table widths with at least `ID + one non-empty contract field`.

This was a test implementation defect, not a product-contract defect.

### Stage 2 failure

`identity.json` defined Brand Mint as `#E6F7F6`, while canonical CSS tokens did not expose the same value.

Resolution:
- fixed the product source by adding canonical `--brand-mint: #e6f7f6` to `packages/brand/src/tokens.css`;
- did **not** weaken the test.

This was a real brand-token drift defect found by CLI.

### Stage 3

Passed on the first CI run.

### Stage 4 failure

PostgreSQL migrations `0001`–`0004` all applied successfully on PostgreSQL 16 and `schema_smoke.sql` passed. The final catalog assertion expected an older constraint name (`practice_answers_selected_option_fk`) while the strengthened schema correctly uses `practice_answers_presented_option_fk` to ensure the selected option was actually presented in the session.

Resolution:
- corrected the catalog test to the stronger actual contract;
- expanded the catalog gate to verify additional cross-record integrity constraints for current question and quiz attempts.

This was a test expectation defect; the PostgreSQL schema and smoke behavior had passed.

---

# Final run results

## Stage 1 — Product contract: CLI PASS

Command:
```bash
python3 scripts/verify-product-contract.py
```

Checks include:
- feature matrix exists;
- IDs parse and are unique;
- feature rows are non-empty;
- feature inventory is substantial;
- required capability families such as activation, Offline, Gemini, PWA, Export and Accessibility remain present.

Result: **PASS**.

## Stage 2 — Brand Identity: CLI PASS

Command:
```bash
python3 scripts/verify-brand.py
```

Checks include:
- required canonical logo/app assets exist and are non-empty;
- SVG files parse as XML/SVG;
- PWA PNG dimensions are exactly 192x192 / 512x512;
- JSON identity/manifests parse;
- Arabic name/tagline, approved palette and Cairo contract match;
- dark mode/focus/reduced motion/touch-target tokens exist;
- canonical product assets do not regress to remote Miaoda/TailAdmin branding.

Result: **PASS**.

## Stage 3 — UX Architecture: CLI PASS

Command:
```bash
python3 scripts/verify-ux.py
```

Checks include:
- architecture/parity/DoD/wireframe sources exist;
- Admin/Student core destinations and critical flow contracts exist;
- offline/activation/AI/upload/accessibility contracts are present;
- comprehensive UX coverage rows exist with no missing marker;
- product parity matrix has a stable large feature-ID set;
- both wireframe SVG files parse;
- UX architecture DoD has no unchecked items.

Result: **PASS**.

## Stage 4 — PostgreSQL Platform: CLI PASS on real PostgreSQL 16

Command:
```bash
TEST_DATABASE_URL=postgresql://... bash database/tests/run.sh
```

CI performs:
1. start clean PostgreSQL 16 service;
2. apply `0001_core.sql`;
3. apply `0002_access.sql`;
4. apply `0003_learning.sql`;
5. apply `0004_ai_and_sync.sql`;
6. execute `database/tests/schema_smoke.sql`;
7. produce `pg_dump --schema-only`;
8. verify required core tables in dump;
9. query PostgreSQL catalogs for critical FK/check/index contracts.

Verified catalog contracts include:
- lesson subject/class composite FK;
- 6-digit and 7-digit code constraints;
- presented-option answer FK;
- current question belongs to session;
- attempt profile/session binding;
- attempt version/session binding;
- quiz/version binding;
- active entitlement uniqueness;
- single correct-option index.

Result: **PASS on PostgreSQL 16.15**.

---

# Remaining runtime gates

The successful Stage 1–4 CLI run does **not** mean the whole product is production-ready. Still pending by future stage:

- real backend/API builds and tests;
- production connection-pool/load tests;
- Auth/authorization attack matrix;
- code-redemption concurrency tests through the API;
- real backup + restore drill on hosting;
- content import/media pipeline tests;
- AI golden/retry/failover tests;
- Admin/Student browser E2E;
- offline account/sync tests;
- performance/security/accessibility gates;
- staging/release/rollback rehearsal.

## Policy

From this report forward, every stage must have an executable CLI/CI gate and an explicit verification level before closure. See `docs/engineering/CLI_VERIFICATION_GATES.md`.
