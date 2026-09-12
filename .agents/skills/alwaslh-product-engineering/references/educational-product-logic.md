# Educational Product Logic

Design around learning, not around the repository's modules.

## Student mental model

The student should primarily think in terms of:
- my subjects
- what I am studying now
- lesson content
- practice/test
- what is available offline
- progress and next step

Do not expose administrative lifecycle terminology to students unless it helps them act.

## Cognitive load

- One dominant goal per learning screen.
- Keep instructions short and placed near the action.
- Prefer progressive disclosure over showing every option immediately.
- Preserve orientation: subject, lesson, progress/position, and exit/back path.
- Avoid reward mechanics or gamification that distract from the learning goal unless the product explicitly requires them.

## Content hierarchy

Respect the canonical curriculum relationships from code/migrations. Do not invent a new hierarchy in the UI just to make a mockup attractive.

Represent lesson status consistently, such as available/current/completed/locked/offline where these states are supported by real product rules.

## Assessment UX

Maintain the distinction between:
- learning/practice
- test/assessment
- finalized result/history

Never reveal correctness/scoring early when server/product rules intentionally withhold it.

## Error/recovery language

Student-facing messages should say what happened and what the student can do next, not expose stack/API/database terminology.

Examples of useful categories:
- connection unavailable
- content not downloaded
- access expired
- lesson unavailable
- answer not saved yet
- session needs reconnection

Map each message to a real state; do not invent recovery actions that the backend cannot support.
