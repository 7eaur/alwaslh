# DOCUMENTATION INDEX — الوسيلة الذكية

> Current project memory map. A replacement engineering conversation should be able to continue from GitHub without prior chat memory.

Last synchronized: **2026-09-13**.

## Source-of-truth precedence

When sources conflict, use this order:

1. current code + PostgreSQL migrations + executable tests/CI;
2. verified runtime evidence when runtime is relevant;
3. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`;
4. `PROJECT_HANDOFF.md`;
5. `PROJECT_STATUS.md`;
6. `PROJECT_ENGINEERING_LOG.md`;
7. current product/workstream docs;
8. historical stage/roadmap prose.

Anything not inspected or executed = `NOT YET VERIFIED`.

## Mandatory startup — current Student continuation

Read in this order:

1. `PROJECT_HANDOFF.md`
2. `PROJECT_STATUS.md`
3. `PROJECT_ENGINEERING_LOG.md`
4. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`
5. `docs/product/STUDENT_PRODUCT_ARCHITECTURE.md`
6. `docs/product/STUDENT_FUTURE_SURFACES_SPEC.md`
7. `docs/product/STUDENT_LIBRARY_OVERVIEW_REDESIGN.md`
8. `.agents/skills/alwaslh-product-engineering/SKILL.md`
9. actual changed source/tests/workflows for the current batch
10. live `main`, open PRs and GitHub Actions

For the current batch specifically, also inspect PR #55 before editing.

## Current active batch

**PR #55 — Student Library Overview Refinement**

Branch: `ux/student-library-overview`

Purpose:

- remove duplicated Library tabs/cards;
- make `/app/library` a real personal overview;
- add honest summary/statistics;
- keep one clear collection destination grid;
- use one return-to-Library action inside child sections;
- preserve offline/download integrity contracts.

Final exact-head CI + phone/desktop Visual QA remain the merge gate. See `PROJECT_STATUS.md` and `PROJECT_HANDOFF.md` for exact continuation.

## Verified Student baseline

PR #53 — Student Experience Rebuild — MERGED / VERIFIED — 23/23 workflows.

PR #54 — Future Student Surfaces — MERGED / VERIFIED — 23/23 workflows.

Current merged Student architecture includes:

- Welcome/Auth/Help/Support;
- Home/Learn/Reader;
- Practice/Assessment;
- Library/Notifications/Progress/Account;
- final primary navigation `الرئيسية / التعلّم / التدريب / مكتبتي`;
- learner-safe errors;
- restrained motion;
- interaction affordance + >=44px touch targets;
- destination-level lazy loading;
- no fabricated future data.

## Canonical Student product docs

| File | Purpose |
|---|---|
| `docs/product/STUDENT_PRODUCT_ARCHITECTURE.md` | final Student IA, shell, route, UX and performance architecture |
| `docs/product/STUDENT_FUTURE_SURFACES_SPEC.md` | Stage17–19 pre-integration UI/data rules |
| `docs/product/STUDENT_LIBRARY_OVERVIEW_REDESIGN.md` | current Library overview decision |
| `docs/product/CURRENT_PRODUCT_OVERRIDES.md` | latest Product Owner decisions that supersede older conflicting prose |

## Central continuity docs

| File | Purpose |
|---|---|
| `PROJECT_HANDOFF.md` | replacement-engineer/current-chat handoff and exact continuation |
| `PROJECT_STATUS.md` | concise current batch/status/next action |
| `PROJECT_ENGINEERING_LOG.md` | decisions, findings, evidence and remaining work |
| `NEXT_CONVERSATION_PROMPT.md` | short copy/paste launcher for a new conversation |

## Normal roadmap return

Prebuilt Student UI does not close remaining service/backend work.

Return sequence after current UX batch:

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17 → Stage18 → Stage19`

## Additional references only when relevant

Broad recovery/history:

- `docs/workstreams/UNIFIED_PROJECT_RESUME_PROTOCOL.md`
- `MASTER_REBUILD_ROADMAP.md`
- `PRODUCT_FEATURE_PARITY_MATRIX.md`
- `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md`

Railway/deployment:

- `docs/operations/RAILWAY_LIVE_STATE.md`

Content/import/publication:

- `docs/content/LIVE_CONTENT_IMPORT_STATUS.md`

UX refoundation history:

- `docs/workstreams/UX_UI_REFOUNDATION_PAUSE_2026-09-12.md`
- `docs/product/UX_UI_MASTER_AUDIT_2026-09-12.md`
- `docs/product/TARGET_INFORMATION_ARCHITECTURE.md`
- `docs/product/DESIGN_SYSTEM_SPEC.md`
- `docs/product/CONTENT_LANGUAGE_RULES.md`
- `docs/workstreams/UX_UI_REFOUNDATION_IMPLEMENTATION_ROADMAP.md`

Historical docs must not override newer current Product Owner decisions.