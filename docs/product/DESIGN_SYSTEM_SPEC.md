# DESIGN SYSTEM SPECIFICATION — الوسيلة الذكية

Date: **2026-09-12**  
Status: **Refoundation foundation / implementation authority for UX batches**

## 1. Identity authority

Do not create a new visual identity.

Canonical identity remains under `packages/brand/`:

- `BRAND_FOUNDATION.md`
- `BRAND_GUIDELINES.md`
- `identity.json`
- `src/tokens.css`
- production logo/app-icon assets

Approved direction to preserve:

- Arabic-first / RTL-first;
- calm, modern educational tone;
- trustworthy and not childish;
- teal/open-book identity;
- Cairo Arabic typography;
- Student touch-first;
- Admin dense but readable.

Primary brand values currently include:

- Teal `#00B5A9`;
- dark teal `#007F78`;
- ink `#123C43`;
- light mint `#E6F7F6`;
- soft neutral `#F2F4F7`;
- charcoal `#1F2937`.

Existing semantic tokens are the baseline and should be extended rather than replaced.

## 2. System principles

Priority:

`Function → Clarity → UX → Hierarchy → Consistency → Visual polish`

Rules:

1. Semantic role before raw color.
2. One component exists because a stable interaction pattern exists, not because abstraction is fashionable.
3. Cards are not a default layout unit.
4. Student and Admin share primitives/state language, not density/composition.
5. Loading, empty, error, permission and offline states are product components.
6. RTL is structural, not a final mirror transform.
7. Motion communicates state/change only.
8. A visible value must support orientation, learning, decision or action.
9. Official brand assets are used directly; local placeholder marks are removed.
10. No gradients/glass/glow/3D/excessive shadows unless an approved brand asset itself contains them.

---

# 3. Tokens

## 3.1 Existing token families — KEEP

Keep the current shared token architecture for:

- brand scale;
- semantic surfaces;
- text roles;
- borders;
- success/warning/danger/info states;
- focus styling;
- typography;
- spacing;
- radii;
- elevation/shadow;
- touch target minimum;
- reader width;
- motion;
- dark-mode semantics where supported.

No app may create a parallel brand palette.

## 3.2 Semantic surface roles

Required semantic roles:

- `surface-canvas` — app background;
- `surface-panel` — primary content surface;
- `surface-subtle` — low-emphasis grouped background;
- `surface-raised` — overlay/popover/dialog where elevation is needed;
- `surface-inverse` — dark navigation or inverse contexts;
- `surface-selection` — selected row/item state.

If an existing token already provides the role, reuse it rather than creating an alias with no behavioral difference.

## 3.3 Action roles

Use semantic variants:

- primary;
- secondary;
- quiet/ghost;
- danger;
- link/text action.

States:

- default;
- hover where pointer exists;
- active;
- focus-visible;
- disabled;
- loading.

Do not use color alone to communicate dangerous/destructive behavior.

## 3.4 Status roles

One shared status semantic model should map domain states into:

- neutral;
- informative;
- success/ready;
- warning/attention;
- danger/failed/blocked.

Domain components own the Arabic label; color/status component owns the visual semantics.

Raw backend enum strings must not leak when a user-facing label exists.

## 3.5 Layout tokens

Retain current content/reader limits and add only evidence-backed product roles:

- Student compact page gutter;
- Student wide page gutter;
- Student bottom-nav height/safe-area allowance;
- Student content max width;
- Reader max width;
- Admin sidebar/rail width;
- Admin standard content max width;
- Admin wide/table content max width.

Admin table/queue pages may be wider than prose/form pages. Do not force every page into the same 76rem-style max if the task requires scanable data columns.

## 3.6 Safe areas

Installed Student PWA must support:

- `env(safe-area-inset-top)`;
- `env(safe-area-inset-bottom)`;
- `env(safe-area-inset-inline-start/end)` where needed.

Bottom navigation must not overlap device home indicators.

---

# 4. Typography

## 4.1 Family

Primary Arabic UI family: **Cairo** from the approved brand foundation.

Fallbacks should be system Arabic-capable sans-serif fonts.

Do not introduce another default UI family during refoundation.

## 4.2 Scale

Use a restrained hierarchy:

- display/large page title only where orientation requires it;
- page title;
- section title;
- subsection title;
- body;
- small/helper;
- caption/metadata.

Student mobile body text should remain comfortably readable; do not reduce typography to fit more cards on screen.

Admin may be denser but should not fall below a readable base size for tables/forms.

## 4.3 Arabic behavior

- Arabic headings do not use excessive letter spacing.
- Long Arabic prose uses comfortable line height.
- Mixed Latin/code/numeric data uses `dir="ltr"`/unicode isolation only for the technical fragment.
- Do not flip number order accidentally in RTL labels.
- Avoid all-caps English stage/engineering labels in production UI.

---

# 5. Spacing and grid

Use the existing spacing scale.

Rules:

- space expresses hierarchy before borders/shadows do;
- related field/action groups stay visually closer than separate workflows;
- mobile Student uses one main column by default;
- tablet may use two-column browse/content layouts when reading order remains clear;
- Admin uses responsive grids only when the items are truly peer items;
- forms use bounded readable widths instead of filling giant desktop canvases;
- tables/queues may use wide workspaces with horizontal containment if needed.

Do not solve information architecture by putting every section inside a bordered card.

---

# 6. Radius, border and elevation

Use existing token scale.

Recommended intent:

- small/medium radius for controls;
- medium/large radius for bounded panels/dialogs;
- subtle borders as the primary separation mechanism;
- one restrained shadow level for overlays/raised surfaces;
- avoid stacked shadows and floating-card aesthetic.

Navigation selection should use clear background/border/text emphasis rather than glow.

---

# 7. Motion

Use existing quick/base motion tokens.

Allowed:

- route/content transition only if subtle and useful;
- drawer/dialog opening;
- status/feedback appearance;
- selected-state transitions.

Avoid:

- decorative entrance animations on every card;
- parallax;
- long easing sequences;
- animated gradients;
- motion that blocks task completion.

All motion must honor `prefers-reduced-motion`.

---

# 8. Core primitives

## 8.1 Button

Variants:

- Primary
- Secondary
- Quiet
- Danger
- Icon button

Requirements:

- minimum touch target from shared token;
- visible focus;
- accessible name for icon-only controls;
- loading state retains label context when possible;
- destructive action visually and spatially separated.

## 8.2 Form field

Shared anatomy:

- label;
- optional required indicator only where needed;
- input/select/textarea;
- helper text;
- validation message;
- disabled/read-only state.

Validation appears beside the field and says how to recover.

Preserve input on recoverable server errors.

## 8.3 Search and Filter Bar

Use when retrieval volume justifies it.

Pattern:

- primary search;
- high-value filters;
- applied-filter summary/reset;
- optional sort;
- result count when meaningful.

Do not expose every API query parameter as a filter.

## 8.4 Tabs

Use only for tightly related views of one entity/workflow.

Requirements:

- proper tab semantics/keyboard behavior;
- current state clear without color alone;
- tabs do not replace global navigation.

## 8.5 Table / Data list

Admin pattern:

- useful columns only;
- readable row density;
- stable status semantics;
- row opens detail;
- row actions limited to frequent safe operations;
- destructive/rare actions in contextual menu/detail page;
- sorting/filtering explicit;
- pagination bounded;
- mobile fallback uses priority fields, not tiny compressed columns.

## 8.6 Detail header

For Admin object pages:

- human title;
- domain context/breadcrumb;
- primary status;
- one primary action where applicable;
- secondary actions grouped separately;
- identifiers only in advanced details/copy action if genuinely useful.

## 8.7 Dialog

Use for:

- confirmation;
- short create/rename;
- small bounded choice.

Must support:

- focus trap;
- escape/close behavior unless destructive confirmation requires explicit choice;
- focus restoration;
- labeled title/description.

## 8.8 Drawer

Use for:

- mobile Admin navigation;
- short supporting context.

Do not put long editors/review workflows inside a drawer.

## 8.9 Popover/Menu

Use for compact contextual actions only.

Keyboard navigation and dismissal are required.

## 8.10 Alert / Inline notice

Semantic variants:

- info;
- success;
- warning;
- error.

Message structure:

`what happened → what it means → next action`

Do not dump error objects.

## 8.11 Toast

Use for short confirmation of completed non-blocking actions.

Do not use a disappearing toast for critical failure/recovery instructions.

## 8.12 Status Badge

Displays a concise human state with shared semantics.

Examples:

- `مسودة`
- `بانتظار المراجعة`
- `جاهز`
- `منشور`
- `فشل`
- `موقوف`

Labels depend on domain contract; no raw enum fallback should silently ship to production.

---

# 9. Product states

Every changed surface must deliberately handle relevant states.

## Loading

- preserve page shell where possible;
- use skeleton for predictable content structures;
- use spinner only for small bounded operations;
- avoid blank full-page loading after the shell is known.

## Empty

An empty state explains:

1. what is empty;
2. whether this is normal;
3. the next useful action if one exists.

No decorative illustration is required by default.

## Error

- human description;
- recovery action;
- preserve user input/context;
- raw diagnostics hidden from Student and normal Admin pages.

## Permission / Access denied

Explain what the user can do next. Do not expose ACL/role implementation.

## Offline

Student:

- persistent but quiet global offline indicator;
- screen-specific availability/recovery;
- “متاح بدون إنترنت” instead of storage/integrity internals.

Admin:

- Admin operations generally require connectivity; show clear blocked/retry state rather than pretending mutations succeeded offline.

## Conflict / stale data

Admin needs an explicit refresh/reload path for 409/stale workflows. Do not silently overwrite a newer state.

---

# 10. Student-specific components

## App Shell

- safe-area aware;
- compact brand/header;
- stable bottom nav/rail depending viewport;
- online/offline status at low prominence;
- route outlet;
- account access.

## Subject item

Not necessarily a card. Can be a structured list/tile with:

- subject name;
- class context if needed;
- next/open action;
- offline indicator if available.

## Lesson list item

- lesson title;
- sequence/section context;
- availability/offline status;
- one clear open action.

## Reader shell

- dedicated page;
- back/title/controls;
- narrow content width;
- readable Arabic typography;
- media controls;
- speech controls;
- download/offline indicator;
- focused states.

## Assessment

- intro/list item;
- question surface;
- option control;
- progress indicator;
- save/next/previous;
- finish confirmation;
- result state.

Progress should be task progress (question position), not invented learning analytics.

---

# 11. Admin-specific patterns

## Workspace Shell

Desktop:

- grouped navigation sidebar;
- top page context/actions;
- content outlet;
- current group/destination clear;
- optional collapse only if it improves space without hiding meaning.

Narrow/tablet:

- compact header;
- navigation drawer;
- no giant nav grid above content.

## Master/list pages

- page title/action;
- search/filter toolbar;
- table/list;
- pagination;
- loading/empty/error states.

## Detail pages

- breadcrumb/context;
- detail header/status/actions;
- related information grouped by real task;
- tabs only when justified;
- advanced technical metadata collapsed.

## Review Queue

- item context;
- reason/status;
- age/time if useful;
- source/provenance where decision requires it;
- clear review action;
- queue return path.

## Long-running operation

- submitted/running/succeeded/failed/paused state;
- last meaningful update;
- retry/cancel only if the server contract allows it;
- bounded polling;
- no fake percentage if backend has no real progress measure.

---

# 12. Icons

Use one coherent icon family/style in application UI.

Rules:

- icons support labels; they do not replace ambiguous navigation text;
- `aria-hidden` for decorative icons;
- icon-only buttons require accessible names/tooltips where appropriate;
- no mixed filled/outline styles without semantic reason;
- no decorative 3D icons.

Exact icon package choice is **NOT YET VERIFIED / NOT DECIDED**. Reuse current dependencies if adequate before adding a new package.

---

# 13. Responsive rules

## Student

- mobile-first;
- phone: single-column task screens, bottom nav, full-width primary actions where appropriate;
- tablet: wider list/detail arrangements only when they reduce navigation friction;
- desktop: app composition, not a stretched marketing site;
- Reader width remains bounded;
- touch targets remain >= shared minimum even on desktop where touch may exist.

## Admin

- desktop is primary operational density target;
- <= medium width: grouped nav moves into drawer, content remains first-class;
- data tables adapt by priority/horizontal containment, not tiny text;
- multi-column forms reduce columns before labels/controls become cramped;
- destructive controls never wrap into misleading adjacency.

Breakpoints should use current token/CSS conventions and be adjusted from actual content pressure, not device-brand breakpoints.

---

# 14. RTL and bidi

- use `margin-inline`, `padding-inline`, `inset-inline`, logical borders;
- back/forward icons must follow RTL direction semantics;
- breadcrumb order must be correct in RTL;
- tables keep numeric/code fields visually isolated;
- phone/code/UUID snippets may be LTR locally without making the whole row LTR;
- avoid hand-written left/right positioning except genuinely physical behavior.

---

# 15. Accessibility acceptance

For changed components/screens:

- keyboard reachable and operable;
- visible focus;
- correct labels/names;
- heading hierarchy;
- landmarks for shell/page/navigation/main;
- dialogs trap/restore focus;
- state messages use appropriate `aria-live` without noise;
- no color-only status;
- touch targets meet shared minimum;
- reduced-motion honored;
- sufficient contrast under approved semantic colors;
- 200% zoom and narrow viewport remain usable;
- mixed Arabic/Latin content remains understandable.

Automated checks are support, not a substitute for keyboard/browser inspection.

---

# 16. Component extraction policy

Extract a shared primitive when at least one is true:

- behavior repeats across Student/Admin;
- visual/state semantics must remain identical;
- accessibility behavior is non-trivial and should be centralized;
- repeated implementations are already diverging.

Keep a component domain-local when:

- its structure exists only for one workflow;
- extraction would require a configuration-heavy API;
- product logic and presentation are tightly coupled and stable.

Avoid a “universal card/form/table” abstraction that hides real product semantics.

---

# 17. Verification gate for Design System changes

A component/token batch is not complete until applicable checks pass:

- lint;
- strict typecheck;
- unit/integration tests;
- production build;
- affected Playwright/Chromium flows;
- phone/tablet/desktop responsive inspection;
- RTL inspection;
- keyboard/focus inspection;
- loading/empty/error/offline/permission states;
- visual screenshot/diff where tooling is available.

Unavailable visual tooling must be recorded as `NOT YET VERIFIED`, never silently assumed.