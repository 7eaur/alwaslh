# PROJECT STATUS

- **Current Phase:** Product Evolution Review after verified Stage 10. The product idea remains the same; remaining flows/features are being improved deliberately instead of copied from the legacy application.
- **Verification Policy:** every stage requires executable evidence. Official states: `DESIGN PASS` / `CLI PASS` / `RUNTIME PASS` / `RELEASE PASS`; unexecuted = `NOT YET VERIFIED`.
- **Continuity Source:** read `PROJECT_HANDOFF.md`, this file, `PROJECT_ENGINEERING_LOG.md`, `docs/product/PRODUCT_EVOLUTION_REVIEW.md`, `PRODUCT_FEATURE_PARITY_MATRIX.md`, `MASTER_REBUILD_ROADMAP.md`.
- **Planning branch / PR:** `planning/product-evolution-review` / draft PR #12.
- **Verified Stage 10 final head:** `27c6a2ef1118ee44d2e63471e4f925e1296283e0`.
- **Final Stage 10 CI:** `33302270707` SUCCESS; Stage 9 regression `33302270692` SUCCESS; Full Rebuild `33302270695` SUCCESS including Chromium E2E.

## Completed engineering baseline

- Stage 1 Product Inventory — CLI PASS.
- Stage 2 Brand — CLI PASS.
- Stage 3 UX Architecture baseline — CLI PASS; product flows may now be improved through explicit decisions.
- Stage 4 PostgreSQL — CLI/RUNTIME PASS on PostgreSQL 16.
- Stage 5 Engineering Foundation — CLI/RUNTIME PASS.
- Stage 6 Auth/Authorization — CLI/RUNTIME PASS.
- Stage 7 Access Codes/Entitlements — CLI/RUNTIME PASS.
- Stage 8 Activation/Login/Recovery baseline — CLI/PostgreSQL/Chromium PASS; **activation UX is now explicitly scheduled for refactor by PED-003**.
- Stage 9 deterministic `alwaslh-go` import — CLI/PostgreSQL RUNTIME PASS: 15 roots / 48 docs / 5,552 images / 0 fatal inventory issues.
- Stage 10 Media Pipeline — CLI/PostgreSQL/MEDIA RUNTIME PASS with Sharp/Poppler, deterministic ordering/storage identity, idempotency, failure cleanup and real PDF E2E.

## Product decisions recorded — Batch 01

Canonical source: `docs/product/PRODUCT_EVOLUTION_REVIEW.md`.

- **PED-001:** same core product idea; legacy is reference/inventory, not immutable specification.
- **PED-002:** elegant Welcome/Introduction experience before Student login/activation; all visible copy must be production-ready, no placeholder text.
- **PED-003:** first activation becomes two-step UX: `6-digit Full Code verification → mandatory Create Password → atomic account activation/session`. Verification must use a short-lived one-time activation ticket and must not create/consume a partial account.
- **PED-004:** forgotten-password recovery is Admin-assisted using the Student code/account identifier. Existing password is never revealed. Preferred safe behavior is temporary reset credential + forced password change + session revocation + audit.
- **PED-005:** Student UI must be simple, elegant, mobile-first and preserve useful access to curriculum, models/quizzes, notes, favorites/saved items and progress without dashboard clutter.
- **PED-006 / PED-010:** Admin curriculum/lesson/media upload remains direct and reliable; upload does not depend on Gemini. AI failure/quota must never block normal upload.
- **PED-007 / PED-008:** add a provider-abstracted OCR extraction layer. Store page text + provenance/provider/confidence/status and feed reusable extracted text to Gemini instead of repeatedly sending raw images by default.
- **PED-009:** durable AI execution will use server-only configured credential/project pools with health, quota/rate awareness, cooldown, retry/backoff and legitimate failover.

## Immediate architecture impact

1. **Reopen Stage 8 activation contract** before final Student Product implementation. Keep atomicity/race/idempotency guarantees while splitting the UX into code verification and mandatory password creation.
2. **Stage 10 Preview Sync** still required: Preview remains pre-Stage-10 and Vercel branch deploys currently hit `No Output Directory named "dist"` configuration mismatch.
3. Introduce an **OCR Extraction Layer** between Media Pipeline and AI authoring. Upload succeeds first; OCR is a separate/retryable processing job; Gemini generation is explicit/on-demand.
4. Stage 11 contracts must consume extracted text + source/page provenance and define semantic validators/golden tests.
5. Stage 12 durable AI execution must implement credential/project scheduling, retry/cooldown/failover and usage metadata server-side.
6. Admin and Student product stages will be redesigned from decisions, not copied screen-for-screen from legacy.

## Temporary Preview

- Supabase `linksoftt`: temporary PostgreSQL/testing host only.
- Vercel project `alwaslh`, team `wasl15`.
- Preview branch `preview/supabase-vercel` remains at `1eb623ef0cd3f7b47af7aa6add08c87d88f84f81` and has a READY deployment.
- `/api/health` was verified HTTP 200 on that deployment.
- Stage 10 migration/code is not synchronized there yet.
- Vercel serverless filesystem is not durable media storage; Poppler/live media upload on Vercel remains NOT YET VERIFIED.

## Remaining product-review areas

Detailed decisions are still required for: access expiry/renewal and Class Codes; Student Home/navigation; Reader/search/highlights; Practice/quizzes/models/ministerial exams; notes/saved structure and sync; progress/achievements/rank; notifications; Offline/PWA; Admin roles; content lifecycle/versioning/publish; AI generation modes/review; Quiz Builder; reports/export; search; support/admin operations.

## Next Action

Continue Product Evolution Review one coherent area at a time. Record each decision immediately, then revise the remaining implementation roadmap. No feature-heavy Stage 11+ implementation should start until core decisions that affect its contracts are settled. Engineering fixes needed for Stage 8 activation refactor, Stage 10 Preview sync and OCR foundation will be scheduled explicitly from the review.
