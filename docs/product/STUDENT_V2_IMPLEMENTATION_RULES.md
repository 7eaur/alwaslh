# STUDENT V2 — IMPLEMENTATION RULES

Date: 2026-09-14
Status: **MANDATORY**
Applies to: `apps/student-web`

## 1. Code organization

- Layout/chrome belongs in `app/layout`.
- Shared presentational primitives belong in `shared/ui`.
- Shared icons belong in one registry.
- Shared read cache/invalidation belongs in `shared/data`.
- Durable local adapters belong in `shared/storage` or feature-owned repositories on top of a shared scoped DB adapter.
- Feature pages/components/data/state stay under `features/<feature>`.
- Page files orchestrate; they do not own routing + API + storage + formatting + giant JSX at once.
- No duplicated App Bar, Bottom Nav, common button, empty state, search field, list row or icon implementation.
- If a component is reused by 2+ unrelated features, evaluate promotion to shared UI.
- Shared UI must remain domain-agnostic; `LessonRow` stays in Learn, `ListRow` can be shared.

## 2. Dependency direction

Allowed direction:

`app → features → shared`

`features → shared`

Not allowed:

- shared importing feature modules;
- feature A reaching into feature B internals;
- circular imports;
- layout importing curriculum/quiz business data.

Cross-feature needs go through shared contracts/read models or explicit public feature exports.

## 3. File responsibility

- One primary responsibility per file.
- 250–350 lines is a review signal, not an automatic failure; split when responsibilities are mixed.
- Do not keep growing legacy flat files merely because they already exist.
- Do not split into meaningless 20-line fragments; boundaries must match ownership/responsibility.
- `index.ts` barrels are optional and must not hide circular dependencies.

## 4. UI consistency

- Home only: official mark + `الوسيلة الذكية` in App Bar.
- Other top-level pages: page title in App Bar.
- Nested pages: back + current entity title.
- Four phone bottom destinations only: Home / Learn / Practice / Library.
- Reader and active assessment use focused shell variants.
- No repeated page eyebrow + H1 + explanatory paragraph when App Bar already establishes context.
- No navigation card wall duplicating bottom navigation.
- No Card-for-everything pattern.

## 5. Visual rules

- Cairo-first typography; final release must self-host approved font assets or use an approved local delivery path.
- Only weights 400/500/600/700.
- Teal is accent/action/selection, not universal text/border color.
- Primary text charcoal; secondary neutral gray.
- Border contrast remains subtle.
- No decorative gradient, glow, glass dock, random shadow stack or non-functional animation.
- Touch target >=44px.
- RTL is first-class; mixed English lesson names must remain readable.
- `prefers-reduced-motion` is mandatory.

## 6. State rules

Every data surface must deliberately support relevant states:

- first load;
- cached/ready;
- empty;
- offline;
- error;
- permission/access change;
- success feedback where action exists.

No giant blank white page. No indefinite skeleton. Empty copy must answer what happened and, when useful, what the student can do next.

## 7. Data-fetching rules

- Use the shared profile-scoped runtime cache for shared read models.
- Never create Home/Learn duplicate curriculum caches.
- Deduplicate concurrent identical requests.
- Derive counters from loaded models.
- Cached route transitions should not flash full loading states.
- Manual refresh updates the shared read model.
- Access-changing actions invalidate only relevant keys.
- Session expiry/account switch clears profile-scoped runtime cache.
- Stale cache cannot authorize protected actions.

## 8. Local persistence rules

Persist locally only with an explicit reason and lifecycle.

Suitable directions:

- Stage16 verified offline lesson packages;
- Notes/Saved/Needs Review after Stage17 contract;
- tiny safe UI preferences.

Never ordinary-persist:

- password/PIN;
- reusable auth secrets;
- raw auth challenges;
- fake entitlement/progress authority;
- arbitrary `/v1` business responses in Service Worker cache.

Account-scoped local records must not leak across accounts/devices.

## 9. Performance rules

- Route-level lazy loading for major features.
- Lazy media/images.
- No duplicate large arrays in separate stores without reason.
- No hidden expensive views mounted permanently.
- Virtualization only when measured list size justifies it.
- Avoid extra network request just to display a number already derivable locally.
- Measure before introducing complexity.

## 10. Accessibility rules

- Semantic controls: buttons are buttons, links are links.
- Visible focus.
- Correct accessible labels for icon-only controls.
- Keyboard usable where browser form/navigation supports it.
- Color is not the only state cue.
- Text contrast must meet accessible targets.
- Safe areas and browser chrome tested on real mobile viewport behavior.

## 11. Testing gate

Every migrated batch requires:

- lint;
- typecheck;
- build;
- relevant tests;
- route/browser smoke;
- mobile visual QA;
- RTL check;
- reduced-motion check;
- no needless duplicate network reads for touched shared models.

## 12. Documentation gate

Before marking a batch done:

- update execution plan status;
- update PR scope/evidence;
- update top-level status/handoff when the change is stable and conflict-safe;
- record unresolved gaps as `NOT YET VERIFIED` / `DEFERRED`, not assumptions.

## 13. Anti-patterns — reject during review

Reject code that introduces:

- giant feature/page files mixing responsibilities;
- copy-pasted SVG controls;
- separate copies of App Bar/Bottom Nav;
- duplicated API requests for the same fresh data;
- hard-coded feature colors when tokens exist;
- repeated explanatory content used to compensate for unclear layout;
- fake stats/progress;
- local storage used as hidden backend;
- UI feature invented before its data/behavior contract exists;
- CSS override chains instead of fixing component ownership.

These rules are part of the acceptance criteria, not optional style guidance.
