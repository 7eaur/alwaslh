# DOCUMENTATION INDEX — الوسيلة الذكية

> خريطة ذاكرة المشروع الرسمية. أي محادثة أو مهندس يبدأ من هنا ولا يعتمد على Chat memory.

Last synchronized: **2026-09-10 — Stage13F VERIFIED / CLOSED / PROMOTED; Stage13G ACTIVE on Track A; Stage14 parallel Track B in progress.**

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

`NEXT_CONVERSATION_PROMPT.md` launcher فقط.

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

## 5. Current verified checkpoint

`main`:

`3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`

Stage13F runtime checkpoint:

`afbe552710b3f1cf79ee70594f691fa836c05a45`

Stage13F verification:

- runtime verification-only PR #27 — **13/13 SUCCESS**, closed unmerged;
- closure verification-only PR #28 — **13/13 SUCCESS**, closed unmerged;
- `main` moved by non-force fast-forward to exact closure checkpoint `3aeca598...`.

Stage13F provides canonical reviewed Question Bank, immutable revisions, direct questions, stable same-item regeneration, Quiz Builder immutable versions/snapshots, review/publish/archive and reviewed/published export authority.

## 6. Current implementation sequence

```text
Stage13F VERIFIED / PROMOTED
→ Track A Stage13G Remaining Admin Product
→ Track B closes Stage14 and incorporates current main before Stage15
→ Stage15+ in dependency/order sequence
→ hardening/load/release gates later
```

Track A current branch: `integration/stage13g-admin-product`.

## 7. Current open boundaries

- `AI-012-019` P2 — live provider benchmark/routes/credentials/bootstrap `NOT YET VERIFIED`.
- Stage13G Admin parity remains active: student accounts, access-code operations, recovery/device operations, notifications, dashboard/operations, import/export/reporting/settings/security/audit and explicitly open lesson/quiz generation/export variants.
- Track B Stage14 final shell/copy/a11y closure is independent parallel work.
- Track B Stage15 must consume promoted Stage13F authority from `main`.
- Production deployment/cutover remains future-only; no deployment action is implied by Stage13G.

## 8. Documentation maintenance

After every meaningful batch:

1. update Status + Engineering Log during work;
2. update Queue/Continuity/Handoff/Resume when continuation truth changes;
3. update specialized stage docs and Legacy Coverage when capability state changes;
4. add an EXECUTION REPORT to Issue #16;
5. record exact HEAD/run IDs;
6. never mark PASS from prose/build alone;
7. never leave continuation-critical state only in Chat.
