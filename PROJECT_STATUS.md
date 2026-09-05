# PROJECT STATUS

- **Current Phase:** Product Evolution Review closure after verified Stage 10. Core product decisions are now sufficiently settled to resume implementation sequencing without more discussion on routine details.
- **Verification Policy:** every implementation stage requires executable evidence. Official states: `DESIGN PASS` / `CLI PASS` / `RUNTIME PASS` / `RELEASE PASS`; unexecuted = `NOT YET VERIFIED`.
- **Continuity Source:** read `PROJECT_HANDOFF.md` first, then this file, `PROJECT_ENGINEERING_LOG.md`, `docs/product/PRODUCT_EVOLUTION_REVIEW.md`, `docs/product/PRODUCT_DECISIONS_BATCH_05.md`, `docs/ai/AI_PROVIDER_MODEL_STRATEGY.md`, `PRODUCT_FEATURE_PARITY_MATRIX.md`, `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md`, `MASTER_REBUILD_ROADMAP.md`.
- **Planning branch / PR:** `planning/product-evolution-review` / draft PR #12.
- **Product Review Batches recorded:** 01–05.
- **Verified Stage 10 final head:** `27c6a2ef1118ee44d2e63471e4f925e1296283e0`; Stage10 `33302270707`, Stage9 regression `33302270692`, Full Rebuild `33302270695` all SUCCESS.

## Current decided product direction

### Student entry/account/access
- Welcome → `تفعيل جديد` / `لدي حساب بالفعل`.
- Two-step activation with one-time verification ticket and atomic final activation.
- Admin temporary-password recovery + revoke sessions + forced private password change.
- One registered cryptographic application device per Student account; Admin reset/rebind for lost/different device.
- Full Code = 6 digits.
- Class Code = 7 digits; Student can add more Class Codes later and hold multiple class entitlements.

### Student learning
- No valuable legacy capability may disappear without explicit Product Owner approval.
- Reader: optimized original page + optional approved OCR Text View + Arabic search + cached/versioned TTS `استماع للدرس`.
- Notes keep all useful legacy types: text + image + capture + audio.
- Favorites and Needs Review remain separate from Notes.
- Needs Review can be added manually or automatically after repeated wrong answers; default implementation target is two independent mistakes on the same question, configurable after measurement.
- `اختبر نفسك`: immediate correct/incorrect + answer + published explanation after each question.
- Full Tests/Models: result/review at end.
- Student custom tests consume only Admin-reviewed Published Question Bank.
- Original ministerial models remain exact/provenanced; simulated model is a separate future type.
- Personal progress/private achievements only; no Global Leaderboard.
- Weak-area recommendations are server-derived and require enough evidence; no misleading conclusion from one question.

### Notifications / Offline / performance
- Web/PWA Push Notifications are required from the initial product where platform support permits.
- Study reminders are gentle by default: at most one/day and default max 3/week, with quiet hours and opt-out.
- Important content/access/Admin messages can also use Push; In-App center remains fallback.
- Offline: Lesson + Subject + explicit Book downloads, Download Manager, delta sync/outbox, maximum 14-day signed authorization lease capped by entitlement expiry.
- Student runtime should avoid repeated full API refetches.

### Media / Curriculum / Admin / UX
- Images are processed into light Student-facing variants while source originals remain internal evidence; readability of Arabic/formulas/tables must be tested before final quality settings.
- Curriculum supports multiple ordered classes/subjects with optional Unit; no mandatory yearly version lifecycle.
- Admin role = **Super Admin only** for current scope.
- Upload is independent from OCR/AI/TTS.
- OCR reusable and async; TTS derived from approved text and cached by content revision.
- Draft → Review → Published.
- Admin Import/Export required.
- Contextual in-place instructions required.
- Design System must be unified: shared brand/tokens/components, no page-by-page duplication.

### AI authoring
- AI is now **provider/model-neutral**, not Gemini-specific.
- Current strategy: benchmark multiple providers/models and route by task, quality, cost and throughput.
- OCR-text-first by default; vision only when required.
- Generated-from-book questions require source + page provenance before publish.
- Durable high-throughput execution: chunked jobs, queue, bounded concurrency/backpressure, provider/model scheduler, retries/cooldown, idempotency, partial success, cancel/resume, validation/dedupe/provenance and cost/token/latency metrics.
- Model cascade: cheap/fast benchmark-approved model first where suitable; escalate only failed/uncertain units to a stronger model.
- Goal = maximize accepted useful output per cost/token/time, not raw request count.

## Mandatory engineering governance

- **No patching as final design.** Fix root causes after understanding callers/contracts/side effects. Temporary Preview workaround must be documented with an exit path.
- No disabling tests, auth bypasses, duplicate implementations, hidden errors or hard-coded production exceptions as final solutions.
- Unified Design System and duplicate-component/style audit are required before closing Admin/Student product stages.

## Engineering impact / NOT YET IMPLEMENTED

1. Stage6/8 partial reopen for two-step activation/device/recovery + security/Chromium gates.
2. Stage10 Preview Sync still pending.
3. Student media-delivery quality/browser verification pending.
4. OCR Extraction Foundation pending.
5. Reader Text/Search/TTS pending runtime implementation.
6. Practice Engine/Published Question Bank + auto Needs Review pending.
7. Push notification service and gentle-reminder policy pending.
8. Offline 14-day lease/download architecture pending runtime verification.
9. Stage11 provider-neutral AI contracts/benchmark + Stage12 durable multi-provider execution pending.
10. Admin/Student full products pending.

## Legacy feature coverage gate

`PRODUCT_FEATURE_PARITY_MATRIX.md` + `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` are mandatory before Admin/Student feature stages close. Every legacy capability must map to `KEEP/IMPROVE/REFACTOR/REBUILD` with implementation/test evidence, or explicit Product Owner-approved `REMOVE`.

## Temporary Preview

Supabase `linksoftt` + Vercel `alwaslh` (`wasl15`) remain temporary. Preview branch `preview/supabase-vercel` at `1eb623ef0cd3f7b47af7aa6add08c87d88f84f81` has READY deployment and `/api/health` HTTP 200, but is still pre-Stage10. Vercel output-dir mismatch and serverless media/Poppler durability remain unresolved/`NOT YET VERIFIED`.

## Next Action

Close Product Review documentation/CI, then execute the implementation bridges in order: Stage10 Preview sync → Stage6/8 auth/device refactor → OCR foundation → revised Stage11/12 AI contracts/execution, followed by Super Admin and Student product stages. Routine design details may now be chosen by engineering according to the documented product rules; only genuine Business Rule conflicts should reopen product discussion.
