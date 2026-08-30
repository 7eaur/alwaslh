# UX STAGE DEFINITION OF DONE

Stage 3 closes only when all of the following are true:

- [x] Admin information architecture is defined by user job, not database table.
- [x] Student information architecture is defined with a simple five-destination mobile navigation.
- [x] Legacy Admin screens are mapped to target destinations.
- [x] Legacy Student screens are mapped to target destinations.
- [x] Critical Admin flows are specified: lesson publishing, AI quiz creation, access-code issuance.
- [x] Critical Student flows are specified: activation/login, initial sync, lesson study, practice resume, class activation.
- [x] Required loading/empty/error/offline/stale/permission/destructive-action states are defined.
- [x] Responsive behavior for Admin and Student is defined.
- [x] Navigation/deep-link/back behavior is defined.
- [x] Accessibility UX contract is defined.
- [x] Admin low-fidelity wireframe reference is committed and reviewed against the IA.
- [x] Student low-fidelity wireframe reference is committed and reviewed against the IA.
- [x] Final parity pass against `PRODUCT_FEATURE_PARITY_MATRIX.md` confirms no important scenario is missing from the UX structure.
- [x] `python3 scripts/verify-ux.py` passes in CI.
- [x] Admin/Student wireframe SVGs parse successfully.
- [x] UX parity review contains comprehensive covered rows with no missing/dropped marker.

**Result: CLI PASS — Stage 3 UX Architecture is source/contract verified. Browser E2E, responsive interaction, keyboard and accessibility runtime verification remain mandatory when the actual interfaces are implemented. Stage 4 is the clean-slate PostgreSQL platform.**
