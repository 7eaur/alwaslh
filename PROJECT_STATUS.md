# PROJECT STATUS

- **Current Phase:** Product Evolution Review closure after verified Stage 10. Core product decisions are settled enough to resume implementation without more routine product discussion.
- **Verification Policy:** every implementation stage requires executable evidence. Official states: `DESIGN PASS` / `CLI PASS` / `RUNTIME PASS` / `RELEASE PASS`; unexecuted = `NOT YET VERIFIED`.
- **Continuity Source:** start with `DOCUMENTATION_INDEX.md`, then `PROJECT_HANDOFF.md`, this file, `PROJECT_ENGINEERING_LOG.md`, Product Decision docs, AI strategy, legacy parity/audits and `MASTER_REBUILD_ROADMAP.md`. `NEXT_CONVERSATION_PROMPT.md` is the canonical startup prompt.
- **Planning branch / PR:** `planning/product-evolution-review` / draft PR #12.
- **Product Review Batches recorded:** 01–06.
- **Verified Stage 10 final head:** `27c6a2ef1118ee44d2e63471e4f925e1296283e0`; Stage10 `33302270707`, Stage9 regression `33302270692`, Full Rebuild `33302270695` all SUCCESS.

## Current decided product direction

### Runtime surfaces
- `apps/student-web` = Student Web/PWA، قابل للتثبيت مثل نتيجة التطبيق القديم، mobile-first/offline-first ويعمل أيضًا من Browser.
- `apps/admin-web` = Admin Web مستقل للـSuper Admin فقط.
- `apps/api` = Backend API الوحيد للوصول إلى PostgreSQL الخاصة.
- Admin navigation/bundles لا تدخل Student UX؛ السطحان يتشاركان Brand/Design System/shared primitives فقط حيث يناسب.

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
- AI is **provider/model-neutral**, not Gemini-specific.
- Canonical strategy: `docs/ai/AI_PROVIDER_MODEL_STRATEGY.md`.
- Benchmark multiple providers/models and route by task, quality, cost and throughput.
- OCR-text-first by default; vision only when required.
- Generated-from-book questions require source + page provenance before publish.
- Durable high-throughput execution: chunked jobs, queue, bounded concurrency/backpressure, provider/model scheduler, retries/cooldown, idempotency, partial success, cancel/resume, validation/dedupe/provenance and cost/token/latency metrics.
- Model cascade: cheap/fast benchmark-approved model first where suitable; escalate only failed/uncertain units to a stronger model.
- Goal = maximize accepted useful output per cost/token/time, not raw request count.

## Mandatory engineering governance

- **No patching as final design.** Fix root causes after understanding callers/contracts/side effects.
- No disabling tests, auth bypasses, duplicate implementations, hidden errors or hard-coded production exceptions as final solutions.
- Unified Design System and duplicate-component/style audit are required before closing Admin/Student product stages.
- Documentation is project memory; every meaningful batch updates Status/Log/Handoff/specialized docs and exact evidence.
- Legacy details remain available in `PRODUCT_FEATURE_PARITY_MATRIX.md`, `PROJECT_DEEP_AUDIT.md`, `PROJECT_FULL_AUDIT_CATALOG.md`, `PROJECT_REBUILD_BLUEPRINT.md`, Offline docs and `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md`.

## Engineering impact / NOT YET IMPLEMENTED

1. Stage6/8 partial reopen for two-step activation/device/recovery + security/Chromium gates.
2. Stage10 Preview Sync still pending.
3. Student PWA installability/final offline/update behavior beyond current baseline remains later runtime verification.
4. Student media-delivery quality/browser verification pending.
5. OCR Extraction Foundation pending.
6. Reader Text/Search/TTS pending runtime implementation.
7. Practice Engine/Published Question Bank + auto Needs Review pending.
8. Push notification service and gentle-reminder policy pending.
9. Offline 14-day lease/download architecture pending runtime verification.
10. Stage11 provider-neutral AI contracts/benchmark + Stage12 durable multi-provider execution pending.
11. Admin/Student full products pending.

## Legacy feature coverage gate

`PRODUCT_FEATURE_PARITY_MATRIX.md` + `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` are mandatory before Admin/Student feature stages close. Every legacy capability must map to `KEEP/IMPROVE/REFACTOR/REBUILD` with implementation/test evidence, or explicit Product Owner-approved `REMOVE`.

## Temporary development Preview

Canonical policy: `docs/engineering/DEVELOPMENT_RUNTIME_AND_PREVIEW_POLICY.md`.

Current temporary environment:
- Supabase `linksoftt` = PostgreSQL/testing host مؤقت فقط؛
- Vercel project `alwaslh`, team `wasl15` = web/runtime host مؤقت؛
- integration branch `preview/supabase-vercel`.

الغرض: الإشراف والتجارب أثناء التطوير. بعد كل دفعة مستقرة: `CI PASS → Preview sync → deploy → runtime verification → documentation evidence`.

Current Preview branch remains at `1eb623ef0cd3f7b47af7aa6add08c87d88f84f81` with READY deployment and `/api/health` HTTP 200 previously verified, but it is still pre-Stage10. Vercel output-dir mismatch and serverless media/Poppler durability remain unresolved/`NOT YET VERIFIED`.

Preview does **not** redefine final Production architecture. أي workaround خاص بالمنصة مؤقت ويحتاج impact + exit path؛ الأسرار لا تدخل Git أو chat.

## Next Action

1. Close Product Review documentation/CI on the current planning HEAD.
2. Stage10 Preview Sync.
3. Stage6/8 auth/device refactor.
4. OCR Foundation.
5. revised Stage11 provider-neutral AI contracts/benchmark.
6. Stage12 durable multi-provider high-throughput execution.
7. Continue Super Admin + Student stages according to `MASTER_REBUILD_ROADMAP.md` and the legacy coverage gate.

Routine design details may now be chosen by engineering according to the documented product rules; only genuine Business Rule conflicts should reopen product discussion.
