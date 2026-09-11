# DOCUMENTATION INDEX — الوسيلة الذكية

> خريطة ذاكرة المشروع الرسمية. أي محادثة أو مهندس يبدأ من هنا ولا يعتمد على Chat memory.

Last synchronized: **2026-09-11 — Stage13G VERIFIED/CLOSED on Track A; NOT PROMOTED to main.**

## 1. Source of Truth precedence

عند التعارض:

1. **current code + PostgreSQL migrations + executable test/CI evidence**.
2. **explicit current Product Owner instruction** + `docs/product/CURRENT_PRODUCT_OVERRIDES.md`.
3. latest Issue `#16` execution model/report when it records a newer explicit coordination decision.
4. `PROJECT_HANDOFF.md` + `PROJECT_STATUS.md`.
5. `PROJECT_RESUME_SNAPSHOT.md`.
6. `PROJECT_ENGINEERING_LOG.md`.
7. `PROJECT_INTEGRATION_CONTINUITY.md`.
8. `PROJECT_EXECUTION_QUEUE.md`.
9. current workstream/stage docs.
10. `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` + `PRODUCT_FEATURE_PARITY_MATRIX.md` + roadmap.
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
11. `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md`
12. latest Issue `#16` body/comments
13. live current `main` + current track branch + Actions
14. current-stage DB/API/Frontend/tests
15. `MASTER_REBUILD_ROADMAP.md` + canonical parity matrix

`NEXT_CONVERSATION_PROMPT.md` is only a launcher. If it conflicts with the sources above, the sources above win and the launcher must be corrected.

## 3. Current execution model

**Parallel Two-Track Execution** is current.

- Track A: API/Admin/DB/AI/generation/Question Bank/Quiz Builder. Stage13G is now closed on its branch.
- Track B: Student Product Stage14+ on `parallel/stage14-student-product`.
- Issue #16 is the sole cross-track execution ledger.
- Shared backend contracts reach Track B through verified `main` after explicit promotion.
- No duplicate durable authority to avoid integration.

Current model doc: `docs/workstreams/PARALLEL_TWO_TRACK_OPERATING_MODEL.md`.

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
| `PRODUCT_FEATURE_PARITY_MATRIX.md` | canonical legacy capability inventory |
| `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` | executable capability acceptance state |

## 5. Verified checkpoints

Shared `main` Stage13F closure: `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`.

Stage13G Track A chain:

- G-A Accounts + Access: `4822f87d60ab7a467c4708b5f75bb24cb90e7738`, run `34425317912`, Chromium 4/4.
- G-B Notifications + Operations: `bc19f6e198c8cfede62e9f1b7a7eb1b0fed121cb`, run `34428052472`, Chromium 7/7 total.
- G-C1 Code Import / Export / Print: `345e0712c45e9e4c0479dc65d96efc3fb7da33cd`, run `34430915626`, Chromium 10/10 total.
- G-C2 Reports / Settings / Security / Audit: `77350523f111398e2e008280938e60a4ad87130d`, run `34529871808`, all 3 jobs SUCCESS.
- G-D + parity closure dedicated runtime: `80115ce27984a6f9098ab7e227f4b81e1f8aad39`, run `34554764124`, all 3 jobs SUCCESS, Chromium 17/17.
- Stage13G wider closure head: `dbb67a52c813aaf8b8d1af0faeacec65edde716b`; verification-only PR #30 against Stage13F `main`: **15/15 workflows SUCCESS, 0 failures**, closed unmerged.

A documentation-only closure commit may sit above the executable head. Always live-check the branch and Actions; prose-only movement does not change runtime authority.

## 6. Current sequence

```text
Stage13F VERIFIED / CLOSED / PROMOTED
→ Stage13G G-A VERIFIED
→ G-B VERIFIED
→ G-C1 VERIFIED
→ G-C2 VERIFIED
→ G-D VERIFIED
→ wider regression 15/15 SUCCESS
→ Stage13G VERIFIED / CLOSED on Track A
→ promotion to main: WAITING FOR EXPLICIT PRODUCT OWNER DIRECTION
```

Track A branch: `integration/stage13g-admin-product`.
Track B branch: `parallel/stage14-student-product`.

## 7. Open boundaries

- Stage13G is **not promoted to `main`**. Do not move `main` autonomously.
- `AI-012-019` — live provider benchmark/routes/credentials/bootstrap = `NOT YET VERIFIED`.
- Admin bundle-size warning remains deferred performance debt; it is not a Stage13G correctness blocker.
- G-C1 verifies CSV/Excel-compatible output and browser Print/Save-as-PDF; binary `.xlsx` and server-generated binary PDF are not claimed.
- Student notification product UI remains Track B/later work; G-B verified backend visibility/read authority only.
- Production deployment/cutover remains future-only unless separately approved.

## 8. Documentation maintenance

After every meaningful batch:

1. update Status + Engineering Log during work;
2. update Queue/Continuity/Handoff/Resume when continuation truth changes;
3. update specialized stage docs and Legacy Coverage when capability state changes;
4. add an EXECUTION REPORT to Issue #16;
5. record exact HEAD/run IDs;
6. never mark PASS from prose/build alone;
7. never leave continuation-critical state only in Chat.