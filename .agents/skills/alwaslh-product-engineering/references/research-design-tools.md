# Product Design, Mobbin and Figma Routing

These tools support design work. They do not define the product or override repository evidence.

## Before using any external design reference

Read the approved Alwaslh identity and current product flows first.

Mandatory identity sources for redesign work include:

- `packages/brand/BRAND_FOUNDATION.md`;
- `packages/brand/BRAND_GUIDELINES.md`;
- `packages/brand/identity.json`;
- relevant `packages/brand/src/*` tokens;
- current production logo/app-icon assets.

Use external references to improve usability, hierarchy, interaction patterns, and composition while preserving the product's identity.

## Product Design

Use for:
- clarifying product outcomes and user jobs;
- auditing flows and information architecture;
- exploring alternatives before implementation;
- prototyping high-impact flows.

Do not let an exploratory prototype silently become a new business rule.

## Mobbin

Use to study real product patterns for:
- educational/mobile navigation;
- onboarding/activation;
- home/continue-learning surfaces;
- course/lesson hierarchy;
- assessment flows;
- offline/download states;
- admin tables, filters, review queues, and workflow layouts.

Do not copy a screen literally. Extract the interaction principle and test whether it fits Alwaslh's product, Arabic RTL behavior, and identity.

## Figma

Use when a formal visual/design artifact materially improves implementation or review:
- design-system tokens/components;
- reusable component variants/states;
- key Student app flows;
- Admin shell/navigation/workspace hierarchy;
- responsive layouts;
- interaction/prototype review.

Figma is a design artifact, not runtime authority. Code/contracts remain authoritative where they differ.

## Tool order

For a redesign task, prefer:

`Repository/product evidence → Alwaslh identity → flow/IA reasoning → Mobbin research where useful → Product Design exploration → Figma formalization where useful → implementation → browser verification`

Do not add a design-tool step when it does not improve the decision or implementation.

## Copy/data caution

External screenshots may contain labels, metrics, navigation names, or content that do not belong in Alwaslh. Never copy their text blindly.

All final visible copy/data must be written for Alwaslh users and follow `product-content-copy.md`.
