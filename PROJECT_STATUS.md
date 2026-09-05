# PROJECT STATUS

- **Current Phase:** Product Evolution Review after verified Stage 10. Core product idea is unchanged; remaining features/flows are being improved and reorganized instead of copied blindly from legacy.
- **Verification Policy:** every stage requires executable evidence. Official states: `DESIGN PASS` / `CLI PASS` / `RUNTIME PASS` / `RELEASE PASS`; unexecuted = `NOT YET VERIFIED`.
- **Continuity Source:** read `PROJECT_HANDOFF.md`, this file, `PROJECT_ENGINEERING_LOG.md`, `docs/product/PRODUCT_EVOLUTION_REVIEW.md`, `PRODUCT_FEATURE_PARITY_MATRIX.md`, `MASTER_REBUILD_ROADMAP.md`.
- **Planning branch / PR:** `planning/product-evolution-review` / draft PR #12.
- **Product Review Batches recorded:** 01–03.
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

## Product decisions — Batches 01–03

Canonical source: `docs/product/PRODUCT_EVOLUTION_REVIEW.md`.

### Student entry/account
- Same product idea; no useful legacy feature removed without explicit owner decision.
- Welcome/introduction before entry with `تفعيل جديد` / `لدي حساب بالفعل`.
- Two-step activation: code verification → mandatory password → atomic activation/session.
- Admin-assisted temporary-password recovery + forced password change + session revocation.
- One registered cryptographic application-device key per account; different/lost device requires Admin reset/rebind.

### Student learning
- Preserve summaries, `اختبر نفسك`, full/custom tests, original ministerial models, explanations, attempts, resume/restart, versions, filters, progress and other useful legacy learning flows.
- Notes, Favorites and Needs Review remain separate.
- Personal achievements remain; no Global Leaderboard requirement.

### Reader / search / audio
- Original page/image view remains visual source of truth.
- Optional approved OCR/published Text View.
- Arabic-aware book/lesson search mapped to exact page/source.
- `استماع للدرس` through provider-abstracted Arabic TTS.
- TTS audio generated/cached per published content revision, reused across plays and optionally downloadable Offline.
- No independent Highlight system in current scope.

### Practice / tests / ministerial models
- Student can build custom practice/test from selected published subject/lesson(s), count and available question types.
- **Every Student question comes from Admin-reviewed Published Question Bank; no live Gemini generation for Student sessions.**
- Original ministerial models remain exact/provenanced.
- Simulation model is a separate future type and clearly labeled.
- Practice feedback timing remains PENDING: immediate per question vs end of set.

### Offline/performance
- Offline is core.
- Explicit lesson and subject downloads; explicit full-book download when size/storage budget permits; no automatic whole-curriculum download.
- Download Manager: size/progress/retry/cancel/remove.
- Account/device-scoped cache + revision/delta sync + local outbox reduce API traffic.
- **Offline authorization lease = maximum 14 days, capped by actual entitlement expiry.**
- No generic authenticated API-response Service Worker caching.

### Curriculum/Admin/AI
- Multiple classes/grades/subjects with flexible ordering; direction `Curriculum/Year → Class → Subject Offering → optional Unit → Lesson → Content`.
- Upload independent of OCR/AI/TTS.
- OCR async/reusable/provider-abstracted.
- Draft → Admin Review → Published; AI outputs always reviewed before publish.
- Admin Import/Export required.
- Preserve legacy AI generation outcomes with OCR-text-first inputs and server-side durable credential scheduling.

## Immediate architecture impact

1. Reopen Stage 6/8 partially for two-step activation, temporary-password forced change, device registry/challenge/rebind and new security/browser E2E.
2. Stage 10 Preview Sync remains pending.
3. Implement OCR Extraction Foundation independent from upload.
4. Reader must support original-page + Text View + search + cached/versioned TTS.
5. Stage 11/12 AI contracts/execution retain agreed generation modes and text-first provenance-aware architecture.
6. Admin Product includes flexible curriculum, OCR/TTS derived states, review/publish, AI review, Question Bank/Quiz Builder and Import/Export.
7. Student Product includes Reader text/search/audio, summaries, Practice, Published-Question-Bank custom tests, original models, personal data and progress.
8. Offline/PWA uses bounded explicit downloads and 14-day lease.

## Temporary Preview

- Supabase `linksoftt`: temporary PostgreSQL/testing host only.
- Vercel project `alwaslh`, team `wasl15`.
- Preview branch `preview/supabase-vercel` remains at `1eb623ef0cd3f7b47af7aa6add08c87d88f84f81` with READY deployment.
- `/api/health` verified HTTP 200.
- Stage 10 migration/code not synchronized there yet.
- Vercel serverless filesystem is not durable media storage; Poppler/live media upload remains `NOT YET VERIFIED`.

## Product review still pending

- `اختبر نفسك`: immediate feedback vs end-of-set; scoring/timing/result/review semantics.
- Curriculum year/version/archive/replacement semantics.
- Admin roles/permissions.
- Quiz Builder/Content QA exact workflow.
- Notes media types/sync conflict UX.
- Notifications categories/channels.
- Student direct AI/explanation scope, if any.
- Exact reports/import/export scopes/formats.

## Next Action

Continue Product Evolution Review. Next: finalize Practice/Test behavior, then Admin roles/content/Quiz Builder. Product decisions are design-level only until implemented and executable gates pass; do not report Reader/TTS/Offline/device changes as runtime-complete yet.
