# PROJECT STATUS

- **Current Phase:** Product Evolution Review after verified Stage 10. Core product idea is unchanged; remaining features/flows are being improved and reorganized instead of copied blindly from legacy.
- **Verification Policy:** every stage requires executable evidence. Official states: `DESIGN PASS` / `CLI PASS` / `RUNTIME PASS` / `RELEASE PASS`; unexecuted = `NOT YET VERIFIED`.
- **Continuity Source:** read `PROJECT_HANDOFF.md` first, then this file, `PROJECT_ENGINEERING_LOG.md`, `docs/product/PRODUCT_EVOLUTION_REVIEW.md`, `PRODUCT_FEATURE_PARITY_MATRIX.md`, `MASTER_REBUILD_ROADMAP.md`.
- **Planning branch / PR:** `planning/product-evolution-review` / draft PR #12.
- **Product Review Batches recorded:** 01–03.
- **Verified Stage 10 final head:** `27c6a2ef1118ee44d2e63471e4f925e1296283e0`; Stage10 `33302270707`, Stage9 regression `33302270692`, Full Rebuild `33302270695` all SUCCESS.

## Current decided product direction

- Welcome → `تفعيل جديد` / `لدي حساب بالفعل`.
- Two-step activation + Admin temporary-password recovery + one registered cryptographic application device.
- Preserve useful legacy learning depth: curriculum, Reader, summaries, Practice, tests/models, notes/favorites/review-later, progress/private achievements, Offline.
- Reader: original page + optional approved Text View + Arabic search + cached/versioned `استماع للدرس` TTS; no Highlight system now.
- Student custom tests use only Admin-reviewed Published Question Bank; no live Gemini generation for Student sessions.
- Original ministerial models stay exact; simulation is a separate future type.
- Offline: lesson/subject + explicit full-book downloads, Download Manager, delta sync/outbox, maximum 14-day signed authorization lease capped by entitlement expiry.
- Curriculum direction supports multiple ordered classes/subjects with optional Unit and explicit version-aware structure.
- Upload independent from OCR/AI/TTS; OCR reusable; AI outputs Draft; Admin reviews before publish; Import/Export required.
- Legacy AI generation outcomes retained with OCR-text-first inputs and server-side durable scheduling.

## Engineering impact / NOT YET IMPLEMENTED

1. Stage6/8 partial reopen for activation/device/recovery and new security/Chromium gates.
2. Stage10 Preview Sync still pending.
3. OCR Extraction Foundation pending.
4. Reader Text/Search/TTS pending implementation/runtime verification.
5. Practice Engine/Published Question Bank custom-test flow pending.
6. Offline 14-day lease/download architecture pending runtime verification.
7. Admin/Student full products and AI stages pending.

## Temporary Preview

Supabase `linksoftt` + Vercel `alwaslh` (`wasl15`) remain temporary. Preview branch `preview/supabase-vercel` at `1eb623ef0cd3f7b47af7aa6add08c87d88f84f81` has READY deployment and `/api/health` HTTP 200, but is still pre-Stage10. Vercel output-dir mismatch and serverless media/Poppler durability remain unresolved/`NOT YET VERIFIED`.

## Product review still pending

- `اختبر نفسك`: feedback after each question or at end; detailed scoring/timing/review.
- Curriculum year/version/archive/replacement semantics.
- Admin roles/permissions.
- Quiz Builder/Content QA exact workflow.
- Notes media types/sync conflict UX.
- Notifications.
- Student direct AI explanation/chat scope.
- exact reports/import/export scopes/formats.

## Next Action

Continue Product Evolution Review. Finalize Practice/Test behavior next, then Admin roles/content/Quiz Builder. Product decisions are design-level only until implementation and executable gates pass.
