# Student Visual Source of Truth

Status: **ACTIVE**

This document fixes the approved visual direction for the Student experience. It is a visual implementation contract, not a replacement for product/backend authority.

## Reference direction

The approved Student UI must stay very close to the latest user-approved reference screens supplied for:

- Welcome / activation
- Login
- Home
- Learn
- Subject / units / lessons
- Practice
- Account

The reference style is the primary visual benchmark for composition, density, spacing, card treatment, botanical decoration, icon treatment, and navigation feel.

## Non-negotiable visual language

- Arabic-first / RTL-first.
- Calm white/off-white canvas.
- Brand teal as the controlled accent, with dark teal for accessible text/actions.
- Dark ink headings with restrained secondary gray text.
- Soft botanical/leaf artwork and pale abstract shapes used as framing decoration, especially in top/empty areas.
- White cards with light borders, soft elevation, and rounded corners; not every element becomes a card.
- Clear large-but-not-oversized page hierarchy.
- Rounded square icon wells using very light mint.
- Bottom navigation remains four destinations: Home / Learn / Practice / Library.
- Account remains an App Bar action, not a fifth bottom-tab destination.
- Home/App screens should feel like a native learning app, not a website dashboard.
- Reader and active assessment remain focused experiences and do not inherit decorative clutter.

## Data truth boundary

Visual parity must not invent product data.

- Stats are shown only when backed by authoritative contracts.
- Notes/Saved/Review/Notifications/Progress remain fake-free until their contracts are authoritative.
- Educational lesson media remains canonical backend-published media; reference artwork does not replace textbook/source pages silently.
- Class labels are contextual from real access/catalog data and are not treated as permanent profile identity.

## Botanical motif rules

- Decorative only; never carries essential information.
- Opacity must remain low enough not to reduce text contrast.
- No large gradients or glowing effects.
- Prefer reusable SVG/CSS motifs over heavy raster backgrounds.
- Hide/reduce motifs in Reader, Assessment, very dense lists, or reduced-motion/accessibility-sensitive contexts when needed.

## Surface-specific target

### Welcome / Auth
Large centered brand lockup, botanical framing, short copy, one dominant action, one secondary action. Keep forms visually simple and high-contrast.

### Home
Brand App Bar + quiet botanical hero + concise welcome copy. Quick stats and Library can use grouped cards similar to the approved reference. Subjects remain compact rows. Recent attempt is optional and only appears with real data.

### Learn
Page title, class context selector only when real/needed, search only when scale requires it, compact subject rows with icon wells.

### Subject
Centered/entity page heading, search only when scale requires it, grouped units with compact lesson rows, clear lesson number, summary/questions affordances only when real.

### Practice
Reference-style top heading and botanical framing, two-tab mode switch, compact subject selector/search, training/model rows, recent attempts.

### Library
Same card language as reference Home/Account. Downloads real; Notes/Saved/Review remain clear empty states until contracts exist.

### Account
Grouped sections: Access & Content / Help / My Space. Destructive logout isolated at bottom. Do not fake settings that backend does not support.

### Reader
Minimal reading canvas. Decorative plant art is removed or strongly suppressed. Source media is full-width within a controlled reading width without a heavy card frame.

## Acceptance criteria

A Student surface is not visually complete until it passes:

1. 390px phone QA.
2. Tablet QA.
3. Desktop QA.
4. RTL alignment and no horizontal overflow.
5. Safe-area and bottom-nav clearance.
6. Touch targets >= 44px where interactive.
7. Reduced-motion behavior.
8. No fake data.
9. Same visual family as the approved reference screens.
