# DOCUMENTATION INDEX — الوسيلة الذكية

> خريطة ذاكرة المشروع الرسمية. أي محادثة/مهندس جديد يبدأ هنا ولا يعتمد على chat memory.

## 1. Source of Truth precedence

عند التعارض استخدم الترتيب:

1. **current code + PostgreSQL migrations + executable GitHub Actions + actual Render runtime evidence**.
2. `docs/product/CURRENT_PRODUCT_OVERRIDES.md` للقرارات التشغيلية الحالية.
3. `PROJECT_HANDOFF.md` + `PROJECT_STATUS.md` + `PROJECT_ENGINEERING_LOG.md` للحالة والسجل المركزي.
4. `PROJECT_INTEGRATION_CONTINUITY.md` للـcurrent Integration operational snapshot.
5. Product Decisions للـBusiness/Product rules.
6. specialized Stage/module/deployment docs.
7. `PRODUCT_FEATURE_PARITY_MATRIX.md` + `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` لمنع ضياع legacy capability.
8. `MASTER_REBUILD_ROADMAP.md` للترتيب المستهدف.
9. legacy audits/PRD/TODO/root legacy code كأدلة تاريخية فقط.

إذا لم يوجد executable/hosted evidence لادعاء runtime، يبقى `NOT YET VERIFIED`.

## 2. Mandatory startup order

1. `README.md`
2. `DOCUMENTATION_INDEX.md`
3. `PROJECT_HANDOFF.md`
4. `PROJECT_STATUS.md`
5. `PROJECT_ENGINEERING_LOG.md`
6. Main/Integration replacement only: `PROJECT_INTEGRATION_CONTINUITY.md`
7. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`
8. `docs/workstreams/TEAM_OPERATING_MODEL.md`
9. role workstream: Backend / Frontend / Integration
10. latest role GitHub Board + Team Room when cross-team
11. if release/hosting involved: root `render.yaml` + `docs/deployment/RENDER_PRODUCTION.md`
12. Product Decisions / Parity / Coverage / Roadmap
13. current specialized stage docs
14. legacy audits only when relevant to a capability being preserved/rebuilt

`NEXT_CONVERSATION_PROMPT.md` is Launcher only.

## 3. Central state / governance files

| File | Authority / Purpose |
|---|---|
| `PROJECT_HANDOFF.md` | resumable project handoff: production branch, architecture, team, current stage, hosting, known risks |
| `PROJECT_STATUS.md` | concise current state, baseline, blockers, Render state, next work |
| `PROJECT_ENGINEERING_LOG.md` | cumulative architecture decisions, findings, changes, tests and remaining work |
| `PROJECT_INTEGRATION_CONTINUITY.md` | detailed current memory for Main Integration: branch heads/reports/decisions/root causes/CI/Render/exact next action |
| `docs/product/CURRENT_PRODUCT_OVERRIDES.md` | current Product Owner decisions; currently Render-primary deployment + main production branch |
| `docs/workstreams/TEAM_OPERATING_MODEL.md` | permanent team ownership/command/report/branch/continuity rules |
| `docs/workstreams/BACKEND_WORKSTREAM.md` | Backend ownership/self-review/current handoff |
| `docs/workstreams/FRONTEND_WORKSTREAM.md` | Frontend ownership/UX/API/a11y/current handoff |
| `docs/workstreams/INTEGRATION_WORKSTREAM.md` | Architecture/Integration/QA/Release rules |
| `MASTER_REBUILD_ROADMAP.md` | target stage sequence; not runtime evidence |
| `NEXT_CONVERSATION_PROMPT.md` | compact startup launcher |
| `TODO.md` | historical only |

### GitHub Team Coordination

- Issue `#13` — Team Room: contracts/blockers/architecture decisions.
- Issue `#14` — Backend Command Board / reports.
- Issue `#15` — Frontend Command Board / reports.
- Issue `#16` — Integration/QA/Release decisions/evidence.

Latest `COMMAND`/Integration Review governs workstream scope. Each workstream updates its role file + Board REPORT. Integration updates central docs and `PROJECT_INTEGRATION_CONTINUITY.md` as soon as resume state changes.

## 4. Production / Deployment — CURRENT

| File | Purpose |
|---|---|
| `render.yaml` | **production Infrastructure-as-Code** for Render; deploys from `main` |
| `docs/deployment/RENDER_PRODUCTION.md` | Render topology, DB/media durability, branching/release workflow, first-deploy verification |
| `.env.example` | current local/current-runtime env contract; never secret storage |
| `docs/product/CURRENT_PRODUCT_OVERRIDES.md` | Product Owner deployment authority: `DEPLOYMENT RE-ENABLED — RENDER PRIMARY` |

Current facts:

- **`main` is production source branch.**
- Render is primary hosting target for Student/Admin/API/PostgreSQL.
- legacy main preserved at `archive/legacy-main-2026-09-08`.
- repository Vercel serverless path has been retired.
- feature branches do not deploy directly to production.
- hosted runtime is `NOT YET VERIFIED` until the first Render Blueprint apply and health/session/media checks pass.
- current `FileSystemMediaStorage` requires Render Persistent Disk; ephemeral production upload storage is prohibited.
- no production Render AI worker yet because Stage12 live provider/bootstrap is not implemented.

## 5. Product / Legacy parity

| File | Purpose |
|---|---|
| `PRODUCT_FEATURE_PARITY_MATRIX.md` | required inventory of valuable legacy capability/scenarios |
| `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` | capability → disposition → implementation → acceptance evidence |
| `docs/product/PRODUCT_EVOLUTION_REVIEW.md` | core Product Decisions |
| `docs/product/PRODUCT_DECISIONS_BATCH_05.md` | product/AI/design/root-cause decisions |
| `docs/product/PRODUCT_DECISIONS_BATCH_06.md` | Student/Admin/PWA/documentation and historical Preview policy |
| `docs/product/CURRENT_PRODUCT_OVERRIDES.md` | current Product Owner decisions; overrides older conflicting deployment policy |
| `PROJECT_DEEP_AUDIT.md` | legacy deep audit/reference |
| `PROJECT_FULL_AUDIT_CATALOG.md` | expanded historical evidence catalog |
| `PROJECT_REBUILD_BLUEPRINT.md` | historical synthesis, below newer decisions/evidence |
| `docs/prd.md` | legacy/reference PRD |
| `docs/SOURCE_INVENTORY.md` | historical source inventory |

Legacy code is a capability/failure reference, not the current architecture target.

## 6. Data / Curriculum / Content

| File | Purpose / State |
|---|---|
| `DATABASE_PLATFORM_ARCHITECTURE.md` | PostgreSQL platform architecture/constraints |
| `docs/curriculum/CURRICULUM_STRUCTURE.md` | Class → Subject Offering → optional Section → Lesson |
| `docs/admin/STAGE13_ADMIN_CURRICULUM_UI.md` | Admin curriculum UI behavior/evidence |
| `docs/admin/STAGE13_CONTENT_MEDIA_OCR_OPERATIONS.md` | Stage13C VERIFIED operations over Stage9→10→OCR |
| `docs/admin/STAGE13_CONTENT_INGESTION_PUBLICATION.md` | Stage13D VERIFIED mixed upload/history/Draft→Review→Published |
| `docs/media/MEDIA_PIPELINE_ARCHITECTURE.md` | Stage10 media architecture |
| `docs/media/MEDIA_STAGE_DOD.md` | media DoD/evidence |
| `database/migrations/0008_content_source_import.sql` | Stage9 provenance schema |
| `database/migrations/0009_media_pipeline.sql` | Stage10 media schema |
| `database/migrations/0011_ocr_foundation.sql` | OCR durable schema |
| `database/migrations/0017_content_ingestion_publication.sql` | Stage13D ingestion/publication schema |

Canonical content source remains `7eaur/alwaslh-go` pinned by Stage9 evidence. Source names/folders are provenance, not curriculum authority.

Stage13D separates processing from publication: ready media is not Lesson content until explicitly Draft-linked, reviewed and Published.

## 7. Auth / Access / Student activation

Implementation lives under `apps/api/src/auth`, `activation`, `access`, associated migrations/tests and `apps/student-web`.

Stable verified principles:

- server sessions + role isolation;
- Full Code 6 digits / Class Code 7 digits;
- non-consuming verify → activation ticket → atomic completion;
- Student password + registered P-256 device challenge;
- Admin temporary-password recovery + revocation + forced password change;
- explicit device rebind/reset.

Production session/CORS behavior must also be verified against Render frontend origins after first deploy.

## 8. OCR / AI

| File | Purpose |
|---|---|
| `docs/ai/AI_PROVIDER_MODEL_STRATEGY.md` | provider/model-neutral strategy and benchmark requirement |
| `docs/ai/STAGE11_GENERATION_CONTRACTS.md` | typed modes/Prompt Registry/validators/golden data |
| `docs/ai/STAGE12_JOB_LIFECYCLE.md` | durable job/unit/attempt lifecycle and controls |
| `docs/ai/STAGE12_WORKER_RUNTIME.md` | bounded dedicated worker runtime and explicit missing production bootstrap |
| `database/migrations/0011_ocr_foundation.sql` + OCR code/tests | canonical OCR lifecycle/review/search |

Live provider credentials/routes/benchmark/bootstrap remain `NOT YET VERIFIED`. Do not create a fake production worker to satisfy deployment.

Current engineering stage is **Stage13E Admin AI Operations / Review**. Dynamic candidate state is in `PROJECT_INTEGRATION_CONTINUITY.md` + Boards #13–#16. Stage13E remains outside `main` until verified.

## 9. UX / Brand / Offline

- `packages/brand/` — canonical brand primitives.
- `docs/ux/` — UX architecture/contracts.
- `OFFLINE_MODE.md` + `OFFLINE_MODE_README.md` — legacy/reference + rebuild offline requirements.
- `docs/engineering/DEVELOPMENT_RUNTIME_AND_PREVIEW_POLICY.md` — historical development/preview policy; current hosting decisions are superseded by `CURRENT_PRODUCT_OVERRIDES.md` + Render deployment docs.

## 10. Current verified baseline

Latest fully verified pre-Render executable head:

`4eca7de8877ac9e2289b9c7990c912d33c256935`

Same-head SUCCESS:

- Stage13D Admin `34177369743`
- Stage13D Backend `34177369784`
- Stage13 Admin `34177369748`
- Stage12 `34177369812`
- Stage11 `34177369753`
- OCR `34177369750`
- Stage10 `34177369777`
- Stage9 `34177369756`
- Full Rebuild `34177369768`

Docs/Render-config cutover commits do not replace this application verification baseline. First Render apply creates a separate hosted-runtime evidence layer.

## 11. Current implementation sequence

```text
VERIFIED through Stage13D
→ Render production bootstrap + hosted verification
→ finish Stage13E candidate verification/integration
→ merge Stage13E to main → Render auto-deploy → hosted smoke
→ Stage13F Question Bank
→ Stage13G remaining Admin
→ Stage14 Student product
→ Stage15 Assessment
→ Stage16 Offline/PWA
→ Stage17 personal data
→ Stage18 notifications
→ Stage19 progress/statistics
→ Stage20 reporting/export
→ later hardening/release/operations
```

Render bootstrap does not make Stage13E complete; Stage13E candidate branches stay isolated until gates pass.

## 12. Superseded / historical warnings

- Old root Supabase frontend/backend architecture is legacy reference, not runtime target.
- old Supabase database is not current production authority.
- `TODO.md` is historical only.
- PED-051 and former deployment-deferral wording are historical. **Current override is Render-primary production.**
- Vercel serverless preview path was removed from the current production branch.
- External old provider projects/hooks may remain until provider-side disconnection after Render goes live; repository retirement does not delete external data.

## 13. Documentation maintenance rule

After every meaningful batch:

1. record exact Git HEAD + GitHub run IDs and, when deployed, Render resource/deploy IDs;
2. update `PROJECT_STATUS.md`;
3. update `PROJECT_ENGINEERING_LOG.md` findings/ADs/evidence;
4. update `PROJECT_HANDOFF.md` when resume context changes;
5. Integration updates `PROJECT_INTEGRATION_CONTINUITY.md` immediately after material report/decision/HEAD/CI/Render result;
6. update specialized module/deployment doc;
7. update Legacy Coverage/parity evidence when capability state changes;
8. update Roadmap when stage status/order changes;
9. never mark PASS from prose/build alone;
10. leave unverified items explicitly `NOT YET VERIFIED`.

This convention exists so a replacement conversation can continue from the repository alone.
