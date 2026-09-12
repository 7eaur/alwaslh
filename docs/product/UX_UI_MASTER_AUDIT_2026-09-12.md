# UX/UI MASTER AUDIT — الوسيلة الذكية

Date: **2026-09-12**  
Baseline inspected: **`main@c3ddef04933772116c3bd9cdf29eb5a973c527fd`**  
Active track: **UX/UI Refoundation**  
Normal roadmap return point: **`STUDENT-016I`**

> Evidence order: live code/contracts/tests and approved brand sources outrank this document. Anything not directly inspected is marked `NOT YET VERIFIED`.

## 1. Scope and method

This is a source-and-flow audit, not a visual review from screenshots.

Inspected evidence includes:

- `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, `PROJECT_HANDOFF.md`, `DOCUMENTATION_INDEX.md`;
- `docs/workstreams/UX_UI_REFOUNDATION_PAUSE_2026-09-12.md` and `UNIFIED_PROJECT_RESUME_PROTOCOL.md`;
- Issue #16 current board/body and latest execution comments;
- approved brand foundation, identity, shared tokens and logo/app-icon assets;
- actual Student source tree and primary UI components;
- actual Admin source tree and all top-level workspace families;
- Student/Admin package dependencies and application entry points;
- `apps/api/src/app.ts` service/route composition to verify domain boundaries;
- Student/Admin E2E inventories used as behavior-contract evidence.

Not used as product authority:

- chat memory;
- generic dashboard templates;
- external visual references;
- inferred backend/database field names.

External Mobbin/Figma/Product Design exploration is **not required yet** to establish the current structural findings. It may be used later for interaction alternatives after the project IA is authoritative.

## 2. Product mental models recovered from source

### Student

Student is an installed educational PWA/app experience. The current verified domain capabilities cover:

`Activation/Login → entitled curriculum → Lesson/Reader → Practice/Assessment → Offline download/use`

Future Personal Learning and Progress destinations are roadmap work and must not be invented as finished UI during this refoundation.

Student should answer, in order:

1. Where am I?
2. What can I learn now?
3. What should I do next?
4. Is this content available online/offline?
5. What should I do when something prevents progress?

### Super Admin

Super Admin is an operational workspace. Actual API composition confirms independent domain families for:

- auth/session;
- student activation/access;
- curriculum + Reader publication;
- content ingestion;
- content/media/OCR operations;
- AI operations/review;
- AI authoring;
- Question Bank;
- Quiz Builder/export;
- student assessment;
- offline authorization/downloads;
- notifications;
- admin operations.

The appropriate product workflow is therefore a hierarchy of work areas and object/detail pages, not one flat dashboard or one scrolling page per backend module.

## 3. Global findings

| ID | Severity | Area | Finding | Evidence / impact | Classification |
|---|---:|---|---|---|---|
| `UX-IA-101` | P1 | Routing | Neither Student nor Admin has application routing; navigation is React state/component switching. | No router dependency in either app; Student authenticated state renders one aggregate section; Admin `App.tsx` uses an 11-value workspace state union. Browser back/deep-link/history semantics are structurally weak. | REBUILD navigation foundation |
| `UX-IA-102` | P1 | Student | Authenticated Student is one long mixed surface. | Curriculum, assessment, offline downloads and access management are stacked by `StudentAccessSection`. Learning tasks compete in one scroll context. | REBUILD shell / REFACTOR task pages |
| `UX-IA-103` | P1 | Admin | Admin global navigation is flat and exposes too many backend-shaped workspaces. | 11 top-level sidebar destinations with no grouped IA or route hierarchy. | REBUILD shell/navigation |
| `UX-IA-104` | P1 | Admin | Several workspaces contain multiple independent primary workflows. | Curriculum, AI authoring, governance, Question Bank, Quiz Builder, ingestion/content ops all combine list/detail/create/review/config/export tasks. | REFACTOR/REBUILD page boundaries |
| `UX-COPY-101` | P1 | Student | Production UI exposes security/storage/runtime implementation language. | Visible device-key/server/storage/SHA-256/Service Worker/Cache API/revision/sync wording increases cognitive load and does not help learning. | REFACTOR copy/view models |
| `UX-COPY-102` | P1 | Admin | Production UI contains stage labels and engineering authority/cache/revision/lifecycle terminology. | Operators see `Stage 13G`, parity labels, cache/repository/server-authority explanations and raw event/code terminology. | REFACTOR copy/data presentation |
| `UX-LEGACY-101` | P1 | Admin | Parity closure UI remains embedded beside product UI. | `LessonAuthoringParityPanel` and `QuizMetadataPanel` duplicate entity operations and expose parity/revision language. | MOVE capability then REMOVE legacy surfaces |
| `UX-RESP-101` | P2 | Admin | Mobile adaptation preserves navigation complexity instead of redesigning it. | At <=820px sidebar becomes a static block above content and nav becomes a two-column grid. | REBUILD responsive shell |
| `UX-BRAND-101` | P2 | Identity | Shared tokens are used, but production brand lockups are inconsistent with approved assets. | Student draws a local mark; Admin uses a letter `و` block rather than approved logo assets. | IMPROVE |
| `UX-DS-101` | P2 | Components | Strong token base exists, but application patterns are duplicated locally. | Repeated local status/date/error/state/metric patterns and workspace-specific CSS families without one UI primitive layer. | IMPROVE shared primitives |
| `UX-A11Y-101` | P2 | Accessibility | Useful foundations exist but route/focus semantics are not app-level. | Focus-visible, touch targets, reduced motion and RTL logical properties exist; state-switched screens require manual focus restoration and lack route-level landmarks/history. | KEEP foundations + REFACTOR navigation/focus |
| `UX-DATA-101` | P2 | Data presentation | Some screens render identifiers/technical metadata as first-class content. | UUID-like IDs, content revisions, prompt/job/output identifiers, source paths/config values appear where they are not the primary decision. | REFACTOR progressive disclosure |

## 4. Student inventory

### 4.1 Application/bootstrap

Current source:

- `src/main.tsx`
- `src/App.tsx`
- `src/pwa.ts`
- auth/device/offline helpers

Current behavior:

- brand tokens are imported globally;
- Service Worker registration is present;
- auth/session/device lifecycle has real security contracts;
- visible app phase is owned inside `App.tsx` rather than URL routes;
- activation/login/recovery/account states are component-switched.

Classification:

- security/auth/device contracts: **KEEP**;
- phase-based UI ownership: **REFACTOR**;
- route/history/deep-link model: **REBUILD**;
- local brand mark: **IMPROVE** to approved production asset.

### 4.2 Activation / Login / Recovery

What works:

- clear focused forms;
- pending/error states;
- correct authentication boundaries;
- touch-sized controls and Arabic-first styling.

Problems:

- helper copy explains browser/device/security implementation rather than user action;
- entry surface reads partially like a technical security demonstration;
- returning-student and recovery flow should have clearer task-specific hierarchy and recovery instructions.

Classification: **IMPROVE / REFACTOR copy and hierarchy**, preserve APIs and security behavior.

### 4.3 Authenticated Home

Current state:

- there is no true Student Home destination;
- authenticated account view delegates to `StudentAccessSection`, which stacks all current learning and account functions.

Classification: **REBUILD**.

Home must not invent progress or recommendation data that the current backend does not provide. Conditional “continue learning” is allowed only when reliable state exists.

### 4.4 Subjects / Curriculum

Current source: `student-curriculum.tsx`.

What works:

- entitlement-aware curriculum retrieval;
- class/subject/lesson structure is recognizable;
- loading/empty/error/offline states exist;
- published-content boundary is respected;
- media and Reader behaviors are tied to real APIs.

Problems:

- class, subject, lesson browsing and Reader are combined inside one component surface;
- Reader opens inline rather than as a focused learning destination;
- some empty/help copy explains publication/review internals;
- manual DOM focus restoration compensates for missing route-level navigation.

Classification:

- curriculum data behavior: **KEEP**;
- subject/lesson browse presentation: **REFACTOR**;
- Reader boundary: **REBUILD as dedicated screen/route**.

### 4.5 Reader

What works:

- protected media remains server-authorized;
- Reader loading/error/offline behavior exists;
- speech functionality and cleanup exist;
- content width tokens exist.

Problems:

- no dedicated route, back behavior or stable screen context;
- inline placement competes with curriculum browsing;
- unsupported-media and offline messages can expose MIME/revision/publication mechanics.

Classification: **REFACTOR UI boundary; KEEP authority/media logic**.

`STUDENT-016I` true cold-start offline Reader remains **PAUSED / NOT YET VERIFIED** and is not part of this redesign implementation.

### 4.6 Practice / Assessment

Current source: `student-assessment.tsx` + `assessment.css`.

What works:

- published quiz discovery;
- server-owned attempt/scoring/finalization;
- active assessment is already more focused than the surrounding Student shell;
- question navigation, save/finalize and lifecycle states exist.

Problems:

- quiz discovery is stacked with unrelated Student work;
- version/server mechanics are over-explained;
- developer roadmap text about future offline assessment is visible to the learner;
- no route-level attempt URL/back contract.

Classification:

- assessment authority/controller behavior: **KEEP**;
- discovery and active-attempt route boundaries: **REFACTOR**;
- visible technical/developer copy: **REMOVE/REWRITE**.

### 4.7 Offline / Downloads

Current source: `student-offline-downloads.tsx`.

What works:

- download/materialize/remove lifecycle exists;
- explicit loading/error/offline states;
- integrity/security rules are implemented below the UI.

Problems:

- UI exposes `SHA-256`, Service Worker, Cache API, content revision and authorization mechanics;
- offline library is buried inside the aggregate page;
- selection/presentation is utility-like rather than an installed-app learning library.

Classification: **REFACTOR UI/copy; KEEP security/integrity implementation**.

Target learner language: “متاح بدون إنترنت”, “يوجد تحديث”, “تعذر حفظ الدرس”, “أعد الاتصال لتحديث المحتوى”.

### 4.8 Account / Access

Current source: lower part of `student-access.tsx`.

What works:

- entitlement and class-code operations are real;
- offline/error/loading states exist.

Problems:

- access management appears as a peer to learning content on the default Student surface;
- labels such as entitlement/server decision are operator/implementation oriented.

Classification: **MOVE + REFACTOR** into Account/Access destination or contextual recovery flow.

### 4.9 Profile / Settings / Personal Learning / Progress

- dedicated profile/settings experience: **NOT YET VERIFIED as an implemented product surface**;
- Personal Learning: roadmap Stage17, **NOT IMPLEMENTED / do not invent**;
- Progress/Statistics/Achievements: later roadmap stage, **NOT IMPLEMENTED / do not invent**.

## 5. Admin inventory

### 5.1 Shell / Sidebar / Navigation

Current source: `apps/admin-web/src/App.tsx`, `styles.css`.

Current behavior:

- one fixed desktop sidebar;
- 11 flat top-level button destinations;
- current workspace is React state, not a route;
- mobile converts sidebar to a static block and two-column nav grid.

Problems:

- no deep links/browser history;
- backend/module names dominate hierarchy;
- all destinations appear equally weighted;
- mobile requires traversing the navigation block before content.

Classification: **REBUILD**.

### 5.2 Dashboard / Operations Overview

Current source: `AdminOperationsWorkspace.tsx`.

What works:

- overview data, recent activity and notifications can support real decisions;
- operational data comes from real APIs.

Problems:

- visible stage/cache/authority language;
- notifications are mixed as a tab rather than a clearly placed operational destination;
- metrics must remain actionable and avoid becoming decorative KPIs.

Classification: **IMPROVE / REFACTOR**.

### 5.3 Curriculum

Current source: `CurriculumWorkspace.tsx`.

Independent workflows currently combined:

- create class;
- create subject;
- create class/subject offering;
- select and edit class;
- offering configuration/order;
- create/manage sections;
- create/manage lessons.

Impact: multiple primary actions, creation controls and hierarchical browsing occupy one page.

Classification: **REFACTOR into list/detail hierarchy**. Keep curriculum contracts and CRUD services.

### 5.4 Content Ingestion

Current source: `ContentIngestionWorkspace.tsx`.

Independent workflows currently combined:

- create/upload task;
- upload progress;
- task history;
- selected task detail;
- processing/linking/publication transitions.

Correct contract to preserve: upload/ready does not equal publication.

Classification: **REFACTOR** into ingestion list/new/task-detail boundaries.

### 5.5 Content / Media / OCR

Current source: `ContentOperationsWorkspace.tsx`.

Current surface combines:

- document filtering/browsing;
- document detail;
- assets/media;
- OCR results;
- OCR review/actions.

Some source paths, MIME/error codes and technical values are first-class content.

Classification: **REFACTOR** into Content Library/detail and OCR Review queue/detail. Technical metadata becomes progressive disclosure only when operationally useful.

### 5.6 AI Operations / Human Review

Current source:

- `AiOperationsPage.tsx`
- `AiOperationsWorkspace.tsx`
- adapter/view-model/controller files

What works:

- pagination and view-model/controller separation;
- bounded polling;
- real job/unit/output/review authority;
- human review is preserved.

Problems:

- one workspace drills Job → Unit → Attempts → Output → Review without route hierarchy;
- raw IDs, prompt keys and internal error codes can dominate presentation;
- review queue is not a clear first-class operator destination.

Classification:

- adapter/controller/data behavior: **KEEP**;
- workspace IA/presentation: **REFACTOR**;
- human review queue: **PROMOTE into clear route within AI/Review area**.

### 5.7 AI Authoring

Current source: `AdminAiAuthoringWorkspace.tsx`.

Independent workflows combined:

- lesson generation;
- application of approved outputs by raw ID;
- quiz generation/version draft configuration;
- question regeneration/archive;
- specialized export.

Impact: one catch-all AI page asks operators to understand implementation identifiers and cross-entity lifecycles.

Classification: **REBUILD IA / MOVE actions contextually**.

Preferred ownership:

- Lesson AI actions from Lesson detail;
- Quiz generation from Quiz detail/create flow;
- Question regeneration from Question detail;
- AI operations/review area owns jobs and review, not every authoring form.

### 5.8 Question Bank

Current source: `QuestionBankWorkspace.tsx`.

Current surface combines:

- list/filter/pagination;
- detail;
- manual create;
- edit;
- AI import by output ID;
- regeneration;
- submit/reject/publish lifecycle.

What works: lifecycle and revision authority are real and must remain intact.

Classification: **REFACTOR** into list, new, detail/edit/review actions. Remove raw output-ID dependence from the normal happy path where contextual navigation can carry the object.

### 5.9 Quiz Builder

Current source: `QuizBuilderWorkspace.tsx`.

Current surface combines:

- list/filter;
- create;
- detail;
- version editor;
- candidate search/selection;
- submit/reject/publish/archive lifecycle.

Classification: **REFACTOR** into list/new/detail/version-edit routes while preserving immutable published-version authority.

### 5.10 Students / Access

Current source: `AdminStudentAccessWorkspace.tsx`.

Current top-level tab contains two different task families:

- Student accounts/detail/recovery/device/access operations;
- Access code inventory/generation/revocation.

Student master/detail pattern is useful but too much detail can remain inline at narrow widths.

Classification: **REFACTOR** into Students list/detail and Access Codes pages. Preserve recovery/device/security contracts.

### 5.11 Files / Reports

Current source: `AdminReportsWorkspace.tsx`.

Actual function:

- import full-access codes from CSV;
- validate/report row errors;
- export selected/scoped access codes;
- print access-code cards.

Finding: current label “الملفات والتقارير” is misleading; this is an Access Codes file utility, not a general reporting work area.

Classification: **REMOVE as top-level destination; MOVE** under Access Codes.

### 5.12 Governance / Security / Audit

Current source: `AdminGovernanceWorkspace.tsx`.

Current surface combines:

- product/processing reports;
- environment/database/session/security configuration values;
- security counts;
- audit-event list/filtering.

Implementation values such as DB SSL/pool/SameSite/raw event codes are exposed in the same general workspace.

Classification: **REBUILD boundaries**:

- Audit becomes a dedicated Operations page;
- system/runtime status exists only for genuinely actionable operator diagnostics;
- implementation configuration is hidden or progressively disclosed.

### 5.13 Legacy parity surfaces

Current source:

- `LessonAuthoringParityPanel.tsx`
- `QuizMetadataPanel.tsx`
- `stage13g-parity.css`

These expose “Lesson parity”, “Quiz parity”, “Content revision”, “lifecycle” language and duplicate entity operations.

Classification: **MOVE valid capabilities into canonical Lesson/Quiz detail pages, then REMOVE parity surfaces and CSS after executable parity verification**.

### 5.14 Admin login

Current source: `LoginScreen.tsx`.

What works:

- simple auth form;
- server session authority preserved.

Problems:

- local `و` brand block instead of approved production asset;
- explanatory copy emphasizes storage/session implementation rather than the operator task.

Classification: **IMPROVE**.

## 6. Design-system audit

### KEEP

- `packages/brand` is a strong canonical base;
- approved teal/open-book/Cairo identity;
- semantic surface/text/border/status tokens;
- focus tokens;
- spacing/radius/shadow scale;
- reader width and touch-target tokens;
- dark-theme tokens where used;
- logical RTL-friendly CSS foundation;
- reduced-motion handling;
- minimum touch sizes.

### IMPROVE

- add product-level layout tokens for Student shell/safe areas and wider Admin workspaces;
- unify Button/Field/State/Status/Toolbar/Table/Filter/Dialog/Drawer primitives;
- standardize loading/skeleton/empty/error/permission/offline patterns;
- use official logo assets consistently;
- standardize mixed Arabic/Latin/numeric treatment;
- remove workspace-specific reimplementations of the same interaction primitives.

### DO NOT DO

- do not replace the identity;
- do not make every section a card;
- do not create a generic “dashboard template” system;
- do not add animation/gradient/glass/glow as decoration;
- do not make Student and Admin share the same composition density.

## 7. Accessibility audit

Verified foundations in source:

- visible focus styles;
- minimum interactive target token;
- semantic labels in many forms;
- `aria-live` in several mutation/loading states;
- reduced-motion CSS;
- RTL logical properties;
- basic responsive breakpoints.

Problems/gaps:

- state-based pseudo-navigation weakens browser history and route-level focus management;
- some screen changes rely on manual DOM focus restoration;
- large Admin composites make heading/landmark hierarchy harder to scan;
- mobile Admin navigation is structurally poor even when controls remain technically accessible;
- exact WCAG contrast/keyboard/screen-reader behavior for every current surface is **NOT YET VERIFIED**;
- visual/browser device inspection of the redesigned surfaces is **NOT YET VERIFIED** until implementation batches run.

## 8. Duplication / complexity audit

Observed duplication:

- local `errorMessage` / `messageFor` helpers across workspaces;
- repeated date formatting and status-label mapping;
- repeated loading/empty/error state components;
- repeated metric/status badge patterns;
- independent filters/pagination/action toolbars with inconsistent composition;
- giant workspace components containing list, detail, form and lifecycle behavior together.

Target response is not a giant abstraction layer. Extract only stable cross-product primitives and keep domain-specific logic local.

## 9. What is explicitly NOT changing

This audit does not authorize changes to:

- API/PostgreSQL canonical authority;
- Auth/Authorization/Entitlements;
- publication boundaries;
- `media ready != published`;
- AI human-review chain;
- Question Bank publication authority;
- immutable published Quiz delivery;
- server-owned assessment scoring/finalization;
- `/v1` Service Worker exclusion;
- signed offline authorization/integrity/device/session security.

If a future UX implementation proves a contract defect, it must be documented and fixed separately at the owning layer.

## 10. Audit decision

A blind rewrite is **not justified**. The underlying product contracts, API clients, many data controllers, E2E suites and brand tokens are valuable.

A **structural frontend refoundation is justified** for:

1. route/history/navigation foundations;
2. Student authenticated shell and learning screen boundaries;
3. Admin grouped workspace IA and object-detail boundaries;
4. product-language cleanup;
5. consolidation of stable UI primitives/states;
6. removal of parity/developer UI after capability migration.

Implementation must proceed incrementally against the existing behavior contracts.