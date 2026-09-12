# DOCUMENTATION INDEX — الوسيلة الذكية

> Official project memory map. A replacement engineering conversation starts here and must be able to continue from GitHub without prior chat memory.

Last synchronized: **2026-09-12 — UX/UI Refoundation active; normal Stage16 roadmap paused after verified `STUDENT-016H`; exact return point `STUDENT-016I`.**

## 1. Source-of-truth precedence

When sources conflict, use this precedence:

1. current `main` code + PostgreSQL migrations + executable CI/test evidence;
2. live Railway state when the question is about the hosted runtime;
3. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`;
4. active workstream authority, currently UX/UI refoundation documents listed below;
5. `PROJECT_HANDOFF.md` + `PROJECT_STATUS.md`;
6. `PROJECT_RESUME_SNAPSHOT.md`;
7. `PROJECT_ENGINEERING_LOG.md`;
8. `PROJECT_INTEGRATION_CONTINUITY.md`;
9. `PROJECT_EXECUTION_QUEUE.md`;
10. specialized deployment/content docs;
11. Roadmap + Legacy Coverage + historical workstream docs.

Anything not inspected/executed = `NOT YET VERIFIED`.

## 2. Mandatory startup order while UX/UI Refoundation is active

Read in this order:

1. `README.md`
2. `DOCUMENTATION_INDEX.md`
3. **`docs/workstreams/UNIFIED_PROJECT_RESUME_PROTOCOL.md`**
4. `PROJECT_STATUS.md`
5. `PROJECT_ENGINEERING_LOG.md`
6. **`docs/workstreams/UX_UI_REFOUNDATION_PAUSE_2026-09-12.md`**
7. **`docs/product/UX_UI_MASTER_AUDIT_2026-09-12.md`**
8. **`docs/product/TARGET_INFORMATION_ARCHITECTURE.md`**
9. **`docs/product/DESIGN_SYSTEM_SPEC.md`**
10. **`docs/product/CONTENT_LANGUAGE_RULES.md`**
11. **`docs/workstreams/UX_UI_REFOUNDATION_IMPLEMENTATION_ROADMAP.md`**
12. `.agents/skills/alwaslh-product-engineering/SKILL.md` and only the focused references needed for the task
13. `PROJECT_HANDOFF.md`
14. `PROJECT_RESUME_SNAPSHOT.md`
15. `PROJECT_INTEGRATION_CONTINUITY.md`
16. `PROJECT_EXECUTION_QUEUE.md`
17. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`
18. `docs/workstreams/STAGE16_STUDENT_HANDOFF.md`
19. `docs/workstreams/STUDENT_PRODUCT_TRACK_STATUS.md`
20. `docs/operations/RAILWAY_LIVE_STATE.md`
21. `docs/content/LIVE_CONTENT_IMPORT_STATUS.md`
22. `MASTER_REBUILD_ROADMAP.md`
23. `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md`
24. `PRODUCT_FEATURE_PARITY_MATRIX.md`
25. latest GitHub Issue #16 body/comments
26. live `main` HEAD + Actions + Railway state only where runtime evidence is relevant
27. actual Student/Admin/API code/tests for the batch before coding.

Live evidence wins if anything differs.

## 3. Current operating model

The old parallel Track A/Track B model is historical for new work.

Normal roadmap work is temporarily paused for a source-backed frontend/product refoundation because the current Student/Admin information architecture would create additional product debt if more features were built on top of it.

This pause does **not** reset backend/domain work and does **not** authorize a blind rewrite.

Current exact normal-roadmap boundary:

- `STUDENT-016H` — **DONE / VERIFIED / MERGED**;
- `STUDENT-016I` — **PAUSED / exact return point after UX/UI refoundation**;
- then `016R → 016S → conditional 016O → 016G → Stage17`.

Stage17 or later feature implementation is not allowed inside the refoundation track.

## 4. Current UX/UI refoundation authority

| File | Purpose |
|---|---|
| `docs/workstreams/UX_UI_REFOUNDATION_PAUSE_2026-09-12.md` | why normal roadmap is paused and which contracts/roadmap boundary must be preserved |
| `docs/product/UX_UI_MASTER_AUDIT_2026-09-12.md` | full Student/Admin source-backed UI inventory, evidence, severity and KEEP/IMPROVE/REFACTOR/REBUILD/REMOVE classification |
| `docs/product/TARGET_INFORMATION_ARCHITECTURE.md` | target Student navigation/screen tree and Admin work-area/page hierarchy |
| `docs/product/DESIGN_SYSTEM_SPEC.md` | preserved identity, semantic design tokens, component/state/responsive/RTL/a11y rules |
| `docs/product/CONTENT_LANGUAGE_RULES.md` | Student/Admin product-language, status/error mappings and forbidden implementation copy |
| `docs/workstreams/UX_UI_REFOUNDATION_IMPLEMENTATION_ROADMAP.md` | UX-B00..UX-B17 incremental execution order, branch/testing/closure gates |
| `.agents/skills/alwaslh-product-engineering/SKILL.md` | repository-scoped engineering/product/design operating skill; code/contracts remain higher authority |

External Product Design, Mobbin and Figma may support research/prototyping but cannot override these project sources.

## 5. Central state files

| File | Purpose |
|---|---|
| `docs/workstreams/UNIFIED_PROJECT_RESUME_PROTOCOL.md` | mandatory full product/repository recovery + gap-audit protocol |
| `PROJECT_STATUS.md` | concise current track, verified state, open gates and exact next action |
| `PROJECT_ENGINEERING_LOG.md` | architecture decisions, findings, changes, tests/evidence and remaining work |
| `PROJECT_HANDOFF.md` | detailed replacement-engineer startup and architecture/runtime context |
| `PROJECT_RESUME_SNAPSHOT.md` | compact restart snapshot |
| `PROJECT_INTEGRATION_CONTINUITY.md` | unified-main/shared-contract/deployment continuity |
| `PROJECT_EXECUTION_QUEUE.md` | normal roadmap queue; currently paused by the UX/UI workstream |
| `docs/product/CURRENT_PRODUCT_OVERRIDES.md` | latest Product Owner execution decisions |
| `docs/workstreams/STAGE16_STUDENT_HANDOFF.md` | detailed Stage16 implementation/security boundary; still relevant as a preserved contract source |
| `docs/operations/RAILWAY_LIVE_STATE.md` | Railway services/domains/build/deploy/volume/runbook |
| `docs/content/LIVE_CONTENT_IMPORT_STATUS.md` | canonical content source and publication/bulk-import rules |
| `MASTER_REBUILD_ROADMAP.md` | Stage1–29 product sequence |
| `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` | legacy capability acceptance |
| `NEXT_CONVERSATION_PROMPT.md` | launcher; must not override newer status/refoundation authority |

## 6. Current integrated baseline before the refoundation foundation PR

PR #41 integrated the repository-scoped Alwaslh product engineering skill after successful PR-head CI.

- PR #41 final head: `25f876d3cfe2af95a8a27319c289f102db3e6db0`
- merge commit: `c3ddef04933772116c3bd9cdf29eb5a973c527fd`

Always re-read live `main`; do not assume this SHA remains HEAD forever.

The active refoundation foundation work is developed on short-lived branch/PR evidence recorded in `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md` and Issue #16.

## 7. Verified stage state

- Stage1–10 + OCR — VERIFIED.
- Stage11 provider-neutral AI contracts — VERIFIED.
- Stage12 durable AI runtime — VERIFIED backend/runtime; `AI-012..AI-019` live provider readiness remains open.
- Stage13A–G — VERIFIED / CLOSED and integrated.
- Stage14 Student Product — CLOSED / VERIFIED.
- Stage15 Practice/Assessment — CLOSED / VERIFIED.
- **Stage16 Offline/PWA — OPEN / PARTIALLY VERIFIED / NORMAL ROADMAP PAUSED.**
- Stage17+ — pending Stage16 closure after UX/UI refoundation.

### Stage16 security boundary the refoundation must preserve

Current integrated work includes executable evidence for:

- safe Service Worker shell with `/v1` excluded from Cache API authority;
- profile/device-bound offline lease;
- protected Published+entitled lesson packages;
- bounded offline storage;
- server-signed P-256/ES256 authorization;
- durable non-secret active scope selection;
- read-time signature/metadata/key/scope/expiry verification;
- read-time size + SHA-256 blob integrity verification;
- logout/late-refresh lifecycle protection.

The UX track may change how this state is explained to a learner, but must not weaken these contracts.

### Stage16 still open after refoundation because

- true cold-start offline Reader is `STUDENT-016I` and remains intentionally unimplemented by the design track;
- reconnect revalidation/purge is `016R`;
- revision/tombstone/cursor/delta synchronization is `016S`;
- bounded outbox is conditional `016O` only if later offline writes require it;
- Stage16 closure matrix is `016G`.

## 8. UX/UI foundation decisions

Source-backed audit established:

- neither Student nor Admin currently has route-based product navigation;
- authenticated Student currently stacks Curriculum + Assessment + Offline Downloads + Access in one aggregate surface;
- Reader is embedded in curriculum instead of being a focused learning screen;
- Admin currently has 11 flat state-switched workspaces and multiple multi-workflow giant pages;
- Student exposes storage/crypto/offline implementation terms that should be learner-facing meanings;
- Admin exposes Stage/parity/config/cache/revision implementation language beyond normal operator need;
- existing API/security/publication/assessment/offline contracts remain valuable and should be preserved;
- `packages/brand` identity/tokens are canonical and should be extended, not replaced.

Target Student stable implemented-era destinations:

- Home
- Learn
- Practice
- Downloads
- Account access
- dedicated Reader and active Assessment screens

Do not expose future Personal Learning/Progress as finished navigation before those roadmap stages exist.

Target Admin global work areas:

- Overview
- Curriculum
- Content / Ingestion / OCR
- AI Jobs / Human Review
- Question Bank / Quizzes
- Students / Access Codes
- Operations / Notifications / Audit / constrained System Status

Dashboard remains overview/attention/shortcuts only.

## 9. Hosted runtime

Railway inspection/dev stack is documented under `docs/operations/RAILWAY_LIVE_STATE.md`.

Known public inspection surfaces historically include Student/Admin/API services plus PostgreSQL private service. Treat the document/live Railway connector evidence as authority before making runtime claims.

The Railway environment label `production` does **not** mean Stage28 final production cutover is complete.

## 10. Content state

Canonical source: `7eaur/alwaslh-go@f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`.

- full inventory: 48 documents / 5,552 images;
- bounded Grade 9 English proof: 75 source images / 75 ready media assets / 300 variants / 75 Draft lesson assets / 10 lessons;
- Student visibility remains NO until normal Admin review/publication;
- do not bulk-materialize the full inventory during UX/UI refoundation.

Read `docs/content/LIVE_CONTENT_IMPORT_STATUS.md` before content import/publication work.

## 11. Refoundation execution order

Canonical details live in `UX_UI_REFOUNDATION_IMPLEMENTATION_ROADMAP.md`.

High-level sequence:

1. `UX-B00` audit/IA/design-system/content-language/roadmap foundation.
2. `UX-B01` shared routing/shell/presentation foundation.
3. `UX-B02..B05` Student shell, learning/Reader, assessment, downloads/account/copy.
4. `UX-B06..B14` Admin shell and operational workflow families.
5. `UX-B15` legacy/copy/shared-pattern cleanup.
6. `UX-B16` responsive/RTL/accessibility closure.
7. `UX-B17` browser/visual/regression refoundation closure.
8. Resume normal roadmap at **`STUDENT-016I`** only after closure.

Each implementation batch requires applicable lint/typecheck/tests/build/browser/responsive/RTL/a11y evidence and exact SHA/PR/run IDs.

## 12. Exact first action for a replacement conversation

Do not jump to Stage16/17 work or redesign from imagination.

1. recover live `main` and PR/Issue #16 state;
2. read the current UX/UI refoundation authority in Section 4;
3. determine the first unmerged/incomplete UX-Bxx batch from `PROJECT_STATUS.md` and the refoundation roadmap;
4. inspect the actual callers/contracts/tests for that batch;
5. work on a short-lived branch from refreshed `main`;
6. update status/log/Issue #16 during the batch;
7. merge only after exact-head green evidence;
8. keep `STUDENT-016I` paused until the refoundation exit gate is closed.