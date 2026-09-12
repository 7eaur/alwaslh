# Full Product and Architecture Audit — 2026-09-12

## Evidence boundary and recovery

Baseline: **`3eb6b18ac5f403cb10463864c3c4b9e86f68b249`**, recovered from live `main` and rechecked through GitHub during this audit. Audit branch: `audit/full-product-architecture-20260912`. This is an audit-first workstream, not the owner of UX implementation or Legacy Content import. The unfinished local STUDENT-016I experiment is excluded. No application, migration, access, publication or production data changes are made by this documentation batch.

Authority: executable repository code, PostgreSQL migrations, tests/Actions, verified runtime, then current documentation. Historical design documents describe intent; they do not override deployed behavior. The installed `alwaslh-product-engineering` skill and its project/security guardrails were read and applied. The user's audit-first instruction takes precedence over normal queue continuation.

Recovery found UX PR **#47**, `ux/student-practice`, head observed **`6bef406fdc00f0c3e127e6d5b418b18a8561b28e`**, still open at recheck. Its declared scope is Student Practice/Assessment presentation, without assessment API changes. Historical open PRs #2, #3, #4, #6, #7, #8, #9, #10, #11 and #12 are not alternate live baselines. Content PR #48 is merged; API deployment uses its merge **`d113dc02212884b93fa0cd2ac8f75aae6bdb7258`**. The later main sentinel cleanup does not imply an application redeploy is required.

Read recovery includes README, documentation index, status, engineering log, queue, resume protocol, next-conversation prompt, current overrides, handoff/continuity/roadmap references, the UX pause and the five requested UX/product documents. The historical parity matrix and all Issue #16 historical comments were not exhaustively reread: **NOT YET VERIFIED** as an exhaustive history audit. Existing stage completion claims were treated as historical evidence, not newly executed acceptance.

### Verification vocabulary

- **EXECUTED**: a command or actual module ran in this audit, with its result recorded below.
- **SOURCE CONFIRMED**: the identified implementation and relevant callers/contracts were inspected; this does not certify production behavior.
- **RUNTIME METADATA VERIFIED**: Railway deployment metadata was read; this does not certify user journeys or database contents.
- **NOT YET VERIFIED**: no explicit execution/inspection supports the stronger claim. An inventory/search match is not exhaustive semantic review.

The accompanying [inventory](FULL_PRODUCT_ARCHITECTURE_INVENTORY_2026-09-12.md) covers every current Admin TSX surface, API route declarations, migration entity definitions and executable test/workflow files. It distinguishes lexical inventory from human review. Reproductions are in `docs/audits/evidence/`. Source links and line references are anchored to the baseline, not to an assumed future main.

## 1. Executive Product Assessment

**Decision: C — specific presentation/workflow areas need partial rebuild; the backend/domain foundation should be retained with targeted refactors.** The narrower backend assessment is B. There is no evidence supporting a whole-system rewrite or a move to microservices.

Alwaslh is a controlled educational-content product: administrators prepare and verify material, students receive authorized lessons and practice against reviewed questions, and the server owns access and assessment results. Much of the difficult correctness work is already represented: provenance, separate review/publication states, transactional redemption, device-bound sessions, immutable quiz snapshots, persistent shuffle order and signed offline authorization.

The product is not launch-complete. Several implemented capabilities remain disconnected from a complete operator/student journey. In particular, production AI/OCR composition is missing in the inspected runtime, imported lesson assets do not enter the existing task-bound publication command, and completed offline downloads are not yet a cold-start Reader journey. These are not problems CSS can solve.

Two concrete priority findings are the shared-subject navigation collision (FPA-001) and abandoned assessment content bypassing the access recheck (FPA-002). Neither justifies stopping all UX work. Route owners should incorporate FPA-001; FPA-002 can be repaired independently in the backend with real PostgreSQL regression coverage.

## 2. Original Product Model

The learning value is trusted, organized Arabic educational material with reading, summaries, questions, practice and assessment. Access is activated and time/scoped; the client is not allowed to decide which protected content it owns. Offline is an authorized reading mode with integrity constraints, not an alternative authentication system.

The real actor model has `profiles.role` values `student` and `admin`. There is no implemented teacher/editor/reviewer role hierarchy and no separate authoritative `students` table. “Super Admin” describes the operational product role; it does not imply an additional database role value. Adding multiple approval roles without a product requirement would be overengineering.

Student intent: activate an account, return securely from the registered device, recover through the supported administrator process, obtain class/all-content access, locate a lesson, read approved material, practice, take a test, understand a result, and use downloaded lessons within the offline authorization window.

Admin intent: organize offerings and lessons; ingest or import sources; check media and extracted text; request AI assistance; review output; curate questions; assemble/review/publish quizzes; issue and manage access; support student recovery; inspect actionable operations/audit evidence. Administrator tasks are broader than CRUD but do not require ordinary screens to expose storage internals.

## 3. Current Architecture

Three applications: Fastify API, React/Vite Student Web/PWA, React/Vite Admin Web. PostgreSQL is the durable domain authority. The API is a modular monolith with feature services and parameterized SQL behind a small transaction/query interface. Media has a filesystem storage adapter and deterministic processing components. Shared packages contain brand, domain/validation and presentation primitives.

The architecture already has use-case commands: activation, redeem, process/link/review/publish, apply reviewed AI output, submit/reject/publish a question or quiz, start/answer/finalize an assessment. It is inaccurate to classify the whole backend as a table browser. Curriculum editing is legitimately closer to CRUD. The actual mismatch is that some commands are tied to one ingestion mechanism while product entities can arrive through several mechanisms.

Keep the deployment shape until measured capacity requires otherwise. Worker composition can be a supervised process using the same service modules and database; it does not require a new distributed architecture.

## 4. Student Journey

| Step | Actual authority/behavior | Assessment |
| --- | --- | --- |
| First activation | Full-code verification, activation ticket/device challenge, password and device proof, transactional account/access creation | KEEP; production journey not rerun here |
| Return | Identifier/password starts challenge; device signs completion; HttpOnly session | KEEP; password-only Admin login intentionally excludes students |
| Recovery | Administrator temporary password and device rebind commands | KEEP; support communication quality needs product testing |
| Home / Learn | New routed shell and entitlement-filtered curriculum | IMPROVE: offering identity must include class |
| Subject / lesson | Sections and unsectioned lessons; globally identified lesson Reader | FPA-001; back link also needs class context |
| Read | Protected image delivery; approved text/summary; search and optional browser speech | KEEP capabilities; request lifetime needs refactor |
| Practice / test | Published snapshots, server session, saved answers, practice feedback vs deferred test feedback | KEEP contracts; PR #47 owns presentation |
| Results | Server finalization and stored attempt history | KEEP; completed-history policy must be distinct from abandoned content |
| Downloads | Signed manifest and verified byte materialization foundation | Cold-start learner Reader still missing, not complete |
| Account / offline states | Recovery/access/session behavior exists; presentation is under refoundation | B05 ownership; no audit-side UI rewrite |

The current Reader handles loading, error, unavailable media, search-empty, offline and reconnect. It is not valid to repeat the old audit claim that no routed Reader exists. Conversely, image visibility and no horizontal overflow do not prove pedagogical usability or all RTL/a11y behavior.

## 5. Admin Journey

The current shell exposes eleven locally selected workspaces. BrowserRouter is installed, but `App.tsx` still uses `setWorkspace` as destination authority. The route foundation must not be mistaken for a completed Admin navigation migration.

| Current area | Operator job | Disposition |
| --- | --- | --- |
| Operations | Understand actionable health/activity and manage notifications | IMPROVE; separate notification composition from overview |
| Governance | Inspect safe configuration/security projections and audit feed | KEEP diagnostics in a dedicated area; translate event summaries |
| Curriculum | Manage classes, reusable subjects, offerings, sections and lessons | REBUILD composition into list/detail/contextual actions; preserve domain/API |
| Content ingestion | Ordered upload, process, link, submit/reject/publish, archive/history | REFACTOR orchestration; add source review, preserve ordered ingest |
| Media/OCR | Find source documents/assets and correct extraction text | REBUILD review surface around actual source preview |
| AI operations | Inspect jobs/units/attempts; review canonical output and resolve conflicts | KEEP useful controller/view-model separation; simplify normal review |
| AI authoring | Request lesson/quiz generation and apply approved outputs | REBUILD task composition; replace manual technical-ID handoffs |
| Question Bank | Create/import, edit revision, review, publish, regenerate/archive | KEEP lifecycle; separate list/editor/review responsibilities |
| Quiz Builder | Scope quiz, select revisions, create models, review/publish/export | KEEP model; REFACTOR 1,135-line workspace into task screens |
| Student access | Search students, inspect access, recover/rebind/revoke, issue codes | REFACTOR student-support and code-batch flows |
| Files/reports | Import code files, selected exports/cards/print | IMPROVE contextual placement under access; do not remove selection semantics |

No ordinary navigation destination is needed for each create/edit/review operation. Prefer work area → destination, with those operations inside the owning flow. Operations and Audit are legitimate locations for technical evidence; this is not a reason to expose it everywhere.

## 6. Backend

Transactions and database constraints are used for important mutations. Assessment answer/finalization, entitlement redemption, question publication and ingestion publication have use-case services. SQL within these services is not by itself poor architecture; replacing it with generic repositories would add indirection without fixing the observed defects.

Targeted changes: make publication operate on lesson/assets independent of import source; wire production workers; make content-delivery access policy explicit for every assessment state; retire temporary startup import orchestration. Preserve canonical server checks when splitting Admin pages. Cross-route authorization helper duplication is a small maintainability issue, not evidence of an authorization bypass.

## 7. Frontend

API adapters already provide boundaries and centralized request handling in several features. AI Operations has explicit view models and request sequence refs; reuse this semantic pattern for other asynchronous detail screens. Avoid a generic form/workspace framework.

Admin giant files are a responsibility problem, not merely a line-count problem: Curriculum has seven forms, Quiz Builder mixes metadata/model/candidates/review/export, and student support is mixed with code creation/revocation. The partial rebuild should replace page composition while retaining validated adapters and domain commands.

Student B02/B03 route work is real progress. PR #47's proposed Practice composition is in-flight and **NOT YET VERIFIED** here as merged/current implementation. Reader requests currently lack cancellation/sequence protection across changed lesson IDs (FPA-007).

## 8. Database / Domain Model

All 27 migration files through `0026_legacy_supabase_import_support.sql` were inspected across recovery and this audit; two distinct `0023_*` filenames exist. The migrator keys by filename, so duplicate numeric prefixes are not automatically a collision.

| Domain entities | Purpose / owner / lifecycle | Decision |
| --- | --- | --- |
| profiles, auth_credentials, auth_sessions, login guards/events | Account identity, one-way credential, hashed session, abuse guard/audit; Auth owns | KEEP |
| student_devices, auth_device_challenges, activation tickets | Device proof and short-lived enrollment/login capability | KEEP; not a second student identity |
| full_access_codes, class_access_codes, student_entitlements, access_redemptions/events | Issuance → activation/redemption → finite/scoped grant → expiration/revocation | KEEP; codes are inputs, entitlement is effective access |
| classes, subjects, subject_class_links | Reusable subject plus class offering with composite identity | KEEP; fix frontend mapping, not schema |
| curriculum_sections, lessons, lesson_assets, curriculum_events | Optional grouping, lesson, ordered delivery material, publication/audit | KEEP; source-independent publication command needed |
| content_import_runs, content_source_documents/assets | Immutable source/provenance and reconciliation; import owner | KEEP; Supabase content is a source, not runtime Auth/DB authority |
| content_ingestion_tasks/items/media | Ordered user-upload execution and replay/link history | KEEP; not the universal publication aggregate |
| media_assets/variants | Processing identity plus source/display/thumbnail/AI bytes | KEEP; ready is not published |
| ocr_extractions | Extracted raw/normalized text, trust/review and provider provenance | KEEP; wire execution and source comparison |
| ai_jobs, units, attempts, outputs, review_events, runtime/route control | Durable plan/execution/capacity/retry plus human decisions | KEEP; execution and review statuses are different concepts |
| question_bank_items/revisions/lessons/sources/imports/events | Stable editorial identity, reviewed versions, provenance | KEEP |
| quizzes, quiz_lessons, versions, questions/options, builder_events | Assessment definition and copied immutable deliverable snapshots | KEEP; copies preserve history, not accidental duplicate truth |
| practice_sessions/questions/options/answers, quiz_attempts | Stable presentation order, resumable answers, server result | KEEP; fix abandoned-state read policy |
| notifications/reads | Targeted/global notice and individual read receipt | KEEP; student response minimization deserves review |
| saved_questions, achievement definitions/student achievements | Schema foundations without matching runtime service consumers found | DEFER; not delivered features; do not drop applied tables blindly |
| content_revisions/tombstones/sync_checkpoints | Future reconnect/delta foundations | DEFER runtime claims; offline reconnect not implemented by table existence |
| auth_password_reset_tokens | Historical recovery schema; current operations still counts it | REFACTOR obsolete projection after current temporary-password contract check |

Duplicated status is acceptable when it represents different lifecycles: ready media, approved OCR, approved AI, published question revision and published lesson are not interchangeable. The DB runner's commit/ledger atomicity is a separate reliability defect (FPA-005).

## 9. API Contracts

Student APIs generally return protected projections rather than raw storage keys. Reader bytes use authenticated endpoints, private/no-store and nosniff. Quiz answer keys are withheld until the relevant practice answer or completed result. Ownership is server-side.

Some projections remain broader than learner needs: `StudentAssessmentQuestionView` includes Question Bank item/revision IDs, and `NotificationRecord` is shared by Admin and Student with creator/target metadata. This is a minimization/refactor candidate, not proof of credential leakage. Retain opaque action IDs where needed; omit unnecessary provenance from learner-facing responses after consumer tests.

The API route inventory includes actual commands for review/publication, support and assessment. No generic admin lesson-asset publication endpoint or OCR execution entry was found. A specialized quiz export asset endpoint is not a general source-review API.

## 10. Content

Two distinct inputs now exist: canonical repository-source import and explicit legacy content import, alongside Admin ingestion. All should converge on the same protected educational lifecycle. The new importer intentionally inserts draft lessons/assets/questions. That draft fence is correct.

However, `legacy-supabase-importer.ts` inserts lesson assets without `ingestion_task_id`, whereas `transitionPublication` queries and updates by that ID. Existing curriculum patch schemas do not provide a general alternative. Therefore successful import does not establish a complete supported publish-to-student journey (FPA-004).

Do not manufacture ingestion history or publish rows with ad-hoc SQL to bypass this mismatch. Introduce a reviewed, source-independent lesson/asset publication use case and have ingestion delegate to it. Validate future publication time, active offering/lesson, media readiness, expected revision and event provenance.

## 11. Media/OCR

The image/PDF pipeline has safe storage keys, deterministic variants, bounded processing concurrency and retry concepts. Preserve it. Processing readiness is correctly separated from publication. OCR has a Tesseract provider, extraction service and review states, but its runtime composition is missing outside tests in the inspected application.

Admin `ContentOperationsWorkspace` allows raw-text/corrected-text review but renders no source image. The existing browser test titled “reviews source media” verifies variant counts/status and OCR text, not a visible original page. Human source comparison is a missing capability, not just a visual improvement.

PDF limits exist, but extraction reads all rendered pages before downstream concurrency limiting. Memory amplification is a source-confirmed capacity risk; an actual OOM/latency threshold is **NOT YET VERIFIED** (FPA-009).

## 12. AI / Human Review

Durable job execution, retry/capacity, attempts and canonical review events are substantial foundations. `approvedOutput` requires the latest approval event and validates edited output. Applying generated questions enters the editorial question pipeline. AI itself has no general publication endpoint.

`AiWorkerRuntime`, router/execution components and OCR extraction are instantiated in tests, but no production worker entry/configuration/provider adapter wiring was found in the runtime entrypoints/package scripts. A queue accepting a job and a UI displaying it do not prove an operational AI feature (FPA-003).

Approval/apply concurrency and atomicity across summary-plus-question application deserve additional fault/race tests: **NOT YET VERIFIED** as a production guarantee. Do not replace canonical review with frontend approval flags.

## 13. Questions / Quizzes

Question editorial identity is correctly separated from revisions, answer trust and published quiz snapshots. Manual creation, approved AI import, edit, submit-review, reject and publish are real commands. Quiz candidates are scoped, reviewed revisions are copied, and existing published snapshots should survive later editorial changes.

Keep model selection/shuffle options where they represent actual product behavior. Replace implementation terms with learner/admin language; do not remove supported quiz versions merely because the database calls them versions. Quiz detail uses batched reads, so a blanket N+1 finding would be false.

## 14. Assessment

Server-owned session question/option order supports exact resume. Answer validation binds to presented questions/options; scoring is server-side and finalization is idempotent. Practice and Test reveal feedback at different times. These are correct architectural choices.

FPA-002: `sessionView` rechecks quiz/access only for `in_progress`, while `abandon` changes an owned session to `abandoned` without an access check. The abandoned read then returns its questions. An actual service execution with a query double reproduced the omitted recheck; real PostgreSQL integration of this exact scenario is **NOT YET VERIFIED** in the initial audit batch. Ownership is still checked, so this is not a cross-student read finding.

Completed results are an intentional historical use case and must be tested separately before changing access behavior. Recommended minimal fix: require current access for every non-completed session read; allow cancellation to remain available without granting content access.

## 15. Access / Auth

Keep the device-bound challenge model, opaque HttpOnly sessions, scrypt credentials, exact production Origin enforcement and server role checks. Activation/redemption use transactions and replay controls. Full/class scope and finite renewal/no-waste behavior are business rules, not incidental schema complexity.

Security review did not find a basis to replace this system with direct browser database access. Live credential/device/recovery testing was not performed during this audit. Existing tests are valuable but do not prove all current production configuration, sessions or grants are correct.

## 16. Offline

STUDENT-016H exists in current main: signed authorization, byte-size/hash verification and scoped materialization/read foundations. Earlier verified PR #38 head was `407d9992c91d95081147fc104e13b69addef5eb8`; merge `a6f220c74e46852a8b2e6667271acc41b3fb8c79`. Stage16 run **34699149842**, Stage14 **34699149836**, Stage15 **34699149956**, Rebuild **34699149779** are historical exact-head evidence, not fresh evidence for this audit baseline.

Cold-start Reader integration remains STUDENT-016I; reconnect/delta remains later work. The PWA shell installing offline is not proof that a learner can cold-start and read a protected downloaded lesson. Service Worker caches must not become `/v1` authority. Retain signature, expiry, account/device binding, clock rollback and integrity checks when replacing Downloads UI.

## 17. UX / IA

The new IA is a working hypothesis, not sacred. It correctly moves toward meaningful Student destinations and task-focused Admin areas. Its subject-only route loses the actual composite offering identity. An imagined `offeringId` should not silently become a new DB entity just to satisfy a route diagram.

Student navigation should preserve class context into subject and back from Reader. Admin should expose at most work area → primary destination as normal navigation; editor/review/create belong to the task flow. The useful Dashboard answers what needs action, not how many technical tables exist.

Keep native task distinctions: curriculum structure, source/content review, question curation, quiz assembly, student support and operations. Merge repeated controls only when their semantics and permissions match. Full visual design, keyboard/a11y and real-user evaluation of every current surface: **NOT YET VERIFIED**.

## 18. Data Presentation

| Data / surface | Category | Product treatment |
| --- | --- | --- |
| Student name, access scope/expiry, material title, readiness, actionable failure | MUST SHOW | Clear Arabic label and next action |
| Class/subject/lesson context and source page in review | MUST SHOW | Preserve hierarchy and source comparison |
| Question answer trust, editorial review state, quiz model choice | MUST SHOW / TRANSFORM | Human terms; preserve actual decisions |
| Counts/progress/retryable failure | TRANSFORM | “Processed 12 of 20 pages”; useful retry scope |
| Raw enum/event names | TRANSFORM | Maintain explicit mapping with safe fallback |
| IDs needed to support a case or trace a job | CONTEXTUAL | Copyable reference in Operations/detail |
| UUID entry to apply an AI output | REMOVE from normal interaction | Select the reviewed output in context; retain server ID internally |
| Hashes, storage keys, source paths, provider IDs | HIDE in routine screens | Diagnostic detail where justified |
| DB pool/SSL, cookie configuration, stage/parity labels | CONTEXTUAL or REMOVE | Governance technical detail only; remove stage labels from product |
| Raw AI JSON | HIDE by default | Structured editable review; diagnostic/raw view contextual |
| Student Question Bank revision and creator metadata | REMOVE where unused | Narrow response/view model after consumer verification |

Hiding fields is not authorization. Exported access codes are intentionally sensitive operational outputs; preserve explicit selection and server authorization rather than masking a necessary administrator capability.

## 19. Security

SOURCE CONFIRMED protections: role checks in route handlers, production Origin guard on unsafe `/v1` methods, ownership checks for sessions, protected reader bytes, source-path normalization, server scoring, device-bound login and signed offline materialization. These are separate boundaries and should stay separate.

Immediate policy repair: FPA-002. Additional verification gates: student/admin matrix for all route families, abandoned/revoked and publication-changed sessions, actual production cookie/proxy configuration, backup/restore isolation, approved-output concurrent apply/review. These broader production guarantees are **NOT YET VERIFIED**. No P0 or whole-system compromise is claimed from the inspected evidence.

## 20. Performance

Measured local production output at baseline: Student JS **263.32 kB / 80.55 kB gzip**, CSS **51.47 / 8.68 kB gzip**; Admin JS **416.18 / 112.05 kB gzip**, CSS **85.76 / 12.89 kB gzip**. These are build sizes, not user-perceived latency measurements and not evidence that a rewrite is needed.

Source observations: quiz details batch related reads; assessment answer responses reconstruct a full session; quiz materialization issues per-question writes; Admin curriculum snapshots are broad; PDF rendering materializes all page buffers before bounded processing. Prioritize realistic corpus/query/heap measurement before optimizing. Production EXPLAIN/ANALYZE, request percentiles, concurrent load, volume utilization and low-end-device responsiveness: **NOT YET VERIFIED**.

No evidence supports blanket caching of protected API responses or adding Redis now. Introduce pagination/scoped endpoints where actual query and interaction measurements justify them.

## 21. Maintainability

KEEP: modular monolith, transaction interface, feature API adapters, AI Operations sequence protection/view models, media storage abstraction, immutable snapshots. REFACTOR: request lifetimes, oversized multi-task workspaces, publication authority, migration execution boundary. REBUILD: specific Admin page composition and missing source-review workflow. REMOVE after owner closure: temporary startup importer wiring and unused historical product labels.

No lockfile is committed in the inspected app trees; workflows use `npm install`. Pinned direct versions do not fully pin transitive dependencies. Improve reproducibility through a deliberate package-manager/lockfile decision rather than calling these installs fully reproducible. API lint currently exits successfully with one unused `SOURCE_BUCKET` warning in the new importer; leave that small cleanup with the content owner.

## 22. Tests

### Fresh execution on baseline

| Command / check | Result | Limit |
| --- | --- | --- |
| API `npm run test:unit` | **62 passed, 0 failed, 0 skipped** | Unit suite only |
| API typecheck + build | PASS | Does not execute DB services |
| API lint | PASS with one unused-variable warning | Not warning-free |
| Student `npm run build` (prebuild lint + tests) | PASS; **37 tests / 10 files** | No browser run in this command |
| Admin `npm run build` (prebuild lint + tests) | PASS; **63 tests / 14 files** | No browser run in this command |
| FPA-001 actual learning module | Reproduced class-12 selection resolving class-9 | Deterministic fixture; no production mutation |
| FPA-002 actual assessment service with query double | In-progress denied; abandoned returns question; zero additional access checks | **Not PostgreSQL integration** |
| Fresh live HTTP from local runtime | API/Student/Admin requests timed out | Does not establish that Railway is down |
| Main-SHA Actions lookup | Returned no PR-triggered runs | Connector filters to PR runs; not proof of absent push CI |

Executable CI includes PostgreSQL clean migrations/constraints, auth/access/device, media/OCR, AI contracts/execution/review, question/quiz, Student API/assessment and Chromium suites. Existing browser suites cover many real actions, session expiry and 390px overflow. B02/B03 add route/history/focus and wider viewports. This is substantial coverage, not merely mocked component snapshots.

Missing scenarios exposed by this audit: shared subject in multiple classes; abandoned session after expiry/revocation; imported source → review → publish → student; visible original source during OCR review; production worker job lifecycle; controlled out-of-order Reader responses; migration crash after SQL commit before ledger insert. Tests that only check counts/status or seeded rows must not be described as full source review or live AI execution. Complete current-head PostgreSQL/browser rerun and comprehensive visual/RTL/a11y certification: **NOT YET VERIFIED** in this initial batch.

## 23. Missing Capabilities

Release-relevant gaps grounded in current workflows: source-independent publication and original-page review, executable AI/OCR worker composition, cold-start authorized offline Reader, reconnect behavior, and remaining UX roadmap flows. Future saved-question/achievement/sync tables are not proof of delivered features. Do not invent a new learning platform or expand roles to fill these gaps.

Complete ordinary tasks with clear pending/success/empty/error/retry/permission states. In particular, give operators visible queued-job readiness and actionable failures, make source review possible before publication, and preserve chosen class/lesson context. Existing search/filters/retry controls should be retained and improved, not replaced indiscriminately.

## 24. Legacy / Dead Complexity

The first legacy startup batch is intentionally guarded by an exact flag, expected 69 pages / 62 lessons / 104 questions, snapshot verification, journal/replay and draft-only checks. It is not an unconditional import. Its own runbook says to disable the flag and remove startup wiring after success. However, it runs before API listen and can prevent startup on failure (FPA-006).

The runtime state file is still `PENDING_CI_AND_PRODUCTION_EXECUTION` at this baseline. This audit does not certify the actual imported counts, source bytes, replay or backup restoration. A snapshot on the same media volume is recovery evidence, not an independently verified disaster-recovery backup.

Schema-only saved questions, achievements and sync structures should be labelled deferred. Obsolete reset-token operational metrics should be reconciled with current temporary-password recovery. Do not drop historical migrations, change applied checksums or merge stale stacked PRs to “clean up.”

## 25. Architecture Decision

| Area | Decision | Reason / boundary |
| --- | --- | --- |
| Fastify/PostgreSQL modular monolith | YES — KEEP | Correct scale and authority; no distributed rewrite evidence |
| Auth/access/device | KEEP + targeted verification | Real business rules implemented server-side |
| Assessment | REFACTOR | Local non-completed read-policy gap; retain snapshot/scoring design |
| Domain/schema | KEEP | Provenance/editorial/delivery/result identities have distinct purposes |
| Publication service | REFACTOR | Remove ingestion-task dependency from canonical publication command |
| AI/OCR | IMPROVE operational composition | Implement missing runtime entrypoints; retain durable execution/review |
| Media | KEEP + measured resource refactor | Existing deterministic pipeline; bound PDF aggregate memory |
| Student Learn/Reader | IMPROVE/REFACTOR | Composite route identity and async lifetime; preserve B03 progress |
| Admin shell and giant multi-task screens | PARTIAL REBUILD | Replace composition/navigation, not domain services |
| Source/media review | PARTIAL REBUILD / missing workflow | Human review requires protected original source visibility |
| Offline | COMPLETE planned increments | H is foundation; I/reconnect remain undelivered |
| Temporary startup import | REMOVE after content-owner closure | Explicit one-off exception, not permanent API startup architecture |

**Overall C is scoped to these presentation/workflow areas. Backend B does not imply database replacement.** Continue UX Refoundation with the audit findings integrated into its owning batches. No evidence warrants declaring the entire UX roadmap stopped.

## Finding register

Every finding below is open unless a later execution addendum supplies a fix SHA and verification. Priority expresses product/engineering urgency, not an unverified production incident.

### FPA-001 — P1 — Student offering identity

- **Area:** Student / IA / contract mapping.
- **Problem:** Subject routes omit class identity.
- **Evidence:** `student-learning-model.ts:24–33,53–55`; `student-learning.tsx` callers; `student-reader.tsx` back link; migration `0001_core.sql` composite offering key; `evidence/reproduce-subject-collision.mjs` executed.
- **Current behavior:** Same subject across two classes has identical href; lookup chooses first class.
- **Expected product behavior:** The selected class/subject and Reader return context remain exact.
- **Root cause:** Frontend treats reusable subject identity as offering identity; one-class fixture misses it.
- **User impact:** Wrong grade's lesson list; selected grade can become unreachable through its card.
- **Engineering impact:** Route and test contract encode the wrong domain mapping.
- **Classification:** IMPROVE, local correctness fix.
- **Recommended solution:** Include class + subject in route/context; no invented offering UUID required; multi-class direct/back/history tests.
- **Dependencies:** UX Student owner; revise IA route example and B03 tests together.
- **Risk:** Medium route compatibility; no backend migration needed.
- **Status:** EXECUTED reproduction; OPEN; notified in Issue #16 comment `5648464422`; UI branch untouched.

### FPA-002 — P1 — Abandoned assessment access recheck

- **Area:** Backend / access / assessment.
- **Problem:** Abandoned-session reads bypass the current quiz/entitlement check.
- **Evidence:** `student-assessment/service.ts:600–612,674–687`; integration test at `462–468,488–504`; `evidence/reproduce-assessment-access.mjs`.
- **Current behavior:** In-progress read denied after access loss; abandon then read returns owned questions without recheck.
- **Expected product behavior:** Leaving an unfinished session cannot restore protected content access.
- **Root cause:** Access policy is conditional on one status instead of defining the completed-history exception.
- **User impact:** Expired/revoked access may still retrieve abandoned assessment material.
- **Engineering impact:** State transition circumvents an otherwise correct delivery gate.
- **Classification:** IMPROVE, local server policy fix.
- **Recommended solution:** Recheck all non-completed reads; preserve cancellation and explicitly test completed-history behavior.
- **Dependencies:** Independent backend branch; PostgreSQL HTTP regression including pre-existing abandoned and newly abandoned sessions; compatible with #47 presentation scope.
- **Risk:** Low code scope, high need for security regression coverage; do not change historical completed-result semantics accidentally.
- **Status:** SOURCE CONFIRMED + service/query-double reproduction; real PostgreSQL exact scenario NOT YET VERIFIED in initial batch; OPEN.

### FPA-003 — P1 — AI/OCR runtime composition missing

- **Area:** Backend operations / content completeness.
- **Problem:** Execution components are not wired into a production worker flow.
- **Evidence:** `server.ts`, `app.ts`, API package scripts; repository-wide constructor/caller search for `AiWorkerRuntime`, `AiModelRouter`, `OcrExtractionService`, `TesseractOcrProvider`; runtime implementations and integration fixtures.
- **Current behavior:** Admin can enqueue AI work and review existing seeded/durable results; inspected runtime has no worker bootstrap consuming it. OCR provider/service consumers found only in tests.
- **Expected product behavior:** An operator's queued job progresses through execution/review or reports a clear unavailable state.
- **Root cause:** Library/contract stage completion treated as operational feature completion.
- **User impact:** Blocked preparation journey despite available controls.
- **Engineering impact:** Deployment lacks a supervised execution composition and smoke gate.
- **Classification:** IMPROVE / complete missing integration.
- **Recommended solution:** Add explicit worker entry/config/provider composition, shutdown and health; execute one bounded job through human review; keep review/publication separation.
- **Dependencies:** Provider configuration, same protected media access, AI budget/capacity controls; content owner coordination.
- **Risk:** Medium operational/cost impact; live provider execution NOT YET VERIFIED.
- **Status:** SOURCE CONFIRMED for repository runtime; external/untracked workers NOT YET VERIFIED; OPEN.

### FPA-004 — P1 — Imported content cannot use normal publication flow

- **Area:** Content / backend / Admin review.
- **Problem:** Publication command is coupled to ingestion tasks; imported assets lack the task relationship. Source-image comparison is absent from normal OCR review.
- **Evidence:** `legacy-supabase-importer.ts:706–743`; `ingestion-service.ts:928–1040`; curriculum mutation schemas; `ContentOperationsWorkspace.tsx`; `e2e/curriculum.e2e.spec.mjs:112–145`.
- **Current behavior:** Import correctly produces drafts; publication selects only task-owned assets; review UI compares text without original page rendering.
- **Expected product behavior:** Any supported source reaches protected preview → human review → explicit publication → authorized student delivery.
- **Root cause:** An upload execution aggregate owns a source-independent editorial decision; tests prove metadata/text transitions rather than source review.
- **User impact:** Operator cannot finish normal imported-content publication or properly compare OCR to the original.
- **Engineering impact:** Pressure for manual DB publication bypasses and duplicate per-import commands.
- **Classification:** REFACTOR backend; PARTIAL REBUILD source-review surface.
- **Recommended solution:** Canonical lesson/asset publication service, protected Admin preview, ingestion delegation; source-to-student end-to-end test.
- **Dependencies:** Legacy import owner + UX content-review owner; preserve drafts until review.
- **Risk:** Medium; publication/authorization/revision concurrency must remain server-owned.
- **Status:** SOURCE CONFIRMED; full imported production journey NOT YET VERIFIED; OPEN.

### FPA-005 — P2 — Migration SQL and ledger commit separately

- **Area:** Database deployment reliability.
- **Problem:** SQL may commit before the migration ledger entry is written.
- **Evidence:** `migrate.ts` sequential `client.query(contents)` then ledger insert; transactional SQL files.
- **Current behavior:** A crash in that gap leaves applied schema without its filename/checksum record.
- **Expected product behavior:** Restart can reliably identify committed migrations.
- **Root cause:** Transaction ownership split between file contents and runner.
- **User impact:** Potential failed deployment/recovery; no outage reproduced here.
- **Engineering impact:** Non-idempotent DDL can fail on restart despite advisory locking.
- **Classification:** REFACTOR.
- **Recommended solution:** Define explicit runner transaction/ledger policy including special enum migrations; fault-injection test; never edit applied migration checksums casually.
- **Dependencies:** Migration/DB owner; clean and already-migrated fixtures.
- **Risk:** Medium; PostgreSQL DDL transaction details need validation.
- **Status:** SOURCE CONFIRMED failure window; crash reproduction NOT YET VERIFIED; OPEN.

### FPA-006 — P2 — One-off import blocks API startup

- **Area:** Deployment / temporary architecture.
- **Problem:** Guarded batch executes before API listen and failure exits the API.
- **Evidence:** `server.ts`; `legacy-supabase-startup.ts`; first-production-batch runbook cleanup section.
- **Current behavior:** Exact flag gates import; snapshot/journal/replay protections exist; enabled failure prevents normal startup.
- **Expected product behavior:** Ordinary API availability does not depend on a one-off content import after its closure.
- **Root cause:** Temporary execution workaround coupled to normal service lifecycle.
- **User impact:** Potential API unavailability while enabled; no outage asserted.
- **Engineering impact:** More restart/recovery states and operational coupling.
- **Classification:** REMOVE temporary wiring after closure; KEEP generic importer CLI.
- **Recommended solution:** Content owner verifies batch, disables flag, restores normal startup and retains evidence; use explicit one-off execution thereafter.
- **Dependencies:** Active content workstream; no audit-side flag/data change.
- **Risk:** Medium if removed before batch recovery is resolved.
- **Status:** SOURCE CONFIRMED documented exception; live batch completion NOT YET VERIFIED; OPEN.

### FPA-007 — P2 — Reader response lifetime not tied to lesson

- **Area:** Frontend correctness.
- **Problem:** Old Reader request can settle after the lesson context changes.
- **Evidence:** `student-reader.tsx:95–128`; same component used for changing lesson context; contrast AI Operations sequence refs.
- **Current behavior:** `loadReader` writes awaited result without cancellation/sequence check; speech cleanup only on unmount.
- **Expected product behavior:** Displayed content and speech always belong to the active lesson.
- **Root cause:** Async work lifetime is broader than resource identity.
- **User impact:** Possible mismatched content/header or continued previous speech during rapid navigation.
- **Engineering impact:** Nondeterministic state bug; similar detail loaders need scoped review.
- **Classification:** REFACTOR locally.
- **Recommended solution:** Resource-keyed request cancellation/sequence guard and speech cleanup on lesson change; deferred-response test.
- **Dependencies:** UX Reader owner; preserve session-expiry handling.
- **Risk:** Low/medium; controlled browser race NOT YET VERIFIED.
- **Status:** SOURCE CONFIRMED missing guard; dynamic race NOT YET VERIFIED; OPEN.

### FPA-008 — P2 — Admin task composition and technical handoffs

- **Area:** Admin / UX / frontend maintainability.
- **Problem:** Local workspace routing and large screens combine multiple operator jobs; technical data is routinely visible.
- **Evidence:** `App.tsx:158–290`; Curriculum 1,030 lines/7 forms; Quiz Builder 1,135 lines/3 forms; AI Authoring 1,057 lines; Student Access 989 lines; complete TSX inventory.
- **Current behavior:** Create/list/edit/review/export or recovery/code tasks share large components; route history does not identify workspace; some actions require technical IDs.
- **Expected product behavior:** Stable task destinations, contextual editor/review, meaningful source and decision data.
- **Root cause:** Stage-by-stage capability assembly became product navigation/composition.
- **User impact:** More context switching and interpretation effort; deep-link/reload loss.
- **Engineering impact:** High coupling and duplicated forms/state/error presentation.
- **Classification:** PARTIAL REBUILD page composition; KEEP adapters/services.
- **Recommended solution:** Work area → destination; separate task screens, reuse primitives only where semantics match; apply §18 field policy.
- **Dependencies:** B06+ UX owner; do not implement from audit branch.
- **Risk:** Medium regression surface; preserve every tested workflow/selection/permission contract.
- **Status:** SOURCE CONFIRMED; exhaustive visual/user evaluation NOT YET VERIFIED; OPEN.

### FPA-009 — P2 — PDF aggregate memory is not bounded by page concurrency

- **Area:** Performance / media.
- **Problem:** All rendered page buffers are read before limited-concurrency downstream processing.
- **Evidence:** `media/pdf-processor.ts` `Promise.all` page reads; `media/service.ts` ordered concurrency; configured input/page limits.
- **Current behavior:** Large PDFs can retain aggregate rendered bytes despite two concurrent processing operations.
- **Expected product behavior:** Resource budget follows bounded live pages/bytes and reports oversized work clearly.
- **Root cause:** Concurrency bound starts after eager materialization.
- **User impact:** Potential processing failure/delay under large documents; no measured incident.
- **Engineering impact:** Capacity planning cannot infer memory from concurrency alone.
- **Classification:** REFACTOR after measurement.
- **Recommended solution:** Measure heap/RSS on bounded representative PDFs; read/process/release pages incrementally and set aggregate budget if needed.
- **Dependencies:** Media tests/worker execution owner.
- **Risk:** Medium ordering/retry behavior; OOM threshold NOT YET VERIFIED.
- **Status:** SOURCE CONFIRMED resource shape; performance incident NOT YET VERIFIED; OPEN.

### FPA-010 — P2 — Documentation state drifts from executable main

- **Area:** Recovery / technical ownership.
- **Problem:** Central prose still describes H/B03 as pending and older architecture/source assumptions persist.
- **Evidence:** README, queue, status/log, documentation index routing text, current B03 code and new `0026` importer support.
- **Current behavior:** Recovery can suggest redoing completed code or overlook unfinished operational joins.
- **Expected product behavior:** Status distinguishes implemented, tested, merged and deployed, with exact evidence.
- **Root cause:** Multiple workstreams update closure prose without one reconciled evidence ledger.
- **User impact:** Indirect delivery delay and inconsistent expectations.
- **Engineering impact:** Duplicate work, stale baselines and false completion confidence.
- **Classification:** IMPROVE.
- **Recommended solution:** Append this scoped audit and reconcile owning closure documents on current main; retain historical provenance instead of rewriting history.
- **Dependencies:** UX/content owners' exact-head closure evidence; Issue #16.
- **Risk:** Low if append-only and evidence-based.
- **Status:** SOURCE CONFIRMED; audit records corrected interpretation; broad owner status reconciliation OPEN.

### FPA-011 — P2 — Acceptance claims exceed specific scenarios

- **Area:** QA / release completeness.
- **Problem:** Passing seeded/count/state tests can be read as complete source review, multi-class navigation or live worker proof.
- **Evidence:** Single-class learning fixture; OCR browser test assertions; worker constructors in tests only; integration test's abandoned/access cases separated.
- **Current behavior:** Current tests pass while FPA-001/FPA-002 and missing joins remain.
- **Expected product behavior:** End-to-end tests cross the actual source/role/lifecycle boundaries.
- **Root cause:** Stage-local acceptance misses cross-stage compositions.
- **User impact:** Broken complete journeys despite individual gates passing.
- **Engineering impact:** False confidence and late release defects.
- **Classification:** IMPROVE tests and evidence language.
- **Recommended solution:** Add the seven targeted scenarios in §22; retain useful real PostgreSQL/Chromium suites; do not substitute more mirrored unit tests.
- **Dependencies:** Respective fixing batches; production smoke access for live composition.
- **Risk:** Low; avoid flaky broad screenshot assertions as a replacement for behavior.
- **Status:** SOURCE CONFIRMED gaps; OPEN.

### FPA-012 — P3 — Deferred schema and obsolete recovery metric

- **Area:** Domain / operations / legacy complexity.
- **Problem:** Schema foundations and legacy projections can be mistaken for delivered product capabilities.
- **Evidence:** saved-question/achievement/sync tables without API service consumers found; `admin-operations/service.ts` counts `auth_password_reset_tokens` while current recovery issues temporary passwords.
- **Current behavior:** Existence and operational counts outlive the associated runtime flow.
- **Expected product behavior:** Metrics describe current support actions; future capabilities are clearly deferred.
- **Root cause:** Early schema/old recovery model retained across product evolution.
- **User impact:** Misleading support/roadmap interpretation.
- **Engineering impact:** Unnecessary cognitive load and tests tied to old concepts.
- **Classification:** IMPROVE labels; REMOVE obsolete projection after verification.
- **Recommended solution:** Trace consumers and replace recovery metric with current audited recovery events; do not drop tables without migration/retention review.
- **Dependencies:** Operations/support owner and future-stage parity decisions.
- **Risk:** Low presentation risk; data removal is explicitly not recommended now.
- **Status:** SOURCE SEARCH CONFIRMED; live historical row usage NOT YET VERIFIED; OPEN.

## Ordered independent batches

| Batch | Scope | Ownership / exit gate |
| --- | --- | --- |
| AUDIT-01 | Recovery, model, inventory, findings, baseline tests and two reproductions | This documentation branch; Issue #16 kickoff `5648443655` |
| SEC-01 | FPA-002 backend access predicate + PostgreSQL regression | Independent branch, no Student UI changes; exact-head Stage15 + regressions |
| UX-CORRECT-01 | FPA-001 and FPA-007 | Student UX owner; multi-class/back/direct-route and delayed-response browser tests |
| CONTENT-FLOW-01 | FPA-004 source preview/publication use case | Content + UX review owner; import-to-student test with no premature publication |
| RUNTIME-01 | FPA-003 worker composition | AI/OCR owner; bounded execution/review smoke and failure/retry/shutdown |
| CONTENT-CLOSE-01 | FPA-006 bootstrap retirement | Active import owner after verified batch/recovery closure |
| DB-RELIABILITY-01 | FPA-005 migration atomicity | Dedicated migration branch and fault-injection gate |
| UX-B06+ | FPA-008 Admin composition | Continue existing roadmap, preserve server contracts |
| QUALITY-01 | FPA-009/010/011/012 + reproducibility/data minimization | Targeted measurements, consumer evidence and corrected closure ledger |

## Runtime evidence and unresolved verification

Railway project `b5481a3d-7078-476e-b63c-c07b57c28c6f`, environment `38c1dc2a-58b3-4f5a-9098-85df7f879035`: latest observed deployments reported SUCCESS for API, Student, Admin, PostgreSQL and content-inspector. API deployment **`e3adc7ab-8da1-49e9-bbdf-efd8ca89ea87`**, Student **`02fa104b-bfa0-4a0a-a6b4-bc7500e38e60`**, Admin **`f396fd8b-0dba-45b9-9d26-241889835844`**, PostgreSQL **`3223001d-766f-4f57-833a-7ffcd2558ed8`**, inspector **`b634d859-ddb3-42d8-a7b9-55c6aa3f9772`**. API source SHA was verified as `d113dc02212884b93fa0cd2ac8f75aae6bdb7258`. Student/Admin exact deployed source SHAs: **NOT YET VERIFIED** in this audit.

Production DB migration ledger, actual content counts/publication state, provider execution, backups/restore, volume headroom, full authenticated live journeys, every historical Issue comment, every line of every service and every visual interaction remain **NOT YET VERIFIED** unless separately covered above. This report is not a declaration that the project is complete or regression-free. Its scoped architecture decision and reproduced findings remain actionable without those broader claims.
