# PROJECT RESUME SNAPSHOT — الوسيلة الذكية

> Latest continuation checkpoint. Code, migrations and executable CI evidence outrank prose.

Last synchronized: **2026-09-10 — Stage13F runtime verified 13/13; closure documentation checkpoint being exact-head verified before main promotion.**

## Current execution model

- Repo: `7eaur/alwaslh`.
- Issue #16 = sole cross-track execution ledger.
- Track A: Backend/Admin/AI/Question Bank/Quiz Builder → next Stage13G after promotion.
- Track B: Student Product on `parallel/stage14-student-product`.
- No duplicate durable authority between tracks.
- Production cutover remains future-only.

## Current verified runtime heads

- Stage13E: `d5ebc7f25a369430387a758c7c0bb89350963d67` — VERIFIED / CLOSED.
- Stage13F runtime: `afbe552710b3f1cf79ee70594f691fa836c05a45` — VERIFIED.
- Track B latest verified Reader runtime from its own status file: `0d0a1778b0525560ec288dbfc612bbfa0efa9a6d`; Stage14 final shell/copy/a11y closure remains active.

## Stage13F evidence

Stage-specific exact-head:

- `34420441878` — Backend/PostgreSQL SUCCESS.
- `34420441837` — Admin/PostgreSQL/real Chromium SUCCESS.

Wider runtime verification-only PR #27: **13/13 SUCCESS**, closed unmerged.

- Stage9 `34420900598`
- Stage10 `34420900550`
- OCR `34420900527`
- Stage11 `34420900592`
- Stage12 `34420900501`
- Stage13 Admin `34420900492`
- Stage13D Content `34420900547`
- Stage13D Admin `34420900488`
- Stage13E Frontend Prep `34420900522`
- Stage13E Admin AI Ops `34420900503`
- Stage13F Backend `34420900520`
- Stage13F Admin/Chromium `34420900476`
- Rebuild `34420900482`

## Stage13F product authority

```text
Stage11 typed generation
→ Stage12 durable execution
→ Stage13E human approve
→ Stage13F import Draft
→ Question Bank Review → Published
→ Quiz Builder published-revision selection
→ immutable version snapshots
→ reviewed/published export
→ Stage15 later consumes snapshots
```

Verified:

- stable Question Bank item UUID;
- immutable revisions/history/events;
- MCQ/T-F/direct + answer rules;
- manual + approved-AI authoring;
- exact source/page/checksum/OCR/content-source provenance;
- latest-approve-only import, idempotent under repetition/concurrency;
- Admin Question Bank workspace;
- Quiz Builder multiple versions/models from published revisions;
- direct-question delivery snapshots;
- stable same-item regenerate-one apply path;
- Review/Published export gate, exact version CSV + RTL print/PDF template;
- real session-expiry/responsive Chromium evidence.

## Findings

- `AI-011-005` — FIXED + VERIFIED for Question Bank/direct delivery authority.
- regeneration stable identity / standalone-import guard — FIXED + VERIFIED.
- regeneration replay ordering — FIXED + VERIFIED.
- Draft export ambiguity — FIXED + VERIFIED.
- invalid nested form / ambiguous Chromium locators — FIXED + VERIFIED.
- strict TypeScript fixture and Biome quality blockers — FIXED without rule/test weakening.
- accidental `.noop` main incident — P3 RESOLVED, exact prior tree restored, no runtime effect.
- `AI-012-019` — OPEN / `NOT YET VERIFIED` live provider benchmark/config/bootstrap.

## Legacy parity boundary

Do not claim all `QADMIN-001..033` are complete.

Stage13F executable evidence closes the Question Bank/Builder outcomes explicitly mapped in `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md`. Direct quiz-generation orchestration and specialized export variants still lacking complete user-flow evidence move to Stage13G/AI authoring.

## Exact next actions

1. exact-head verify the closure documentation commit through a verification-only PR;
2. close the PR unmerged;
3. re-check `main` has not moved from Stage13F base;
4. fast-forward `main` non-force to the verified closure commit;
5. post final Stage13F report in Issue #16;
6. Track A starts Stage13G;
7. Track B incorporates new main before Stage15.

## Mandatory startup for a replacement conversation

`README.md → DOCUMENTATION_INDEX.md → PROJECT_HANDOFF.md → PROJECT_STATUS.md → PROJECT_RESUME_SNAPSHOT.md → PROJECT_ENGINEERING_LOG.md → PROJECT_INTEGRATION_CONTINUITY.md → PROJECT_EXECUTION_QUEUE.md → docs/product/CURRENT_PRODUCT_OVERRIDES.md → Issue #16 latest body/comments → current main/branch/Actions → current-stage code/tests`.

Anything not inspected/executed remains `NOT YET VERIFIED`.