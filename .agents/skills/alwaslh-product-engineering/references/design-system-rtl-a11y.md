# Design System, RTL, Responsive and Accessibility

Build one shared product foundation with separate Student/Admin composition patterns.

## Tokens

Define semantic tokens before screen-specific styling:

- surface/background/elevated
- text primary/secondary/muted/inverse
- border/divider/focus
- brand/accent
- success/warning/error/info
- spacing scale
- typography scale
- radii
- elevation only where hierarchy requires it
- motion duration/easing
- layout widths/breakpoints

Prefer CSS variables/tokens over repeated literal values.

## Components

Standardize only recurring primitives:
- buttons/action hierarchy
- links
- fields/selects/checkboxes/radios
- validation/help
- status badges
- alerts/toasts
- dialog/drawer/popover
- tabs
- pagination
- skeleton/loading
- empty/error/offline states
- navigation primitives
- data table primitives for Admin
- learning/reader controls for Student

Do not turn every section into a generic Card component.

## Arabic RTL

Arabic is first-class.

- Use logical CSS properties (`margin-inline`, `padding-inline`, `inset-inline`, `border-inline`, etc.) where possible.
- Verify icons whose meaning depends on direction.
- Keep numeric/date/code/email fragments readable with mixed directionality.
- Do not reverse semantic order merely because layout is RTL.
- Verify form controls, tables, breadcrumbs, dialogs, menus, and keyboard navigation in RTL.
- Use an Arabic-capable type system with clear weight/size hierarchy and comfortable line height.

## Responsive behavior

Student:
- mobile-first
- verify narrow phones, common phones, tablets, and desktop
- prioritize content and primary action; reflow secondary information

Admin:
- desktop/task-density first, but maintain usable responsive fallback
- avoid hiding essential operations with no alternative
- horizontal overflow for truly tabular data is preferable to unreadable compression

## Accessibility

For changed UI:
- semantic HTML first
- keyboard reachable actions
- visible focus
- correct labels/names/roles
- sufficient contrast
- do not encode meaning by color only
- announce actionable async/error states where appropriate
- support zoom/reflow
- honor `prefers-reduced-motion`
- preserve logical focus when dialogs/drawers open/close
- avoid pointer-only gestures without alternatives

Accessibility defects are functional defects when they block task completion.
