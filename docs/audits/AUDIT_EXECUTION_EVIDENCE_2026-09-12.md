# Audit execution evidence — 2026-09-12

This addendum updates the initial audit's verification boundary without rewriting its baseline findings.

## AUDIT-01 closure

- Baseline main: `3eb6b18ac5f403cb10463864c3c4b9e86f68b249`.
- Report PR #49 head: `674519d9ff391de73828ea6b055c0301e63e3b1f`.
- Merged via `4249c91e434994343bfe3bd685af6d101c987dc1`.
- All **15/15** triggered workflows succeeded. No application changes in this batch.
- Local execution: API 62 unit tests, Student 37, Admin 63; all builds pass. API lint has one unused-variable warning.

| Workflow | Run ID | Observed result |
| --- | --- | --- |
| Stage 11 AI Contract Verification | [34717768429](https://github.com/7eaur/alwaslh/actions/runs/34717768429) | success |
| Stage 12 AI Execution Verification | [34717768394](https://github.com/7eaur/alwaslh/actions/runs/34717768394) | success |
| Stage 13F Question Bank Verification | [34717768379](https://github.com/7eaur/alwaslh/actions/runs/34717768379) | success |
| Stage 10 Media Pipeline | [34717768401](https://github.com/7eaur/alwaslh/actions/runs/34717768401) | success |
| Stage 13D Content Ingestion Verification | [34717768434](https://github.com/7eaur/alwaslh/actions/runs/34717768434) | success |
| OCR Foundation Verification | [34717768412](https://github.com/7eaur/alwaslh/actions/runs/34717768412) | success |
| Stage 13E Admin AI Operations Verification | [34717768424](https://github.com/7eaur/alwaslh/actions/runs/34717768424) | success |
| Stage 9 Content Import Verification | [34717768428](https://github.com/7eaur/alwaslh/actions/runs/34717768428) | success |
| Stage 13E Frontend Preparation Verification | [34717768405](https://github.com/7eaur/alwaslh/actions/runs/34717768405) | success |
| Stage 13E Combined Integration Verification | [34717768413](https://github.com/7eaur/alwaslh/actions/runs/34717768413) | success |
| Stage 13F Admin Question Bank Verification | [34717768400](https://github.com/7eaur/alwaslh/actions/runs/34717768400) | success |
| Stage 13D Admin Upload UI Verification | [34717768391](https://github.com/7eaur/alwaslh/actions/runs/34717768391) | success |
| Stage 13 Admin Product Verification | [34717768367](https://github.com/7eaur/alwaslh/actions/runs/34717768367) | success |
| Stage 13G Admin Operations Verification | [34717768421](https://github.com/7eaur/alwaslh/actions/runs/34717768421) | success |
| Rebuild Stage Verification | [34717768432](https://github.com/7eaur/alwaslh/actions/runs/34717768432) | success |

## SEC-01 / FPA-002

Documented before repair in Issue #16 and PR #49; repaired on independent PR #50, with no UI/import/migration edits.

- Red head: `0e084600ad412984fbe6750a664cf71cf24ace4f`.
- Red Stage15 run `34717836123`, PostgreSQL job `103618140853`: all 27 migrations passed; the added assertion at test line 505 failed **200 != 404**.
- Red actual PR merge checkout: `5e00045d2ac0a66c15aad45d8c3368203941bfd8`.
- Fixed head: `b68bc9bac05102635b57a04668a065c0f5598e7a`.
- Green Stage15 run `34717938903`: PostgreSQL job `103618425531` and Chromium job `103618510565` both passed.
- PostgreSQL result: 2 passed, 0 failed, 0 skipped. The tests preserve authorized abandoned access and completed history, while blocking access after expiry and after cancellation.
- The owning-layer fix changes the read eligibility predicate from in-progress only to every non-completed session.
- Production execution of the repaired path remains **NOT YET VERIFIED** until deployment and authenticated verification; passing CI is not that claim.

| Workflow | Run ID | Observed result |
| --- | --- | --- |
| Stage 11 AI Contract Verification | [34717938953](https://github.com/7eaur/alwaslh/actions/runs/34717938953) | success |
| Stage14 Student API Regression | [34717938886](https://github.com/7eaur/alwaslh/actions/runs/34717938886) | success |
| Stage 13F Question Bank Verification | [34717938940](https://github.com/7eaur/alwaslh/actions/runs/34717938940) | success |
| Stage 13E Frontend Preparation Verification | [34717938968](https://github.com/7eaur/alwaslh/actions/runs/34717938968) | success |
| Stage 13E Admin AI Operations Verification | [34717938941](https://github.com/7eaur/alwaslh/actions/runs/34717938941) | success |
| Stage 12 AI Execution Verification | [34717938950](https://github.com/7eaur/alwaslh/actions/runs/34717938950) | success |
| Stage 10 Media Pipeline | [34717938905](https://github.com/7eaur/alwaslh/actions/runs/34717938905) | success |
| Stage 13D Content Ingestion Verification | [34717938943](https://github.com/7eaur/alwaslh/actions/runs/34717938943) | success |
| OCR Foundation Verification | [34717938882](https://github.com/7eaur/alwaslh/actions/runs/34717938882) | success |
| Stage 9 Content Import Verification | [34717938934](https://github.com/7eaur/alwaslh/actions/runs/34717938934) | success |
| Stage 13D Admin Upload UI Verification | [34717938893](https://github.com/7eaur/alwaslh/actions/runs/34717938893) | success |
| Stage 13E Combined Integration Verification | [34717938938](https://github.com/7eaur/alwaslh/actions/runs/34717938938) | success |
| Stage15 Student Assessment | [34717938903](https://github.com/7eaur/alwaslh/actions/runs/34717938903) | success |
| Stage14 Student Product | [34717939005](https://github.com/7eaur/alwaslh/actions/runs/34717939005) | success |
| Stage 13F Admin Question Bank Verification | [34717938994](https://github.com/7eaur/alwaslh/actions/runs/34717938994) | success |
| Stage 13 Admin Product Verification | [34717938870](https://github.com/7eaur/alwaslh/actions/runs/34717938870) | success |
| Stage 13G Admin Operations Verification | [34717938999](https://github.com/7eaur/alwaslh/actions/runs/34717938999) | success |
| Rebuild Stage Verification | [34717938939](https://github.com/7eaur/alwaslh/actions/runs/34717938939) | success |

Stage14 run `34717939005` originally failed in browser job `103618589353` at Reader focus assertion line 53; 11 other browser tests passed. One isolated rerun was requested after inspection, without changing assertions/timeouts or UI. The isolated rerun passed (browser job `103619012849`, same source head); the full matrix is now **18/18 successful**. The original failure remains recorded and FPA-013 stays OPEN.

PR #50 merged as `f60f263f9fecfa33a3876ef7df6334c222c7cf3a`. FPA-002 status: **FIXED / POSTGRESQL + CHROMIUM + REGRESSION CI VERIFIED**. Railway API deployment `1e5a749a-10ac-47fd-99d8-e2653fce154b` was triggered from this merge; deployment status **SUCCESS** was verified at `2026-09-12T20:51:20.911Z`, source SHA `f60f263f9fecfa33a3876ef7df6334c222c7cf3a`. This closes deployment metadata verification, not authenticated production-path testing.

## FPA-013 — P2 — Reader focus is not stable in the browser acceptance flow

- **Area:** Student / accessibility / QA.
- **Problem:** An explicitly focused lesson link lost focus before keyboard activation.
- **Evidence:** Stage14 run `34717939005`, job `103618589353`, `reader.e2e.spec.mjs:53`: expected focused, received inactive; timeout 8 seconds. Source `presentation-foundation.tsx` schedules route focus in requestAnimationFrame.
- **Current behavior:** Browser execution failed after the subject route loaded and the link was focused.
- **Expected product behavior:** Route focus completes predictably and does not steal subsequent intentional keyboard focus.
- **Root cause:** **NOT YET VERIFIED**. Deferred route focus is a candidate; source comparison shows this UI was unchanged by SEC-01.
- **User impact:** Possible keyboard navigation disruption; prevalence **NOT YET VERIFIED**.
- **Engineering impact:** Intermittent or timing-dependent acceptance failure requires controlled reproduction.
- **Classification:** IMPROVE / investigate focused lifecycle.
- **Recommended solution:** Capture active-element/focus event order around route transition, then fix the owning focus lifecycle if confirmed. Preserve the accessibility assertion; do not add arbitrary waits.
- **Dependencies:** Student UX owner; coordinate with route work rather than mixing UI changes into the security branch.
- **Risk:** Low/medium; distinguish legitimate initial route focus from subsequent user intent.
- **Status:** Browser failure **EXECUTED**; root cause/open repair **NOT YET VERIFIED**. The initial 12-finding report now has this 13th finding.

## Additional FPA-011 evidence

The red PostgreSQL job also logged failed fixture cleanup statements caused by references from quiz/question audit events; cleanup catches these errors. This is test-state isolation debt, not the cause of the HTTP assertion failure or evidence of a production outage. Keep production integrity constraints; use properly scoped cleanup or isolated fixture databases.

## Railway source metadata

| Service | Successful deployment | Source SHA |
| --- | --- | --- |
| API at initial recovery | `e3adc7ab-8da1-49e9-bbdf-efd8ca89ea87` | `d113dc02212884b93fa0cd2ac8f75aae6bdb7258` |
| Student | `02fa104b-bfa0-4a0a-a6b4-bc7500e38e60` | `56ee51ab0d5669b4a38f9efec991ea79971d3503` |
| Admin | `f396fd8b-0dba-45b9-9d26-241889835844` | `9866e3b3c332d4c83b15c6e20b4cfd2972008f1b` |

These close the initial report's missing Student/Admin deployment-SHA metadata checks. They do not certify authenticated journeys, content counts, publication state, live worker operation, backups or performance.

## Central coordination

Issue #16 checkpoints: kickoff `5648443655`; FPA-001 `5648464422`; substantive report `5648551853`; real PostgreSQL red proof `5648574188`; merged audit/green PG metadata `5648587298`; Reader focus failure `5648599326`.

Decision remains **C scoped to Admin/source-review composition; backend/domain B**. UX and Legacy Content continue under their existing ownership. No broad rewrite or project-complete claim is made.


Final implementation checkpoint: report and security repair are merged; API deployment succeeded. FPA-002 is fixed, while FPA-001 and FPA-003 through FPA-013 remain open or require their documented verification/owning batches. Issue #16 merge checkpoint: `5648614290`.
