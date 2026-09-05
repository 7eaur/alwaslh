# PROJECT STATUS

- **Current Phase:** Product Evolution Review after verified Stage 10. Core product idea is unchanged; remaining features/flows are being improved and reorganized instead of copied blindly from legacy.
- **Verification Policy:** every stage requires executable evidence. Official states: `DESIGN PASS` / `CLI PASS` / `RUNTIME PASS` / `RELEASE PASS`; unexecuted = `NOT YET VERIFIED`.
- **Continuity Source:** read `PROJECT_HANDOFF.md`, this file, `PROJECT_ENGINEERING_LOG.md`, `docs/product/PRODUCT_EVOLUTION_REVIEW.md`, `PRODUCT_FEATURE_PARITY_MATRIX.md`, `MASTER_REBUILD_ROADMAP.md`.
- **Planning branch / PR:** `planning/product-evolution-review` / draft PR #12.
- **Verified Stage 10 final head:** `27c6a2ef1118ee44d2e63471e4f925e1296283e0`.
- **Final Stage 10 CI:** Stage10 `33302270707` SUCCESS; Stage9 regression `33302270692` SUCCESS; Full Rebuild `33302270695` SUCCESS including Chromium E2E.

## Completed engineering baseline

- Stage 1 Product Inventory — CLI PASS.
- Stage 2 Brand — CLI PASS.
- Stage 3 UX Architecture baseline — CLI PASS.
- Stage 4 PostgreSQL — CLI/RUNTIME PASS on PostgreSQL 16.
- Stage 5 Engineering Foundation — CLI/RUNTIME PASS.
- Stage 6 Auth/Authorization — CLI/RUNTIME PASS.
- Stage 7 Access Codes/Entitlements — CLI/RUNTIME PASS.
- Stage 8 Activation/Login/Recovery baseline — CLI/PostgreSQL/Chromium PASS; now partially reopened by product decisions for two-step activation + registered-device policy.
- Stage 9 deterministic `alwaslh-go` import — CLI/PostgreSQL RUNTIME PASS: 15 roots / 48 docs / 5,552 images / 0 fatal inventory issues.
- Stage 10 Media Pipeline — CLI/PostgreSQL/MEDIA RUNTIME PASS with Sharp/Poppler, deterministic ordering/storage identity, idempotency, cleanup and real PDF E2E.

## Product decisions — Batches 01–02

Canonical source: `docs/product/PRODUCT_EVOLUTION_REVIEW.md`.

### Student entry/account

- Same product idea; no useful legacy feature is removed without explicit owner decision.
- Welcome/introduction screen before Student entry.
- Entry provides `تفعيل جديد` and `لدي حساب بالفعل`.
- Activation becomes `Full Code verification → mandatory password creation → atomic activation/session`.
- Recovery is Admin-assisted: temporary password/reset credential, revoke old sessions, force Student to create a new private password.
- Student account is restricted to **one registered application device key**. Different/lost device requires Admin reset/rebind. Browser fingerprint/user-agent/IP are not treated as security proof.

### Student learning product

- Keep/improve legacy educational capabilities instead of shortening them: summaries, self-practice/`اختبر نفسك`, full tests, models/ministerial exams, explanations, attempts, resume/restart, question images, versions, filters, progress and other useful learning flows.
- Summary, Self Practice and Full Test/Model are separate product concepts.
- Notes, Favorites and `Needs Review` remain separate UX concepts; no forced single “saved” bucket.
- Personal achievements/progress remain; Global Leaderboard is not required.
- Student UX must stay simple/elegant/mobile-first despite feature breadth.

### Offline/performance

- Offline is a core Student requirement.
- Prefer account/device-scoped local cache, explicit bounded downloads, revision/delta sync and local outbox over repeated full API requests.
- No generic authenticated API-response Service Worker caching.
- Trusted finalization/redemption/publishing remain server validated.
- Exact offline authorization lease duration and download granularity remain pending.

### Curriculum/Admin

- Admin must support multiple classes/grades and multiple subjects with explicit flexible ordering.
- Direction: `Curriculum/Year → Class → Subject Offering → optional Unit/Section → Lesson → Content`, with units optional and explicit ordering; exact schema/versioning still under review.
- Upload is independent from AI.
- OCR is asynchronous/provider-abstracted and reusable.
- Admin Import/Export remains a required capability with scoped contracts/validation.
- Content lifecycle: `Draft → Admin Review → Published`; AI outputs are Draft and must be reviewed before publish.

### AI authoring

- Preserve old generation outcomes/modes: summaries, questions, MCQ, T/F, mixed, extraction/source-based, selected page/image, regenerate, alternate versions, exam/model, exact/replica where applicable, bulk generation and source/page metadata.
- Default input path is OCR text + provenance, with vision fallback only when necessary.
- Gemini credentials/projects server-only with health/rate/quota tracking, cooldown, retry/backoff and legitimate failover.

## Immediate architecture impact

1. **Reopen Stage 6/8 partially:** two-step activation, temporary-password forced change, device registry/challenge verification, device reset/rebind and new security/browser E2E.
2. **Stage 10 Preview Sync** still required; Preview remains pre-Stage-10.
3. Add **OCR Extraction Foundation** between Media and AI authoring; it must not block upload.
4. Stage 11 AI contracts must keep all agreed generation modes and use OCR text + source/page provenance by default.
5. Stage 12 Durable AI implements job durability, scheduling, retry/cooldown/failover/metrics/idempotency.
6. Admin Product must include flexible curriculum, review/publish lifecycle, OCR states, AI review and import/export.
7. Student Product must include Welcome/login, curriculum/reader, summaries, practice, tests/models, notes/favorites/review-later and private progress/achievements.
8. Offline/PWA implementation is mandatory and must reduce unnecessary API traffic.

## Temporary Preview

- Supabase `linksoftt`: temporary PostgreSQL/testing host only.
- Vercel project `alwaslh`, team `wasl15`.
- Preview branch `preview/supabase-vercel` remains at `1eb623ef0cd3f7b47af7aa6add08c87d88f84f81` with a READY deployment.
- `/api/health` was verified HTTP 200 on that deployment.
- Stage 10 migration/code is not synchronized there yet.
- Vercel serverless filesystem is not durable media storage; Poppler/live media upload on Vercel remains `NOT YET VERIFIED`.

## Product review still pending

- Reader detailed UX: search/highlight/page jump/reading settings/notes integration.
- Practice/Test details: question types, timing, review/correction, scoring/history, ministerial model semantics.
- Curriculum year/version/archive/replacement semantics.
- Offline: download scope and offline authorization duration.
- Admin roles/permissions.
- Notes media types and sync conflict UX.
- Notifications, search, exact report/export scopes.

## Next Action

Continue Product Evolution Review before feature-heavy implementation. Record every decision immediately, then revise the roadmap and explicitly reopen only the affected verified stages. No valuable legacy feature is removed without Product Owner approval.
