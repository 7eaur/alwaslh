# Educational Product Logic

Design around learning and the original Alwaslh product model, not around the repository's internal modules.

## Preserve the product idea

Before changing educational UX, understand the real product from code, migrations, product docs, current flows, and approved brand foundation.

The redesign must preserve:
- the platform's education-first purpose;
- the Student learning journey;
- curriculum hierarchy and entitlement/publication rules;
- distinction between learning content, practice, assessment, result/history, and offline availability;
- the approved Arabic-first identity and interaction tone.

Do not replace the product with a generic LMS pattern simply because an external reference looks cleaner.

## Student mental model

The student should primarily think in terms of:
- my subjects;
- what I am studying now;
- lesson content;
- practice/test;
- what is available offline;
- progress and next step.

Do not expose administrative lifecycle terminology to students unless it helps them act.

Do not expose technical implementation concepts at all when they can be represented as a simple user-facing state.

## Cognitive load

- One dominant goal per learning screen.
- Keep instructions short and placed near the action.
- Prefer progressive disclosure over showing every option immediately.
- Preserve orientation: subject, lesson, progress/position, and exit/back path.
- Split unrelated learning tasks into separate screens/routes rather than a long page of sections.
- Avoid reward mechanics or gamification that distract from the learning goal unless the product explicitly requires them.

## Content hierarchy

Respect the canonical curriculum relationships from code/migrations. Do not invent a new hierarchy in the UI just to make a mockup attractive.

Represent lesson status consistently, such as available/current/completed/locked/offline where these states are supported by real product rules.

The visible hierarchy should match the student's mental model, while implementation relationships stay internal.

## Assessment UX

Maintain the distinction between:
- learning/practice;
- test/assessment;
- finalized result/history.

Never reveal correctness/scoring early when server/product rules intentionally withhold it.

Assessment is a focused task, not another section buried in a dashboard page.

## Display-ready content

Everything visible to the student must read as finished product content.

Do not show:
- developer explanations;
- internal processing descriptions;
- raw status/enum names;
- database/API/storage terminology;
- technical reasons that do not help the student decide what to do next.

Visible text should answer one of these questions:
- Where am I?
- What am I learning?
- What is my current state?
- What can I do next?
- What should I do if something is unavailable?

If text does not help with one of those goals, question why it is visible.

## Error/recovery language

Student-facing messages should say what happened and what the student can do next, not expose stack/API/database terminology.

Examples of useful categories:
- connection unavailable;
- content not downloaded;
- access expired;
- lesson unavailable;
- answer not saved yet;
- session needs reconnection.

Map each message to a real state; do not invent recovery actions that the backend cannot support.
