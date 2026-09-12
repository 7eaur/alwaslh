# Super Admin Workspace UX

Treat Admin as an operational workspace for expert tasks, not a student-facing app and not a dashboard made of equal cards.

Core operational chain:

`Curriculum → Content/Ingestion → Media/OCR → AI → Human Review → Question Bank → Quiz Builder → Students/Access → Operations/Audit`

## Information architecture

Group navigation by operator goals and lifecycle stage, not by backend module names.

Use:
- stable global navigation for major work areas
- contextual navigation within a workflow
- breadcrumbs only where depth genuinely exists
- progressive disclosure for advanced/rare operations
- search/filter only when data volume or retrieval task justifies it

Do not expose every internal capability as a top-level destination.

## Dashboard

Every dashboard block must answer a decision or action.

Prefer:
- work needing attention
- failed/blocked operations
- review queues
- recent meaningful changes
- capacity/health only when actionable
- shortcuts to frequent workflows

Avoid decorative KPIs, duplicate counts, and cards without a next action.

## Dense data patterns

For tables:
- prioritize scanability
- keep status semantics consistent
- make sorting/filtering explicit
- support row actions without action-menu overload
- use bulk actions only for safe repeatable operations
- keep destructive actions separated and confirmed
- preserve useful columns at realistic widths; allow responsive adaptation rather than tiny text

For forms:
- group by task
- use clear labels and help only where ambiguity exists
- keep validation near the field and actionable
- preserve user input on recoverable failures
- separate save/publish/approve semantics if the business lifecycle distinguishes them

## AI and review surfaces

AI is an assistant to the review lifecycle.

Make provenance/status/review state visible enough for operators to trust decisions. Do not present AI output as automatically approved.

Keep the safe chain visible in workflow design:

`AI output → human AI review → Question Bank Draft → QB review/publish → immutable Quiz version`

## Operational states

All changed workflows should account for:
- loading
- empty queue
- partial data
- validation error
- permission denied
- conflict/stale data
- server failure
- retryable operation
- long-running job
- success with next action
