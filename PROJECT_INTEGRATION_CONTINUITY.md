# PROJECT INTEGRATION CONTINUITY — الوسيلة الذكية

> Operational continuity for any replacement engineering conversation. Current code + migrations + executable CI outrank this file.

Last synchronized: **2026-09-11 — Stage13G VERIFIED/CLOSED on Track A; NOT PROMOTED to main.**

## Resume Procedure

1. Confirm repo and exact live branch/main HEADs.
2. Read README/Index/Handoff/Status/Resume/Engineering Log/this file/Execution Queue.
3. Read current Product Overrides, Parallel Two-Track model, Legacy Coverage and latest Issue #16.
4. Read current code/tests for any new assigned stage; anything not inspected is `NOT YET VERIFIED`.
5. Distinguish executable runtime/wider-regression head from later documentation-only commits.

## Cross-Track Model

- Track A owns Backend/Admin/DB/AI and has closed Stage13G on `integration/stage13g-admin-product`.
- Track B owns Student Product Stage14+ on `parallel/stage14-student-product`.
- `main` is the only verified shared-contract handoff point.
- no duplicate Auth/Access/Notification/Question Bank/Quiz/AI authority to avoid integration.

## Stable Shared Authority

`main` remains Stage13F closure checkpoint:

`3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`

Track A Stage13G has **not** been promoted. Student or other tracks must not assume Stage13G APIs are on `main` until explicit promotion occurs.

## Track A Stage13G Closed Chain

```text
existing Auth + Access authority
→ G-A Admin accounts/access
→ G-B shared Notifications + Operations home
→ G-C1 strict code import + safe export/print
→ G-C2 safe reports/settings/security + canonical audit projection
→ G-D feature-specific Lesson/Quiz AI authoring + parity closure
→ older D/E/F navigation helpers aligned to Operations default
→ wider PR matrix 15/15 SUCCESS
→ CLOSED on Track A / NOT PROMOTED
```

### Runtime checkpoints

- G-A: `4822f87d60ab7a467c4708b5f75bb24cb90e7738`, run `34425317912`.
- G-B: `bc19f6e198c8cfede62e9f1b7a7eb1b0fed121cb`, run `34428052472`.
- G-C1: `345e0712c45e9e4c0479dc65d96efc3fb7da33cd`, run `34430915626`.
- G-C2: `77350523f111398e2e008280938e60a4ad87130d`, run `34529871808`.
- G-D/parity dedicated runtime: `80115ce27984a6f9098ab7e227f4b81e1f8aad39`, run `34554764124`, Chromium 17/17.
- final wider-regression code/workflow head: `dbb67a52c813aaf8b8d1af0faeacec65edde716b`.

Verification-only PR #30 against `main` executed **15/15 workflows SUCCESS** and was closed unmerged. `main` remained unchanged.

## Integration Rules Preserved

### Auth / Access / Notifications

G-A/G-B are projections/product layers over canonical authorities, not replacements. Student recovery/device operations remain Auth-owned; entitlements/code lifecycle remain Access-owned; Notifications use `notifications` + `notification_reads` for Admin and Student API state.

### Reports / Audit / Settings

G-C2 reads canonical authorities. Audit projects Auth, Access, Curriculum, AI review, Question Bank and Quiz Builder event tables. Runtime/security settings are safe posture only; private connection/storage/origin/provider values are not browser contracts.

### AI Authoring

G-D reuses Stage12 durable execution and Stage13E human review:

- no second queue or general AI assistant;
- sources are resolved server-side from canonical published lesson media/OCR provenance;
- selected Lesson plans and per-version Quiz plans are bounded/idempotent;
- AI approval is required before apply;
- generated questions enter Question Bank before Quiz versions and require Question Bank publication before materialization;
- version materialization is idempotent;
- published Question Bank revisions/Quiz snapshots remain delivery authority.

### Export / History

Lesson export/history is a read projection over Lessons, Question Bank events/content and AI authoring jobs; no parallel history store. Quiz specialized export works against canonical reviewed/published versions and authenticated lesson assets. Dynamic CSV output is formula-sanitized.

## Regression Compatibility

Operations is intentionally the authenticated Admin default home. Historical Stage13D/E/F browser tests now authenticate into the shell and explicitly navigate to their target workspace. Their feature assertions were not weakened.

`stage13e-integration.yml` now also triggers on Pull Requests, so its combined real-browser gate participates in repository-wide verification.

## Open Boundary

`AI-012-019` live provider bootstrap/model/routes/credentials = **NOT YET VERIFIED**. This remains independent from Stage13G fixture-backed authoring acceptance.

Admin bundle-size warning remains deferred P3 performance work; no correctness failure is attached to it.

## Promotion Rule / Next Action

Stage13G has met Track A implementation/verification closure. Promotion to `main` is a separate integration decision requiring explicit Product Owner direction. Do not merge, force-update, or rewrite history autonomously.

When promotion is requested, live-check Track B/main divergence first, preserve canonical authorities, run the required integration matrix on the actual promotion candidate, then update Issue #16.