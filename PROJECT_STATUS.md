# PROJECT STATUS — الوسيلة الذكية

> الحالة التنفيذية المختصرة. Code/migrations + executable CI evidence أعلى من prose. أي شيء غير مفحوص/غير منفذ = `NOT YET VERIFIED`.

Last synchronized: **2026-09-10 — Stage13F VERIFIED/CLOSED/PROMOTED; Stage13G Remaining Admin Product ACTIVE on Track A.**

## Current Position

- Repository: `7eaur/alwaslh`.
- `main`: `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`.
- Track A: `integration/stage13g-admin-product`.
- Track B: `parallel/stage14-student-product`.
- Shared execution ledger: Issue #16.
- Current model: **Parallel Two-Track Execution**.
- No deployment action is part of the current Stage13G batch.

## Stage13F Final State

Runtime checkpoint: `afbe552710b3f1cf79ee70594f691fa836c05a45`.
Closure/main checkpoint: `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`.

- PR #27: runtime wider matrix **13/13 SUCCESS**, closed unmerged.
- PR #28: closure wider matrix **13/13 SUCCESS**, closed unmerged.
- `main` fast-forwarded non-force to the exact closure checkpoint.
- Issue #16 closure report comment: `5610815790`.

## Stage Ledger

| Stage | State |
|---|---|
| Stage1–10 | VERIFIED |
| OCR | VERIFIED |
| Stage11 | VERIFIED |
| Stage12 | VERIFIED backend/runtime; live provider bootstrap `NOT YET VERIFIED` |
| Stage13A–E | VERIFIED / CLOSED |
| Stage13F | **VERIFIED / CLOSED / PROMOTED** |
| Stage13G | **ACTIVE — discovery + first foundation batch** |
| Stage14 | Track B IN PROGRESS |
| Stage15 | depends on Track B integrating current main Stage13F authority |
| Stage16–25 | REQUIRED |
| Stage26–29 | future release/deployment track |

## Stage13G Discovery — verified so far

### Access / Codes

Inspected `0002_access.sql`, `0006_access_contract.sql`, `apps/api/src/access/http.ts`, `apps/api/src/access/service.ts`.

Classification: **KEEP + IMPROVE**.

Existing authority: secure 6-digit/7-digit code generation, DB format/uniqueness constraints, transactional idempotent redemption, renewal, entitlements, revocation and durable access events.

Missing Admin product outcomes: list/search/filter/sort/page, lifecycle projections, safe unused-code delete/bulk delete, validated import/template, CSV/print export and unified code/account detail.

### Student Accounts / Recovery / Devices

Inspected `0010_student_auth_device.sql`, `apps/api/src/auth/http.ts`, `apps/api/src/auth/service.ts`.

Classification: **KEEP + IMPROVE**.

Existing authority already provides secure Admin recovery actions, session revocation, device rebind lifecycle, one-active-device integrity and auth audit events. It intentionally does not expose existing credentials.

Missing outcomes: account list/search/status/detail, entitlement/code/device/auth-history projection, explicit account lifecycle semantics and Admin recovery/device UX.

### Admin Web

Current verified workspaces cover Curriculum, Content/OCR, AI Operations, Question Bank and Quiz Builder. Dedicated Stage13G Accounts / Access Codes / Notifications / Operations workspaces are not yet verified.

Classification: **REBUILD product UI on existing backend authorities**.

## Findings

- `DOC-013G-001` P2 — startup docs drifted after Stage13F promotion/two-track switch. **FIX IN PROGRESS**.
- `ADMIN-013G-ACCESS-002` P1 — backend access authority exists but Admin inventory/operations contract is incomplete. **OPEN**.
- `ADMIN-013G-ACCOUNT-003` P1 — account recovery authority exists but canonical Admin Student read model/workspace is missing. **OPEN**.
- `AI-012-019` P2 — live provider bootstrap remains **OPEN / NOT YET VERIFIED**.

## Stage13G Slices

1. G-A Accounts + Access Codes foundation.
2. G-B Notifications + real Operations Dashboard after authority discovery.
3. G-C Import/Export/Reports + Settings/Security/Audit.
4. G-D remaining lesson/quiz AI-authoring parity explicitly left open by Stage13F.
5. Wider exact-head regression + documentation/Legacy Coverage closure.

## Immediate Next Action

Finish the operating-model documentation checkpoint, then implement G-A by extending existing Access/Auth authorities rather than creating replacements.
