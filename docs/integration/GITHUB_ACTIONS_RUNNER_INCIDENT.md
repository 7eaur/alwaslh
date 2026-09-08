# GitHub Actions Runner Incident — CI-001

> Scope: development CI only. This incident does **not** change product architecture, Stage acceptance rules, or the Product Owner decision to defer hosting/deployment until VPS.
>
> Evidence rule: code/migrations/executable steps outrank workflow conclusion labels. A workflow marked `failure` with no allocated runner and no steps is infrastructure evidence, not application-failure evidence.

## Current classification

- ID: `CI-001`
- Severity: `P1`
- Area: GitHub Actions / verification infrastructure
- Scope: **VERIFIED repository-wide across independent workflows**
- Exact external root cause: **NOT YET VERIFIED**
- Stage13E impact: executable same-head closure gate cannot run
- Product/runtime impact: none proven
- Hosting/VPS relation: none; hosting remains intentionally deferred

## Evidence timeline

### Last known fully executing green baseline

Run `34177369768` — **Rebuild Stage Verification**

- head: `4eca7de8877ac9e2289b9c7990c912d33c256935`
- created: `2026-09-08T01:39:16Z`
- completed: `2026-09-08T01:43:19Z`
- conclusion: `success`
- jobs received real runners and executed normal steps including `Set up job`, `Initialize containers`, `actions/checkout@v4`, setup/install/test/database/browser work and completion.

This remains the latest fully executable green application baseline.

### Independent repository-wide pre-checkout failures

By `2026-09-08T05:33Z`, independent previously established workflows were failing before checkout:

1. Stage10 Media Pipeline
   - run `34191051851`
   - job `101949023395`
   - conclusion `failure`
   - `steps=null`
   - no job logs / no repository command executed

2. Stage11 AI Contract Verification
   - run `34191051835`
   - job `101949023152`
   - conclusion `failure`
   - `steps=null`
   - no job logs / no repository command executed

These are independent workflows from Stage13E, so Stage13E YAML or product code cannot explain the incident scope.

### Stage13E current evidence

Run `34283442253` — Stage13E Combined Integration Verification

- candidate/docs head: `c48d1e597497e6054340f71235c78937082b9371`
- runtime/test head beneath docs: `d60218b518fb0fe453c21386e77cd35a2228ad07`
- attempt 2 job: `102256556365` → no runner/steps
- attempt 3 was explicitly re-run after the incident audit:
  - job `102266150322`
  - conclusion `failure`
  - `steps=[]`
  - logs endpoint returned no blob because no log was produced

No Stage13E checkout/lint/typecheck/test/build/PostgreSQL/Chromium command executed in these attempts.

## Runner-label / workflow configuration audit

A runner-label mismatch was explicitly checked and ruled out on the inspected workflows:

- current Stage10 Media Pipeline: `runs-on: ubuntu-latest`;
- current Stage11 AI Contract Verification: `runs-on: ubuntu-latest`;
- current Stage13E Combined Integration: `runs-on: ubuntu-latest`;
- verified Full Rebuild workflow at `4eca7de...`: its jobs also use `runs-on: ubuntu-latest`.

More importantly, the same Stage10 and Stage11 workflows have known green runs with actual GitHub-hosted runner execution:

- Stage10 success `34177369777` / job `101909353790` executed setup, checkout, Node setup, dependencies, lint/typecheck/unit/build, migrations, PostgreSQL integration and real PDF smoke;
- Stage11 success `34177369753` / job `101909353876` executed setup, checkout, Node setup, dependencies, lint/typecheck/tests/build.

Therefore the incident is **not explained by a custom/self-hosted runner label, missing runner label, or a Stage13E-only `runs-on` configuration error**. Changing `ubuntu-latest` or introducing self-hosted infrastructure without separate product need would be unsupported by evidence.

## Public platform status check

GitHub Status was checked for September 8, 2026. No public GitHub Actions incident was reported for that date.

Therefore the evidence does **not** support classifying CI-001 as a known global GitHub Actions outage. The remaining plausible class is repository/account-specific hosted-runner allocation or an unreported platform condition, but the exact cause remains `NOT YET VERIFIED`.

## Account / permission boundary

The repository owner account is confirmed through the connected GitHub integration to have `admin` permission on `7eaur/alwaslh`.

The integration can read workflow runs/jobs/steps and can request reruns, but it does not expose the repository/account Actions billing, usage, budget, or runner-allocation settings needed to verify the exact account-side cause.

Direct attempts to read repository Actions administration endpoints such as `/actions/permissions` and `/actions/runners` through the available generic GitHub connector are rejected by the connector allowlist before reaching GitHub. This is a tooling visibility boundary, not evidence that repository Actions permissions or runner inventory are wrong.

GitHub documentation states that private repositories use account-plan GitHub-hosted runner allowances and that usage can be blocked after included quota is exhausted when additional paid usage is unavailable. This is a **diagnostic possibility only**, not a finding about this account until usage/billing evidence is inspected.

## Local fallback investigation

The execution container was checked independently from GitHub-hosted runners:

- `/mnt/data/alwaslh-stage13e` exists but is empty and is not a Git checkout;
- `github.com` DNS resolution fails;
- HTTPS to `github.com` fails before connection;
- `registry.npmjs.org` DNS/HTTPS fails;
- `git ls-remote https://github.com/7eaur/alwaslh.git HEAD` fails with `Could not resolve host`.

Therefore the current container cannot clone the private repository or install dependencies as a trustworthy local replacement gate. No local PASS is claimed.

## What must NOT be changed because of CI-001

Do not:

- weaken Stage13E tests;
- remove PostgreSQL/browser gates;
- replace real APIs with mocks/test-only endpoints;
- alter Stage13E workflow semantics merely to make a pre-checkout failure look green;
- replace `ubuntu-latest` with custom/self-hosted labels without independent evidence/need;
- create a second queue/lifecycle;
- promote Stage13E to `main` without executable evidence;
- begin Stage13F without explicit Product Owner ordering override;
- introduce hosting/provider infrastructure as a workaround.

## Recovery procedure

1. Inspect account/repository GitHub Actions usage/budget/payment and Actions availability through the GitHub account UI or another administrative channel that exposes those settings.
2. Restore/confirm standard GitHub-hosted `ubuntu-latest` runner allocation for this private repository if an account-side restriction is found.
3. Re-run the **unchanged** Stage13E Combined Integration workflow.
4. A recovery attempt counts as infrastructure recovery only after a real runner executes at least `Set up job` / checkout steps.
5. Any command that then executes and fails becomes a real engineering failure and must be root-caused in the owning DB/API/Admin/test layer.
6. Combined PASS → wider same-head Stage9/10/OCR/11/12/13/13D/Full Rebuild matrix.
7. Wider PASS → follow `docs/integration/STAGE13E_PROMOTION_MANIFEST.md` and re-run Combined + wider gates on the exact promotion HEAD.
8. Only exact promotion-head PASS can close Stage13E and unblock Stage13F.

## Current decision

`CI-001` is a **repository-wide verification-infrastructure blocker with scope verified and exact root cause unverified**.

The runner-label/YAML explanation has been ruled out on the inspected workflows. The correct engineering action is to preserve the candidate and gates unchanged until standard GitHub-hosted runner allocation becomes available or account-side evidence identifies a concrete administrative cause. Product-code or workflow-label churn is not justified by the current evidence.
