# Frontend Engineering

Applies to `apps/student-web`, `apps/admin-web`, and shared frontend primitives.

## Architecture

- Keep route/page composition separate from low-level reusable primitives.
- Keep business authority in API contracts, not duplicated in UI state.
- Avoid global state for data that belongs to a route/component or server cache.
- Prefer explicit state machines/finite states when a flow has meaningful transitions such as upload/review/download/offline/revalidation.
- Preserve existing API contracts unless evidence supports a change.
- Reuse a component when behavior and semantics match; do not force reuse across Student/Admin when only visual similarity exists.

## React/Vite quality

- Keep render paths pure.
- Avoid effect chains for derivable state.
- Cancel/ignore stale async work where navigation/session changes can race.
- Make loading/error/empty states explicit.
- Avoid unnecessary re-renders from unstable context/object values.
- Lazy-load only where bundle/user-flow benefit is real.
- Keep environment/runtime configuration boundaries explicit.
- Do not expose server secrets/private keys through Vite variables.

## Forms

- Model validation rules consistently with server contracts.
- Server remains authoritative.
- Preserve entered data after recoverable errors.
- Disable duplicate submissions when the operation is not idempotent.
- Communicate pending/success/error states without hiding server errors behind generic messages.

## PWA boundary

Service Worker behavior must preserve project rules:
- static/app shell caching only as currently authorized
- `/v1` is not Cache API authority
- protected learning material uses explicit project offline mechanisms
- UI refactors must not silently expand cache scope

## Performance

Measure before complex optimization.

Prioritize:
- route/bundle size
- expensive list/table rendering
- image/media sizing
- unnecessary network requests
- duplicate fetching
- layout shift
- long main-thread work
- avoidable context-wide rerenders

Prefer simple fixes with measurable impact.
