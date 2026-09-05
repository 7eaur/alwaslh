# PROJECT STATUS

- **Current Phase:** Product Evolution Review after verified Stage 10.
- **Verification Policy:** every stage requires executable evidence. Official states: `DESIGN PASS` / `CLI PASS` / `RUNTIME PASS` / `RELEASE PASS`; unexecuted = `NOT YET VERIFIED`.
- **Continuity Source:** read `PROJECT_HANDOFF.md` first, then this file, `PROJECT_ENGINEERING_LOG.md`, `docs/product/PRODUCT_EVOLUTION_REVIEW.md`, `PRODUCT_FEATURE_PARITY_MATRIX.md`, `MASTER_REBUILD_ROADMAP.md`.
- **Planning branch / PR:** `planning/product-evolution-review` / draft PR #12.
- **Product Review Batches recorded:** 01–04.
- **Verified Stage 10 final head:** `27c6a2ef1118ee44d2e63471e4f925e1296283e0`; Stage10 `33302270707`, Stage9 regression `33302270692`, Full Rebuild `33302270695` all SUCCESS.

## Current decided product direction

### Student entry/account
- Welcome → `تفعيل جديد` / `لدي حساب بالفعل`.
- Two-step activation.
- Admin temporary-password recovery + forced password change.
- One registered cryptographic application device per Student account.
- Full Code 6 digits remains core.
- Class Code 7 digits remains core; Student can redeem additional Class Codes later and own multiple class entitlements.

### Student learning
- No valuable legacy learning feature is removed without explicit Product Owner approval.
- Reader: optimized original page + optional OCR Text View + Arabic search + cached/versioned TTS `استماع للدرس`.
- Notes, Favorites and Needs Review remain separate.
- `اختبر نفسك` gives immediate feedback after every question.
- Full Tests/Models reveal final result/review at the end.
- Student custom tests use only Admin-reviewed Published Question Bank.
- Original ministerial models remain exact; simulated models are a separate future type.
- Personal achievements/progress retained; no Global Leaderboard requirement.

### Media / Offline / performance
- Uploaded images are processed into lighter Student-facing variants while preserving educational readability; source/original remains internal evidence.
- Lazy/responsive delivery and appropriate Offline variants are required; quality tuning remains NOT YET VERIFIED in browser/Preview.
- Offline: Lesson + Subject + explicit Book downloads, Download Manager, delta sync/outbox, maximum 14-day signed authorization lease capped by entitlement expiry.
- Student runtime should avoid repeated full API refetches.

### Curriculum/Admin
- Multiple classes/grades and subjects supported with explicit ordering and optional Unit.
- No mandatory annual curriculum-version system; optional source year/edition metadata only when useful.
- Admin role is **Super Admin only** for current product scope.
- Upload independent from OCR/AI/TTS.
- OCR reusable and async.
- Draft → Review → Published.
- Admin Import/Export required.
- Contextual in-place instructions are mandatory for Student/Admin workflows.

### AI authoring
- Preserve valuable legacy generation modes/outcomes.
- OCR-text-first by default; vision only when required.
- Generated-from-book questions require source + page provenance before publish.
- High-throughput architecture decided: durable chunked jobs, bounded concurrency/backpressure, authorized credential scheduler, retries/cooldown, idempotency, partial-success persistence, resume/cancel, validation/dedupe/provenance and usage metrics.
- Goal: maximize accepted useful output per token/time without exhausting server/provider resources.

## Engineering impact / NOT YET IMPLEMENTED

1. Stage6/8 partial reopen for activation/device/recovery and new security/Chromium gates.
2. Stage10 Preview Sync still pending.
3. Student image-delivery optimization/browser quality verification pending.
4. OCR Extraction Foundation pending.
5. Reader Text/Search/TTS pending implementation/runtime verification.
6. Practice Engine/Published Question Bank pending.
7. Offline 14-day lease/download architecture pending runtime verification.
8. Stage11 AI contracts and Stage12 high-throughput durable execution pending.
9. Admin/Student full products pending.

## Temporary Preview

Supabase `linksoftt` + Vercel `alwaslh` (`wasl15`) remain temporary. Preview branch `preview/supabase-vercel` at `1eb623ef0cd3f7b47af7aa6add08c87d88f84f81` has READY deployment and `/api/health` HTTP 200, but is still pre-Stage10. Vercel output-dir mismatch and serverless media/Poppler durability remain unresolved/`NOT YET VERIFIED`.

## Product review still pending

- Notes media types: text/image/capture/audio launch scope.
- Notifications exact categories/channels.
- Progress/mastery/weak-area recommendation rules.
- Quiz Builder exact Admin UX and bulk review workflow.
- exact Import/Export/report scopes/formats.
- Student direct AI explanation/chat scope.

## Next Action

Continue Product Evolution Review for the remaining items above, then revise implementation sequencing. Product decisions are design-level only until code + executable gates pass. `PRODUCT_FEATURE_PARITY_MATRIX.md` remains the coverage checklist so legacy capabilities are not silently lost.
