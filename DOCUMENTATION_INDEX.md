# DOCUMENTATION INDEX — الوسيلة الذكية

> خريطة ذاكرة المشروع الرسمية. أي محادثة/مهندس جديد يبدأ هنا ولا يعتمد على Chat memory.

Last synchronized: **2026-09-09 — Stage13E Combined Gate PASS; wider matrix has 10 green workflows and one stale standalone CI assertion failure.**

## 1. Source of Truth precedence

عند التعارض:

1. **current code + PostgreSQL migrations + executable test/CI evidence**.
2. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`.
3. `PROJECT_HANDOFF.md` + `PROJECT_STATUS.md`.
4. **`PROJECT_RESUME_SNAPSHOT.md` — latest continuation checkpoint.**
5. `PROJECT_ENGINEERING_LOG.md`.
6. `PROJECT_INTEGRATION_CONTINUITY.md`.
7. `PROJECT_EXECUTION_QUEUE.md`.
8. specialized product/stage docs.
9. Legacy Coverage + Roadmap.
10. historical workstream/deployment docs.

Anything not inspected/executed = `NOT YET VERIFIED`.

## 2. Mandatory startup order

1. `README.md`
2. `DOCUMENTATION_INDEX.md`
3. `PROJECT_HANDOFF.md`
4. `PROJECT_STATUS.md`
5. **`PROJECT_RESUME_SNAPSHOT.md`**
6. `PROJECT_ENGINEERING_LOG.md`
7. `PROJECT_INTEGRATION_CONTINUITY.md`
8. `PROJECT_EXECUTION_QUEUE.md`
9. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`
10. `docs/workstreams/SINGLE_OWNER_OPERATING_MODEL.md`
11. `docs/integration/STAGE13E_PROMOTION_MANIFEST.md`
12. latest Issue `#16` comments
13. PR `#24` current checks/changed files
14. current Stage13E workflow/code/migrations/tests
15. Legacy Coverage/Roadmap when closing or starting a stage

`NEXT_CONVERSATION_PROMPT.md` is Launcher only.

## 3. Current operating model

- Single replaceable engineering owner for Product + Architecture + Backend + Frontend + UX + Security + Performance + QA + Git + Documentation.
- Issue `#16` is sole active Project Execution Board.
- Issues `#13/#14/#15` and old Backend/Frontend/Team workstream docs are historical only.
- Hosting/deployment is fully deferred until VPS + explicit Product Owner reopening.
- `main` is a development baseline, not a deployment authority.

## 4. Central state files

| File | Purpose |
|---|---|
| `PROJECT_HANDOFF.md` | replacement-engineer startup and current handoff |
| `PROJECT_STATUS.md` | concise current status/gates/blockers |
| **`PROJECT_RESUME_SNAPSHOT.md`** | **latest exact HEAD/run/root-cause/next-action checkpoint** |
| `PROJECT_ENGINEERING_LOG.md` | cumulative architecture decisions/findings/history |
| `PROJECT_INTEGRATION_CONTINUITY.md` | detailed historical/current continuity |
| `PROJECT_EXECUTION_QUEUE.md` | ordered implementation queue |
| `docs/product/CURRENT_PRODUCT_OVERRIDES.md` | Product Owner overrides |
| `docs/workstreams/SINGLE_OWNER_OPERATING_MODEL.md` | current engineering method |
| `docs/integration/STAGE13E_PROMOTION_MANIFEST.md` | exact selective promotion authority |
| `docs/integration/GITHUB_ACTIONS_RUNNER_INCIDENT.md` | historical CI-001 runner incident evidence |
| `MASTER_REBUILD_ROADMAP.md` | target stage sequence |
| `NEXT_CONVERSATION_PROMPT.md` | compact launcher |

## 5. Current Stage13E checkpoint

Candidate branch:

`integration/stage13e-ai-operations`

Current executable candidate HEAD:

`e291c6bde3971845048bf8bcc4561b65d3c702e6`

Verification-only Draft PR:

`#24 — MUST NOT BE MERGED`

Combined workflow `.github/workflows/stage13e-integration.yml` passed completely in run **`34394580893`**, including API/Admin quality, migrations/contracts, Stage13E backend regressions, isolated Stage12/auth regressions, real fixtures and **Chromium 5/5**.

Wider candidate matrix via PR #24:

- Stage9 `34395033866` SUCCESS
- Stage10 `34395033929` SUCCESS
- OCR `34395033922` SUCCESS
- Stage11 `34395033876` SUCCESS
- Stage12 `34395033892` SUCCESS
- Stage13 Admin `34395033898` SUCCESS
- Stage13D Backend `34395033978` SUCCESS
- Stage13D Admin Chromium `34395034010` SUCCESS
- Full Rebuild `34395033928` SUCCESS
- Stage13E Frontend Prep `34395033957` SUCCESS
- Stage13E standalone Admin workflow `34395034000` FAILURE only at stale DB assertion shell step.

Remaining blocker: **`CI-013E-009` — `.github/workflows/stage13e-ai-operations.yml` contract assertion drift**. It still has old shell syntax and old three-constraint/two-index expectations. Current migration/Combined Gate use four constraints including reject-note enforcement and intentionally no redundant latest-review index.

Classification: CI workflow drift, not product/database failure.

Exact next action is documented in `PROJECT_RESUME_SNAPSHOT.md`.

## 6. Stable product architecture

**الوسيلة الذكية** منصة تعليمية عربية بسطحين مستقلين:

- `apps/student-web`: Student Web/PWA;
- `apps/admin-web`: Super Admin Web;
- `apps/api`: authoritative Fastify/TypeScript API;
- `database/migrations`: PostgreSQL schema/integrity authority.

Stable boundaries:

- browser does not own canonical durable business state;
- Full Code = 6 digits; Class Code = 7 digits;
- Student returning login = password + registered P-256 device proof;
- Curriculum = Class → Subject Offering → optional Section → Lesson;
- source inventory = provenance, not curriculum hierarchy;
- `media ready != published`;
- publication = Draft → Review → Published;
- raw AI/provider output never automatic Student/Question Bank authority;
- provider calls outside long DB transactions;
- durable AI worker separate from Fastify HTTP;
- no test weakening/auth bypass/fake API/duplicate lifecycle.

## 7. Current implementation sequence

```text
VERIFIED through Stage13D
→ Stage13E fix standalone CI drift + full wider exact-head green
→ selective promotion from latest main
→ Combined + wider verification again on promotion HEAD
→ Stage13E closure into main
→ Stage13F Question Bank / Quiz Builder / Publish
→ Stage13G Remaining Admin
→ Stage14+ Student/Product/Hardening
→ deployment only after VPS + explicit reopening
```

## 8. Current known open boundaries

- `CI-013E-009` P1 — standalone Stage13E workflow DB assertion drift; current closure blocker.
- `CI-001` — historical hosted-runner allocation incident; not currently blocking because runners execute again; exact historical external cause NOT YET VERIFIED.
- `AI-011-005` P2 — Stage13F direct reviewed Question Bank persistence.
- `AI-012-019` P2 — live provider benchmark/routes/credentials/bootstrap NOT YET VERIFIED.

## 9. Documentation maintenance

After every meaningful batch:

1. update `PROJECT_RESUME_SNAPSHOT.md`;
2. update `PROJECT_STATUS.md` / `PROJECT_HANDOFF.md` when truth changes;
3. update Queue/Continuity/Engineering Log and specialized docs;
4. add an `EXECUTION REPORT` to Issue #16;
5. record exact HEAD + run IDs;
6. never mark PASS from prose/build alone;
7. never leave continuation-critical information only in chat.
