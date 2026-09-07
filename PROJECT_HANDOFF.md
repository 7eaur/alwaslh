# PROJECT HANDOFF — الوسيلة الذكية

> Source-of-truth order: `DOCUMENTATION_INDEX.md` → this file → `PROJECT_STATUS.md` → `PROJECT_ENGINEERING_LOG.md` → product decisions → specialized architecture docs → parity/coverage docs → roadmap. Repository + GitHub Actions are authoritative; unverified work is always `NOT YET VERIFIED`.

## Repository / phase

- Repo: `7eaur/alwaslh`.
- Branch: `planning/product-evolution-review`; draft PR #12.
- Latest fully verified executable baseline: `6484677dffa80ca0658ce5837750d824e1bb6943`.
- Stage1–10 + OCR + Stage11: **VERIFIED**.
- Stage12 backend lifecycle/runtime: **VERIFIED**.
- Stage13 Curriculum Structure backend foundation: **VERIFIED**.
- Current next work: Stage13 Super Admin Web curriculum/content integration.
- Live AI provider adapters/benchmark/production worker bootstrap: **NOT YET VERIFIED**.
- Deployment: `DEFERRED BY PRODUCT OWNER`; do not re-enable/publish without new explicit instruction.

## Latest exact same-head verification

Executable head `6484677dffa80ca0658ce5837750d824e1bb6943`:

- Stage13 Curriculum Backend `34092024879` — SUCCESS.
- Stage12 AI Execution `34092024902` — SUCCESS.
- Stage11 AI Contracts `34092024875` — SUCCESS.
- OCR Foundation `34092024895` — SUCCESS.
- Stage10 Media Pipeline `34092024854` — SUCCESS.
- Stage9 Content Import `34092024883` — SUCCESS.
- Full Rebuild `34092024916` — SUCCESS including Chromium Student activation/login/recovery E2E.

The initial Stage13 implementation head `70621c2f…` failed shared Biome formatting before TypeScript/runtime verification. `6484677d…` contains formatter-only corrections and is the executable closure.

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
- provider calls stay outside long DB transactions;
- Fastify remains HTTP-only; AI polling is a separate runtime;
- no duplicate queue or duplicate curriculum authority;
- no key/project rotation to evade provider terms;
- operational pressure is not semantic failure;
- root-cause fixes only; do not weaken tests/security/business rules;
- preserve valuable legacy capability unless Product Owner explicitly approves removal.

## Curriculum hierarchy contract — VERIFIED

PED-018 is now executable:

```text
Class / Grade
→ Subject Offering
→ Unit / Section (optional)
→ Lesson
→ Content / pages / resources
```

Important implementation decisions:

- `classes` is the Class/Grade authority;
- `subjects` is the Subject authority;
- existing `subject_class_links` is the Subject Offering authority; **do not create a parallel `subject_offerings` table**;
- `curriculum_sections` is exactly one optional intermediate layer; **do not introduce a recursive generic tree** without a new product requirement;
- `lessons.section_id` may be null;
- `lessons_section_scope_fk` enforces that section and lesson share the same `(class_id, subject_id)` Offering;
- Stage9 source inventory is provenance/evidence and must not silently define curriculum hierarchy from filenames/folders;
- Admin curriculum lifecycle is non-destructive by default: status/archive rather than DELETE;
- `curriculum_events` is the audit trail for Admin curriculum mutation.

Detailed contract: `docs/curriculum/CURRICULUM_STRUCTURE.md`.

## Admin curriculum backend — VERIFIED

Admin-only `/v1/admin/curriculum` API supports snapshot + create/update for classes, subjects, offerings, sections and lessons. It uses existing session/Admin authorization and public error envelopes.

Verified scenarios include:

- Admin authentication;
- duplicate conflicts;
- optional unsectioned lessons;
- same-offering section assignment;
- API and direct-DB rejection of cross-offering section assignment;
- lesson detach from section without deletion;
- reordering/status/archive while preserving lesson rows;
- durable Admin mutation audit;
- no destructive lesson DELETE route.

Stage13 Admin Web must consume this contract rather than creating page-local storage or direct DB access.

## Stage12 AI contract — remains VERIFIED

Do not regress these rules while integrating Admin AI screens:

- reuse `ai_jobs / ai_job_units / ai_outputs`; no second queue;
- durable UUID leases + stale-worker rejection;
- bounded global/provider/project/model capacity;
- cooldown/Retry-After/kill switches/budget admission are DB-coordinated;
- route runtime identity = route + provider + project + credential + model;
- pause is `ai_jobs.paused_at`, separate from execution status;
- `AiJobLifecycleRepository` owns claim + expired-lease recovery;
- dedicated worker uses bounded slots/backoff, graceful drain and fail-fast unexpected errors;
- progress is server-derived;
- provider calls remain outside DB transactions.

Live provider/model configuration remains unverified. Do not invent fake provider credentials/routes to make an entrypoint appear complete.

## Other unresolved boundaries

- current Question Bank persists only `multiple_choice | true_false`; AI `direct` extraction must not be silently published;
- TTS implementation/runtime remains `NOT YET VERIFIED`;
- Student entitlement-filtered curriculum read API is not implemented yet;
- content Draft→Review→Published Admin workflow is not implemented yet;
- hosted Student/Admin/API/media/OCR/AI runtime remains unverified while deployment is deferred;
- temporary branch `tmp-unused-do-not-use` is P3 repository housekeeping only.

## Next ordered work

1. Inspect `apps/admin-web` actual code, current auth shell/routing/state/design primitives and legacy coverage before editing.
2. Implement the simplest maintainable Admin curriculum management UX over the verified API: loading/error/empty states, class/subject/offering/optional section/lesson flows, archive/status, responsive/a11y.
3. Add browser/API verification for the Admin curriculum flow and update parity/coverage evidence.
4. Continue Stage13 content/media/OCR and AI operations on existing backend contracts.
5. Resolve `direct` question persistence before Question Bank publish depends on it.
6. Run authorized live AI provider/model benchmark before production routing/bootstrap.
7. Keep deployment disabled until Product Owner explicitly re-enables it.

## Continuation rule

After every meaningful batch update `PROJECT_STATUS.md` and `PROJECT_ENGINEERING_LOG.md`; update this Handoff when architecture/branch/CI/runtime state changes; update specialized docs/parity evidence when affected; preserve exact commit/run IDs; mark anything not executed/tested as `NOT YET VERIFIED`.
