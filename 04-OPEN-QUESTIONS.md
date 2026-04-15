# Open Questions — Need Product Owner / Tech Lead Answers

All questions verified against remote `origin/main` code as of latest fetch.
Questions marked 🔴 are blocking dev work. Questions marked 🟡 need answers before that phase starts.

---

## Authentication & Auth Architecture

### Q-AUTH-1 🔴 — Cookie auth vs Bearer token: which is the real system?
**Found in remote code:**
- `backend/src/middlewares/auth.middleware.js` reads token from `req.cookies.token` (httpOnly cookie)
- `backend/src/controllers/auth.controller.js` → `sendTokens()` sets `res.cookie("token", ...)` — never returns token in response body
- `frontend/src/api/axios.js` uses `withCredentials: true` and no Authorization header
- `frontend/src/auth/AuthContext.jsx` calls `/auth/me` to restore session — no localStorage

**But production server was running with Bearer tokens in localStorage** (confirmed in earlier chat sessions — `curl -H "Authorization: Bearer ..."` was working).

**The question:** The remote code is fully cookie-based. The production server has been patched to use Bearer tokens. Which architecture are we committing to going forward?

**Blocks:** Every new route, every new role, every frontend API call. Must be decided before any new feature work.

---

### Q-AUTH-2 🔴 — `VITE_API_BASE_URL` env var: what is the correct value for production?
**Found in remote code:**
- `frontend/src/api/axios.js` line 3: `const baseURL = import.meta.env.VITE_API_BASE_URL`
- Line 5–7: throws `Error` if not defined — the app will crash on load if this is missing
- Production currently uses `baseURL: "/api"` (manually patched)

**The question:** Should `VITE_API_BASE_URL` be set to `"/api"` (relative, works behind nginx proxy) or `"https://novaa.lemmecode.com/api"` (absolute)?

**Blocks:** Every frontend build and deployment.

---

### Q-AUTH-3 🟡 — `JWT_ACCESS_EXPIRY` and `JWT_REFRESH_EXPIRY`: are these set in production `.env`?
**Found in remote code:**
- `sendTokens()` uses `process.env.JWT_ACCESS_EXPIRY` and `process.env.JWT_REFRESH_EXPIRY`
- If these are undefined, `jwt.sign(..., { expiresIn: undefined })` creates tokens that never expire

**The question:** Are `JWT_ACCESS_EXPIRY` and `JWT_REFRESH_EXPIRY` set in the production `.env`? If not, all tokens are currently non-expiring.

---

### Q-AUTH-4 🟡 — Login only redirects to `/home` — no role-based routing exists yet
**Found in remote code:**
- `frontend/src/pages/auth/Login.jsx` line 92: `navigate("/home")` for all roles
- `frontend/src/App.jsx` lines 252–258: `/home` route checks `user.role` and redirects to role-specific dashboard
- Only 4 roles handled: `SUPER_ADMIN`, `COLLEGE_ADMIN`, `TEACHER`, `STUDENT`
- `PRINCIPAL` is in `constants.js` ROLE enum but has no route in `App.jsx`

**The question:** When PRINCIPAL logs in, where should they land? Same question for HOD (currently treated as TEACHER), and all new roles from Phase 4.

---

## Student Model & Status

### Q-STU-1 🔴 — `STUDENT_STATUS` in constants.js has no `OFFER_MADE`, `SEAT_CONFIRMED`, or `ENROLLED`
**Found in remote code:**
- `backend/src/utils/constants.js` STUDENT_STATUS: `PENDING, APPROVED, REJECTED, DELETED, ALUMNI, DEACTIVATED`
- `backend/src/controllers/promotion.controller.js` line 47: `status: "APPROVED"` hardcoded
- `backend/src/models/college.model.js` restore cascade: sets students back to `status: "APPROVED"` on college reactivation
- `backend/src/controllers/auth.controller.js` line 103: `student = await Student.findOne({ email, status: "APPROVED" })` — only APPROVED students can log in

**The question:** When we migrate `APPROVED` → `ENROLLED` (Phase 2), the login check, promotion filter, college restore cascade, and every other `status: "APPROVED"` reference must be updated simultaneously. Is there a safe migration window where the app can be taken offline briefly, or must this be a zero-downtime migration?

---

### Q-STU-2 🟡 — `user_id` on Student is `required: true` but `sparse: true` — contradiction
**Found in remote code:**
- `backend/src/models/student.model.js`: `user_id: { required: true, unique: true, sparse: true }`
- Comment says: "Allows documents without user_id during migration"
- But `registerStudent` in `student.controller.js` creates User FIRST then Student WITH `user_id`

**The question:** Is `sparse: true` still needed, or is it leftover from a migration that's already done? If it's leftover, it should be removed — `sparse: true` on a `required` field is contradictory and can allow null user_id documents.

---

### Q-STU-3 🟡 — Category `OTHER` is in `CATEGORY` constants but not in `FeeStructure` enum
**Found in remote code:**
- `backend/src/utils/constants.js` CATEGORY: `GEN, OBC, SC, ST, OTHER`
- `backend/src/models/feeStructure.model.js` category enum: `GEN, OBC, SC, ST, EWS`
- Note: FeeStructure has `EWS` but constants does NOT. Constants has `OTHER` but FeeStructure does NOT.

**The question:** What is the correct canonical list of categories? Should it be `GEN, OBC, SC, ST, EWS, OTHER`? Or should `OTHER` be removed from student registration? This directly causes issue #233 Bug 2 (students with `OTHER` category cannot be approved).

---

## Fee Structure

### Q-FEE-1 🔴 — Fee structure route is mounted at `/api/fees/structure` in `app.js`, not `/api/fee-structures`
**Found in remote code:**
- `backend/app.js`: `app.use("/api/fees/structure", require("./src/routes/feeStructure.routes"))`
- This is the WRONG path that was causing the production bug
- The rate limiter is also applied to `/api/fees/structure` not `/api/fee-structures`

**The question:** Should the route be renamed to `/api/fee-structures` (correct REST convention) in the remote repo? This requires updating `app.js` AND all frontend components that call it. Or should we keep `/api/fees/structure` since that's what the remote code uses?

**Blocks:** Every fee structure frontend fix. Must be decided before any frontend work on fee pages.

---

### Q-FEE-2 🟡 — `EWS` category exists in FeeStructure model but not in student CATEGORY constants
**Found in remote code:** (same as Q-STU-3 above, different angle)
If a fee structure is created for `EWS` category, no student can ever be matched to it because `EWS` is not a valid student category. This is dead data.

**The question:** Should `EWS` be added to student CATEGORY constants, or removed from FeeStructure enum?

---

## HOD Role

### Q-HOD-1 🔴 — `PRINCIPAL` is in `constants.js` ROLE enum but User model enum only has 4 roles
**Found in remote code:**
- `backend/src/utils/constants.js` ROLE: `SUPER_ADMIN, COLLEGE_ADMIN, TEACHER, STUDENT, HOD, PRINCIPAL`
- `backend/src/models/user.model.js` role enum: `["SUPER_ADMIN", "COLLEGE_ADMIN", "TEACHER", "STUDENT"]`
- HOD and PRINCIPAL are in constants but NOT in the User model enum

**The question:** If a user is created with `role: "PRINCIPAL"` or `role: "HOD"`, Mongoose will reject it because it's not in the User model enum. This means HOD and PRINCIPAL cannot actually be assigned to users right now. Is this intentional (planned for Phase 4) or an oversight that needs fixing now?

---

### Q-HOD-2 🟡 — HOD middleware still checks `role !== "TEACHER"` — HOD users would be blocked
**Found in remote code:**
- `backend/src/middlewares/hod.middleware.js` line 8: `if (!req.user || req.user.role !== "TEACHER")`
- This means only users with role `TEACHER` can pass the HOD check
- If HOD becomes a standalone role (Phase 4), HOD users will be blocked by their own middleware

**The question:** Should this be fixed now (change to `role !== "TEACHER" && role !== "HOD"`) as a pre-Phase-4 patch, or wait until Phase 4 when HOD is fully implemented?

---

## Promotion

### Q-PROM-1 🔴 — Promotion controller hardcodes `status: "APPROVED"` — will break after Phase 2
**Found in remote code:**
- `backend/src/controllers/promotion.controller.js` line 47: `status: "APPROVED"`
- After Phase 2 migration, all enrolled students will have `status: "ENROLLED"`
- Promotion screen will show zero students after the migration

**The question:** Should the promotion controller be updated to `status: "ENROLLED"` as part of Phase 2, or as a separate task? It must be done atomically with the migration script.

---

### Q-PROM-2 🟡 — `getAcademicYearLabel()` uses `Math.ceil(semester / 2)` — breaks for non-standard programs
**Found in remote code:**
- `backend/src/controllers/promotion.controller.js` lines 10–16: hardcoded formula
- A 3-semester diploma would show "2nd Year" for semester 3 (wrong — it's the final semester)
- A 4-year engineering program would show "4th Year" for semester 7 (correct) but "4th Year" for semester 8 too (wrong — should be "Final Year" or "4th Year Sem 2")

**The question:** Are there any non-standard programs (diplomas, 4-year engineering) currently in the system? If yes, this is a live bug. If no, it can wait for Phase 3.

---

## College Model & Soft Delete

### Q-COL-1 🟡 — College restore cascade sets students back to `APPROVED` — will be wrong after Phase 2
**Found in remote code:**
- `backend/src/models/college.model.js` restore cascade (line ~130): sets `status: "APPROVED"` for students
- After Phase 2, enrolled students have `status: "ENROLLED"`, not `APPROVED`
- Reactivating a college after Phase 2 would set all enrolled students back to `APPROVED` (which won't exist)

**The question:** Should the college restore cascade be updated as part of Phase 2, or is college deactivation/reactivation rare enough that it can be patched separately?

---

### Q-COL-2 🟡 — College model has no `institutionType` field — but INSTITUTION_TYPE_ANALYSIS.md exists
**Found in:** `/home/lemmecode-novaa/smart-college-mern/INSTITUTION_TYPE_ANALYSIS.md` exists as a file
**Found in remote code:** College model has no `institutionType` field

**The question:** Was the institution type analysis acted on? Should the College model have an `institutionType` field (e.g., ARTS, ENGINEERING, MEDICAL, POLYTECHNIC)? This affects fee structure defaults, course types, and document requirements.

---

## Teacher Model

### Q-TEACH-1 🟡 — Teacher has a `password` field but User model handles auth — which is used?
**Found in remote code:**
- `backend/src/controllers/auth.controller.js` login: `await bcrypt.compare(password, teacher.password)` — reads from Teacher model directly
- But Teacher model in remote code does NOT show a `password` field in the schema
- User model has `password` field

**The question:** Does the Teacher model have a `password` field or not? If login uses `teacher.password` but the field doesn't exist in the schema, teacher login is broken. Need to verify the actual Teacher model in production DB.

---

### Q-TEACH-2 🟡 — Teacher `courses[]` is a flat ObjectId array — no year, no room, no division
**Found in remote code:** Confirmed — `courses: [{ type: ObjectId, ref: 'Course' }]`

**The question:** Are teachers currently assigned to courses in production? If yes, the Phase 3 migration (converting `courses[]` to `courseAssignments[]`) needs to preserve existing assignments. How many teachers have course assignments in the live DB?

---

## Email

### Q-EMAIL-1 🔴 — Email service uses a single global transporter — no `collegeId` parameter anywhere
**Found in remote code:**
- `backend/src/services/email.service.js`: all functions use a single `transporter` created at module load
- None of the send functions accept a `collegeId` parameter
- The transporter reads from `process.env.EMAIL_USER` and `process.env.EMAIL_PASS`

**The question:** The immediate fix (Gmail App Password) is clear. But for Phase 1 Track C (per-college email), every controller that calls email functions needs to pass `collegeId`. How many controllers call email functions? (Answer: at least `studentApproval.controller.js`, `student.controller.js`, `admin.payment.controller.js`, `auth.controller.js`). Should this be a breaking change (update all callers at once) or a backward-compatible change (collegeId optional, falls back to platform SMTP)?

---

## Billing

### Q-BILL-1 🔴 — What are the exact plan tiers and pricing?
Options needed: BASIC / PREMIUM / ENTERPRISE — what does each cost per year?
**Blocks:** Invoice creation UI, invoice PDF generation, billing cron job thresholds.

### Q-BILL-2 🔴 — Billing cycle — academic year (Jun–May) or calendar year (Jan–Dec)?
**Blocks:** Invoice date logic, subscription renewal reminders, trial expiry calculation.

### Q-BILL-3 🟡 — Does LemmeCode have a GSTIN?
Needed for GST-compliant invoice PDF (seller GSTIN field, CGST/SGST/IGST split).
**Blocks:** Invoice PDF generation.

### Q-BILL-4 🟡 — Is BILLING_MANAGER a separate person or does SUPER_ADMIN handle billing?
Affects whether to build the BILLING_MANAGER role at all in Phase 1.

### Q-BILL-5 🟡 — What happens to college data after 30-day suspension — retained 90 days or deleted?
Affects data retention policy (also Issue #217).

### Q-BILL-6 🟡 — Should trial colleges have 30-day expiry or no expiry?
Affects trial setup logic when Super Admin creates a new college.

---

## Credential Delivery

### Q-CRED-1 🟡 — Temp password expiry — 24 hours or 48 hours?
Affects `tempPasswordExpiresAt` calculation.

### Q-CRED-2 🟡 — Should onboarding wizard be mandatory or fully optional?
**Blocks:** Onboarding wizard frontend build.

### Q-CRED-3 🟡 — Should teacher accounts also have `mustChangePassword` enforced, or only College Admin?
Affects scope of the credential delivery system.

### Q-CRED-4 🟡 — Should the system send an SMS as fallback when email fails?
Affects whether to integrate an SMS gateway.

---

## Admission Workflow (Phase 2)

### Q-ADM-1 🟡 — Should OFFER_MADE trigger an automatic email to the student, or is it manual?
Affects email send logic in `makeOffer` controller.

### Q-ADM-2 🟡 — Is downpayment amount mandatory at SEAT_CONFIRMED, or optional?
Affects validation in `confirmSeat` controller.

### Q-ADM-3 🟡 — Can a student be re-offered after being WITHDRAWN? Or is WITHDRAWN permanent?
Affects status transition rules.

### Q-ADM-4 🟡 — Should the system track offer expiry (how many days in OFFER_MADE state)?
Affects whether to build an offer expiry cron job.

---

## Year Labels & Teacher Classroom (Phase 3)

### Q-YR-1 🟡 — Should fee structures be defined per year-label or per semester?
Affects fee structure model and approval flow.

### Q-YR-2 🟡 — Can a course have an odd number of semesters (e.g., 3 semesters for a diploma)?
Affects year label calculation logic. Currently `durationSemesters` max is 8 in Course model.

### Q-TCH-1 🟡 — Who assigns classrooms — College Admin at teacher creation, or HOD at timetable creation?
Affects where the classroom assignment UI lives.

### Q-TCH-2 🟡 — Should room conflict be a hard block or soft warning?
Affects timetable slot creation validation.

### Q-TCH-3 🟡 — Should classroom assignments reset every academic year or carry forward?
Affects academic year rollover logic.

---

## New Roles (Phase 4)

### Q-ROLE-1 🟡 — Can ACCOUNTANT create fee structures or only record payments?
Affects which fee structure routes ACCOUNTANT gets access to.

### Q-ROLE-2 🟡 — Can ADMISSION_OFFICER reject students or only approve/offer?
Affects which routes ADMISSION_OFFICER gets access to.

### Q-ROLE-3 🟡 — Should PRINCIPAL be able to override College Admin decisions?
Affects whether PRINCIPAL gets any write access.

### Q-ROLE-4 🟡 — Who creates ACCOUNTANT and ADMISSION_OFFICER accounts — College Admin or Super Admin?
Affects staff creation endpoint access control.

### Q-ROLE-5 🟡 — Should EXAM_COORDINATOR be built in Phase 4 (limited) or deferred to V1.1?
Affects Phase 4 scope.

---

## HOD Timetable & ID Card (Phase 6)

### Q-HOD-3 🟡 — Can HOD assign a teacher from another department (visiting lecturer)?
Affects teacher dropdown filter in timetable builder.

### Q-HOD-4 🟡 — Can HOD see other departments' timetables (read-only)?
Affects HOD dashboard scope.

### Q-ID-1 🟡 — ID card size — credit card (85.6×54mm) or A4 with 4 cards per page?
Affects pdfkit layout.

### Q-ID-2 🟡 — Bulk ID card output — ZIP of individual PDFs or single multi-page PDF?
Affects bulk generation endpoint.

---

## Promotion (Phase 5)

### Q-PROM-3 🟡 — What is the maximum ATKT count allowed? Is it configurable per college?
Affects promotion gate logic.

### Q-PROM-4 🟡 — Should system send notification to student when academic status is set?
Affects notification logic in `setAcademicStatus` controller.

---

## Summary — Must Answer Before Any Sprint Starts

These are the questions that block the most work. Answer these first:

| # | Question | Blocks |
|---|---|---|
| Q-AUTH-1 | Cookie auth vs Bearer token | Everything |
| Q-AUTH-2 | `VITE_API_BASE_URL` value | Every frontend build |
| Q-FEE-1 | Fee route path `/api/fees/structure` vs `/api/fee-structures` | All fee frontend work |
| Q-STU-3 | Canonical category list (OTHER vs EWS) | Issue #233 Bug 2 fix |
| Q-HOD-1 | PRINCIPAL/HOD not in User model enum | Phase 4 |
| Q-BILL-1 | Pricing tiers | Billing invoice UI |
| Q-BILL-2 | Billing cycle | Billing cron jobs |
| Q-STU-1 | Migration window for APPROVED → ENROLLED | Phase 2 |
