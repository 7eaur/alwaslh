# Super Admin Workspace UX

Treat Admin as an operational workspace for expert tasks, not a student-facing app and not a dashboard made of equal cards.

Core operational chain:

`Curriculum → Content/Ingestion → Media/OCR → AI → Human Review → Question Bank → Quiz Builder → Students/Access → Operations/Audit`

## Information architecture

Group navigation by operator goals and lifecycle stage, not by backend module names.

Use:
- stable global navigation for major work areas;
- contextual navigation within a workflow;
- dedicated routes/pages for major tasks;
- meaningful child pages for deeper operations;
- breadcrumbs only where depth genuinely exists;
- progressive disclosure for advanced/rare operations;
- search/filter only when data volume or retrieval task justifies it.

Do not expose every internal capability as a top-level destination.

## Page architecture

Do not build Admin as one giant scrolling page containing unrelated modules, forms, queues, tables, statistics, and settings.

A page should have a clear task boundary.

Prefer:
- one stable application shell;
- grouped top-level work areas;
- route-level pages for major workflows;
- object/detail pages for a specific lesson, ingestion, question, quiz, student, job, or review item;
- tabs only for tightly related views of the same entity or workflow;
- drawers/dialogs for short focused operations, not as a substitute for proper page hierarchy.

When a page starts accumulating several unrelated primary actions or large independent sections, split it.

Do not make the operator scroll through the entire product to reach a task.

## Dashboard

The dashboard is an overview and launch point, not the entire Admin product.

Every dashboard block must answer a decision or action.

Prefer:
- work needing attention;
- failed/blocked operations;
- review queues;
- recent meaningful changes;
- capacity/health only when actionable;
- shortcuts to frequent workflows.

Avoid decorative KPIs, duplicate counts, cards without a next action, and sections that belong on dedicated pages.

## Dense data patterns

For tables:
- prioritize scanability;
- keep status semantics consistent;
- make sorting/filtering explicit;
- support row actions without action-menu overload;
- use bulk actions only for safe repeatable operations;
- keep destructive actions separated and confirmed;
- preserve useful columns at realistic widths; allow responsive adaptation rather than tiny text.

For forms:
- group by task;
- use clear labels and help only where ambiguity exists;
- keep validation near the field and actionable;
- preserve user input on recoverable failures;
- separate save/publish/approve semantics if the business lifecycle distinguishes them.

## Admin-facing language and data

Use real product/domain terminology, not implementation terminology.

Good operator concepts include curriculum, lesson, publication, ingestion, media, OCR, AI review, Question Bank, quiz, student access, and audit when those are part of the actual workflow.

Do not expose by default:
- database/table names;
- raw API routes;
- cache/storage implementation details;
- cryptographic internals;
- raw enum keys;
- stack traces;
- internal UUIDs that do not help the task.

Technical evidence may be progressively disclosed in dedicated Operations/Audit contexts when it is genuinely useful for diagnosis or action.

Do not render every field from the API. Display the information required to understand status, make a decision, or complete the operation.

## AI and review surfaces

AI is an assistant to the review lifecycle.

Make provenance/status/review state visible enough for operators to trust decisions. Do not present AI output as automatically approved.

Keep the safe chain visible in workflow design:

`AI output → human AI review → Question Bank Draft → QB review/publish → immutable Quiz version`

## Operational states

All changed workflows should account for:
- loading;
- empty queue;
- partial data;
- validation error;
- permission denied;
- conflict/stale data;
- server failure;
- retryable operation;
- long-running job;
- success with next action.
