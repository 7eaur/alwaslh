# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Engineering source of truth for architecture, findings, changes, verification and remaining work. Anything not inspected/executed = `NOT YET VERIFIED`.

Last consolidated: **2026-09-11 — Stage13G VERIFIED / CLOSED on Track A; NOT PROMOTED to main.**

## 1. Project Understanding

`الوسيلة الذكية` is an Arabic-first RTL educational product with:

- `apps/student-web` — Student Web/PWA.
- `apps/admin-web` — Super Admin operational/authoring product.
- `apps/api` — Fastify/TypeScript business/API authority.
- `database/migrations` — PostgreSQL schema/integrity authority.

Core authority chain:

- Auth/session/device/recovery is server-owned.
- Access codes/redemption/entitlements are server/PostgreSQL-owned.
- Full Access Code = exactly 6 digits; Class Access Code = exactly 7 digits.
- content/media/OCR publication lifecycle is explicit.
- Stage11 typed AI validation → Stage12 durable execution → Stage13E human review → Stage13F Question Bank/Quiz publication.
- AI review approval does not auto-publish Question Bank content.
- published Question Bank revisions and published Quiz version snapshots are immutable Student delivery authority.

Execution model: **Parallel Two-Track**.

- Track A owns API/Admin/DB/AI and has closed Stage13G.
- Track B owns Student Product Stage14+.
- `main` is verified shared-contract handoff.
- Issue #16 is the cross-track execution ledger.
- no duplicate durable authority is allowed for integration convenience.

## 2. Architecture

Verified Track A Stage13G chain:

```text
AuthService + AccessService
→ G-A bounded Admin account/access projections + maintenance UX
→ existing notifications tables + NotificationService
→ G-B Operations read model + notification product
→ G-C1 strict access-code import + canonical safe export/print
→ G-C2 safe reports/security/settings + canonical audit projection
→ Stage12 durable AI queue + Stage13E review + Stage13F Question Bank/Quiz
→ G-D bounded feature-specific Lesson/Quiz authoring orchestration
→ Stage13G parity closure + wider regression
```

Architecture classification:

- AuthService: **KEEP + IMPROVE through bounded Admin product**.
- AccessService: **KEEP + IMPROVE**.
- Notification durable schema: **KEEP**; service/product layer **REBUILD bounded shared layer**.
- Operations dashboard: **REBUILD read model; no analytics persistence**.
- G-C1 import/export: **REBUILD bounded operations over canonical Access authority**.
- G-C2 audit/settings/security: **IMPROVE existing authorities; no generic replacement store**.
- Stage12 AI execution + Stage13E review: **KEEP as canonical lifecycle**.
- G-D authoring: **REBUILD product orchestration over existing AI/Question Bank/Quiz authorities**, not a second queue.
- Lesson/Quiz history/export: **REBUILD read projection/presentation over canonical data**, not durable duplicate history.

## 3. User Flows

### G-A Accounts / Access — VERIFIED

1. Admin signs in through canonical Auth session.
2. Admin opens Students & Access.
3. Search/filter/page Student accounts; inspect entitlement/device/redemption/Auth/Access state.
4. Issue one-time temporary password through Auth authority when recovery is required.
5. Allow device rebind through Auth authority.
6. Revoke entitlement through Access authority.
7. Search/filter/page Full/Class codes, generate codes, and non-destructively revoke unused codes.

### G-B Notifications / Operations — VERIFIED

1. Admin lands on real Operations home.
2. Dashboard reads canonical curriculum/account/access/notification counts.
3. Admin inspects latest Auth/Access activity.
4. Admin creates/lists/searches/pages/deletes validated notifications.
5. Student API resolves global/direct/entitled-class visibility and read state from the same durable store.

### G-C1 Import / Export / Print — VERIFIED

1. Admin opens Files/Reports.
2. Download strict CSV import template.
3. Upload Full Access CSV; API normalizes Arabic digits, validates exact six-digit format and reports invalid/duplicate rows.
4. Accepted rows persist through existing Access authority and emit audit evidence.
5. Export bounded canonical Full/Class inventory with explicit all/filter/used/selected scope.
6. CSV is UTF-8 BOM/Excel-compatible and formula-leading cells are sanitized.
7. RTL printable cards support browser Print/Save-as-PDF.

### G-C2 Governance — VERIFIED

1. Admin opens Governance/Security workspace.
2. Read safe Content/OCR/AI/Question Bank/Quiz status aggregates.
3. Inspect non-secret runtime posture and security aggregate counts.
4. Filter/page canonical audit across Auth, Access, Curriculum, AI Review, Question Bank and Quiz Builder.
5. Secret configuration, provider information, private storage paths and review payloads stay server-private.

### G-D Lesson AI Authoring — VERIFIED

1. Admin chooses 1–32 canonical lessons with published AI-ready sources.
2. Select summary, question, comprehensive, exact extraction or replica generation mode and typed target/count settings where applicable.
3. Backend resolves source/OCR provenance and creates idempotent Stage12 job units; browser does not fabricate checksums/source evidence.
4. Stage13E review remains the approval gate.
5. Approved summaries apply idempotently to Lessons; approved generated questions enter canonical Question Bank.
6. Summary can be manually edited/cleared; actual summary changes advance `content_revision`, replay/same value does not.
7. Admin can export selected Lesson content plus filtered history from existing Curriculum/Question Bank/AI authorities.

### G-D Quiz AI Authoring — VERIFIED

1. Admin edits Draft Quiz metadata and selects canonical lesson scope.
2. Configure 1–20 generated versions, each with its own lesson/source scope, label, shuffle option and typed question settings.
3. One durable Stage12 plan contains one unit per requested version.
4. AI output requires human approval.
5. Approved questions are imported into Question Bank; Quiz materialization waits until those revisions are Published.
6. `addVersionOnce` prevents replay from creating duplicate versions.
7. Admin can regenerate one published Question Bank question from its preserved provenance.
8. Quiz/question archive uses non-destructive audited semantics.
9. Reviewed/published versions can be exported/printed by selected scope and specialized presentation variant.

## 4. Audit Findings

| ID | Severity | Area | Problem | Evidence / Impact | Solution | Status |
|---|---:|---|---|---|---|---|
| `DOC-013G-001` | P2 | Documentation | startup docs reflected superseded stage state | replacement engineer could resume wrong work | synchronize two-track/current-stage docs | RESOLVED |
| `ADMIN-013G-ACCESS-002` | P1 | Access | Admin inventory/maintenance product absent | legacy/Admin parity incomplete | bounded Admin read/ops over Access authority | FIXED + VERIFIED |
| `ADMIN-013G-ACCOUNT-003` | P1 | Auth/Admin | recovery/device authority lacked canonical Student workspace | fragmented account ops | Admin projection + existing Auth mutations | FIXED + VERIFIED |
| `ADMIN-013G-RECOVERY-004` | P1 | UX | temp password cleared by same-account refresh | recovery result disappeared | clear only when selected account changes | FIXED + VERIFIED |
| `TEST-013G-005` | P3 | E2E | session-expiry test did not make protected request | false-negative risk | trigger real protected request | RESOLVED |
| `ADMIN-013G-NOTIF-006` | P1 | Notifications | durable schema lacked complete shared product/service | notification parity missing | one NotificationService over existing tables | FIXED + VERIFIED |
| `ADMIN-013G-DASH-007` | P1 | Dashboard | no real operational home | weak Admin hierarchy | live canonical Operations read model | FIXED + VERIFIED |
| `TEST-013G-008` | P2 | Integration | exact metrics assumed empty shared DB | order-coupled tests | baseline/delta assertions | RESOLVED |
| `ADMIN-013G-CODEIO-009` | P1 | Import/Export | code import/export/print parity missing | operational gap | strict import + safe CSV + RTL print | FIXED + VERIFIED |
| `SEC-013G-CSV-010` | P2 | Export Security | formula-leading CSV cells could execute in spreadsheet | unsafe export | spreadsheet formula sanitization | FIXED + VERIFIED |
| `UX-013G-SCOPE-011` | P2 | Export UX | no explicit selected-code scope initially | selection parity gap | selected export/print semantics | FIXED + VERIFIED |
| `ADMIN-013G-GOV-012` | P1 | Governance | reports/settings/security/audit product gap | Stage13G incomplete | safe read projections over canonical state | FIXED + VERIFIED |
| `ADMIN-013G-AUDIT-013` | P2 | Audit | initial audit union omitted `curriculum_events` | curriculum mutation visibility incomplete | include canonical Curriculum authority; no metadata leak | FIXED + VERIFIED |
| `TEST-013G-014` | P3 | E2E | audit-source locator matched hidden option | browser false failure | visible badge selector | RESOLVED |
| `ADMIN-013G-AUTHORING-015` | P1 | AI Authoring | Lesson/Quiz generation triggers/settings/bulk/version parity absent | legacy authoring outcomes incomplete | bounded orchestration over Stage12/13E/13F | FIXED + VERIFIED |
| `CONSISTENCY-013G-016` | P2 | Curriculum | manual summary mutation did not consistently advance `content_revision` like AI apply | downstream change tracking could diverge | migration `0025_lesson_summary_content_revision.sql` + regression | FIXED + VERIFIED |
| `TEST-013G-017` | P2 | Regression | older D/E/F browser helpers assumed Curriculum was login landing page | intentional Operations home caused stale-test failures | explicit target-workspace navigation; feature assertions unchanged | RESOLVED |
| `CI-013G-018` | P2 | CI | Stage13E combined browser gate did not run on PR closure matrix | wider regression could miss AI Operations | add `pull_request` trigger without changing assertions | FIXED + VERIFIED |
| `PERF-013G-BUNDLE-019` | P3 | Admin Frontend | Vite warns main Admin JS chunk >500 kB | future load/perf risk; no correctness failure | measure/code-split during performance stage if evidence warrants | OPEN / DEFERRED |
| `AI-012-019` | P2 | Live AI | provider/model/routes/credentials/bootstrap not proven live | production generation readiness unknown | later authorized live runtime evidence | OPEN / NOT YET VERIFIED |

## 5. Architecture Decisions

### AD-13G-01 — Preserve mutation authorities

Admin product never becomes a second Auth/Access authority. Recovery/device remains Auth-owned; entitlement/code lifecycle remains Access-owned.

### AD-13G-02 — One Notification store

Reuse `notifications` + `notification_reads` for Admin and Student API behavior.

### AD-13G-03 — Operations is a read model

Metrics/activity derive from canonical data; no analytics persistence introduced.

### AD-13G-04 — Bounded partial-aware code import

Malformed/duplicate rows are explicit; accepted rows may persist without silently coercing bad rows.

### AD-13G-05 — CSV is the verified spreadsheet contract

UTF-8 BOM CSV with proper escaping and formula sanitization is the verified Excel-compatible path. No binary `.xlsx` claim.

### AD-13G-06 — Browser-native print/PDF

RTL print + browser Save-as-PDF is the verified PDF outcome for current Admin exports. No server-generated binary PDF claim.

### AD-13G-07 — Governance reuses canonical event/config authorities

G-C2 projects existing Auth/Access/Curriculum/AI Review/Question Bank/Quiz events and typed config/runtime-control state. No generic audit/settings database was added.

### AD-13G-08 — Feature-specific AI authoring reuses Stage12

G-D uses `AiExecutionRepository.createPlan`; no new queue/provider lifecycle/general AI sidekick. Source/provenance is server-resolved.

### AD-13G-09 — Human review + Question Bank publication remain mandatory

AI approval is required before apply. Generated Quiz questions are imported to Question Bank and must be Published before Quiz version materialization.

### AD-13G-10 — Idempotency at orchestration/materialization boundaries

Client request identifiers + plan fingerprints converge repeated authoring requests; Quiz `addVersionOnce` converges approved-output replay.

### AD-13G-11 — Delete parity uses explicit non-destructive archive where safer

Question/Quiz destructive legacy delete outcomes are preserved as clear archive semantics with audit; published delivery history is not silently hard-deleted.

### AD-13G-12 — Lesson/Quiz export history stays a projection

Export/history reads canonical current state/events/jobs. No new durable export-history authority was introduced.

### AD-13G-13 — Summary revisions are content revisions

A real summary change advances `lessons.content_revision`; writing the same value is idempotent. Migration 0025 enforces consistency across manual/AI paths without double increment.

## 6. Changes Made

### G-A

- migration `0023_admin_access_operations.sql`;
- Admin code inventory/filter/sort/page/generation;
- unused-code revoke + durable audit;
- Student list/detail projection with entitlement/device/redemption/Auth/Access state;
- recovery/device/entitlement actions through existing authorities.

### G-B

- `NotificationService` and HTTP contracts over existing notification tables;
- Admin notification product + Student feed/read API;
- Operations dashboard live metrics and activity;
- responsive/session/error/empty states.

### G-C1

- bounded Full Access CSV import and template;
- Arabic-digit/exact-format validation and row-level results;
- canonical Full/Class CSV export with consistency guard + formula safety;
- selected/filter/used scope and RTL printable cards.

### G-C2

- Governance overview with Content/OCR/AI/Question Bank/Quiz reports;
- non-secret settings/security posture;
- bounded six-source canonical audit projection;
- Admin governance UI/filter/session/mobile coverage.

### G-D

Backend:

- `apps/api/src/ai/admin-authoring.ts` + HTTP routes;
- `apps/api/src/quiz-builder/specialized-export.ts` + HTTP routes;
- `apps/api/src/curriculum/lesson-authoring-export.ts` + HTTP routes;
- `QuizBuilderService.addVersionOnce` and audited archive path;
- migration `0024_stage13g_admin_ai_authoring.sql`;
- migration `0025_lesson_summary_content_revision.sql`;
- integration tests for authoring, Quiz application and Lesson parity/security.

Admin:

- `AdminAiAuthoringWorkspace`;
- `LessonAuthoringParityPanel`;
- `QuizMetadataPanel`;
- authoring/parity API clients, styles and shell integration;
- real E2E for generation/export/session/mobile and parity closure.

Regression/CI:

- historical Stage13D/E/F E2E helpers explicitly navigate from Operations home;
- Stage13E Combined workflow enabled on `pull_request`;
- verification-only PR #30 executed repository-wide matrix and was closed unmerged.

## 7. Tests & Verification

### Dedicated Stage13G closure

Runtime HEAD: **`80115ce27984a6f9098ab7e227f4b81e1f8aad39`**.
Workflow: **`34554764124`** — all three Stage13G jobs SUCCESS.

Backend:

- lint: SUCCESS;
- strict typecheck: SUCCESS;
- API unit/build: SUCCESS;
- clean migrations through **0025**: SUCCESS;
- Stage13G G-A, G-B, G-C2 integrations: SUCCESS;
- G-D authoring + Quiz application + Lesson parity integrations: SUCCESS;
- Access/Auth regressions: SUCCESS.

Admin:

- lint/typecheck/build: SUCCESS;
- **63/63 unit tests**: SUCCESS.

Real browser:

- clean PostgreSQL + real API + deterministic canonical fixture: SUCCESS;
- **17/17 Chromium tests passed**;
- includes authoring, specialized export, governance, operations, lesson parity, reports, student/access, real session-expiry and 390px responsive paths.

### Wider closure regression

Final code/workflow head: **`dbb67a52c813aaf8b8d1af0faeacec65edde716b`**.
Verification-only PR: **#30**, base `main@3aeca598...`, closed unmerged.

Result: **15/15 workflows SUCCESS, 0 failures**:

- Rebuild Stage Verification;
- Stage9 Content Import;
- Stage10 Media Pipeline;
- OCR Foundation;
- Stage11 AI Contract;
- Stage12 AI Execution;
- Stage13 Admin Product;
- Stage13D Content Ingestion;
- Stage13D Admin Upload UI;
- Stage13E Frontend Preparation;
- Stage13E Admin AI Operations;
- Stage13E Combined Integration;
- Stage13F Question Bank;
- Stage13F Admin Question Bank;
- Stage13G Admin Operations.

`main` remained unchanged because PR #30 was verification-only.

## 8. Known Issues / Non-Claims

- `AI-012-019`: live provider/model/routes/credentials/bootstrap remains `NOT YET VERIFIED`.
- Admin production bundle emits a >500 kB Vite warning; wider PR build measured ~842 kB minified / ~174 kB gzip for the combined Admin JS chunk. Functional build passes; treat as P3 measured performance debt.
- binary `.xlsx` generation/import is not the verified contract; CSV is.
- server-generated binary PDF is not verified; browser Print/Save-as-PDF is.
- Student notification UI/sync is later Student work.
- Stage13G has not been promoted to `main`.

## 9. Remaining Work

No remaining Stage13G implementation blocker exists on Track A.

### Immediate process boundary

**WAITING FOR EXPLICIT PRODUCT OWNER DIRECTION** for Stage13G promotion/integration to `main` or a new Track A scope. Never move `main` autonomously.

### Separate runtime boundary

`AI-012-019` requires authorized live provider/model/routes/credentials/bootstrap evidence and is not closed by fixture-backed Stage13G authoring tests.