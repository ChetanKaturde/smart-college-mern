# New Features — Planned Work (MASTER_PLAN Phases 1–6)

All planned features from `/smart-college-mern/MASTER_PLAN/`. Listed in build order.

---

## Phase 1 — Foundation (3 independent tracks, build in parallel)

### Track A — Billing & Subscription Model
**File:** `MASTER_PLAN/02-phase1-billing.md`
**Blocks:** Nothing directly, but needed before onboarding new colleges
**Blocked by:** Product owner answers on pricing tiers (see 04-OPEN-QUESTIONS.md)

What gets built:
- Add `subscription` and `billingContact` and `gstDetails` fields to College model
- New `Invoice` model with GST-compliant fields (CGST/SGST/IGST, HSN code, sequential invoice numbers)
- Fix `collegeIsolation.middleware.js` — `subscriptionExpiry` field doesn't exist today, so the check never fires
- Access states: ACTIVE → WARNING (7 days) → GRACE_PERIOD → SOFT_BLOCKED → SUSPENDED
- Invoice CRUD endpoints for Super Admin
- College Admin: view own invoices, upload payment proof
- Super Admin: verify payment, extend subscription
- Invoice PDF generation (GST-compliant, using existing pdfkit)
- Billing cron jobs: due-soon reminders, overdue checks, weekly summary
- New `BILLING_MANAGER` role (platform-level, LemmeCode finance team)
- Frontend: invoice management pages for Super Admin + billing section for College Admin
- Subscription status warning banner on College Admin dashboard

Blocked questions (do not start invoice PDF or frontend until answered):
- What are the exact plan tiers and pricing?
- Does LemmeCode have a GSTIN?
- Billing cycle — academic year or calendar year?

---

### Track B — Credential Delivery & First Login
**File:** `MASTER_PLAN/03-phase1-credentials.md`
**Blocks:** Phase 4 (new roles need this to work)
**Blocked by:** Nothing

What gets built:
- Add `mustChangePassword`, `tempPasswordExpiresAt`, `onboardingCompleted`, `onboardingStep`, `isActive`, `createdBy` to User model
- `mustChangePassword` middleware — blocks all routes except `/api/auth/change-password` if flag is true
- `changePassword` endpoint — clears flag, blacklists current token
- Temp password expiry check on login — blocks login if expired, shows "contact administrator" message
- Show credentials once on college creation (modal with "I have copied these" checkbox)
- Reset credentials endpoint for Super Admin
- Change password page (frontend)
- Onboarding wizard for College Admin (triggered after first password change): Add department → Add course → Set up fee structure → Done
- Axios interceptor: redirect to change-password page on `PASSWORD_CHANGE_REQUIRED` response

---

### Track C — Per-College Email Configuration
**File:** `MASTER_PLAN/06-phase1-email-config.md`
**Blocks:** Nothing, but all email notifications depend on this
**Blocked by:** Nothing (immediate fix available — see below)

Immediate fix (do before building the full solution):
- Generate Gmail App Password → update `EMAIL_PASS` in `.env` → restart app
- This unblocks all emails while the proper solution is built

What gets built:
- New `CollegeEmailConfig` model (SMTP host, port, secure, encrypted credentials, fromName, fromEmail)
- Credentials encrypted at rest using existing `encryption.util.js` (same pattern as Razorpay)
- `collegeEmail.service.js` — `getCollegeTransporter(collegeId)`, cached, falls back to platform SMTP
- Update all 8 email send functions to accept `collegeId` and use college transporter
- Platform-level emails (billing, Super Admin messages) stay on platform SMTP
- New endpoints: GET/POST/DELETE config, POST verify (sends test email)
- Frontend: Email Configuration page in System Settings (same UI pattern as RazorpayConfiguration.jsx)
- "Test Connection" button that sends a test email to the logged-in admin

---

## Phase 2 — Admission Workflow Redesign
**File:** `MASTER_PLAN/04-phase2-admission.md`
**Blocks:** Phase 4 (new roles), Phase 5 (promotion)
**Blocked by:** Phase 1 Track B (credential delivery must exist first)

Current flow (wrong):
```
PENDING → APPROVED (credentials sent immediately, fee record created immediately)
```

New flow:
```
PENDING → OFFER_MADE → SEAT_CONFIRMED → ENROLLED
```

What gets built:
- New student statuses: `OFFER_MADE`, `SEAT_CONFIRMED`, `ENROLLED` (replaces `APPROVED`), `WITHDRAWN`
- Add fields to Student model: `offerMadeAt`, `seatConfirmedAt`, `downpaymentAmount`, `enrolledAt`
- Three new controller actions replacing `approveStudent`:
  - `makeOffer` — sets OFFER_MADE, sends offer email, does NOT create User or fee record
  - `confirmSeat` — sets SEAT_CONFIRMED, records downpayment
  - `enrollStudent` — creates User account, creates fee record, sends credentials, sets ENROLLED
- `withdrawOffer` action for OFFER_MADE or SEAT_CONFIRMED students
- Fix orphaned User bug: User is now only created at `enrollStudent`, never at registration
- Update all places that check `status === "APPROVED"` → `ENROLLED`
- New routes: `make-offer`, `confirm-seat`, `enroll`, `withdraw`
- Migration script: update all existing `APPROVED` students to `ENROLLED`
- Frontend: replace single "Approve" button with 4 state-aware buttons
- Admission funnel view: counts at each stage
- Update all student list filters from APPROVED → ENROLLED

---

## Phase 3 — Year Labels & Teacher Classroom Assignment
**File:** `MASTER_PLAN/05-phase3-year-labels-teacher.md`
**Blocks:** Phase 6 (HOD timetable, ID card)
**Blocked by:** Phase 0 (server sync)

### Decision 02 — Course Year Labels (FY/SY/TY)
- Add `yearLabels` array to Course model: `[{ year, label, semesters }]`
- New utility: `getYearLabel(course, semester)` — returns "TY" for semester 5 in a 3-year course
- Migration script: auto-generate default labels for all existing courses
- Replace hardcoded year calculations in: promotion controller, student controller, timetable controller, attendance controllers
- Frontend: year label input fields in AddCourse/EditCourse (pre-filled with FY/SY/TY defaults)
- Show "TY — Semester 5" instead of just "Semester 5" across all student-facing displays

### Decision 03 — Teacher Classroom Assignment
- Replace flat `courses: [ObjectId]` on Teacher model with `courseAssignments: [{ course_id, year, yearLabel, classroom, division }]`
- Teacher controller: accept `courseAssignments` in create/update
- Timetable slot creation: auto-fill room from teacher's `courseAssignments`
- Conflict detection on slot create/update: teacher double-booking (hard block), room double-booking (configurable), course-year double-booking (hard block)
- Migration script: convert existing `courses[]` to `courseAssignments[]` with null room/year
- Frontend: replace course multi-select with courseAssignments form in AddTeacher/EditTeacher
- Timetable builder: room field auto-fills after teacher + course + year selected

---

## Phase 4 — New Roles
**File:** `MASTER_PLAN/07-phase4-roles.md`
**Blocks:** Nothing
**Blocked by:** Phase 2 (ADMISSION_OFFICER depends on new status states)

Foundation tasks (do once before any role work):
- Add all new roles to `constants.js` and User model enum
- Fix HOD middleware: change role check from `TEACHER` to `HOD`
- Staff account management endpoints (COLLEGE_ADMIN creates ACCOUNTANT, ADMISSION_OFFICER, etc.)
- Staff creation generates temp password, sets `mustChangePassword: true`, returns credentials once

Roles to build:

**ACCOUNTANT**
- Access: fee collection, payment tracking, receipts, financial reports. No academic data.
- Backend: add to payment routes, receipt routes, fee structure GET routes, financial reports
- New: `GET /api/accountant/dashboard`
- Frontend: AccountantDashboard, FeeCollection, PaymentHistory, ReceiptManagement pages

**ADMISSION_OFFICER**
- Access: PENDING applications only. No enrolled students.
- Backend: add to registered students routes, new admission status routes from Phase 2
- New: `GET /api/admission/dashboard`
- Frontend: AdmissionDashboard, PendingApplications, ApplicationDetail pages

**PRINCIPAL**
- Access: read everything, write nothing (except notifications)
- Backend: add to all GET routes across student, teacher, department, course, reports, dashboard, attendance, fee, audit log routes
- Frontend: read-only versions of existing pages (no action buttons)

**EXAM_COORDINATOR**
- Access: view students and teachers for exam planning. Full exam module is V1.1.
- Backend: add to approved students GET, teacher GET, timetable GET, attendance GET
- New: `GET /api/exam/dashboard` — placeholder returning "Exam module coming in V1.1"
- Frontend: placeholder dashboard page only

**PARENT_GUARDIAN**
- Access: own child's attendance, fees, profile. Read-only. Scoped to linked students only.
- New model: `ParentGuardian` with `student_ids` array
- New middleware: attaches `req.linkedStudentIds`
- New routes: `GET /api/parent/children`, child profile/attendance/fees (scoped)
- Frontend: ParentDashboard, ChildAttendance, ChildFees, ChildProfile pages

**PLATFORM_SUPPORT**
- Access: college list, system health, audit logs. No academic or financial data.
- Backend: add to college list GET, health check, audit log GET routes
- No new frontend pages beyond a simple dashboard

Login routing: add redirect cases for all new roles in `Login.jsx`.

---

## Phase 5 — Promotion with Academic Status
**File:** `MASTER_PLAN/08-phase5-6-promotion-hod-idcard.md`
**Blocks:** Nothing
**Blocked by:** Phase 2

What gets built (V1.0):
- Add `promotionEligibility` to Student model: `{ academicStatus: PASS/FAIL/ATKT/PENDING_RESULT, atktCount, setBy, setAt, remarks }`
- New promotion gate: PASS or (ATKT + atktCount <= max) AND fee paid
- New endpoint: `PUT /api/students/:studentId/academic-status` (COLLEGE_ADMIN, EXAM_COORDINATOR)
- Fix hardcoded year label in promotion response — use `getYearLabel()` from Phase 3
- Frontend: add academic status column to promotion screen, allow admin to set status before promoting

V1.1 (plan only, build later): full result module, marks entry UI, ATKT tracking, re-evaluation workflow.

---

## Phase 6 — HOD Timetable & Student ID Card
**File:** `MASTER_PLAN/08-phase5-6-promotion-hod-idcard.md`
**Blocks:** Nothing
**Blocked by:** Phase 3

### HOD Timetable Self-Management
- New HOD-scoped endpoints: teachers in HOD's department, subjects for teacher, room from courseAssignments
- Timetable builder: teacher dropdown filtered to HOD's department only
- Subject dropdown filtered by selected teacher
- Room auto-fills from teacher's courseAssignments
- "My Teaching Schedule" tab in HOD dashboard
- "Add My Slot" shortcut (pre-fills teacher field with HOD's own profile)

### Student ID Card Generation
- New `idCardGenerator.js` utility using existing pdfkit
- ID card layout: college logo, name, student photo, name, enrollment number, course, year label, department, academic year, QR code, valid until
- QR code encodes: `{ studentId, enrollmentNumber, collegeCode }` (static, not attendance QR)
- Endpoints: single student PDF, bulk ZIP for course+year group
- Access: COLLEGE_ADMIN (single + bulk), ADMISSION_OFFICER (single), STUDENT (own card)
- Frontend: Download ID Card button in ViewStudent and StudentProfile, bulk generation in student list

Hall tickets deferred to V1.1 (requires exam module).
