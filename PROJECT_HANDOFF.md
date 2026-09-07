# PROJECT HANDOFF — الوسيلة الذكية

> Source-of-truth order: `DOCUMENTATION_INDEX.md` → this file → `PROJECT_STATUS.md` → `PROJECT_ENGINEERING_LOG.md` → product decisions → specialized architecture docs → parity/coverage docs → roadmap. Repository + GitHub Actions are authoritative; unverified work is always `NOT YET VERIFIED`.

## Repository / phase

- Repo: `7eaur/alwaslh`.
- Branch: `planning/product-evolution-review`; draft PR #12.
- Latest fully verified executable baseline: `d3e621e6f60cc56ee3838b7df36a86ebafa37524`.
- Stage1–10 + OCR + Stage11: **VERIFIED**.
- Stage12 backend lifecycle/runtime: **VERIFIED**.
- Stage13 Curriculum Structure backend foundation: **VERIFIED**.
- Stage13 Admin Curriculum Web: **VERIFIED**.
- Current next work: Stage13 Admin **Content / Media / OCR Operations**.
- Live AI provider adapters/benchmark/production worker bootstrap: **NOT YET VERIFIED**.
- Deployment: `DEFERRED BY PRODUCT OWNER`; do not re-enable/publish without new explicit instruction.
- Old database/migration source is not a current dependency for development; current repository migrations/tests/contracts are the active authority.

## Latest exact same-head verification

Executable head `d3e621e6f60cc56ee3838b7df36a86ebafa37524`:

- Stage13 Curriculum Verification `34168788666` — SUCCESS including Admin Chromium E2E.
- Stage12 AI Execution `34168788667` — SUCCESS.
- Stage11 AI Contracts `34168788661` — SUCCESS.
- OCR Foundation `34168788704` — SUCCESS.
- Stage10 Media Pipeline `34168788646` — SUCCESS.
- Stage9 Content Import `34168788663` — SUCCESS.
- Full Rebuild `34168788747` — SUCCESS including existing Student Chromium E2E.

## Stable target architecture

```text
Admin Web ──┐
            ├── apps/api ── private PostgreSQL
Student PWA ┘      │
                   ├── explicit curriculum hierarchy
                   ├── Stage9 source/provenance inventory
                   ├── Stage10 media evidence
                   ├── reviewed OCR text
                   ├── Stage11 provider-neutral AI contracts
                   ├── Stage12 durable execution/admission/control
                   ├── Stage12 bounded worker runtime
                   └── later TTS / notifications / offline sync
```

Hard rules:

- browser never owns PostgreSQL/provider secrets or authoritative permission/progress/publish state;
- no browser-direct database mutation;
- browser does not run OCR/AI workers as authoritative execution;
- provider calls stay outside long DB transactions;
- Fastify remains HTTP-only; AI polling is a separate runtime;
- no duplicate queue or duplicate curriculum/media/OCR authority;
- no key/project rotation to evade provider terms;
- operational pressure is not semantic failure;
- root-cause fixes only; do not weaken tests/security/business rules;
- preserve valuable legacy capability unless Product Owner explicitly approves removal.

## Curriculum hierarchy contract — VERIFIED

```text
Class / Grade
→ Subject Offering (`subject_class_links`)
→ Unit / Section (optional)
→ Lesson
→ Content / pages / resources
```

Important rules:

- `classes` is Class/Grade authority;
- `subjects` is Subject authority;
- `subject_class_links` is the only Subject Offering authority;
- `curriculum_sections` is exactly one optional intermediate layer;
- `lessons.section_id` may be null;
- `lessons_section_scope_fk` enforces same `(class_id, subject_id)` Offering;
- Stage9 source records are provenance/evidence, not curriculum hierarchy;
- curriculum lifecycle is non-destructive by default;
- `curriculum_events` records Admin mutations.

Detailed contract: `docs/curriculum/CURRICULUM_STRUCTURE.md`.

## Stage13 Admin Curriculum Web — VERIFIED

The previous static Admin shell was rebuilt inside the same product boundary into a server-backed Super Admin curriculum workspace.

Verified architecture:

```text
Admin load
→ GET /v1/admin/me
→ login if needed
→ HttpOnly session
→ GET /v1/admin/curriculum
→ Admin-only mutations
→ authoritative refresh
```

Verified browser flow:

```text
login
→ create Class / Subject / Offering / Section / Lesson
→ move/detach Lesson
→ rename Lesson
→ update status
→ reload/session restore
→ logout
```

The Chromium gate also verifies a 390px viewport without horizontal overflow. No destructive DELETE UI is exposed.

Detailed contract/evidence: `docs/admin/STAGE13_ADMIN_CURRICULUM_UI.md`.

### CI-harness hardening during closure

Failures found during closure were corrected without changing production rules:

- mock `Response` is recreated for each request;
- client tests tolerate configured absolute API base URLs by asserting request paths;
- Playwright selectors are scoped to intended controls instead of ambiguous/fuzzy text matches;
- Stage12 global-capacity race uses independent jobs so `ai_jobs` row locking cannot cause a false `null` before capacity admission.

The final exact-head Stage12 and Full Rebuild success prove the hardened tests and production contracts coexist.

## Content / Media / OCR boundary for the next batch

Repository discovery already verified:

```text
content_source_documents/assets       Stage9 provenance/order
                │
                ▼
media_assets/media_variants           Stage10 processing/checksum/variants
                │
                ▼
ocr_extractions                       OCR durable extraction/review
```

Current gaps:

- `apps/api/src/app.ts` does not expose Admin Content/Media/OCR HTTP routes yet;
- media repository has processing lifecycle methods but no Admin operations read model;
- OCR repository/service has enqueue/process/review/search/get but no Admin pending/recent listing endpoint;
- `apps/admin-web` still marks “الوسائط وOCR” as a later module;
- `lesson_assets` exists, but Stage10 media is not automatically linked/published into lesson assets.

Therefore the next batch must first build a thin Admin operations/read-review contract over existing authorities. It must not invent a second queue, treat source folders as curriculum, expose storage/provider secrets, or pretend media/OCR rows are published lesson content.

Expected first flow:

```text
Admin Content Operations
→ source document list/search/filter
→ ordered source assets
→ media processing + variant state
→ OCR extraction/review state
→ extraction detail
→ approve/reject/correct pending OCR
```

Upload progress/history and media→lesson publication/linking remain separate explicit contracts until implemented and verified.

## Stage12 AI contract — remains VERIFIED

Do not regress these rules while integrating later Admin AI screens:

- reuse `ai_jobs / ai_job_units / ai_outputs`; no second queue;
- durable UUID leases + stale-worker rejection;
- bounded global/provider/project/model capacity;
- cooldown/Retry-After/kill switches/budget admission are DB-coordinated;
- runtime identity = route + provider + project + credential + model;
- pause is `ai_jobs.paused_at`, separate from execution status;
- `AiJobLifecycleRepository` owns claim + expired-lease recovery;
- dedicated worker uses bounded slots/backoff, graceful drain and fail-fast unexpected errors;
- progress is server-derived;
- provider calls remain outside DB transactions.

Live provider/model configuration remains unverified. Do not invent fake credentials/routes to make an entrypoint look complete.

## Legacy coverage status

Admin Curriculum Web provides verified evidence only for its implemented subset, including `PUB-002`, `ADMIN-007/008`, supported `CLASS-A-001..003`, `CLASS-A-005..007`, `CLASS-A-010`, and current `LES-A-001..003`, `LES-A-006..007` behavior.

Do not mark search/preview/delete/bulk/upload/media/OCR/AI/publish/codes/students/reporting capabilities complete until their implementation and tests exist.

## Other unresolved boundaries

- Question Bank persists only `multiple_choice | true_false`; AI `direct` extraction must not be silently published;
- TTS implementation/runtime remains `NOT YET VERIFIED`;
- Student entitlement-filtered curriculum read API is not implemented yet;
- content Draft → Review → Published workflow is not implemented yet;
- media→lesson publication/linking contract is not implemented yet;
- hosted Student/Admin/API/media/OCR/AI runtime remains unverified while deployment is deferred;
- temporary branch `tmp-unused-do-not-use` is P3 repository housekeeping only.

## Next ordered work

1. Add Admin Content/Media/OCR read-model and HTTP contracts over Stage9/10/OCR authorities.
2. Add Admin-only OCR extraction detail and review/correction operations using existing OCR lifecycle/repository behavior.
3. Build responsive/a11y “الوسائط وOCR” workspace with loading/error/empty/search/filter/detail/review states.
4. Add API/PostgreSQL/unit/Chromium evidence and update parity documentation.
5. Define and then implement upload/progress/history + media→lesson publication linking as explicit later contracts.
6. Continue Stage13 AI operations over Stage12; never add a client-owned or parallel queue.
7. Resolve `direct` Question Bank persistence before publish depends on it.
8. Continue Students/Codes/Recovery/Device Rebind, Notifications, Import/Export/Reports/Settings/Audit.
9. Run authorized live AI provider/model benchmark before production routing/bootstrap.
10. Keep deployment disabled until Product Owner explicitly re-enables it.

## Continuation rule

After every meaningful batch update `PROJECT_STATUS.md` and `PROJECT_ENGINEERING_LOG.md`; update this Handoff when architecture/branch/CI/runtime state changes; update specialized docs/parity evidence when affected; preserve exact commit/run IDs; mark anything not executed/tested as `NOT YET VERIFIED`.
