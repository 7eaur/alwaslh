# UX FEATURE PARITY REVIEW

> Stage 3 review against `PRODUCT_FEATURE_PARITY_MATRIX.md`. This review means the **UX architecture contains a destination/flow for each scenario**; it does not mean the scenario is implemented yet.

| Feature group | Target UX coverage | Stage 3 result |
|---|---|---|
| Public entry / PWA install | Student entry + More / Install & Help | COVERED |
| Full-access activation (6-digit) | Entry / Activation flow | COVERED |
| Returning login / recovery / reset | Entry / Account flow | COVERED |
| Class-code activation (7-digit) | More / Access + contextual locked-class flow | COVERED |
| Multiple classes / expiry / renewal | Lessons class switcher + More / Access | COVERED |
| Initial offline download / refresh | First usable session + More / Offline & storage | COVERED |
| Student dashboard | Home | COVERED |
| Classes / subjects / lessons | Lessons hierarchy | COVERED |
| Lesson reader pages/images | Reader | COVERED |
| Zoom / pan / page navigation | Reader contextual tools | COVERED |
| Summary | Reader / Summary action | COVERED |
| Lesson practice | Reader / Practice action | COVERED |
| Reader font/alignment/theme prefs | Reader settings sheet | COVERED |
| Previous / next lesson | Reader navigation | COVERED |
| Text/image/capture/audio notes | Notes + Reader add-note flow | COVERED |
| Saved questions + provenance | Notes / Saved tab + Reader/Quiz bookmark | COVERED |
| Quiz catalog/filter | Quizzes | COVERED |
| Multi-lesson quizzes | Quiz pre-start scope | COVERED |
| Multiple versions / randomized version | Quiz start contract | COVERED |
| Option shuffle | Practice session contract | COVERED |
| Explanation / images | Practice question state | COVERED |
| Resume / restart | Quiz pre-start + session restore | COVERED |
| Offline attempt flow | Practice + explicit pending-sync state | COVERED |
| Attempts / statistics | More / Progress | COVERED |
| Achievements / rank | More / Achievements & rank | COVERED |
| Student notifications | More / Notifications + actionable Home items | COVERED |
| Admin overview | Overview | COVERED |
| Classes / subjects CRUD | Content / Classes & Subjects | COVERED |
| Lessons CRUD | Content / Lessons | COVERED |
| Image/PDF/mixed upload | Upload & Processing | COVERED |
| Compression/progress/tasks/order review | Upload & Processing | COVERED |
| Page detection/re-analysis/save pages | Upload & Processing + AI review | COVERED |
| AI summary/text/questions/image/exact/bulk modes | contextual create actions + AI Operations | COVERED |
| AI edit/delete/regenerate/review | AI review + question editor | COVERED |
| Quiz builder / versions/settings | Assessment & AI / Quizzes | COVERED |
| Full-access code generate/list/search/sort/import/export/cards/history | Students & Access / Full Access Codes | COVERED |
| Class-code generate/list/export/redemption/renewal | Students & Access / Class Codes | COVERED |
| Accounts/student management | Students & Access / Students | COVERED |
| Admin notifications | Communication / Notifications | COVERED |
| Export PDF/Excel/cards/history/image variants | Reports + contextual Export actions | COVERED |
| Admin settings/security | System / Settings + Security | COVERED |
| AI job progress/retry/cancel/failure visibility | AI Operations | COVERED |
| Multi-project/provider operational health | AI Operations (non-secret metadata only) | COVERED |
| New owned identity | Brand package applied to both product shells | COVERED |
| Admin/Student separation | Separate IA/shell contracts | COVERED |
| Accessibility/RTL/responsive | cross-product UX contract | COVERED |

## Review notes

- UX coverage intentionally reorganizes legacy screens rather than preserving old page boundaries.
- AI task types remain one capability set; `AI Operations` is an operational surface, not a replacement for contextual actions in Lessons/Quizzes.
- Notes and Saved Questions stay easy to reach without adding another permanent bottom-nav destination.
- Progress, achievements, notifications, activation/help remain available under `More` because they are lower-frequency than Home/Lessons/Quizzes/Notes.
- Export actions remain contextual where source selection matters, while generated artifacts/history live in Reports.
- No old scenario is marked REMOVE in this Stage 3 review.

**Stage 3 parity result: PASS at UX-architecture level. Implementation parity remains future work and is not claimed here.**
