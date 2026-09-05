# PROJECT STATUS

- **Current Phase:** Product Evolution Review after verified Stage 10. Core product idea is unchanged; remaining features/flows are being improved and reorganized instead of copied blindly from legacy.
- **Verification Policy:** every stage requires executable evidence. Official states: `DESIGN PASS` / `CLI PASS` / `RUNTIME PASS` / `RELEASE PASS`; unexecuted = `NOT YET VERIFIED`.
- **Continuity Source:** read `PROJECT_HANDOFF.md` first, then this file, `PROJECT_ENGINEERING_LOG.md`, `docs/product/PRODUCT_EVOLUTION_REVIEW.md`, `PRODUCT_FEATURE_PARITY_MATRIX.md`, `MASTER_REBUILD_ROADMAP.md`.
- **Planning branch / PR:** `planning/product-evolution-review` / draft PR #12.
- **Product Review Batches recorded:** 01–03.
- **Verified Stage 10 final head:** `27c6a2ef1118ee44d2e63471e4f925e1296283e0`.
- **Final Stage 10 CI:** Stage10 `33302270707` SUCCESS; Stage9 regression `33302270692` SUCCESS; Full Rebuild `33302270695` SUCCESS including Chromium E2E.

## Completed engineering baseline

Stages 1–10 retain their documented verified baseline. Stage 6/8 are now explicitly scheduled for a partial product-driven refactor, not invalidated retroactively.

## Product decisions — Batches 01–03

Canonical source: `docs/product/PRODUCT_EVOLUTION_REVIEW.md`.

### Student entry/account
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

### Practice / tests / models
- Student can build custom sessions from selected subject/lesson(s), count and available types.
- **All Student questions come from Admin-reviewed Published Question Bank; no live Gemini generation for Student sessions.**
- Original ministerial models stay exact/provenanced; simulation is a separate future type.
- Practice feedback timing remains PENDING.

### Offline/performance
- Offline is core.
- Explicit lesson + subject downloads; explicit full-book download when budget permits; no automatic whole-curriculum download.
- Download Manager: size/progress/retry/cancel/remove.
- Account/device-scoped cache + revision/delta sync + local outbox.
- **Offline authorization lease = maximum 14 days, capped by actual entitlement expiry.**

### Curriculum/Admin/AI
- Multiple classes/grades/subjects with flexible ordered hierarchy direction.
- Upload independent from OCR/AI/TTS.
- OCR async/reusable/provider-abstracted.
- Draft → Admin Review → Published; AI outputs reviewed before publish.
- Admin Import/Export required.
- Preserve legacy AI generation outcomes with OCR-text-first inputs and server-side durable credential scheduling.

## Immediate architecture impact

1. Reopen Stage 6/8 partially for activation/device/recovery changes and new security/browser E2E.
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
- Preview branch `preview/supabase-vercel` at `1eb623ef0cd3f7b47af7aa6add08c87d88f84f81` with READY deployment.
- `/api/health` verified HTTP 200.
- Stage10 not synchronized there yet; Vercel output-dir mismatch remains open.
- Vercel serverless media/Poppler durability remains `NOT YET VERIFIED`.

## Product review still pending

- `اختبر نفسك`: immediate vs end-of-set feedback; scoring/timing/result/review semantics.
- Curriculum year/version/archive/replacement semantics.
- Admin roles/permissions.
- Quiz Builder/Content QA exact workflow.
- Notes media types/sync conflict UX.
- Notifications categories/channels.
- Student direct AI/explanation scope, if any.
- Exact reports/import/export scopes/formats.

## Next Action

Continue Product Evolution Review. Next: finalize Practice/Test behavior, then Admin roles/content/Quiz Builder. Product decisions are design-level only until implementation + executable gates pass.
