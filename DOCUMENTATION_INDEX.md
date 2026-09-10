# DOCUMENTATION INDEX — الوسيلة الذكية

> خريطة ذاكرة المشروع الرسمية. أي محادثة أو مهندس يبدأ من هنا ولا يعتمد على Chat memory.

Last synchronized: **2026-09-10 — Stage13F PROMOTED; Stage13G G-A/G-B/G-C1 VERIFIED on Track A; G-C2 ACTIVE; Stage14 parallel Track B.**

## 1. Source of Truth precedence

عند التعارض:

1. **current code + PostgreSQL migrations + executable test/CI evidence**.
2. **explicit current Product Owner instruction** + `docs/product/CURRENT_PRODUCT_OVERRIDES.md`.
3. latest Issue `#16` execution model/report when it records a newer explicit Product Owner coordination decision.
4. `PROJECT_HANDOFF.md` + `PROJECT_STATUS.md`.
5. `PROJECT_RESUME_SNAPSHOT.md`.
6. `PROJECT_ENGINEERING_LOG.md`.
7. `PROJECT_INTEGRATION_CONTINUITY.md`.
8. `PROJECT_EXECUTION_QUEUE.md`.
9. current workstream/stage docs.
10. Legacy Coverage + Roadmap.
11. historical docs/workstreams/deployment records.

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
10. `docs/workstreams/PARALLEL_TWO_TRACK_OPERATING_MODEL.md`
11. latest Issue `#16` body/comments
12. live current `main` + current track branch + Actions
13. current-stage DB/API/Frontend/tests
14. `MASTER_REBUILD_ROADMAP.md` + `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md`

`NEXT_CONVERSATION_PROMPT.md` is only a launcher. If it conflicts with the sources above, the sources above win and the launcher must be corrected.

## 3. Current execution model

**Parallel Two-Track Execution** is current and supersedes Single Owner for active work.

- Track A: API/Admin/DB/AI/generation/Question Bank/Quiz Builder/Stage13G.
- Track B: Student Product Stage14+ on `parallel/stage14-student-product`.
- Issue #16 is the sole cross-track execution ledger.
- Shared backend contracts reach Track B through verified `main`.
- No duplicate durable authority to avoid integration.

Current model doc: `docs/workstreams/PARALLEL_TWO_TRACK_OPERATING_MODEL.md`.

Historical only: `docs/workstreams/SINGLE_OWNER_OPERATING_MODEL.md`, `TEAM_OPERATING_MODEL.md`, `BACKEND_WORKSTREAM.md`, `FRONTEND_WORKSTREAM.md`, `INTEGRATION_WORKSTREAM.md`.

## 4. Central state files

| File | Purpose |
|---|---|
| `PROJECT_HANDOFF.md` | replacement-engineer startup/current handoff |
| `PROJECT_STATUS.md` | concise current state/gates/open boundaries |
| `PROJECT_RESUME_SNAPSHOT.md` | exact continuation checkpoint |
| `PROJECT_ENGINEERING_LOG.md` | architecture/findings/changes/tests |
| `PROJECT_INTEGRATION_CONTINUITY.md` | detailed resumable state |
| `PROJECT_EXECUTION_QUEUE.md` | ordered active tasks |
| `docs/product/CURRENT_PRODUCT_OVERRIDES.md` | current PO decisions |
| `docs/workstreams/PARALLEL_TWO_TRACK_OPERATING_MODEL.md` | current coordination model |
| `MASTER_REBUILD_ROADMAP.md` | stage sequence |
| `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` | capability acceptance state |

## 5. Current verified checkpoints

Shared `main` Stage13F closure:

`3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`

Stage13F runtime checkpoint:

`afbe552710b3f1cf79ee70594f691fa836c05a45`

Stage13G Track A verified chain:

- G-A Accounts + Access: `4822f87d60ab7a467c4708b5f75bb24cb90e7738`, run `34425317912`, Chromium 4/4.
- G-B Notifications + Operations: `bc19f6e198c8cfede62e9f1b7a7eb1b0fed121cb`, run `34428052472`, Chromium 7/7 total.
- G-C1 Code Import / Export / Print: **runtime/code HEAD `345e0712c45e9e4c0479dc65d96efc3fb7da33cd`**, run `34430915626`, all three jobs SUCCESS, real Chromium **10/10 total**.

The documentation handoff commit is intentionally allowed to sit above `345e0712...`; it is prose-only. Runtime verification authority remains `345e0712...` until new executable code changes and a new exact-head gate pass.

## 6. Current implementation sequence

```text
Stage13F VERIFIED / PROMOTED
→ Stage13G G-A VERIFIED
→ Stage13G G-B VERIFIED
→ Stage13G G-C1 VERIFIED
→ Stage13G G-C2 Reports / Settings / Security / Audit  ← CURRENT TRACK A WORK
→ Stage13G G-D Remaining Lesson / Quiz AI Authoring Parity
→ Stage13G closure/wider regression/Legacy Coverage synchronization
```

Track A current branch: `integration/stage13g-admin-product`.
Track B current branch: `parallel/stage14-student-product`.

## 7. Current open boundaries

- **G-C2** is the first incomplete Track A item: inspect real config/schema plus Auth/Access/content/AI event authorities, then build only evidence-backed report/security/audit/settings product contracts. Prefer read projections; do not create a second generic audit store or browser-owned settings authority.
- `AI-012-019` P2 — live provider benchmark/routes/credentials/bootstrap = `NOT YET VERIFIED`.
- G-D remains required: lesson generation trigger/orchestration, selected-lesson bulk generation, Quiz Builder generation settings/direct generation/version orchestration and remaining archive/export parity.
- G-C1 does **not** claim binary `.xlsx` generation or server-generated binary PDF. Verified output is strict CSV import/template, UTF-8 BOM CSV export compatible with Excel, and RTL browser print/Save-as-PDF flow.
- Earlier Stage13D/E/F Admin E2E helpers that assumed Curriculum as the post-login home must be adapted before final wider Stage13G regression; feature assertions must not be weakened.
- Production deployment/cutover remains future-only.

## 8. Documentation maintenance

After every meaningful batch:

1. update Status + Engineering Log during work;
2. update Queue/Continuity/Handoff/Resume when continuation truth changes;
3. update specialized stage docs and Legacy Coverage when capability state changes;
4. add an EXECUTION REPORT to Issue #16;
5. record exact HEAD/run IDs;
6. never mark PASS from prose/build alone;
7. never leave continuation-critical state only in Chat.
