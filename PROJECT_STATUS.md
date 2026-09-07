# PROJECT STATUS

- **Current Phase:** Stage13 Super Admin backend preparation — explicit curriculum hierarchy extension **IMPLEMENTED / VERIFICATION PENDING**.
- **Planning branch / PR:** `planning/product-evolution-review` / draft PR #12.
- **Latest fully verified executable baseline:** `45a902eb94cf574ebbcf29e1d0e9b2ca0ae6f894`.
- **Latest documentation closure:** `418ce0d0d1fed45b272d100a1297dc446693f3e5`.
- **Deployment:** `DEFERRED BY PRODUCT OWNER`. Hosted Student/Admin/API/media/OCR/AI worker runtime remains `NOT YET VERIFIED`.

## Fully verified baseline through Stage12

Exact executable head: `45a902eb94cf574ebbcf29e1d0e9b2ca0ae6f894`.

- Stage12 AI Execution Verification `34089764278` — **SUCCESS** including bounded worker lifecycle, execution lifecycle, capacity, controls, pause/resume/progress and paused-lease recovery.
- Stage11 AI Contract Verification `34089764339` — **SUCCESS**.
- OCR Foundation Verification `34089764349` — **SUCCESS** including real Tesseract.
- Stage10 Media Pipeline `34089764277` — **SUCCESS**.
- Stage9 Content Import Verification `34089764344` — **SUCCESS**.
- Rebuild Stage Verification `34089764467` — **SUCCESS** including Chromium.

Stage12 backend lifecycle/runtime is closed and **VERIFIED**. Authorized live provider adapters/credentials, benchmark-approved production routes, production worker bootstrap, hosted worker runtime and actual provider billing remain explicitly `NOT YET VERIFIED`.

## Current isolated batch — Curriculum Structure / Stage13 backend foundation

Product contract from PED-018:

```text
Class / Grade
→ Subject Offering
→ Unit / Section (optional)
→ Lesson
→ Content / pages / resources
```

Repository discovery proved the existing model already contains `classes`, `subjects`, `subject_class_links` and `lessons`. `subject_class_links` is therefore kept as the existing **Subject Offering** authority; no duplicate `subject_offerings` table is introduced.

Current implementation adds:

- `0016_curriculum_structure.sql`;
- `subject_class_links.status` + `updated_at`;
- one optional `curriculum_sections` layer only;
- nullable `lessons.section_id`;
- composite DB scope protection so a lesson cannot reference a section from another Class/Subject Offering;
- durable `curriculum_events` Admin mutation audit;
- Admin-only curriculum service/routes under `/v1/admin/curriculum`;
- create/update/reorder/archive behavior without destructive Admin DELETE endpoints;
- PostgreSQL + HTTP integration coverage;
- dedicated Stage13 curriculum backend workflow.

Detailed contract: `docs/curriculum/CURRICULUM_STRUCTURE.md`.

### Important preserved boundaries

- Stage9 `content_source_documents/assets` remain source/provenance inventory, not curriculum authority.
- existing lesson IDs and class/subject relationships remain intact;
- media/questions/practice/attempt relationships are not rewritten;
- hierarchy is not filename-derived;
- no recursive generic curriculum tree;
- archive/status is preferred over destructive deletion because lessons may already have historical references.

## Verification gate for current batch

Do **not** promote the verified baseline until one exact implementation head passes:

1. Stage13 API lint/typecheck/unit/build;
2. clean all-migration application;
3. curriculum PostgreSQL schema/constraint/index checks;
4. Admin curriculum HTTP integration tests;
5. cross-offering section rejection at API and direct-DB levels;
6. lower-layer Stage12/11/OCR/10/9 regressions;
7. Full Rebuild including Chromium.

Current curriculum implementation status: **NOT YET VERIFIED** until those checks finish successfully.

## Next ordered work after curriculum closure

1. Close/fix the curriculum backend batch from CI evidence only; no test weakening.
2. Update `PROJECT_ENGINEERING_LOG.md`, this file and `PROJECT_HANDOFF.md` with exact closure commit/run IDs.
3. Continue Stage13 Super Admin product: shell/auth, curriculum/content management, media/OCR state, AI job operations, Question Bank review/publish, students/codes/recovery/device rebind, notifications/import-export/reports/settings/audit.
4. Resolve AI `direct` question persistence explicitly before Question Bank publish flow depends on it.
5. Run live provider/model benchmark before any production AI defaults/bootstrap.
6. Keep hosted deployment deferred until explicit Product Owner re-enable instruction.

## Stable lower-layer facts

- Stage9 source inventory: 15 roots / 48 source documents / 5,552 images.
- Stage10 media identity/checksum/order remains authoritative source evidence.
- OCR derives only from ready media; only reviewed/approved OCR is approved downstream text evidence.
- Student auth/device rules from Stage6/8 remain unchanged.
- Question Bank persistence currently supports only `multiple_choice | true_false`; AI `direct` extraction remains reviewable output only.
- configured AI budget reservations are safety ceilings, not proof of invoice accuracy.

## Repository housekeeping

Temporary branch `tmp-unused-do-not-use` contains no unique code and is not referenced by PR #12. Removal remains a **P3 housekeeping item** because the connected GitHub write surface does not expose ref deletion.

## Last build/test

**Last fully green executable head:** `45a902eb94cf574ebbcf29e1d0e9b2ca0ae6f894`.

**Current implementation:** Curriculum Structure / Stage13 backend foundation — **IMPLEMENTED / VERIFICATION PENDING**.

**Deployment:** `DEFERRED BY PRODUCT OWNER`.
