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

## Release evidence

The final release gate must be able to answer for each legacy capability:

1. Where is it in the new product?
2. What changed and why?
3. Which Product Decision authorizes the change?
4. Which test proves the target behavior?
5. If removed, where is the explicit Product Owner approval?

Anything without an answer is `NOT YET VERIFIED` and cannot be silently treated as complete.
