# PRODUCT FEATURE PARITY MATRIX

> Purpose: guarantee that the rebuilt **الوسيلة الذكية** preserves every meaningful feature and user scenario from the current product while improving implementation, security, speed, UX and maintainability.
>
> No feature is removed merely because its current code is poor. A feature may be **REBUILT** or its unsafe implementation may be replaced while preserving the user/business outcome.

## Status vocabulary

- **KEEP** — behavior is valid; preserve with minimal product change.
- **IMPROVE** — preserve behavior and improve UX/performance/clarity.
- **REFACTOR** — preserve behavior, move to cleaner shared architecture.
- **REBUILD** — same business outcome, new safe implementation.
- **REPLACE** — unsafe/obsolete mechanism replaced by a safer equivalent outcome.
- **VERIFY** — current intended business behavior needs confirmation before implementation.

---

# 1. Public / Entry / PWA

| ID | Existing feature/scenario | Current evidence | Target | Rebuild acceptance |
|---|---|---|---|---|
| PUB-001 | Public landing / student entry | `/` | IMPROVE | Fast mobile-first entry with clear student action and discreet admin entry |
| PUB-002 | Separate admin login route | `/admin-login` | KEEP/IMPROVE | Admin authentication visually/product-wise separate from student experience |
| PUB-003 | Student login route compatibility | `/student-login` | KEEP | Existing deep links continue or redirect cleanly |
| PUB-004 | RTL Arabic-first app | global HTML/CSS | KEEP/IMPROVE | Full RTL with consistent logical spacing/icons/forms |
| PUB-005 | PWA install prompt | `PWAInstallPrompt` | REFACTOR | Correct browser-specific installation flow, no stale cross-device prompt state |
| PUB-006 | Standalone installed experience | manifest/SW | REBUILD | Reliable update lifecycle, no unregister/re-register loops |
| PUB-007 | Offline indicator | `OnlineStatusIndicator` | IMPROVE | Distinguish offline/backend unreachable/sync pending subtly |
| PUB-008 | App onboarding/tutorial | `Onboarding` | REBUILD copy/system | Tutorial is generated from current feature/navigation contract and never references retired screens |
| PUB-009 | Support/contact access | Footer/layout | IMPROVE | Support remains accessible but does not clutter every learning screen |
| PUB-010 | Copyright/brand footer | Footer | REBUILD identity | New identity/copy in central BrandConfig |

---

# 2. Student Identity / Full Access Activation

| ID | Existing feature/scenario | Target | Rebuild acceptance |
|---|---|---|---|
| AUTH-S-001 | Enter 6-digit full-access code first time | REBUILD | Server atomically validates/claims code and creates account |
| AUTH-S-002 | One-time activation code consumption | REBUILD | Concurrency-safe, idempotent and audited |
| AUTH-S-003 | Student chooses/receives password/PIN after activation | REPLACE unsafe storage | Credential owned only by Auth; application DB never stores retrievable password |
| AUTH-S-004 | Returning student login | IMPROVE | Simple account login with clear errors and session restoration |
| AUTH-S-005 | Automatic session restore | REFACTOR | Trusted Auth session first; cached UI does not impersonate a valid session |
| AUTH-S-006 | Account works after browser/app reinstall | REBUILD recovery | Secure account recovery, not browser fingerprint as credential |
| AUTH-S-007 | Device recognition for UX | IMPROVE | Optional device/session metadata only, never sole security proof |
| AUTH-S-008 | Legacy student migration | REBUILD migration | One-time authenticated/idempotent migration path with ownership proof |
| AUTH-S-009 | Reset code/account by administrator | REBUILD | Account/code/entitlement/local-state semantics explicitly defined and auditable |
| AUTH-S-010 | Forced logout when account is deleted/reset | KEEP/REBUILD | Online validation revokes session; local private state cleared according to contract |
| AUTH-S-011 | Offline launch after prior valid login | REBUILD | Limited account-scoped offline authorization snapshot permits cached reading only |
| AUTH-S-012 | Expired full access handling | IMPROVE | Clear expiry state; server prevents unauthorized content refresh/download |
| AUTH-S-013 | Admin can see student account status | IMPROVE | Status derives from canonical account + entitlement model |
| AUTH-S-014 | Admin can reset student access | KEEP/REBUILD | Safe revoke/reset action with confirmation and audit log |
| AUTH-S-015 | Admin can reveal student password | REPLACE | Replace with password-reset/recovery action; original password is never revealed |

---

# 3. Class Access Codes / Entitlements

| ID | Existing feature/scenario | Target | Rebuild acceptance |
|---|---|---|---|
| ENT-001 | Student can enter a 7-digit class code | REBUILD | Transactional redemption endpoint |
| ENT-002 | Class code unlocks all subjects/content in class | KEEP/REBUILD enforcement | Server-side entitlement controls data and storage, not UI only |
| ENT-003 | Multiple class activations per student | KEEP | Entitlement list supports multiple active classes |
| ENT-004 | Class-code expiry | KEEP/IMPROVE | Canonical expiry and clear state |
| ENT-005 | Prevent repeated/reused single-use code | REBUILD | DB transaction guarantees one redemption |
| ENT-006 | Renew class access with a new code | IMPROVE | Existing entitlement is extended/replaced according to defined rule; new code is not wasted |
| ENT-007 | View currently activated classes | KEEP | Student entitlement page clearly lists access/expiry |
| ENT-008 | Full-access account bypasses class locks | KEEP | Canonical `all_content` entitlement |
| ENT-009 | Admin generates class codes | REBUILD backend | Cryptographic server generation with uniqueness/format validation |
| ENT-010 | Admin filters/sorts/searches class codes | KEEP/IMPROVE | Server-side pagination/filter/sort |
| ENT-011 | Admin exports class codes CSV | KEEP/IMPROVE | Proper CSV escaping and explicit scope |
| ENT-012 | Admin exports printable code cards | KEEP/REFACTOR | New identity/template; selected/filtered/all scope explicit |
| ENT-013 | Admin deletes class codes | KEEP/REBUILD semantics | Deleting unused code and revoking redeemed entitlement are separate explicit operations |
| ENT-014 | Admin bulk deletes class codes | KEEP | Server batch action + audit/log/result summary |
| ENT-015 | Track code used/unused state | KEEP | Include redeemed-by account and redeemed-at metadata where authorized |

---

# 4. Student Dashboard

| ID | Existing feature/scenario | Target | Rebuild acceptance |
|---|---|---|---|
| SD-001 | Student dashboard/home | REBUILD UX | Calm mobile-first home focused on continuing learning |
| SD-002 | Display available/activated classes | KEEP | Server-entitled classes only |
| SD-003 | Quick access to lessons | KEEP/IMPROVE | Continue/recent lesson and clear class cards |
| SD-004 | Quick access to quizzes | KEEP/IMPROVE | Relevant practice shortcut, not decorative clutter |
| SD-005 | Show last login | KEEP if business still desired | Accurate account timestamp with offline cached display |
| SD-006 | Show learning stats summary | KEEP/IMPROVE | Trusted metrics with clear labels |
| SD-007 | Manual refresh | REFACTOR | One sync engine, predictable progress/status |
| SD-008 | Background refresh/new-content behavior | REBUILD | Content revision/delta sync instead of ad-hoc latest-class check |
| SD-009 | Offline cached-first rendering | KEEP/REBUILD | Fast local rendering from account-scoped repository |
| SD-010 | Initial offline content download | REBUILD | Entitlement-aware, resumable, partial-failure aware |

---

# 5. Class / Subject / Lesson Browsing

| ID | Existing feature/scenario | Target | Rebuild acceptance |
|---|---|---|---|
| CONTENT-S-001 | Class → subject → lessons hierarchy | KEEP | Same mental model and business hierarchy |
| CONTENT-S-002 | Select class | KEEP/IMPROVE | Simple selector/cards; remembers choice per account/device |
| CONTENT-S-003 | Select subject | KEEP | Clear subject navigation |
| CONTENT-S-004 | Lesson list ordered by page | KEEP | Deterministic server/order field |
| CONTENT-S-005 | Lesson thumbnails | KEEP/IMPROVE | Stable aspect ratio, lazy media, low CLS |
| CONTENT-S-006 | Locked content visual state | KEEP but secondary | UI lock reflects actual server entitlement rather than pretending to enforce it |
| CONTENT-S-007 | Manual lesson-list refresh | REFACTOR | Uses shared sync engine |
| CONTENT-S-008 | Realtime/new content update | IMPROVE | Scoped revision invalidation, not full list refetch for every event |
| CONTENT-S-009 | Offline lesson listing | KEEP | Deletions/updates/tombstones handled correctly |
| CONTENT-S-010 | Navigate previous/next lesson | KEEP | Based on stable content order |

---

# 6. Student Lesson Reader

| ID | Existing feature/scenario | Target | Rebuild acceptance |
|---|---|---|---|
| READ-001 | Open lesson detail | KEEP/REBUILD UX | Fast reader workspace |
| READ-002 | View one or multiple lesson images/pages | KEEP | Reliable media loading/offline support |
| READ-003 | Zoom lesson image | KEEP | Accessible zoom controls and native pinch where possible |
| READ-004 | Pan zoomed image | KEEP | Smooth touch/pointer interaction |
| READ-005 | Summary tab | KEEP | Render validated generated summary |
| READ-006 | Interactive lesson questions tab | KEEP/REFACTOR | Uses shared PracticeEngine |
| READ-007 | Notes tab | KEEP/REFACTOR | Dedicated NotesPanel |
| READ-008 | Change content font size | KEEP/IMPROVE | Persist reader preference |
| READ-009 | Change quiz font size | KEEP/IMPROVE | Shared readable preference |
| READ-010 | Text alignment control | KEEP if still useful | Persist device preference, simplified UI |
| READ-011 | Reader dark/light mode | KEEP/REBUILD | Coherent theme/reader mode, not page-local hardcoded surfaces |
| READ-012 | Download/view lesson media offline | KEEP | Authorized media manifest/cache with quota management |
| READ-013 | View last attempt | KEEP/IMPROVE | Accurate attempt metadata |
| READ-014 | Resume lesson practice | REBUILD state machine | Resume exact answer state without duplicate answer corruption |
| READ-015 | Restart lesson practice | KEEP | Clears intended session safely |
| READ-016 | Save current question | KEEP | Stable question/source identifier |
| READ-017 | Navigate back to lesson list | KEEP | Clear mobile navigation |
| READ-018 | Realtime refresh after admin AI/content update | IMPROVE | Update reader + offline repository consistently |

---

# 7. Student Notes / Saved Questions

| ID | Existing feature/scenario | Target | Rebuild acceptance |
|---|---|---|---|
| NOTE-001 | Local-only personal notes | KEEP product rule | Explicitly local/private unless business rule changes |
| NOTE-002 | Text note | KEEP | Account-scoped local persistence |
| NOTE-003 | Image note | KEEP | Store Blob, not base64 |
| NOTE-004 | Camera/capture note | KEEP | Correct media type and cleanup |
| NOTE-005 | Audio/voice note | KEEP/FIX | Correct audio type/renderer; no image misclassification |
| NOTE-006 | Note description/caption | KEEP | Typed metadata |
| NOTE-007 | Associate note to lesson | KEEP | Stable lesson relation and cached title snapshot |
| NOTE-008 | Delete note | KEEP | Clear confirmation/undo where appropriate |
| NOTE-009 | Notes list page | REBUILD UX | Search/filter/group by lesson without card overload |
| NOTE-010 | Saved/bookmarked questions | KEEP | Stable UUID/source; no cross-lesson collisions |
| NOTE-011 | Saved question retains source lesson/page/context | IMPROVE | Explicit source lesson/page/question ID |
| NOTE-012 | Offline use | KEEP | Native because local repository is canonical |
| NOTE-013 | Account reset/logout handling | REBUILD | Clear/retain behavior explicitly documented and tested |
| NOTE-014 | Server sync for notes/bookmarks | VERIFY business rule | Current PRD says local-only; do not reintroduce fake queues unless backup/sync is intentionally added |

---

# 8. Student Quizzes / Practice

| ID | Existing feature/scenario | Target | Rebuild acceptance |
|---|---|---|---|
| QUIZ-S-001 | Quiz catalog | KEEP/REBUILD UX | Simple class/subject filtering and meaningful empty states |
| QUIZ-S-002 | Filter quizzes by class | KEEP | Entitled classes only |
| QUIZ-S-003 | Filter by subject | KEEP | Efficient server/local projection |
| QUIZ-S-004 | Quiz can include multiple lessons | KEEP | Normalized quiz-source relation |
| QUIZ-S-005 | Multiple quiz versions/models | KEEP | Stable version IDs/names |
| QUIZ-S-006 | Random version selection | KEEP | Reproducible session stores selected version |
| QUIZ-S-007 | Explicit version selection when offered | KEEP | Clear UI if current behavior exposes it |
| QUIZ-S-008 | Shuffle options | KEEP/FIX | Shuffle stable IDs, not text values |
| QUIZ-S-009 | Show correctness after answer | KEEP | Practice classification clear |
| QUIZ-S-010 | Explanation/method after answer | KEEP | Scientific formatting contract preserved |
| QUIZ-S-011 | Lesson/page image tied to question | KEEP/FIX provenance | Each question knows real source lesson/page |
| QUIZ-S-012 | Save/bookmark quiz question | KEEP/FIX | Correct source relation, no first-lesson shortcut |
| QUIZ-S-013 | Persist progress | KEEP/REBUILD | Shared session state machine/outbox |
| QUIZ-S-014 | Resume unfinished quiz | KEEP/FIX | Exact state restored |
| QUIZ-S-015 | Restart quiz | KEEP | Explicit reset |
| QUIZ-S-016 | Save attempt | KEEP | Idempotent attempt ID; offline outbox if server history matters |
| QUIZ-S-017 | Show score/result | KEEP | Score derived deterministically from answers |
| QUIZ-S-018 | Version name stored with attempt | KEEP | Stable version relation/snapshot |
| QUIZ-S-019 | Offline quiz access | KEEP | Authorized cached quiz package |
| QUIZ-S-020 | Offline attempt then later sync | REBUILD | Real outbox + idempotent sync, or clearly local-only if intentionally changed |
| QUIZ-S-021 | Award achievement for high score | KEEP/REBUILD trust | Server-derived trusted award |
| QUIZ-S-022 | Attempt/history cache | REFACTOR | Account-scoped repository, no duplicate localStorage caches |

---

# 9. Student Statistics / Achievements / Ranking

| ID | Existing feature/scenario | Target | Rebuild acceptance |
|---|---|---|---|
| STAT-001 | Notes count | KEEP | Reads canonical local note repository |
| STAT-002 | Interactive questions answered | KEEP | Defined metric contract |
| STAT-003 | Correct answers | KEEP | Derived from trusted/local sessions as labelled |
| STAT-004 | Average score | KEEP | Correct formula and data source |
| STAT-005 | Completion rate | KEEP | Per-record and global formulas separated |
| STAT-006 | Completed lessons/practices | KEEP | Explicit definition |
| STAT-007 | Progress points | VERIFY/IMPROVE | Preserve if meaningful; formalize rule rather than hidden formula |
| STAT-008 | Student ranking | KEEP/REBUILD | Trusted server attempts only; own rank privacy |
| STAT-009 | Achievements/badges | KEEP/REBUILD | Typed award catalog + server rules |
| STAT-010 | Recent practice records | KEEP/IMPROVE | Show lesson/quiz title, subject and date |
| STAT-011 | Record detail dialog | KEEP/FIX | Shows selected record values, not global aggregate |
| STAT-012 | Offline statistics | IMPROVE | Local practice stats available; server ranking clearly unavailable/stale offline |

---

# 10. Student Notifications

| ID | Existing feature/scenario | Target | Rebuild acceptance |
|---|---|---|---|
| NOTIF-S-001 | Global notifications feed | KEEP | Fast cached feed |
| NOTIF-S-002 | Latest notifications on student experience | KEEP/IMPROVE | Clear importance/time hierarchy |
| NOTIF-S-003 | Manual/background refresh | REFACTOR | Shared repository/sync mechanism |
| NOTIF-S-004 | Notification badge | IMPROVE | Real unread/last-seen state |
| NOTIF-S-005 | Offline cached notifications | KEEP | Account/app scoped cache |
| NOTIF-S-006 | Targeted notification support | IMPROVE extensibility | Data model permits audience without forcing it into first rebuild if not required |
| NOTIF-S-007 | Deep-link/action support | IMPROVE extensibility | Optional future CTA schema |

---

# 11. Admin Dashboard / Shell

| ID | Existing feature/scenario | Target | Rebuild acceptance |
|---|---|---|---|
| ADMIN-001 | Admin dashboard home | REBUILD | Real operational dashboard |
| ADMIN-002 | Counts for classes | KEEP/IMPROVE | Aggregate query |
| ADMIN-003 | Counts for subjects | KEEP/IMPROVE | Aggregate query |
| ADMIN-004 | Counts for lessons | KEEP/IMPROVE | Aggregate query |
| ADMIN-005 | Access/account usage counts | KEEP/IMPROVE | Canonical metrics |
| ADMIN-006 | Latest notifications/activity | REBUILD | Real events, not placeholder text |
| ADMIN-007 | Admin navigation | REBUILD IA | Grouped by domain |
| ADMIN-008 | Responsive mobile admin shell | KEEP/IMPROVE | Functional but admin remains desktop/tablet optimized |
| ADMIN-009 | Admin onboarding | IMPROVE | Accurate, concise and optional |
| ADMIN-010 | Security/admin credential controls | MOVE/REBUILD | Settings > Security, not dashboard |

---

# 12. Admin Classes / Subjects

| ID | Existing feature/scenario | Target | Rebuild acceptance |
|---|---|---|---|
| CLASS-A-001 | List classes | KEEP | Server pagination if scale requires |
| CLASS-A-002 | Create class | KEEP | Typed validated form |
| CLASS-A-003 | Rename/edit class | KEEP | Mutation with optimistic/clear feedback |
| CLASS-A-004 | Delete class | KEEP | Dependency impact shown/handled |
| CLASS-A-005 | List subjects by class | KEEP | Efficient query/tree view |
| CLASS-A-006 | Create subject | KEEP | Unique/business constraints applied |
| CLASS-A-007 | Edit subject | KEEP | Typed form |
| CLASS-A-008 | Delete subject | KEEP | Clear cascading-content consequence |
| CLASS-A-009 | Move primary subject class | KEEP | Transactional relation change |
| CLASS-A-010 | Link subject to extra classes | KEEP | Explicit relation + admin-only permission |
| CLASS-A-011 | Remove extra-class link | KEEP | Explicit mutation |
| CLASS-A-012 | Cache fast admin list | REFACTOR | Query cache, not hand-built string-key cache |

---

# 13. Admin Lessons / Content Authoring

| ID | Existing feature/scenario | Target | Rebuild acceptance |
|---|---|---|---|
| LES-A-001 | Lesson list | KEEP/REBUILD screen | Server pagination/filter/sort/search |
| LES-A-002 | Filter by class | KEEP | Efficient query |
| LES-A-003 | Filter by subject | KEEP | Efficient query |
| LES-A-004 | Search lesson | KEEP | Server-side or indexed query |
| LES-A-005 | Preview lesson | KEEP | Dedicated preview drawer/route |
| LES-A-006 | Edit lesson title | KEEP | Inline/editor mutation |
| LES-A-007 | Edit page number/order | KEEP | Validated deterministic order |
| LES-A-008 | Delete lesson | KEEP | Storage/quiz/source dependency handling |
| LES-A-009 | Bulk select lessons | KEEP | Stable table selection |
| LES-A-010 | Upload image files | KEEP/REFACTOR | Ordered media pipeline |
| LES-A-011 | Upload PDF | KEEP/REFACTOR | Self-hosted PDF worker, ordered page extraction |
| LES-A-012 | Mix PDFs/images in upload | KEEP/FIX | Original chosen order preserved |
| LES-A-013 | Compress images | KEEP/REFACTOR | One media pipeline with display/AI profiles |
| LES-A-014 | Upload progress | KEEP | Durable upload/job status |
| LES-A-015 | Upload task history/archive | KEEP/REBUILD | Admin-owned task table with safe RLS |
| LES-A-016 | Detect lesson/page boundaries with AI | KEEP/REBUILD jobs | Durable job with result review |
| LES-A-017 | Re-run page detection | KEEP | Versioned job |
| LES-A-018 | Edit detected page metadata before save | KEEP | Workbench review step |
| LES-A-019 | Batch save detected lessons | KEEP | Transactional/retryable save |
| LES-A-020 | Generate lesson summary | KEEP/REBUILD AI | Durable job + prompt/version metadata |
| LES-A-021 | Extract text | KEEP | Structured result with coverage metadata |
| LES-A-022 | Generate interactive questions | KEEP | Strict schema/validation |
| LES-A-023 | Question type MCQ | KEEP | Preserve generation rules |
| LES-A-024 | Question type True/False | KEEP | Preserve generation rules |
| LES-A-025 | Mixed question types | KEEP | Requested counts enforced |
| LES-A-026 | Extract questions from source image | KEEP | Extraction mode does not invent content |
| LES-A-027 | Replica/exact question generation | KEEP | Exactness contract/uncertainty handling |
| LES-A-028 | Comprehensive generation | KEEP/REBUILD orchestration | Parent job with resumable subtasks |
| LES-A-029 | Edit summary | KEEP | Typed content editor |
| LES-A-030 | Delete summary | KEEP | Clear state |
| LES-A-031 | Edit generated question | KEEP | Question editor |
| LES-A-032 | Delete generated question | KEEP | Stable IDs |
| LES-A-033 | Add/manual question capability where present | KEEP/VERIFY exact current path | Unified question editor |
| LES-A-034 | Bulk generate across selected lessons | KEEP/REBUILD | Queue with bounded concurrency/priority |
| LES-A-035 | Background generation visible while navigating admin | KEEP/REBUILD | Jobs survive tab/browser navigation |
| LES-A-036 | Cancel generation task | KEEP/REBUILD | Durable cancellation checks |
| LES-A-037 | Retry failed generation | IMPROVE | First-class retry from AI Operations |
| LES-A-038 | Export selected lesson content | KEEP | New safe print/export templates |
| LES-A-039 | Export history | KEEP/IMPROVE | Admin-only and filterable |

---

# 14. Admin Quizzes

| ID | Existing feature/scenario | Target | Rebuild acceptance |
|---|---|---|---|
| QADMIN-001 | List quizzes | KEEP | Server pagination/filter/search |
| QADMIN-002 | Create quiz | KEEP | Dedicated builder |
| QADMIN-003 | Edit quiz title/metadata | KEEP | Typed form |
| QADMIN-004 | Delete quiz | KEEP | One documented soft/hard-delete model |
| QADMIN-005 | Select class/subject | KEEP | Canonical relations |
| QADMIN-006 | Select one/multiple lessons | KEEP | Normalized quiz_lessons relation |
| QADMIN-007 | Build quiz from lesson summary/text | KEEP | Source coverage visible |
| QADMIN-008 | Generate MCQ count | KEEP | Strict requested count validation |
| QADMIN-009 | Generate True/False count | KEEP | Strict count validation |
| QADMIN-010 | Mixed counts | KEEP | Exact count/type rules |
| QADMIN-011 | Generate from images | KEEP | AI source pipeline |
| QADMIN-012 | Exact exam-paper extraction mode | KEEP | Preserve source count/order/type/options; unknown answers remain reviewable |
| QADMIN-013 | Multiple quiz versions | KEEP | Version table/model |
| QADMIN-014 | Per-version lesson/source selection | KEEP | Explicit version sources |
| QADMIN-015 | Per-version question count/settings | KEEP | Typed settings |
| QADMIN-016 | Generate one version | KEEP | Durable child job |
| QADMIN-017 | Generate all versions | KEEP/REBUILD | Parallelism bounded by scheduler, not serial UI loop |
| QADMIN-018 | Add/remove version | KEEP | Stable IDs/order |
| QADMIN-019 | Edit generated question | KEEP | Shared QuestionEditor |
| QADMIN-020 | Add manual question | KEEP | Shared QuestionEditor |
| QADMIN-021 | Remove question | KEEP | Stable mutation |
| QADMIN-022 | Regenerate one question | KEEP/REBUILD AI | Source/context retained, validation required |
| QADMIN-023 | Preserve explanation/method/source reference/page | KEEP | Shared question schema |
| QADMIN-024 | Export quiz to Excel | KEEP | Sanitized/lazy export |
| QADMIN-025 | Export quiz to PDF | KEEP | New identity/safe template |
| QADMIN-026 | Export selected versions | KEEP | Explicit selection |
| QADMIN-027 | PDF: questions + all options | KEEP | Complete export |
| QADMIN-028 | PDF: questions only | KEEP | Complete export |
| QADMIN-029 | PDF: questions + correct answers | KEEP | Complete export |
| QADMIN-030 | PDF: answers + explanations | KEEP | Complete export |
| QADMIN-031 | PDF: answer key only | KEEP | Complete export |
| QADMIN-032 | PDF: lesson images only | KEEP/FIX | Export all chosen images or explicit limit; no silent first-two truncation |
| QADMIN-033 | PDF: lesson names only | KEEP | Correct source metadata |

---

# 15. Admin Full-Access Codes

| ID | Existing feature/scenario | Target | Rebuild acceptance |
|---|---|---|---|
| CODE-A-001 | Generate full-access codes | REBUILD backend | Exact 6-digit format from one shared schema |
| CODE-A-002 | Generate many codes in batches | KEEP/REBUILD | Server batch, cryptographic random, collision-safe |
| CODE-A-003 | List codes | KEEP | Server pagination |
| CODE-A-004 | Search code | KEEP | Server filter |
| CODE-A-005 | Sort code/state/dates | KEEP | Server sort |
| CODE-A-006 | Page through codes | KEEP | Real server paging, not full-table memory paging |
| CODE-A-007 | Copy code | KEEP | Clipboard feedback |
| CODE-A-008 | Used/available status | KEEP | Canonical status machine |
| CODE-A-009 | Activation/expiry dates | KEEP | Canonical lifecycle |
| CODE-A-010 | Reset redeemed code/account/device | KEEP/REBUILD semantics | Explicit account/code action with audit and data impact |
| CODE-A-011 | Delete code | KEEP | Safe unused-code deletion; account deletion is separate explicit action |
| CODE-A-012 | Bulk delete | KEEP | Batch endpoint/result summary |
| CODE-A-013 | Import Excel/CSV | KEEP/FIX | Strict six-digit numeric schema and row-level error report |
| CODE-A-014 | Download import template | KEEP/FIX | Correct examples/schema |
| CODE-A-015 | Export all codes Excel | KEEP | Sanitized/lazy export |
| CODE-A-016 | Export used codes Excel | KEEP | Explicit filtered export |
| CODE-A-017 | Printable code cards | KEEP/REBRAND | New identity, scope selector |
| CODE-A-018 | Show device fingerprint | REPLACE UI | Show meaningful linked account/session status, not low-level fingerprint |
| CODE-A-019 | Reveal student password | REPLACE | Reset/recovery action only |

---

# 16. Admin Student Accounts

| ID | Existing feature/scenario | Target | Rebuild acceptance |
|---|---|---|---|
| ACCOUNT-A-001 | List student accounts | KEEP | Server pagination |
| ACCOUNT-A-002 | Search students | KEEP | Server search |
| ACCOUNT-A-003 | Show username/code identity | KEEP/IMPROVE | Canonical account identifier + activation source |
| ACCOUNT-A-004 | Show last login | KEEP | Accurate timestamp |
| ACCOUNT-A-005 | Show access/status | KEEP/REBUILD | Derived from canonical entitlements/account status |
| ACCOUNT-A-006 | Delete student account | KEEP/REBUILD | Auth/profile/dependent data handled transactionally/verified |
| ACCOUNT-A-007 | View account entitlement/code history | IMPROVE | Unified account detail |
| ACCOUNT-A-008 | Reset access/recovery | IMPROVE | Safe actions with audit log |

---

# 17. Admin Notifications

| ID | Existing feature/scenario | Target | Rebuild acceptance |
|---|---|---|---|
| NOTIF-A-001 | Create global notification | KEEP | Typed form |
| NOTIF-A-002 | Notification title | KEEP | Validation |
| NOTIF-A-003 | Notification body/message | KEEP | Validation/safe rendering |
| NOTIF-A-004 | List sent notifications | KEEP | Server pagination/date sort |
| NOTIF-A-005 | Delete notification | KEEP | Clear confirmation |
| NOTIF-A-006 | Realtime/student visibility | KEEP/IMPROVE | Shared notification repository/change model |
| NOTIF-A-007 | Future audience targeting | IMPROVE extensibility | Model supports all/class/account without blocking parity release |
| NOTIF-A-008 | Future schedule/expiry | IMPROVE extensibility | Optional fields/workflow |

---

# 18. AI Generation Rules That Must Be Preserved

These are product behavior, not implementation trivia.

| ID | Rule/capability | Target acceptance |
|---|---|---|
| AIRULE-001 | Arabic Fusha educational output | PromptRegistry + golden tests |
| AIRULE-002 | Arabic visible numerals where requested | One notation spec/validator/renderer |
| AIRULE-003 | Preserve Western digits/Latin symbols in chemical formulas such as formulas/compound notation | Golden science fixtures |
| AIRULE-004 | Correct Arabic mathematical symbols | Deterministic normalization tests |
| AIRULE-005 | Arabic variable/trigonometric notation rules | Versioned notation spec |
| AIRULE-006 | Preserve exact Quran/Hadith/source text in extraction/exact modes | Exact-text regression fixtures |
| AIRULE-007 | Question text | Strict schema |
| AIRULE-008 | Option list | Strict schema/minimum count by type |
| AIRULE-009 | Correct option index matches actual correct option | Semantic validator |
| AIRULE-010 | Explanation | Typed optional/required by mode |
| AIRULE-011 | Solution method | Typed field consistently named |
| AIRULE-012 | Difficulty | Controlled enum |
| AIRULE-013 | Source reference | Preserve/validate |
| AIRULE-014 | Source page | Preserve/validate against coverage |
| AIRULE-015 | Requested MCQ count | Exact count acceptance |
| AIRULE-016 | Requested True/False count | Exact count acceptance |
| AIRULE-017 | No unintended duplicate questions | Semantic/hash similarity checks where practical |
| AIRULE-018 | Multiple versions should differ while staying within sources | Cross-version validator/golden review |
| AIRULE-019 | Replica mode follows source structure | Separate extraction/replica prompt |
| AIRULE-020 | Exact exam mode preserves source question count/order/type/options | Strict extraction contract; no invented data |
| AIRULE-021 | If correct answer is not visible in exact source, do not fabricate certainty | `answer_status: known/unknown/review` |
| AIRULE-022 | Page offset/source mapping | Explicit source-page mapping metadata |
| AIRULE-023 | JSON/structured machine response | Provider structured output + Zod |
| AIRULE-024 | Retry malformed provider output | Job retry; never silently repair into false educational content |
| AIRULE-025 | Admin can edit generated content | All AI output remains reviewable before/after publish |

---

# 19. AI Reliability / Multi-Key / Multi-Project Features

| ID | Desired capability | Target design |
|---|---|---|
| AI-OPS-001 | More than one Gemini credential | Server-only credential pool; secret aliases only in DB/UI |
| AI-OPS-002 | Automatic failover | Health-based scheduler |
| AI-OPS-003 | Do not stop generation when one credential/provider call fails transiently | Retry with project cooldown + alternate healthy credential/project where policy allows |
| AI-OPS-004 | Split concurrent generation work | Queue workers obey global/per-project concurrency |
| AI-OPS-005 | Respect provider quotas | Track quota by **Google project**, not just key |
| AI-OPS-006 | Several keys in same project | Treat as credential rotation/failure isolation, **not extra quota** |
| AI-OPS-007 | Distinct authorized projects if intentionally provisioned | Scheduler may distribute jobs by project policy/weight while respecting each project quota/terms |
| AI-OPS-008 | 429 handling | Exponential backoff/Retry-After/cooldown, no long blocking sleep inside UI request |
| AI-OPS-009 | 503 handling | Retry with bounded exponential backoff |
| AI-OPS-010 | 401/403 key failure | Disable credential/alert admin, do not repeatedly hammer |
| AI-OPS-011 | Task survives closed tab/app | Durable queue/server worker |
| AI-OPS-012 | Task cancellation | Worker checks cancelled state between chunks/attempts |
| AI-OPS-013 | Task retry | Admin can retry failed unit/job idempotently |
| AI-OPS-014 | Progress | Persist completed/total units and current stage |
| AI-OPS-015 | Usage visibility | Model, project alias, attempts, latency, token/cost fields where provider supplies |
| AI-OPS-016 | Prompt reproducibility | Save prompt_version/provider/model/source revision |
| AI-OPS-017 | AI Operations dashboard | Queue/running/failed/retry/cancel/project health without secrets |
| AI-OPS-018 | Bulk non-urgent work | Evaluate Gemini Batch API / queued background execution where latency is acceptable |
| AI-OPS-019 | Model upgrade | Golden A/B tests before changing baseline model |
| AI-OPS-020 | Key/auth evolution | Support current Google server-side auth model without frontend exposure |

---

# 20. Exports / Print / Identity

| ID | Existing feature/scenario | Target |
|---|---|---|
| PRINT-001 | Quiz PDF generation | KEEP/REFACTOR |
| PRINT-002 | Excel generation | KEEP/REFACTOR |
| PRINT-003 | Code-card PDF/image export | KEEP/REBRAND |
| PRINT-004 | Export history | KEEP/IMPROVE |
| PRINT-005 | Arabic RTL print | KEEP/IMPROVE |
| PRINT-006 | New logo/colors/typography | REBUILD identity |
| PRINT-007 | Self-hosted brand assets | REBUILD |
| PRINT-008 | Sanitize dynamic export text | REQUIRED FIX |
| PRINT-009 | Lazy-load heavy export libraries | REQUIRED PERF |

---

# 21. New Identity / Design System Requirements

These are new implementation requirements while preserving feature outcomes.

| ID | Requirement |
|---|---|
| DS-001 | One brand foundation: logo, color palette, Arabic typography, icon language |
| DS-002 | Shared semantic tokens: background/surface/text/border/primary/success/warning/danger/info |
| DS-003 | Shared spacing scale |
| DS-004 | Shared radius scale; avoid uncontrolled 32–40px rounding |
| DS-005 | Shared elevation/shadow scale |
| DS-006 | Motion tokens and reduced-motion behavior |
| DS-007 | Focus ring/accessibility states |
| DS-008 | Form field system |
| DS-009 | Button hierarchy |
| DS-010 | Table/list system for Admin |
| DS-011 | Reader/content system for Student |
| DS-012 | Empty/loading/error/offline/sync states |
| DS-013 | Responsive breakpoints/rules |
| DS-014 | Self-hosted production assets |
| DS-015 | Print/export tokens aligned with brand |

---

# 22. Separation of Admin and Student Applications

The rebuild will preserve one product/backend but give each audience a purpose-built application surface.

## Admin Web

Primary jobs:
- operate content;
- manage students/access;
- supervise AI generation;
- create/edit assessments;
- communicate/publish;
- export/report;
- configure security/system.

Admin should prioritize information density, speed, bulk actions, keyboard efficiency and operational clarity.

## Student Web/PWA

Primary jobs:
- enter securely;
- continue learning;
- browse entitled content;
- read lessons comfortably;
- practice;
- keep personal notes/bookmarks;
- view progress;
- work reliably with poor/no internet.

Student should prioritize calm hierarchy, touch ergonomics, readability, fast cached startup and minimal cognitive load.

Shared packages should contain design primitives and domain contracts, not force the same page composition on both apps.

---

# 23. Feature-Parity Release Rule

Before replacing the old application, each row above must be marked one of:

- **DONE — parity verified**
- **DONE — intentionally improved behavior, migration verified**
- **RETIRED — approved business decision with documented reason and migration impact**

No old route/file may be deleted solely because the new UI “looks complete”. Feature parity is tested from user scenarios, not filenames.
