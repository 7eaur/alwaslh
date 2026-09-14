# Student Visual Parity Execution Plan

Status: **IN PROGRESS**
Branch: `fix/student-reader-visual-parity`
Primary reference: `docs/product/STUDENT_VISUAL_SOURCE_OF_TRUTH.md`

## Objective

Bring the complete Student product into one coherent visual family that stays close to the approved reference screens while preserving all verified backend, offline, authorization and assessment contracts.

## Batch order

### V01 — Foundation and shared shell — STARTED
- Visual tokens and surfaces.
- Botanical motif asset/background utility.
- App Bar icon wells and spacing.
- Bottom navigation proportions and selected state.
- Shared card/list density.
- Mobile safe area and 390px baseline.

Implemented so far:
- reusable `student-botanical.svg` decorative motif;
- `student-visual-parity.css` loaded as the final Student visual layer;
- calm canvas/background framing;
- refined App Bar icon wells/brand sizing;
- refined bottom-nav selected state/elevation;
- shared surface elevation/border tuning.

Gate: B01 + B02 + screenshot inspection.

### V02 — Home — STARTED
- Botanical hero/welcome composition.
- Quick stats grouped card.
- Library grouped summary using only real device/download data; future items stay unavailable/empty, not fabricated.
- Compact subject preview.
- Last attempt when authoritative data exists.

Implemented so far:
- reference-style two-part welcome hero with restrained motivational copy;
- botanical framing reused from V01;
- quick-stat card density/elevation aligned with the reference;
- Library/Subjects/Last Attempt surfaces restyled without changing data authority;
- download count remains device/profile-scoped real data only.

Gate: B02/B05 + Home visual QA.

### V03 — Welcome / Activation / Login / Recovery
- Centered brand lockup and botanical framing.
- Reference-like segmented entry mode.
- Compact form cards and accessible actions.
- Preserve recovery and forced-password flows.

Gate: Stage14 + auth screenshots.

### V04 — Learn landing
- Reference-like heading/decoration.
- Class context treatment from real catalog/access.
- Compact search and subject rows.
- Scale to many subjects without giant cards.

Gate: B03.

### V05 — Subject / Units / Lessons — STARTED
- Reference-like entity heading.
- Compact unit accordions.
- Lesson number wells and row actions.
- Empty sections never become dominant default state.
- Summary/question actions only when their contracts exist.

Implemented so far:
- tightened subject hierarchy and unit density;
- first populated unit opens instead of an empty first unit;
- reduced oversized card treatment.

Gate: B03.

### V06 — Reader — STARTED
- Focused reading canvas.
- Source page/media presentation without heavy card framing.
- Search, TTS, offline, reconnect/integrity preserved.
- Suppress decorative artwork inside focused reading area.

Implemented so far:
- cleaner focused Reader canvas;
- lighter source-media framing;
- preserved canonical backend lesson media and Stage16 boundaries.

Gate: B03 + Stage16 cold-start/offline/reconnect.

### V07 — Practice / Models / Attempts / Result
- Reference-like header and botanical framing outside focused attempt.
- Practice/models segmented switch.
- Subject/search/filter density.
- Compact catalog/history rows.
- Focused attempt remains distraction-free.

Gate: B04 + Stage15.

### V08 — Library
- Reference visual language.
- Downloads as authoritative real device data.
- Notes/Saved/Review stay fake-free until Stage17.
- Empty/loading/error states in same family.

Gate: B05 + Stage16.

### V09 — Account / Help / Support / Notifications / Progress
- Account grouped sections matching reference.
- Logout isolated as subdued danger action.
- Help/support visual parity.
- Notifications/Progress remain truthful empty/placeholder states until authoritative contracts exist.

Gate: B05 + Stage14.

### V10 — Cross-surface QA and cleanup
- 390px / tablet / desktop screenshot matrix.
- RTL, safe areas, overflow, keyboard/focus, contrast, reduced motion.
- Remove obsolete CSS selectors only after zero-reference verification.
- Bundle/import review and route-lazy verification.
- Update project handoff/status/log.

Gate: exact-head Student workflows all green before merge.

## Implementation rule

Each batch follows:

`Implement -> Run CI -> Visually inspect -> Critique -> Fix -> Verify`

Do not advance a visually broken surface merely because its functional E2E test passed.

## Current progress

Active work is now V01 + V02, while previously started V05/V06 corrections remain in the same branch. After exact-head verification of the shared visual layer and Home, continue in strict order with V03 then V04/V05/V06, V07, V08, V09 and V10.
