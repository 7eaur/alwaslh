# CLI VERIFICATION GATES

> Mandatory engineering policy for **الوسيلة الذكية**. A stage is not considered fully verified because code was reviewed or documentation was written. It must pass the executable checks appropriate to that stage.

## Status vocabulary

- **DESIGN PASS** — architecture/design review is complete, but executable/runtime checks are still pending.
- **CLI PASS** — deterministic CLI checks for the stage passed in a clean environment.
- **RUNTIME PASS** — the feature passed against the real runtime/service/browser/database required by the stage.
- **RELEASE PASS** — all functional, security, performance, accessibility, backup/recovery and parity gates applicable to release passed.
- **NOT YET VERIFIED** — the check has not actually run. Never replace this with an assumption.

## Non-negotiable rule

A stage may be used as input to the next engineering stage when its documented design contracts are stable, but it is not marked **fully verified** until its mandatory CLI/runtime gates pass. Any later discovery that invalidates an earlier contract reopens that stage.

Every verification record must capture:

1. exact command;
2. commit SHA;
3. environment/tool versions;
4. pass/fail result;
5. failure output or artifact when applicable;
6. fixes made;
7. rerun result.

## Unified command

```bash
bash scripts/verify-stage.sh 2
bash scripts/verify-stage.sh 3
TEST_DATABASE_URL=postgresql://... bash scripts/verify-stage.sh 4
```

CI runs the same underlying checks. Local and CI checks must not intentionally use different acceptance logic.

---

# Stage 1 — Product Freeze / Feature Contract

CLI gate:

- parse `PRODUCT_FEATURE_PARITY_MATRIX.md`;
- verify feature IDs are unique;
- verify every row has a target decision/acceptance;
- reject unresolved accidental duplicate IDs;
- compare implementation coverage later against the same IDs.

Runtime gate: none by itself; this is a product-contract stage.

---

# Stage 2 — Brand Identity

CLI gate implemented by `scripts/verify-brand.py`:

- all canonical assets exist and are non-empty;
- all SVG assets parse as valid XML/SVG;
- PWA PNG dimensions are exactly 192/512 as declared;
- identity/asset JSON files parse;
- canonical Arabic name/tagline match;
- palette and Cairo typography contracts match tokens;
- dark/focus/reduced-motion/touch-target tokens exist;
- canonical production assets do not depend on Miaoda/TailAdmin remote/template branding.

Later browser/runtime gate:

- actual Cairo/Tajawal loading;
- logo rendering on light/dark backgrounds;
- favicon/PWA install icons on real browsers/devices;
- contrast/accessibility audit.

---

# Stage 3 — UX Architecture

CLI gate implemented by `scripts/verify-ux.py`:

- required UX source documents exist;
- Admin and Student core destinations exist in architecture;
- activation/code/offline/AI/upload/accessibility contracts exist;
- UX parity review contains comprehensive COVERED rows and no unresolved missing marker;
- product parity matrix contains a substantial stable feature-ID set;
- Admin and Student wireframes parse as valid SVG;
- UX Stage DoD has no unchecked architecture items.

Later implementation/runtime gate:

- each flow is exercised in E2E tests;
- keyboard/RTL/responsive/accessibility behavior is browser-tested;
- parity IDs are mapped to automated/manual acceptance evidence.

---

# Stage 4 — PostgreSQL Data Platform

CLI gate implemented by `database/tests/run.sh` on a **real disposable PostgreSQL instance**:

1. apply every migration in order with `ON_ERROR_STOP`;
2. run `database/tests/schema_smoke.sql`;
3. create a schema-only dump;
4. verify required tables exist in the dump;
5. verify critical constraints/indexes exist in PostgreSQL catalogs.

CI must run PostgreSQL as a service so this gate does not depend on a developer machine already having PostgreSQL installed.

Before production, additional runtime gates remain mandatory:

- transaction/concurrency tests for code redemption;
- backend authorization tests;
- connection-pool/load tests;
- backup creation + restore drill;
- failure/recovery tests;
- storage/media integration once implemented.

---

# Stage 5 — Engineering Foundation

Must not close until CI proves:

```text
install
lint
typecheck
unit tests
API tests
DB migrations/tests
build admin
build student
build api/worker
```

Also verify clean install from lockfile and environment validation failures.

---

# Stage 6+ policy

Each later stage receives its own executable test set **before** being marked complete. Examples:

- Auth: password/session/recovery/authorization attack matrix.
- Entitlements: concurrent redemption/idempotency/expiry/revocation.
- Content import: counts/order/checksums/repeat-import determinism.
- Media: PDF page order/image readability/retry/failure recovery.
- AI: golden dataset/schema+semantic validation/retry/429/503/failover/cancel/resume.
- Admin: E2E CRUD/AI/codes/export/permissions.
- Student: E2E activation/lesson/practice/quiz/notes/offline/reconnect.
- Offline: account isolation/delta/deletion/outbox/quota/update lifecycle.
- Performance: bundle/query/LCP/INP/CLS/sync/storage budgets.
- Security: dependency scan, secret scan, authorization tests, headers/CORS/upload validation.
- Accessibility: automated checks plus keyboard/screen-reader/zoom/reduced-motion/manual device checks.
- Release: clean staging rebuild, backup/restore, smoke/E2E/parity 100%, rollback rehearsal.

## Closure rule

**No stage will be reported simply as “PASS” in status documentation unless the exact scope of the pass is stated.** Use `DESIGN PASS`, `CLI PASS`, `RUNTIME PASS`, or `RELEASE PASS` so unexecuted checks remain visible.
