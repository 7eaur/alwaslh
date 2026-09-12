# Frontend Engineering — React/Vite

Use for Student/Admin frontend implementation after product/UX decisions are understood.

## Component architecture

- Prefer components with one clear responsibility.
- Extract shared primitives when repetition is real, not speculative.
- Keep domain-heavy composition near the owning feature/route.
- Avoid giant route components that contain unrelated product areas.
- Avoid generic abstractions whose API is harder to understand than the repeated code they replace.
- Keep Student/Admin shared primitives at the visual/semantic layer; do not force shared page layouts when the products need different density.

## Routing and page boundaries

Frontend structure should reflect the product IA.

- major workflow = dedicated route/page;
- object/detail task = focused child route/page where useful;
- tabs only for tightly related views;
- dialogs/drawers for short focused work;
- dashboard/home remains overview/entry, not a giant composition of all features.

If one route component grows into multiple independent workflows, split the route before adding more UI.

## State

Separate:
- server/canonical state;
- transient UI state;
- form state;
- offline/resilience state.

Do not duplicate canonical business authority into client state.

Make loading/error/empty/offline/permission states explicit rather than encoding them through ambiguous booleans.

## API integration

- Reuse established API client patterns.
- Do not invent unverified endpoints.
- Preserve same-origin `/v1` production behavior.
- Treat authorization/session failures distinctly from connectivity/server failures.
- Do not expose raw backend errors directly in UI.
- Map API/domain state into presentation-ready user-facing models rather than rendering raw response objects.

## Forms

- Use stable controlled/uncontrolled patterns consistently.
- Validate at appropriate client boundaries for feedback while preserving server validation as authority.
- Preserve user input after recoverable errors.
- Disable duplicate submissions while pending.
- Announce validation failures accessibly.

## Performance

Optimize based on evidence:
- avoid unnecessary app-wide state/subscriptions;
- avoid repeated requests caused by unstable effects;
- lazy-load route/feature code when it materially reduces initial cost;
- keep heavy admin data rendering bounded/paginated/virtualized only when needed;
- size images/media appropriately;
- avoid large animation libraries for trivial effects.

Do not add caching or memoization without a real performance reason.

## Content rendering

Visible UI text must follow `product-content-copy.md`.

Do not render every response field simply because it is available. Create view models or mapping helpers where they improve clarity and prevent backend implementation details from leaking into components.

## Error boundaries and recovery

Changed flows should provide a path to recover when possible. Avoid white-screen failures and generic `Something went wrong` when a more actionable state is available.
