# NOVAA — Master Task List (Chronological)

**How to use this file:**
Tasks are ordered by when they can and must be done.
Every task has a status, owner type, estimated time, and what it unblocks.
Work top to bottom. Do not skip ahead — dependencies are real.

**Owner types:** `DevOps` · `Backend` · `Frontend` · `Both` · `Leadership`
**Status:** `[ ]` not started · `[x]` done · `[~]` in progress · `[!]` blocked

---

## Stage 0 — Before Any Code Work Starts

These are decisions and access issues. No developer can proceed without them.

| # | Task | Owner | Blocks |
|---|---|---|---|
| [ ] | **S0-1** Decide: cookie-based auth vs Bearer token — which is the system going forward? (Q-AUTH-1) | Leadership | Everything |
| [ ] | **S0-2** Decide: `VITE_API_BASE_URL` value for production — `/api` or `https://novaa.lemmecode.com/api`? (Q-AUTH-2) | Leadership | Every frontend build |
| [ ] | **S0-3** Decide: canonical student category list — `GEN, OBC, SC, ST, EWS, OTHER` or subset? (Q-STU-3) | Leadership | Issue #233 Bug 2 fix |
| [ ] | **S0-4** Decide: fee route path — `/api/fees/structure` (current remote) or `/api/fee-structures` (correct REST)? (Q-FEE-1) | Leadership | All fee frontend work |
| [ ] | **S0-5** Get access to the Gmail account used as platform email sender | Leadership | Email fix |

---

## Stage 1 — Security & Legal (No Feature Dependencies)

Do these immediately after Stage 0 decisions. All are independent of each other.

| # | Task | Owner | Time | Issue | Unblocks |
|---|---|---|---|---|---|
| [ ] | **1-1** Remove student PDFs from GitHub repo using BFG history rewrite | Backend | 1 hr | #182 | Legal compliance |
| [ ] | **1-2** Add `uploads/` to `.gitignore` and commit | Backend | 10 min | #182 | — |
| [ ] | **1-3** Rotate `JWT_SECRET` using `openssl rand -hex 64`, update `.env`, restart | DevOps | 20 min | #225 | — |
| [ ] | **1-4** Replace `SUPER_ADMIN_PASSWORD=admin123` with a strong password in `.env` | DevOps | 10 min | #225 | — |
| [ ] | **1-5** Replace dummy Stripe key with real key or remove it from `.env` | DevOps | 10 min | #225 | — |
| [ ] | **1-6** Add `FRONTEND_URL` and `CORS_ORIGINS` to production `.env` | DevOps | 15 min | #223 | QR codes, CORS |
| [ ] | **1-7** Fix Gmail App Password in `.env` (`EMAIL_PASS`) | DevOps | 15 min | — | All emails |
| [ ] | **1-8** Fix localhost fallback in `ViewApproveStudent.jsx` | Frontend | 15 min | #224 | — |
| [ ] | **1-9** Fix localhost fallback in `StripeConfiguration.jsx` | Frontend | 15 min | #224 | — |
| [ ] | **1-10** Fix localhost fallback in `RazorpayConfiguration.jsx` | Frontend | 15 min | #224 | — |
| [ ] | **1-11** Fix localhost fallback in `StudentProfile.jsx` | Frontend | 15 min | #224 | — |
| [ ] | **1-12** Remove `mock.payment.controller.js` from codebase and its route from `app.js` | Backend | 15 min | — | — |
| [ ] | **1-13** Create `.env.example` file listing all required environment variables with placeholder values | Backend | 30 min | — | New developer onboarding |

---

## Stage 2 — Server Sync & Code Cleanup

Do after Stage 1. These bring the server and repo into a clean, consistent state.

| # | Task | Owner | Time | Unblocks |
|---|---|---|---|---|
| [ ] | **2-1** Push unpushed local commit `9211410` to remote (or verify it's already in remote) | DevOps | 10 min | Clean git history |
| [ ] | **2-2** Pull remote `origin/main` to server (18 commits behind) | DevOps | 30 min | All subsequent work |
| [ ] | **2-3** Rebuild frontend after pull and deploy to `/htdocs/novaa.lemmecode.com/public/` | DevOps | 20 min | Staging reflects latest code |
| [ ] | **2-4** Verify production `app.js` matches repo `app.js` — reconcile manual patches (dashboard route, alias route) | Backend | 30 min | Prevents next deploy from breaking things |
| [ ] | **2-5** Remove 36+ `console.log` statements from frontend source | Frontend | 2 hr | Performance, security |
| [ ] | **2-6** Verify `JWT_ACCESS_EXPIRY` and `JWT_REFRESH_EXPIRY` are set in `.env` — if missing, tokens never expire | DevOps | 10 min | Auth security |

---

## Stage 3 — Immediate Bug Fixes (Issue #233)

These are standalone fixes that do not require any new feature work.
Bugs 2, 3, and 6 overlap with Phase 2 — if Phase 2 starts soon, skip those and fix them there instead.

| # | Task | Owner | Time | Issue | Note |
|---|---|---|---|---|---|
| [ ] | **3-1** Remove duplicate `GET /registered` route declaration in `student.routes.js` | Backend | 10 min | #233 Bug 1 | Safe to do now |
| [ ] | **3-2** Fix `validateStudentId` to check `param('id')` not `param('studentId')` | Backend | 15 min | #233 Bug 4 | Safe to do now |
| [ ] | **3-3** Add missing `next` parameter to `updateMyProfile` and `updateStudentByAdmin` | Backend | 15 min | #233 Bug 5 | Safe to do now |
| [!] | **3-4** Fix category `OTHER` / `EWS` mismatch between student validator and FeeStructure model | Backend | 30 min | #233 Bug 2 | Blocked by S0-3 (category decision) |
| [!] | **3-5** Fix orphaned User account on failed student registration | Backend | 1 hr | #233 Bug 3 | Consider doing in Phase 2 instead |
| [!] | **3-6** Implement enrollment number generation on student approval | Backend | 2 hr | #233 Bug 6 | Consider doing in Phase 2 instead |

---

## Stage 4 — Pre-Phase Fixes (Model & Auth Consistency)

Small fixes that must be done before any phase work starts, to avoid conflicts.

| # | Task | Owner | Time | Blocks |
|---|---|---|---|---|
| [ ] | **4-1** Add `HOD` and `PRINCIPAL` to User model role enum (they're in constants but not in the model — creating these users currently fails silently) | Backend | 15 min | Phase 4 |
| [ ] | **4-2** Fix HOD middleware: change `role !== "TEACHER"` to `role !== "TEACHER" && role !== "HOD"` as a pre-Phase-4 patch | Backend | 10 min | Phase 4 |
| [ ] | **4-3** Remove `sparse: true` from `student.user_id` field if migration is complete (contradicts `required: true`) | Backend | 10 min | Data integrity |
| [ ] | **4-4** Fix hardcoded `"2025-2026"` academic year in receipt responses | Backend | 30 min | Receipt accuracy |
| [ ] | **4-5** Audit Razorpay webhook for idempotency — verify duplicate payment protection is working end-to-end | Backend | 2 hr | #194 |
| [ ] | **4-6** Expose Stripe payment option in student UI (backend is fully built, only frontend wiring needed) | Frontend | 3 hr | Student payment options |

---

## Stage 5 — Phase 1A: Billing Model

**Blocked by:** S0-1 (auth decision), Leadership answers on pricing tiers and billing cycle
**Can start partially:** College model additions and Invoice model can be built before pricing is decided

| # | Task | Owner | Time | Blocked by |
|---|---|---|---|---|
| [ ] | **5-1** Add `subscription`, `billingContact`, `gstDetails` fields to College model | Backend | 1 hr | Nothing |
| [ ] | **5-2** Create `Invoice` model with GST fields, sequential invoice numbers, payment proof | Backend | 2 hr | Nothing |
| [ ] | **5-3** Fix `collegeIsolation.middleware.js` to actually check `subscription.subscriptionExpiry` | Backend | 1 hr | 5-1 |
| [ ] | **5-4** Implement access states: ACTIVE → WARNING → GRACE_PERIOD → SOFT_BLOCKED → SUSPENDED | Backend | 3 hr | 5-3 |
| [!] | **5-5** Invoice CRUD endpoints (create, list, send, verify payment, extend subscription) | Backend | 4 hr | Leadership: pricing tiers |
| [!] | **5-6** GST-compliant invoice PDF generation using pdfkit | Backend | 4 hr | Leadership: GSTIN |
| [!] | **5-7** Billing cron jobs (due-soon reminders, overdue checks, weekly summary) | Backend | 3 hr | Leadership: billing cycle |
| [!] | **5-8** Frontend: invoice management pages for Super Admin | Frontend | 4 hr | 5-5 |
| [!] | **5-9** Frontend: billing section for College Admin (view invoices, upload payment proof) | Frontend | 3 hr | 5-5 |
| [ ] | **5-10** Frontend: subscription status warning banner on College Admin dashboard | Frontend | 1 hr | 5-3 |
| [ ] | **5-11** Update college creation flow: set `subscription.plan = 'TRIAL'` and `trialEndsAt` | Backend | 30 min | 5-1 |

---

## Stage 6 — Phase 1B: Credential Delivery & First Login

**Blocked by:** S0-1 (auth decision)
**No other blockers — can run in parallel with Stage 5**

| # | Task | Owner | Time | Blocked by |
|---|---|---|---|---|
| [ ] | **6-1** Add `mustChangePassword`, `tempPasswordExpiresAt`, `onboardingCompleted`, `onboardingStep`, `createdBy` to User model | Backend | 30 min | Nothing |
| [ ] | **6-2** `mustChangePassword` middleware — blocks all routes except change-password if flag is true | Backend | 1 hr | 6-1 |
| [ ] | **6-3** `changePassword` endpoint — clears flag, blacklists current token | Backend | 1 hr | 6-1 |
| [ ] | **6-4** Temp password expiry check on login — block login if expired | Backend | 30 min | 6-1 |
| [ ] | **6-5** Show credentials once modal on college creation (Super Admin UI) | Frontend | 2 hr | 6-1 |
| [ ] | **6-6** Reset credentials endpoint for Super Admin | Backend | 1 hr | 6-1 |
| [ ] | **6-7** Frontend: Change Password page | Frontend | 2 hr | 6-2 |
| [ ] | **6-8** Frontend: axios interceptor — redirect to change-password on `PASSWORD_CHANGE_REQUIRED` | Frontend | 30 min | 6-2 |
| [!] | **6-9** Frontend: Onboarding wizard (Add dept → Add course → Set fee structure → Done) | Frontend | 4 hr | Leadership: mandatory or optional? |

---

## Stage 7 — Phase 1C: Per-College Email Configuration

**Blocked by:** Stage 1 Task 1-7 (Gmail App Password — immediate fix must be done first)
**Can run in parallel with Stages 5 and 6**

| # | Task | Owner | Time | Blocked by |
|---|---|---|---|---|
| [ ] | **7-1** Create `CollegeEmailConfig` model (SMTP host, port, secure, encrypted credentials, fromName, fromEmail) | Backend | 1 hr | Nothing |
| [ ] | **7-2** `collegeEmail.service.js` — `getCollegeTransporter(collegeId)`, cached, falls back to platform SMTP | Backend | 2 hr | 7-1 |
| [ ] | **7-3** Update all 8 email send functions to accept `collegeId` and use college transporter | Backend | 2 hr | 7-2 |
| [ ] | **7-4** Config endpoints: GET, POST, DELETE, POST verify (sends test email) | Backend | 2 hr | 7-1 |
| [ ] | **7-5** Frontend: Email Configuration page in System Settings (same pattern as RazorpayConfiguration) | Frontend | 2 hr | 7-4 |

---

## Stage 8 — Phase 2: Admission Workflow Redesign

**Blocked by:** Stage 6 complete (credentials must exist before enrollment creates them)
**Blocked by:** Leadership answers on offer email, downpayment, withdrawal rules

| # | Task | Owner | Time | Blocked by |
|---|---|---|---|---|
| [ ] | **8-1** Run migration script: all `APPROVED` students → `ENROLLED` (run on server BEFORE any code change) | DevOps | 30 min | Maintenance window |
| [ ] | **8-2** Add new statuses to `STUDENT_STATUS` constants: `OFFER_MADE`, `SEAT_CONFIRMED`, `ENROLLED`, `WITHDRAWN` | Backend | 20 min | 8-1 |
| [ ] | **8-3** Update Student model: new status enum + `offerMadeAt`, `seatConfirmedAt`, `downpaymentAmount`, `enrolledAt` fields | Backend | 1 hr | 8-2 |
| [ ] | **8-4** New controller actions: `makeOffer`, `confirmSeat`, `enrollStudent`, `withdrawOffer` | Backend | 4 hr | 8-3 |
| [ ] | **8-5** Fix orphaned User bug: User created only at `enrollStudent`, never at registration (replaces Stage 3 Task 3-5) | Backend | 1 hr | 8-4 |
| [ ] | **8-6** Implement enrollment number generation at `enrollStudent` (replaces Stage 3 Task 3-6) | Backend | 1 hr | 8-4 |
| [ ] | **8-7** Update all `status === "APPROVED"` references across codebase → `ENROLLED` | Backend | 2 hr | 8-2 |
| [ ] | **8-8** Update college restore cascade in College model: `APPROVED` → `ENROLLED` | Backend | 30 min | 8-2 |
| [ ] | **8-9** Update login check in `auth.controller.js`: `status: "APPROVED"` → `status: "ENROLLED"` | Backend | 15 min | 8-2 |
| [ ] | **8-10** Update promotion controller: `status: "APPROVED"` → `status: "ENROLLED"` | Backend | 15 min | 8-2 |
| [ ] | **8-11** New routes: `make-offer`, `confirm-seat`, `enroll`, `withdraw` | Backend | 30 min | 8-4 |
| [ ] | **8-12** Frontend: replace single Approve button with 4 state-aware buttons | Frontend | 3 hr | 8-11 |
| [ ] | **8-13** Frontend: admission funnel view (counts at each stage) | Frontend | 2 hr | 8-11 |
| [ ] | **8-14** Frontend: update all student list filters from APPROVED → ENROLLED | Frontend | 1 hr | 8-2 |

---

## Stage 9 — Phase 3: Year Labels + Teacher Classroom

**Can run in parallel with Stages 5, 6, 7 — only needs Stage 1 complete**
**Blocked by:** Leadership answers on fee-per-year and classroom assignment ownership

| # | Task | Owner | Time | Blocked by |
|---|---|---|---|---|
| [ ] | **9-1** Add `yearLabels` array to Course model | Backend | 30 min | Nothing |
| [ ] | **9-2** Create `getYearLabel(course, semester)` utility function | Backend | 1 hr | 9-1 |
| [ ] | **9-3** Run migration script: auto-generate default FY/SY/TY labels for all existing courses | DevOps | 20 min | 9-1 |
| [ ] | **9-4** Replace hardcoded year calculations in promotion, student, timetable, attendance controllers | Backend | 2 hr | 9-2 |
| [ ] | **9-5** Frontend: year label input fields in AddCourse and EditCourse | Frontend | 2 hr | 9-1 |
| [ ] | **9-6** Frontend: show "TY — Semester 5" format across student profile, timetable, attendance | Frontend | 2 hr | 9-2 |
| [ ] | **9-7** Replace `courses: [ObjectId]` with `courseAssignments: [{ course_id, year, yearLabel, classroom, division }]` on Teacher model | Backend | 1 hr | 9-1 |
| [ ] | **9-8** Update teacher controller to accept `courseAssignments` in create and update | Backend | 1 hr | 9-7 |
| [ ] | **9-9** Timetable slot: auto-fill room from teacher's `courseAssignments` | Backend | 1 hr | 9-7 |
| [ ] | **9-10** Timetable slot: conflict detection (teacher double-booking, room double-booking, course-year double-booking) | Backend | 3 hr | 9-9 |
| [ ] | **9-11** Run migration script: convert existing `courses[]` to `courseAssignments[]` with null room/year | DevOps | 20 min | 9-7 |
| [ ] | **9-12** Frontend: replace course multi-select with courseAssignments form in AddTeacher and EditTeacher | Frontend | 3 hr | 9-7 |
| [ ] | **9-13** Frontend: timetable builder room auto-fill after teacher + course + year selected | Frontend | 2 hr | 9-9 |

---

## Stage 10 — Phase 4: New Roles

**Blocked by:** Stage 8 complete (ADMISSION_OFFICER needs new status states)
**Blocked by:** Stage 6 complete (staff account creation needs credential delivery)
**Blocked by:** Leadership answers on role permissions and who creates staff accounts

| # | Task | Owner | Time | Blocked by |
|---|---|---|---|---|
| [ ] | **10-1** Add all new roles to `constants.js` ROLE enum | Backend | 20 min | Nothing |
| [ ] | **10-2** Add all new roles to User model role enum | Backend | 15 min | 10-1 |
| [ ] | **10-3** Fix HOD middleware: change role check from `TEACHER` to `HOD` (replaces Stage 4 Task 4-2) | Backend | 10 min | 10-2 |
| [ ] | **10-4** Staff account management endpoints: create, list, update, link-parent | Backend | 3 hr | 10-2 |
| [ ] | **10-5** ACCOUNTANT — add to payment, receipt, fee structure GET, financial report routes | Backend | 2 hr | 10-2 |
| [ ] | **10-6** ACCOUNTANT — `GET /api/accountant/dashboard` endpoint | Backend | 1 hr | 10-5 |
| [ ] | **10-7** ACCOUNTANT — frontend pages: dashboard, fee collection, payment history, receipt management | Frontend | 4 hr | 10-6 |
| [ ] | **10-8** ADMISSION_OFFICER — add to registered students routes + new Phase 2 admission routes | Backend | 1 hr | 10-2, Stage 8 |
| [ ] | **10-9** ADMISSION_OFFICER — `GET /api/admission/dashboard` endpoint | Backend | 1 hr | 10-8 |
| [ ] | **10-10** ADMISSION_OFFICER — frontend pages: dashboard, pending applications, application detail | Frontend | 3 hr | 10-9 |
| [ ] | **10-11** PRINCIPAL — add to all GET routes across student, teacher, department, course, reports, dashboard, attendance, fee, audit log | Backend | 3 hr | 10-2 |
| [ ] | **10-12** PRINCIPAL — frontend pages: read-only dashboard, reports, student list, teacher list | Frontend | 4 hr | 10-11 |
| [ ] | **10-13** EXAM_COORDINATOR — add to approved students GET, teacher GET, timetable GET, attendance GET | Backend | 1 hr | 10-2 |
| [ ] | **10-14** EXAM_COORDINATOR — `GET /api/exam/dashboard` placeholder endpoint | Backend | 30 min | 10-13 |
| [ ] | **10-15** EXAM_COORDINATOR — placeholder frontend dashboard page | Frontend | 1 hr | 10-14 |
| [ ] | **10-16** PARENT_GUARDIAN — new `ParentGuardian` model | Backend | 1 hr | 10-2 |
| [ ] | **10-17** PARENT_GUARDIAN — new middleware attaching `req.linkedStudentIds` | Backend | 1 hr | 10-16 |
| [ ] | **10-18** PARENT_GUARDIAN — new routes: children list, child profile/attendance/fees (scoped) | Backend | 2 hr | 10-17 |
| [ ] | **10-19** PARENT_GUARDIAN — frontend pages: dashboard, child attendance, child fees, child profile | Frontend | 4 hr | 10-18 |
| [ ] | **10-20** PLATFORM_SUPPORT — add to college list GET, health check, audit log GET | Backend | 30 min | 10-2 |
| [ ] | **10-21** Login routing: add redirect cases for all new roles in `Login.jsx` | Frontend | 1 hr | 10-2 |

---

## Stage 11 — Phase 5: Promotion with Academic Status

**Blocked by:** Stage 8 complete (uses ENROLLED status)
**Blocked by:** Leadership answer on max ATKT count
**Can run in parallel with Stage 10**

| # | Task | Owner | Time | Blocked by |
|---|---|---|---|---|
| [ ] | **11-1** Add `promotionEligibility` to Student model: `{ academicStatus, atktCount, setBy, setAt, remarks }` | Backend | 30 min | Stage 8 |
| [ ] | **11-2** Update promotion gate: PASS or (ATKT + count ≤ max) AND fee paid | Backend | 1 hr | 11-1 |
| [ ] | **11-3** New endpoint: `PUT /api/students/:studentId/academic-status` | Backend | 1 hr | 11-1 |
| [ ] | **11-4** Fix hardcoded year label in promotion response — use `getYearLabel()` from Stage 9 | Backend | 30 min | Stage 9 Task 9-2 |
| [ ] | **11-5** Frontend: academic status column in promotion screen | Frontend | 1 hr | 11-3 |
| [ ] | **11-6** Frontend: set-status UI (PASS/FAIL/ATKT/PENDING_RESULT) before promoting | Frontend | 2 hr | 11-3 |

---

## Stage 12 — Phase 6: HOD Timetable + ID Card

**Blocked by:** Stage 9 complete (needs year labels + teacher classroom assignment)
**Blocked by:** Leadership answers on room conflict rules and ID card format

| # | Task | Owner | Time | Blocked by |
|---|---|---|---|---|
| [ ] | **12-1** HOD-scoped endpoints: teachers in HOD's dept, subjects for teacher, room from courseAssignments | Backend | 2 hr | Stage 9 |
| [ ] | **12-2** Frontend: timetable builder teacher dropdown filtered to HOD's department | Frontend | 1 hr | 12-1 |
| [ ] | **12-3** Frontend: subject dropdown filtered by selected teacher | Frontend | 1 hr | 12-1 |
| [ ] | **12-4** Frontend: room auto-fill from teacher's courseAssignments | Frontend | 1 hr | 12-1 |
| [ ] | **12-5** Frontend: "My Teaching Schedule" tab in HOD dashboard | Frontend | 2 hr | 12-1 |
| [ ] | **12-6** Frontend: "Add My Slot" shortcut (pre-fills teacher field with HOD's own profile) | Frontend | 1 hr | 12-1 |
| [!] | **12-7** ID card generator utility using pdfkit | Backend | 3 hr | Leadership: card size, QR decision |
| [!] | **12-8** ID card endpoints: single student PDF, bulk ZIP | Backend | 2 hr | 12-7 |
| [!] | **12-9** Frontend: Download ID Card button in ViewStudent and StudentProfile | Frontend | 1 hr | 12-8 |
| [!] | **12-10** Frontend: bulk ID card generation in student list | Frontend | 2 hr | 12-8 |

---

## Stage 13 — Compliance & Medium Priority Issues

These can be done at any point after Stage 2. They do not block any phase.

| # | Task | Owner | Time | Issue |
|---|---|---|---|---|
| [ ] | **13-1** Add GST calculation to fee receipts | Backend + Frontend | 3 hr | #212 |
| [ ] | **13-2** Migrate file uploads from local disk to S3 (or equivalent cloud storage) | Backend | 1 day | #213 |
| [ ] | **13-3** Switch Razorpay and Stripe from test keys to live keys in production | DevOps | 30 min | #214 |
| [ ] | **13-4** Implement data retention policy (auto-delete or archive after X days post-suspension) | Backend | 2 hr | #217 |

---

## What Can Be Done Right Now (No Decisions Needed)

If you are waiting for leadership answers, these tasks have zero blockers:

**Today (under 30 min each):**
- 1-1 through 1-13 (security and legal fixes)
- 2-1, 2-2 (git sync)
- 3-1, 3-2, 3-3 (safe bug fixes from #233)
- 4-1, 4-2, 4-3, 4-4 (model consistency fixes)

**This week (1–3 hours each):**
- 2-3 through 2-6 (server cleanup)
- 4-5 (Razorpay webhook audit)
- 5-1, 5-2 (billing model — can start before pricing is decided)
- 6-1 through 6-8 (credential delivery — all except onboarding wizard)
- 7-1 through 7-5 (email config)
- 9-1 through 9-6 (year labels backend + frontend)

---

## Missing Things Identified (Not in Any Previous Document)

These were gaps found during review — not tracked anywhere else:

| # | Gap | Severity | Suggested Action |
|---|---|---|---|
| G-1 | No `.env.example` file — new developers have no reference for required env vars | Medium | Task 1-13 above |
| G-2 | `PRINCIPAL` and `HOD` in constants but not in User model enum — creating these users fails silently | High | Task 4-1 above |
| G-3 | `sparse: true` on `student.user_id` contradicts `required: true` — can allow null user_id documents | Medium | Task 4-3 above |
| G-4 | `JWT_ACCESS_EXPIRY` / `JWT_REFRESH_EXPIRY` may not be set — tokens may never expire | High | Task 2-6 above |
| G-5 | Stripe is fully built backend-side but students cannot use it — dead code in production | Medium | Task 4-6 above |
| G-6 | Academic year hardcoded as `"2025-2026"` in receipt responses | Low | Task 4-4 above |
| G-7 | College restore cascade sets students back to `APPROVED` — will break after Phase 2 migration | High | Task 8-8 above |
| G-8 | Login only redirects to `/home` — no routing exists for PRINCIPAL, HOD, or any new role | High | Task 10-21 above |
| G-9 | `EWS` in FeeStructure enum but not in student CATEGORY constants — dead fee structures possible | Medium | Blocked by S0-3 |
| G-10 | No deployment checklist — every deploy risks overwriting manual production patches | High | Covered by Task 2-4 |
