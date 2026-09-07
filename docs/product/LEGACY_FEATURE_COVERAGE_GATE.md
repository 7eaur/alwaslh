# LEGACY FEATURE COVERAGE GATE

Purpose: prevent any valuable capability from the legacy **الوسيلة الذكية** from disappearing during the rebuild merely because screens/architecture are being redesigned.

Canonical inventory: `PRODUCT_FEATURE_PARITY_MATRIX.md`.

## Rule

Before the Admin Product or Student Product can be declared feature-complete, **every legacy capability row** must have an explicit disposition:

```text
legacy capability ID
→ KEEP | IMPROVE | REFACTOR | REBUILD | REMOVE
→ target module/flow
→ Product Decision ID
→ implementation evidence
→ test/acceptance evidence
```

`REMOVE` is valid only with explicit Product Owner approval and a documented reason/replacement.

A capability may move to a better screen or share infrastructure with another capability, but its user/business outcome must remain unless removal is explicitly approved.

## Mandatory coverage areas

At minimum reconcile all legacy Student and Admin capabilities covering:

- Welcome/onboarding/PWA entry;
- activation, returning login, recovery, device/access states;
- Full Codes and Class Codes, renewal/expiry/multiple class entitlements;
- classes, subjects, optional hierarchy, lessons and content browsing;
- Reader, navigation, zoom/pan, page state, summaries, search, TTS where newly added;
- Practice / `اختبر نفسك`;
- full tests, filters, multi-lesson selection, versions, shuffle/randomization, explanations, images, resume/restart, attempt history;
- original ministerial models and later simulations where enabled;
- Notes, Favorites, Needs Review and saved-question provenance;
- progress/statistics/private achievements;
- Offline/PWA/download/sync states;
- notifications;
- Admin curriculum/content CRUD and ordering;
- image/PDF/mixed upload, processing, compression/variants/progress;
- OCR extraction/review;
- all valuable legacy AI generation modes, bulk generation, regenerate/version, exact/source modes and review;
- Question Bank / Quiz Builder / QA / publish lifecycle;
- students/accounts/recovery/device rebind;
- Full/Class code generation/search/filter/sort/bulk/import/export/print;
- Admin Import/Export/Reports;
- settings/security/audit/operations.

## Current Stage13 Admin evidence

Latest verified executable head: `d3e621e6f60cc56ee3838b7df36a86ebafa37524`.

Evidence matrix:

- Stage13 `34168788666` — SUCCESS including Admin Chromium;
- Full Rebuild `34168788747` — SUCCESS;
- supporting Stage12/11/OCR/10/9 regressions all SUCCESS on the same head.

The verified Admin Curriculum batch provides implementation/test evidence for the following **implemented subset only**:

| Capability | Evidence / disposition |
|---|---|
| `PUB-002` | REBUILD/IMPROVE — separate Admin login, server session, Chromium login/logout |
| `ADMIN-007` | REBUILD — grouped Admin navigation foundation; unimplemented modules are visibly non-interactive |
| `ADMIN-008` | IMPROVE — responsive Admin shell; Chromium 390px overflow check |
| `CLASS-A-001` | KEEP — server-backed class list in curriculum snapshot/workspace |
| `CLASS-A-002` | KEEP — validated Class create flow |
| `CLASS-A-003` | KEEP — Class rename/status/order edit flow |
| `CLASS-A-005` | KEEP — subjects represented within selected Class Offering context |
| `CLASS-A-006` | KEEP — validated Subject create flow |
| `CLASS-A-007` | KEEP — Subject rename/status edit flow |
| `CLASS-A-010` | KEEP — explicit Subject→Class Offering link flow |
| `LES-A-001` | KEEP/REBUILD screen — server-backed lesson hierarchy/list within selected Offering |
| `LES-A-002` | KEEP — Class selection/filter in current hierarchy browser |
| `LES-A-003` | KEEP — Subject Offering selection/filter |
| `LES-A-006` | KEEP — Lesson title edit verified in Chromium |
| `LES-A-007` | KEEP — explicit deterministic Lesson ordering edit exists and is API-backed |

This evidence **does not** close all Stage13 parity. In particular these remain `NOT YET VERIFIED` until their own implementation/test evidence exists:

- `CLASS-A-004`, `CLASS-A-008/009/011/012` where current business/dependency semantics remain unresolved or unimplemented;
- `LES-A-004` search;
- `LES-A-005` preview;
- `LES-A-008/009` dependency-aware removal/bulk selection;
- `LES-A-010..015` image/PDF/mixed upload, processing, progress and history;
- `LES-A-016..039` AI authoring/review/bulk/export capabilities;
- all remaining Admin dashboard, Question Bank, codes, students, notifications, import/export/reporting/settings/audit capabilities.

## Current next coverage batch

Stage13 Content / Media / OCR Operations will target evidence for processing supervision and OCR review first. It must preserve the boundary:

```text
Stage9 source provenance
→ Stage10 media processing state
→ OCR extraction/review
```

This does not automatically satisfy upload/history or published Lesson-content parity. `lesson_assets` publication/linking requires an explicit verified contract.

## Release evidence

The final release gate must be able to answer for each legacy capability:

1. Where is it in the new product?
2. What changed and why?
3. Which Product Decision authorizes the change?
4. Which test proves the target behavior?
5. If removed, where is the explicit Product Owner approval?

Anything without an answer is `NOT YET VERIFIED` and cannot be silently treated as complete.
