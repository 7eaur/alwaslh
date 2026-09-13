# Student Entry & Core Experience Rebuild — 2026-09-13

This checkpoint records the Product Owner-approved expansion of the Student refoundation so the visible product is designed as one coherent learner experience from first install/open through daily learning.

## Binding design criteria

`Clarity → Ease of use → Flow → Visual comfort → Consistency → Polish`

Student-facing copy must explain only what the learner needs to know or do. Do not expose cryptography, device-key implementation, server/session/cache/revision internals, admin terminology or diagnostic details in normal learner UI.

## Experience scope

The unified Student experience now explicitly includes:

- first-open / welcome experience;
- activation;
- returning login;
- recovery guidance;
- help/instructions;
- support/contact guidance;
- authenticated shell;
- Home;
- Learn / Subject / Reader;
- Practice / Assessment;
- Downloads, evolving into My Library when Stage17 exists;
- Account/access management;
- future Notes/Saved/Notifications/Progress placement defined by `STUDENT_PRODUCT_ARCHITECTURE.md` without exposing unfinished routes.

## Current implementation step

The first rebuild step removes the old Entry page's implementation-heavy security prose, introduces a first-run welcome surface, separates Help and Support as reusable product surfaces, and moves account/logout/help ownership into the Account destination instead of wrapping every authenticated screen in an account page.

No Admin work is authorized by this checkpoint.
