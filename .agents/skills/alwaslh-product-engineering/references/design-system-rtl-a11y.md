# Design System, RTL, Responsive and Accessibility

Build one shared product foundation with separate Student/Admin composition patterns.

## Identity source before design-system changes

Do not invent a new visual identity during refoundation.

Before changing tokens, typography, logo usage, color roles, shape language, icons, or imagery, inspect:

- `packages/brand/BRAND_FOUNDATION.md`;
- `packages/brand/BRAND_GUIDELINES.md`;
- `packages/brand/identity.json`;
- `packages/brand/src/*` token/style sources;
- production logo and app-icon assets.

The approved Alwaslh identity remains the baseline: Arabic educational product, calm and trustworthy, teal/open-book direction, RTL-first, Student touch-first, Admin dense-but-readable.

External references can improve composition and usability but must not silently replace the brand.

## Tokens

Define semantic tokens before screen-specific styling while preserving approved brand values:

- surface/background/elevated;
- text primary/secondary/muted/inverse;
- border/divider/focus;
- brand/accent;
- success/warning/error/info;
- spacing scale;
- typography scale;
- radii;
- elevation only where hierarchy requires it;
- motion duration/easing;
- layout widths/breakpoints.

Prefer CSS variables/tokens over repeated literal values.

Do not change core brand values merely to match an external template. If an existing token creates a verified accessibility/usability defect, document the evidence and adjust through a deliberate design-system decision.

## Components

Standardize only recurring primitives:
- buttons/action hierarchy;
- links;
- fields/selects/checkboxes/radios;
- validation/help;
- status badges;
- alerts/toasts;
- dialog/drawer/popover;
- tabs;
- pagination;
- skeleton/loading;
- empty/error/offline states;
- navigation primitives;
- data table primitives for Admin;
- learning/reader controls for Student.

Do not turn every section into a generic Card component.

Components should make screens feel like one product without forcing every screen into the same layout.

## Arabic RTL

Arabic is first-class.

- Use logical CSS properties (`margin-inline`, `padding-inline`, `inset-inline`, `border-inline`, etc.) where possible.
- Verify icons whose meaning depends on direction.
- Keep numeric/date/code/email fragments readable with mixed directionality.
- Do not reverse semantic order merely because layout is RTL.
- Verify form controls, tables, breadcrumbs, dialogs, menus, and keyboard navigation in RTL.
- Use the approved Arabic-capable type system with clear weight/size hierarchy and comfortable line height.

## Responsive behavior

Student:
- mobile-first;
- verify narrow phones, common phones, tablets, and desktop;
- prioritize content and primary action; reflow secondary information;
- preserve installed-app safe areas and touch ergonomics.

Admin:
- desktop/task-density first, but maintain usable responsive fallback;
- avoid hiding essential operations with no alternative;
- horizontal overflow for truly tabular data is preferable to unreadable compression;
- preserve clear navigation hierarchy instead of stacking the entire workspace vertically.

## Accessibility

For changed UI:
- semantic HTML first;
- keyboard reachable actions;
- visible focus;
- correct labels/names/roles;
- sufficient contrast;
- do not encode meaning by color only;
- announce actionable async/error states where appropriate;
- support zoom/reflow;
- honor `prefers-reduced-motion`;
- preserve logical focus when dialogs/drawers open/close;
- avoid pointer-only gestures without alternatives.

Accessibility defects are functional defects when they block task completion.
