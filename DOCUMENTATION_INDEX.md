# DOCUMENTATION INDEX — الوسيلة الذكية

> خريطة ذاكرة المشروع الرسمية. أي محادثة/مهندس جديد يبدأ هنا ولا يعتمد على Chat memory.

Last synchronized: **2026-09-09 — Stage13E VERIFIED / PROMOTED / CLOSED; Stage13F READY / NOT STARTED.**

## 1. Source of Truth precedence

عند التعارض:

1. **current code + PostgreSQL migrations + executable test/CI evidence**.
2. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`.
3. `PROJECT_HANDOFF.md` + `PROJECT_STATUS.md`.
4. `PROJECT_RESUME_SNAPSHOT.md` — latest continuation checkpoint.
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
5. `PROJECT_RESUME_SNAPSHOT.md`
6. `PROJECT_ENGINEERING_LOG.md`
7. `PROJECT_INTEGRATION_CONTINUITY.md`
8. `PROJECT_EXECUTION_QUEUE.md`
9. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`
10. `docs/workstreams/SINGLE_OWNER_OPERATING_MODEL.md`
11. latest Issue `#16` comments
12. live current `main` + relevant Actions
13. current-stage DB/API/Frontend/tests
14. `MASTER_REBUILD_ROADMAP.md` + `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` when starting/closing a stage

`NEXT_CONVERSATION_PROMPT.md` is Launcher only.

## 3. Current operating model

- Single replaceable engineering owner for Product + Architecture + Backend + Frontend + UX + Security + Performance + QA + Git + Documentation.
- Issue `#16` is sole active Project Execution Board.
- Issues `#13/#14/#15` and old permanent workstream docs are historical only.
- Hosting/deployment is fully deferred until VPS + explicit Product Owner reopening.
- `main` is a development/integration baseline, not deployment authority.
- Root-cause fixes only; no test weakening/auth bypass/fake API/duplicate durable authority.

## 4. Central state files

| File | Purpose |
|---|---|
| `PROJECT_HANDOFF.md` | replacement-engineer startup and current handoff |
| `PROJECT_STATUS.md` | concise current status/gates/open boundaries |
| `PROJECT_RESUME_SNAPSHOT.md` | latest exact verification/next-action checkpoint |
| `PROJECT_ENGINEERING_LOG.md` | project understanding, architecture decisions, findings, changes and verification |
| `PROJECT_INTEGRATION_CONTINUITY.md` | detailed current continuity |
| `PROJECT_EXECUTION_QUEUE.md` | ordered implementation queue |
| `docs/product/CURRENT_PRODUCT_OVERRIDES.md` | Product Owner overrides |
| `docs/workstreams/SINGLE_OWNER_OPERATING_MODEL.md` | current engineering method |
| `MASTER_REBUILD_ROADMAP.md` | target stage sequence |
| `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` | legacy capability acceptance state |
| `NEXT_CONVERSATION_PROMPT.md` | compact launcher |

Historical/closure evidence:

- `docs/integration/STAGE13E_PROMOTION_MANIFEST.md` — completed exact 36-file selective Stage13E promotion record;
- `docs/integration/GITHUB_ACTIONS_RUNNER_INCIDENT.md` — historical CI-001 evidence/runbook;
- Stage13E specialized contracts under `docs/ai/` and `docs/admin/`.

## 5. Current verified checkpoint

Stage13E accepted candidate:

`72ead8446af237392dc6d953c8e0c2382f468286`

Candidate required matrix: **12/12 SUCCESS**. Verification-only PR #24 was closed unmerged.

Stage13E verified selective promotion/runtime SHA:

`d5ebc7f25a369430387a758c7c0bb89350963d67`

Promotion properties:

- built from inspected `main @ e304d61286b9ca120db2dad695d29f4f1642e733`;
- exact accepted 36-file Stage13E manifest;
- one promotion commit;
- no divergent candidate history/central-doc rollback;
- promotion required matrix: **12/12 SUCCESS**;
- verification-only PR #25 closed unmerged;
- `main` fast-forwarded non-force after confirming it had not moved.

Promotion run IDs:

- Combined Stage13E `34401502463`
- Stage13E standalone `34401549935`
- Stage13E Frontend Prep `34401549849`
- Rebuild `34401550016`
- Stage13 Admin `34401549835`
- Stage9 `34401549851`
- Stage10 `34401549989`
- OCR `34401549910`
- Stage11 `34401549927`
- Stage12 `34401549964`
- Stage13D Content `34401550065`
- Stage13D Admin `34401549903`

All are SUCCESS on exact `d5ebc7f...`.

Documentation-only closure commits after the promotion do not replace the verified runtime/application evidence attached to `d5ebc7f...`.

## 6. Stable product architecture

**الوسيلة الذكية** لها سطحان مستقلان:

- `apps/student-web`: Student Web/PWA;
- `apps/admin-web`: Super Admin Web;
- `apps/api`: authoritative Fastify/TypeScript API;
- `database/migrations`: PostgreSQL schema/integrity authority.

Stable boundaries:

- browser does not own canonical durable business state;
- Full Code = 6 digits; Class Code = 7 digits;
- returning Student login = password + registered P-256 device proof;
- Curriculum = Class → Subject Offering → optional Section → Lesson;
- source inventory = provenance, not curriculum hierarchy;
- `media ready != published`;
- educational publication = explicit Draft → Review → Published;
- raw AI/provider output never automatic Student/Question Bank authority;
- provider calls stay outside long DB transactions;
- durable AI worker is separate from Fastify HTTP;
- Stage13E Admin history is bounded/paginated and current review authority is independent from selected historical page;
- Stage13E does not create a second Stage12 queue or Stage13F Question Bank authority.

## 7. Current implementation sequence

```text
VERIFIED through Stage13E
→ Stage13F repository discovery
→ Stage13F Question Bank / Quiz Builder / Publish implementation
→ exact-head DB/API/Admin/Chromium + wider regression closure
→ Stage13G Remaining Admin
→ Stage14+ Student/Product/Hardening
→ deployment only after VPS + explicit reopening
```

Stage13F is **READY / NOT STARTED**. Repository discovery precedes implementation; uninspected Stage13F areas are `NOT YET VERIFIED`.

## 8. Current open boundaries

- `AI-011-005` P2 — Stage13F reviewed `direct` Question Bank persistence.
- `AI-012-019` P2 — live provider benchmark/routes/credentials/bootstrap `NOT YET VERIFIED`.
- `CI-001` — historical hosted-runner allocation incident, no longer blocking; exact historical external cause `NOT YET VERIFIED`.
- Stage13G+ remains later ordered work.
- deployment/VPS remains future-only.

Closed Stage13E IDs include `AI-013E-DB-001`, `AI-013E-REVIEW-002`, `AI-013E-OPS-003..006`, `AI-013E-PERF-007`, `AI-013E-API-008`, and `CI-013E-009` — all FIXED + VERIFIED.

## 9. Documentation maintenance

After every meaningful batch:

1. update `PROJECT_RESUME_SNAPSHOT.md`;
2. update Status/Handoff when truth changes;
3. update Queue/Continuity/Engineering Log + specialized docs;
4. add an execution/closure report to Issue #16;
5. record exact HEAD + run IDs;
6. never mark PASS from prose/build alone;
7. never leave continuation-critical information only in chat.
