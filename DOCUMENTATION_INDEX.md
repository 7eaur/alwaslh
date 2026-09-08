# DOCUMENTATION INDEX — الوسيلة الذكية

> خريطة ذاكرة المشروع الرسمية. أي محادثة/مهندس جديد يبدأ هنا ولا يعتمد على chat memory.

## 1. Source of Truth precedence

عند التعارض:

1. **current code + PostgreSQL migrations + executable test/CI evidence**.
2. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`.
3. `PROJECT_HANDOFF.md` + `PROJECT_STATUS.md` + `PROJECT_ENGINEERING_LOG.md`.
4. `PROJECT_INTEGRATION_CONTINUITY.md` — detailed resumable snapshot.
5. `PROJECT_EXECUTION_QUEUE.md` — exact active tasks/order/blockers.
6. Product Decisions + specialized stage/module docs.
7. `PRODUCT_FEATURE_PARITY_MATRIX.md` + `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md`.
8. `MASTER_REBUILD_ROADMAP.md`.
9. historical legacy/workstream/deployment docs.

Anything not inspected/executed = `NOT YET VERIFIED`.

## 2. Mandatory startup order

1. `README.md`
2. `DOCUMENTATION_INDEX.md`
3. `PROJECT_HANDOFF.md`
4. `PROJECT_STATUS.md`
5. `PROJECT_ENGINEERING_LOG.md`
6. `PROJECT_INTEGRATION_CONTINUITY.md`
7. **`PROJECT_EXECUTION_QUEUE.md`**
8. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`
9. **`docs/workstreams/SINGLE_OWNER_OPERATING_MODEL.md`**
10. active GitHub Issue `#16` latest comments
11. Product Decisions / Parity / Coverage / Roadmap as relevant
12. current specialized stage docs
13. actual code/migrations/tests before modifying that area
14. legacy audits/code only when needed to preserve a capability or understand a failure

`NEXT_CONVERSATION_PROMPT.md` is Launcher only.

## 3. Current operating model — SINGLE OWNER

Product Owner retired the permanent Backend/Frontend multi-chat model on 2026-09-08.

Active:

- `docs/workstreams/SINGLE_OWNER_OPERATING_MODEL.md`
- `PROJECT_EXECUTION_QUEUE.md`
- Issue `#16` — sole Project Execution Board

Historical/closed:

- Issue `#13` — Team Room
- Issue `#14` — Backend Board
- Issue `#15` — Frontend Board
- `docs/workstreams/TEAM_OPERATING_MODEL.md`
- `docs/workstreams/BACKEND_WORKSTREAM.md`
- `docs/workstreams/FRONTEND_WORKSTREAM.md`
- `docs/workstreams/INTEGRATION_WORKSTREAM.md`

Historical files/issues remain evidence only; do not place new commands/reports there.

## 4. Central state files

| File | Purpose |
|---|---|
| `PROJECT_HANDOFF.md` | complete replacement-engineer startup/context |
| `PROJECT_STATUS.md` | concise current stage/baseline/blockers |
| `PROJECT_ENGINEERING_LOG.md` | cumulative architecture decisions/findings/changes/tests |
| `PROJECT_INTEGRATION_CONTINUITY.md` | detailed current branch/contract/root-cause/CI/exact-next-action memory |
| `PROJECT_EXECUTION_QUEUE.md` | sole ordered implementation queue |
| `docs/product/CURRENT_PRODUCT_OVERRIDES.md` | current Product Owner overrides |
| `docs/workstreams/SINGLE_OWNER_OPERATING_MODEL.md` | current engineering method/quality gates |
| `docs/integration/STAGE13E_PROMOTION_MANIFEST.md` | exact Stage13E selective promotion file set + exact-head promotion procedure after executable PASS |
| `docs/integration/GITHUB_ACTIONS_RUNNER_INCIDENT.md` | CI-001 evidence: repository-wide hosted-runner allocation blocker, recovery rules, local fallback limits |
| `MASTER_REBUILD_ROADMAP.md` | target stage sequence, not runtime evidence |
| `NEXT_CONVERSATION_PROMPT.md` | compact startup launcher |

## 5. Hosting / deployment policy — CURRENT

**Deployment is deferred and out of current development scope until Product Owner provides a VPS and explicitly reopens deployment.**

Consequences:

- do not provision or debug Render/Vercel/Railway as current work;
- hosted runtime is not a Stage gate;
- absence of VPS does not block product development;
- `main` is the latest Integration-approved **development baseline**, not a deployment contract;
- keep application architecture portable for later VPS deployment.

Historical deployment files may remain in Git for evidence/portability but are not current task authority.

## 6. Product / architecture summary

**الوسيلة الذكية** منصة تعليمية عربية بسطحين مستقلين:

- `apps/student-web`: Student Web/PWA;
- `apps/admin-web`: Super Admin Web;
- `apps/api`: authoritative Fastify/TypeScript API;
- `database/migrations`: PostgreSQL schema/integrity authority.

Core flow:

`source provenance → media → OCR → AI → reviewed/published content → entitled Student learning/assessment`.

Stable boundaries:

- browser does not own canonical durable business state;
- Full Code = 6 digits; Class Code = 7 digits;
- Student returning login requires password + registered P-256 device proof;
- Curriculum = Class → Subject Offering → optional Section → Lesson;
- source inventory = provenance, not curriculum hierarchy;
- `media ready != published`;
- Stage13D publication is explicit Draft → Review → Published;
- raw AI/provider output is never automatic student authority;
- provider calls outside long DB transactions;
- Fastify HTTP remains separate from durable AI worker;
- no test weakening/auth bypass/fake API/duplicate lifecycle.

## 7. Product / parity references

| File | Purpose |
|---|---|
| `PRODUCT_FEATURE_PARITY_MATRIX.md` | valuable legacy capabilities/scenarios |
| `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` | capability → disposition → implementation → acceptance evidence |
| `docs/product/PRODUCT_EVOLUTION_REVIEW.md` | Product Decisions |
| `docs/product/PRODUCT_DECISIONS_BATCH_05.md` | product/AI/design/root-cause decisions |
| `docs/product/PRODUCT_DECISIONS_BATCH_06.md` | Student/Admin/PWA/documentation decisions |
| `docs/product/CURRENT_PRODUCT_OVERRIDES.md` | current overrides |
| `PROJECT_DEEP_AUDIT.md` / `PROJECT_FULL_AUDIT_CATALOG.md` | historical deep evidence |

Legacy architecture is reference only.

## 8. Data / Content / Curriculum

Important current docs/migrations:

- `DATABASE_PLATFORM_ARCHITECTURE.md`
- `docs/curriculum/CURRICULUM_STRUCTURE.md`
- `docs/admin/STAGE13_ADMIN_CURRICULUM_UI.md`
- `docs/admin/STAGE13_CONTENT_MEDIA_OCR_OPERATIONS.md`
- `docs/admin/STAGE13_CONTENT_INGESTION_PUBLICATION.md`
- `docs/media/MEDIA_PIPELINE_ARCHITECTURE.md`
- `database/migrations/0008_content_source_import.sql`
- `database/migrations/0009_media_pipeline.sql`
- `database/migrations/0011_ocr_foundation.sql`
- `database/migrations/0017_content_ingestion_publication.sql`

Canonical source evidence remains Stage9 `alwaslh-go`; source paths/names are provenance, not curriculum authority.

## 9. Auth / Access

Current verified principles:

- server session/role isolation;
- Full Code 6 digits / Class Code 7 digits;
- non-consuming activation verify → atomic completion;
- Student password + registered P-256 device challenge;
- Admin recovery + revocation + forced password change;
- explicit device rebind/reset.

## 10. OCR / AI

Key docs:

- `docs/ai/AI_PROVIDER_MODEL_STRATEGY.md`
- `docs/ai/STAGE11_GENERATION_CONTRACTS.md`
- `docs/ai/STAGE12_JOB_LIFECYCLE.md`
- `docs/ai/STAGE12_WORKER_RUNTIME.md`
- `docs/ai/STAGE13E_ADMIN_AI_OPERATIONS.md`
- `docs/ai/STAGE13E_ADMIN_AI_PERFORMANCE.md`
- `docs/ai/STAGE13E_ADMIN_AI_HTTP_VALIDATION.md`
- `docs/admin/STAGE13E_AI_OPERATIONS_FRONTEND_PREP.md`
- `docs/integration/STAGE13E_PROMOTION_MANIFEST.md`
- `docs/integration/GITHUB_ACTIONS_RUNNER_INCIDENT.md`

Live provider benchmark/routes/credentials/bootstrap remain `NOT YET VERIFIED`. Never fake provider readiness or move the background worker into Fastify.

## 11. Current verified baseline

Latest fully executable green application baseline:

`4eca7de8877ac9e2289b9c7990c912d33c256935`

Same-head SUCCESS:

- Stage13D Admin `34177369743`
- Stage13D Backend `34177369784`
- Stage13 Admin `34177369748`
- Stage12 `34177369812`
- Stage11 `34177369753`
- OCR `34177369750`
- Stage10 `34177369777`
- Stage9 `34177369756`
- Full Rebuild `34177369768`

Do not replace this baseline with docs-only/unexecuted heads.

## 12. Current implementation sequence

```text
VERIFIED through Stage13D
→ Stage13E combined verification + closure
→ Stage13F Question Bank / Quiz Builder / Publish
→ Stage13G Remaining Admin
→ Stage14 Student Product
→ Stage15 Assessment
→ Stage16 Offline/PWA
→ Stage17 Personal Data
→ Stage18 Notifications
→ Stage19 Progress/Statistics
→ Stage20 Import/Export/Reporting
→ Stage21–25 hardening/data
→ VPS available + deployment reopened
→ Stage26 Staging
→ Stage27 Release Gate
→ Stage28 Production Cutover
→ Stage29 Monitoring/Operations
```

Exact current task is always the first unfinished item in `PROJECT_EXECUTION_QUEUE.md`.

## 13. Current Stage13E / CI snapshot

Combined branch:

`integration/stage13e-ai-operations @ c48d1e597497e6054340f71235c78937082b9371`

Latest runtime/test HEAD below docs:

`d60218b518fb0fe453c21386e77cd35a2228ad07`

Stage13E remains `NOT YET VERIFIED` because no current candidate run has executed repository steps. Latest explicit rerun is run `34283442253`, attempt `3`, job `102266150322`, which completed with `steps=[]` and no log blob.

`CI-001` scope is now verified **repository-wide**, not Stage13E-specific:

- last known fully executing green baseline: Full Rebuild `34177369768`, completed SUCCESS at `2026-09-08T01:43:19Z` with real setup/checkout/test jobs;
- independent Stage10 run `34191051851` / job `101949023395` later failed pre-checkout with `steps=null`;
- independent Stage11 run `34191051835` / job `101949023152` later failed pre-checkout with `steps=null`;
- GitHub public status reported no Actions incident for September 8, 2026;
- exact repository/account-side runner-allocation cause remains `NOT YET VERIFIED` because Actions usage/billing/settings telemetry is not exposed by the connected integration;
- local fallback is also unavailable: execution-container DNS cannot resolve `github.com` or `registry.npmjs.org`, and no authenticated checkout exists.

Current static audit additionally fixed:

- `AI-013E-PERF-007`: List Jobs pages Jobs before Unit aggregation.
- `AI-013E-API-008`: all Stage13E offsets are bounded to JavaScript safe integers at HTTP validation; unsafe offsets return `400` before service/DB execution.

Promotion readiness audit proved the Stage13E candidate and current `main` have **zero changed-file overlap since their common merge base**. `docs/integration/STAGE13E_PROMOTION_MANIFEST.md` defines the exact 36 Stage13E files and requires a fresh exact-head combined + wider regression run on a short-lived promotion branch before `main` promotion.

See Queue, Continuity, `docs/integration/GITHUB_ACTIONS_RUNNER_INCIDENT.md`, and specialized Stage13E docs for exact evidence and next action.

## 14. Documentation maintenance

After every meaningful batch:

1. update `PROJECT_EXECUTION_QUEUE.md`;
2. update `PROJECT_INTEGRATION_CONTINUITY.md`;
3. update `PROJECT_STATUS.md` when state changes;
4. record findings/ADs/tests in `PROJECT_ENGINEERING_LOG.md`;
5. update specialized stage docs;
6. add `EXECUTION REPORT` to Issue #16;
7. update Handoff/Index/Roadmap/Legacy Coverage when their truth changes;
8. record exact HEAD + executable run IDs;
9. never mark PASS from prose/build alone;
10. never leave continuation-critical information only in chat.
