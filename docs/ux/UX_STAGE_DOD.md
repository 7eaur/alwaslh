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

**Result: PASS — Stage 3 UX Architecture is closed. The next roadmap stage is Stage 4 Database Reality Verification. If database access is not connected, implementation must not skip past this gate into final schema/auth/RLS work.**
