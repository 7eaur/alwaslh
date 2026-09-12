# Product Content & Display Copy

Every visible word and data point must be written for the person using the product, not for the engineers who implemented it.

## Core rule

**Production UI copy must be presentation-ready, correct, concise, and actionable.**

Do not expose backend implementation details simply because they exist in code or API responses.

## Never expose by default

Do not show these concepts to Students and do not show them to Admin operators unless the task genuinely requires technical operations/troubleshooting:

- API route names;
- database/table/column names;
- IndexedDB/localStorage/cache implementation details;
- Service Worker terminology;
- P-256 / ES256 / signatures / key IDs;
- sync cursors/checkpoints/tombstones/revision internals;
- raw UUIDs or internal identifiers;
- stack traces, exception names, provider internals, or infrastructure jargon;
- developer notes, TODO text, placeholder explanations, or statements about what happens "in the background".

Internal state should be translated into a user-meaningful state.

Examples:

- `offline package verified` → `متاح بدون إنترنت`
- `authorization expired` → `يحتاج الاتصال بالإنترنت لتجديد الوصول`
- `network request failed` → `تعذر الاتصال. تحقق من الإنترنت وحاول مجددًا.`
- `revision changed` → `يتوفر إصدار أحدث من الدرس`

Use these only when they accurately map to real supported behavior.

## Student copy

Student language must be:

- short;
- natural Arabic;
- age-appropriate without sounding childish;
- focused on the learning task;
- free from engineering/administrative terminology;
- explicit about the next useful action.

A Student screen should explain only what the student needs to know to continue learning.

Do not turn infrastructure state into educational content.

## Admin copy

Admin can use domain terminology needed to operate the product, such as curriculum, publication, review, question bank, quiz version, access, ingestion, or OCR where those are real operator concepts.

Still avoid implementation jargon unless the operator is in a dedicated technical/operations view and needs it to act.

Prefer domain language over code language:

- user goal/status first;
- internal IDs second and only when operationally useful;
- detailed technical evidence progressively disclosed.

## Data presentation

Do not render every field merely because the API returned it.

For every visible data point ask:

1. Does the user need this to understand the current state?
2. Does it help make a decision or perform an action?
3. Is this the correct human-readable label/value?
4. Does showing it create unnecessary cognitive load?

Hide irrelevant/internal fields.

Do not ship fake KPIs, invented totals, fake success claims, or decorative statistics. If real data is unavailable, use an honest empty/loading/not-available state.

## Ready-to-display requirement

Before approving a screen, verify all visible copy is final-quality UI copy:

- no lorem ipsum;
- no TODO/placeholder/developer instructions;
- no raw enum keys such as `PUBLISHED_PENDING_SYNC`;
- no explanatory prose about backend behavior;
- no mixed terminology for the same concept;
- no button labels describing implementation instead of intent;
- no duplicated headings/helper text.

Buttons should describe the user's intended action: `متابعة الدرس`, `بدء التدريب`, `حفظ`, `نشر`, `مراجعة` — not implementation steps.

## Screen content hierarchy

Visible content follows this priority:

`user goal → current state → primary action → necessary supporting information → secondary actions → optional details`

Anything outside this hierarchy should have a clear reason to remain visible.
