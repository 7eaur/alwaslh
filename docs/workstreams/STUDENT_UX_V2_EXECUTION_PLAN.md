# STUDENT UX/UI V2 EXECUTION PLAN

Date: 2026-09-14
Status: **ACTIVE**
Branch: `ux/student-experience-v2`

## Objective

تنفيذ معمارية Student Experience V2 بشكل مرحلي، مع الحفاظ على العقود الخلفية والأمنية الحالية، وعدم بناء Feature وهمية قبل مصدر بياناتها.

## Parallel-work warning

PR #57 (`stage16/student-016i`) is an open separate Stage16 workstream and currently changes:

- `App.tsx`
- `student-learning.tsx`
- `student-reader.tsx`
- top-level status/handoff/log
- offline Reader files/tests.

V2 batches must avoid unnecessary overlap until PR #57 is reconciled/merged. Do not resolve UX work by weakening Stage16 security/offline behavior.

## Batch V2-00 — Architecture freeze

Status: **DONE on branch**

- approve Student Experience V2;
- approve local-data/cache policy;
- define execution sequence;
- preserve backend/business rules.

## Batch V2-01 — Foundation + Shell + Home

Scope:

- Student-only theme tokens;
- icon registry;
- session memory read-model cache;
- new App Bar contract;
- refined 4-item Bottom Navigation;
- Home brand lockup with official mark + `الوسيلة الذكية`;
- Home real statistics only;
- subject preview;
- last attempt when available;
- safe-area/mobile overlap fix owned by shell.

Acceptance:

- no duplicate Home menu cards;
- cached navigation foundation exists;
- home does not invent missing progress/library data;
- no content behind bottom navigation;
- 44px touch targets;
- RTL/focus/reduced-motion preserved.

## Batch V2-02 — Welcome / Activation / Login

Scope:

- minimal Welcome;
- compact auth brand area;
- activation/login switch;
- remove large empty top space;
- unified fields/buttons/errors;
- preserve all existing Auth/device contracts.

Acceptance:

- first action obvious;
- no marketing-page clutter;
- no credential/security regression;
- keyboard/mobile form behavior verified.

## Batch V2-03 — Learn / Subject scalability

Start after PR #57 reconciliation because `student-learning.tsx` overlaps.

Scope:

- page-title App Bar;
- class selector only when multiple classes;
- scalable subject list;
- search only when needed;
- sections/units accordion;
- compact lesson rows;
- summary/question capability badges only when real;
- reuse shared curriculum read-model cache.

Acceptance:

- works with 1 or many classes;
- works with 1 or many subjects;
- works with large unit/lesson counts;
- no giant repeated headings/copy.

## Batch V2-04 — Focused Reader

Start after PR #57 reconciliation.

Scope:

- focused App Bar;
- content-first reading width;
- capability slots: lesson / summary / lesson questions;
- compact reader tools;
- previous/next canonical navigation;
- preserve protected media/offline package checks.

Acceptance:

- no global bottom nav while focused;
- content remains primary;
- reader does not duplicate future note/question models;
- cold-start offline contract remains intact.

## Batch V2-05 — Practice / Models / Results

Scope:

- page-title App Bar;
- practice/models architecture;
- simplified conditional filters/search;
- recent attempts;
- focused assessment shell;
- result/review hierarchy;
- refresh recent-attempt cache after completion.

Acceptance:

- existing quiz/version business rules preserved;
- student can reach models without unnecessary navigation depth;
- no fake model/attempt data.

## Batch V2-06 — Library / Account / Secondary surfaces

Scope:

- remove Library dashboard/article composition;
- move Library statistics to Home when authoritative;
- direct collection rows;
- simplify child pages;
- Account management hierarchy;
- Notifications/Progress honest states;
- Help/Support compact structure.

Acceptance:

- no duplicate tabs + cards for same destination;
- logout at bottom;
- no assumed student name/fixed class;
- secondary pages share same App Bar/state patterns.

## Batch V2-07 — Local personal data foundation

Stage17-aligned scope:

- account-scoped IndexedDB repository primitives;
- Notes records + Blob attachments where approved;
- Saved/bookmark stable source identity;
- Needs Review learner-owned state;
- explicit logout/reset lifecycle;
- sync remains absent until intentionally approved.

Acceptance:

- no cross-account leakage;
- no base64 media storage;
- provenance retained;
- offline behavior explicit.

## Batch V2-08 — Performance / Accessibility / Visual QA

- production bundle inspection;
- lazy-route verification;
- repeated-network-read audit;
- mobile/tablet/desktop screenshots;
- iPhone safe-area checks;
- RTL/LTR mixed-content checks;
- keyboard/focus/screen-reader checks;
- contrast and touch target checks;
- reduced-motion checks;
- no P0/P1 visual regressions.

## Merge policy

- short, reviewable commits/batches;
- lint/typecheck/unit/build before readiness;
- browser/E2E for affected flows;
- exact-head CI before merge;
- reconcile PR #57 before touching overlapping Stage16 Reader files;
- do not merge visual refoundation by bypassing failing product/security tests.
