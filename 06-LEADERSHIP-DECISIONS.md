# NOVAA — Decisions Needed from Leadership

**What this document is:**
A plain-language explanation of every open decision that is currently blocking the development team.
Each decision is explained in terms of what it affects, what happens if we delay it, and what the options are.

**What this document is not:**
A technical specification. No code. No jargon.

**Who needs to read this:**
Product owner, investors, and anyone who has authority to make product and business decisions.

**How to use it:**
Read each section, pick an answer, and communicate it to the development team.
The faster these are answered, the faster the product ships.

---

## The Big Picture First

The platform currently runs on a staging environment. Two tracks of work are running in parallel:

**Track 1 — Things that are broken right now.**
Some features are not working in the current build. These are not design decisions — they are bugs and configuration issues. They need to be fixed regardless of any business decision.

**Track 2 — Things that need to be built.**
The product roadmap has six phases of new features. Several of those phases cannot start until leadership answers the questions in this document.

The development team can fix Track 1 immediately. Track 2 is waiting on you.

---

## Section 1 — Revenue: The Platform Currently Has No Way to Charge Colleges

### What is happening right now

Every college on NOVAA has free, unlimited access. There is no billing system. There is no subscription. There is no invoice. There is no way to cut off a college that has not paid.

The code has a check that is supposed to block expired colleges — but the field it checks (`subscriptionExpiry`) does not exist in the database. So the check never fires. Every college, forever, has full access.

### Why this matters

The platform cannot generate revenue until this is built. Every college onboarded before billing is live is a college that may resist paying later. The longer this waits, the harder the conversation becomes.

### What needs to be decided

**Decision 1-A: What are the pricing tiers?**

The billing system needs to know what to charge. The development team needs at minimum:
- The name of each plan (e.g., Basic, Premium, Enterprise)
- The annual price of each plan
- What each plan includes or limits (number of students, number of teachers, features)

Without this, the invoice creation screen cannot be built.

**Decision 1-B: What is the billing cycle?**

Two options:
- Academic year (June to May) — aligns with how Indian colleges think about their budget
- Calendar year (January to December) — simpler for accounting

This affects when invoices are generated, when reminders are sent, and when subscriptions expire.

**Decision 1-C: Does LemmeCode have a GST registration number (GSTIN)?**

Indian B2B invoices above ₹20,000 require GST. If LemmeCode has a GSTIN, invoices must show CGST/SGST/IGST breakdown. If not, invoices are simpler but may not be acceptable to college finance departments.

**Decision 1-D: Who handles billing internally?**

Option A: The Super Admin (platform owner) handles all billing directly.
Option B: A separate BILLING_MANAGER role is created for a finance team member who can manage invoices without having access to college academic data.

**Decision 1-E: What happens to a college's data after they stop paying?**

Recommended sequence: 7-day warning → 15-day grace period → read-only access → 30-day suspension → data deletion.

The question is: how long after suspension before data is permanently deleted? 30 days? 90 days? Never (data retained indefinitely)?

This is both a product decision and a legal one (DPDPA 2026 data retention obligations).

**Decision 1-F: Do trial colleges get a time limit?**

When a new college is onboarded, should they get a 30-day free trial that expires automatically, or should they have unlimited access until billing is set up manually?

---

## Section 2 — The Admission Process Is Broken by Design

### What is happening right now

When a student applies to a college on NOVAA, the admin sees the application and clicks "Approve." The moment they click Approve:
- A login account is created for the student
- A fee record is created
- Credentials are emailed to the student

This sounds reasonable. But it is wrong for how Indian college admissions actually work.

### Why this is a problem

In India, a student typically applies to 5–10 colleges simultaneously. When a college "approves" them, it means "we are offering you a seat" — not "you are enrolled." The student may never actually join. They may choose a different college.

Under the current system, every student who gets an offer immediately gets a login account and a fee record — even if they never show up. This creates:
- Orphaned accounts for students who never enrolled
- Fee records that will never be paid
- Inaccurate enrollment numbers
- Confusion when the same student applies to multiple colleges on the platform

### The fix that is planned

Replace the single "Approve" button with a four-step process:

**Step 1 — Make Offer** (admin action)
The college reviews the application and decides to offer a seat. No account is created. No fee record is created. An email is sent to the student saying "you have been offered a seat."

**Step 2 — Confirm Seat** (admin action, after student visits college)
The student visits the college, pays a downpayment, and signs documents. The admin records this. Still no login account.

**Step 3 — Enroll** (admin action)
The admin formally enrolls the student. At this moment — and only at this moment — a login account is created, a fee record is created, and credentials are sent.

**Step 4 — Withdraw** (admin action, if student declines)
If the student decides not to join after receiving an offer, the admin marks them as Withdrawn. No data is left behind.

### What needs to be decided

**Decision 2-A: Should the offer email be sent automatically, or should the college call the student manually?**

When the admin clicks "Make Offer," should the system automatically send an email to the student? Or should the system just change the status, and the college contacts the student through their own channels?

Some colleges prefer to call students personally. Others want the system to handle communication.

**Decision 2-B: Is the downpayment amount required at Seat Confirmation, or optional?**

When the admin clicks "Confirm Seat," should they be required to enter a downpayment amount? Or is it optional (some colleges may not take a downpayment)?

**Decision 2-C: Can a student be re-offered after withdrawing?**

If a student withdraws (declines the offer), can the admin re-offer them later? Or is a withdrawal permanent?

**Decision 2-D: Should offers expire automatically?**

If a student receives an offer but does not confirm their seat within X days, should the system automatically expire the offer? If yes, how many days?

### Important note on timing

This change affects every part of the system that currently looks for "approved" students — the promotion screen, the attendance system, the fee system, the login system. All of them need to be updated at the same time. This is a significant change that requires a brief maintenance window. The development team needs to know: **is there a time when the platform can be taken offline for 30–60 minutes for this migration?**

---

## Section 3 — Emails Are Not Being Sent

### What is happening right now

Every email the platform is supposed to send — registration confirmations, approval notifications, rejection notices, payment receipts, payment reminders, low attendance alerts, password reset OTPs — is silently failing.

The error in the server logs: `534 Application-specific password required`.

Gmail requires a special "App Password" for third-party applications. The platform is using a regular Gmail password, which Gmail rejects.

### The immediate fix (15 minutes of work)

Generate a Gmail App Password from the Google account settings and update one line in the server configuration. This unblocks all emails immediately.

**This requires access to the Gmail account that is configured as the platform's email sender.** Who has access to that account?

### The longer-term fix (Phase 1)

Currently, all emails from all colleges come from a single platform Gmail account. This means a student at College A receives an email from a generic NOVAA address, not from their college's email. This looks unprofessional.

The plan is to allow each college to configure their own email (SMTP settings), so emails appear to come from the college directly. This is already designed and ready to build — it just needs the immediate fix first.

---

## Section 4 — New Staff Roles: Who Can Do What

### What is happening right now

NOVAA has four roles: Super Admin, College Admin, Teacher, Student.

In a real college, the College Admin role is doing the work of five different people:
- The Principal (oversight)
- The Accountant (fees and payments)
- The Admission Officer (processing applications)
- The Exam Coordinator (results and exams)
- The HOD (department timetables)

All of these people currently share one login or one person does everything. This does not scale.

### What is planned

Six new roles, each with a specific, limited set of permissions:

**PRINCIPAL** — Can see everything in the college. Cannot change anything (except sending announcements). Useful for oversight without risk of accidental changes.

**ACCOUNTANT** — Can see and manage fees, payments, and receipts. Cannot see academic data (attendance, timetables, student marks). Useful for separating financial access from academic access.

**ADMISSION OFFICER** — Can process pending applications (offer seats, confirm seats, enroll students). Cannot see enrolled students' academic or financial records. Useful for colleges with a dedicated admissions team.

**EXAM COORDINATOR** — Can view student and teacher data for exam planning purposes. The full exam module (marks entry, hall tickets) is planned for a later version.

**PARENT / GUARDIAN** — Can view their own child's attendance, fees, and profile. Read-only. Cannot see any other student's data.

**PLATFORM SUPPORT** — A LemmeCode internal role. Can view the college list and system health. Cannot access any college's academic or financial data.

### What needs to be decided

**Decision 4-A: Can the Accountant create fee structures, or only record payments?**

Option A: Accountant can create and edit fee structures (the pricing per course per category) AND record payments.
Option B: Accountant can only record payments. Fee structures are created by the College Admin only.

This is a question of how much financial authority the Accountant role should have.

**Decision 4-B: Can the Admission Officer reject students, or only process approvals?**

Option A: Admission Officer can make offers, confirm seats, enroll students, AND reject applications.
Option B: Admission Officer can only move applications forward (offer, confirm, enroll). Rejections require College Admin approval.

**Decision 4-C: Who creates Accountant and Admission Officer accounts?**

Option A: The College Admin creates these accounts for their own college.
Option B: The Super Admin creates these accounts when setting up a college.

Option A gives colleges more autonomy. Option B gives the platform more control over who gets access.

**Decision 4-D: Should the Exam Coordinator role be built now (limited version) or later (with the full exam module)?**

Building it now means a placeholder dashboard with no real functionality yet. Building it later means it ships alongside the exam module (marks entry, hall tickets, results). The exam module is planned for a future version.

---

## Section 5 — Student Promotion: The System Cannot Track Pass or Fail

### What is happening right now

The only thing blocking a student from being promoted to the next semester is whether they have paid their fees. There is no way to record whether a student passed their exams, failed, or has backlogs (ATKT — Allowed to Keep Terms).

A student who failed every exam can be promoted as long as their fees are paid. A student who passed everything but has one pending installment cannot be promoted.

### What is planned

A simple academic status flag per student: PASS, FAIL, ATKT (backlog), or PENDING RESULT.

The promotion screen will require the admin to set this status before promoting. A student with FAIL status cannot be promoted. A student with ATKT status can be promoted only if their backlog count is within the allowed limit.

### What needs to be decided

**Decision 5-A: What is the maximum number of backlogs (ATKT) allowed for promotion?**

Different colleges have different rules. Some allow promotion with up to 2 backlogs. Some allow up to 4. Some have no limit.

Should this be a fixed platform rule, or should each college be able to configure their own limit?

**Decision 5-B: Who enters the academic status — College Admin or Exam Coordinator?**

Currently only College Admin exists. Once the Exam Coordinator role is built (Decision 4-D), should they be the ones entering pass/fail results?

---

## Section 6 — Year Labels: The System Says "Semester 5" When It Should Say "TY"

### What is happening right now

Every screen in NOVAA that shows a student's academic year displays it as "Semester 5" or "3rd Year." Indian colleges do not use this language. They say FY (First Year), SY (Second Year), TY (Third Year).

This affects: student profiles, timetable displays, attendance reports, ID cards, promotion screens, and fee receipts.

### What is planned

Allow each course to define its own year labels. A 3-year BA course would have FY, SY, TY. A 4-year engineering course would have FY, SY, TY, Final Year. A 1-year diploma would just have FY.

### What needs to be decided

**Decision 6-A: Should fee structures be defined per year-label or per semester?**

Currently, a fee structure is defined per course per student category (e.g., BA + OBC = ₹45,000/year). The question is whether the fee should be the same for all years of the course, or whether FY students pay a different amount than TY students.

If fees differ by year, the fee structure model needs to be redesigned. If fees are the same across all years, no change is needed.

**Decision 6-B: Can a course have an odd number of semesters?**

Standard courses have 2 semesters per year (6 semesters for a 3-year course). But some diploma programs have 3 semesters total, or other non-standard structures.

Does NOVAA need to support these, or is the standard 2-semesters-per-year structure sufficient for now?

---

## Section 7 — Student ID Cards

### What is planned

The system already has all the data needed to generate student ID cards: name, photo, enrollment number, course, year, department, college logo, and QR code. The ID card generator just needs to be built.

### What needs to be decided

**Decision 7-A: What size should the ID card be?**

Option A: Credit card size (85.6mm × 54mm) — standard wallet size, requires a card printer
Option B: A4 page with 4 cards per page — can be printed on any printer and cut

**Decision 7-B: Should the ID card include a QR code?**

The QR code would encode the student's ID and enrollment number. Scanning it would confirm the student's identity. This is useful for security at college gates.

**Decision 7-C: For bulk ID card generation, should the output be one PDF with all cards, or a ZIP file with one PDF per student?**

One PDF is easier to print in bulk. Individual PDFs are easier to email to students.

**Decision 7-D: Should students be able to download their own ID card from their dashboard?**

This removes the need for the college to distribute physical cards. Students can print their own.

---

## Section 8 — HOD Timetable Management

### What is happening right now

The HOD (Head of Department) creates timetables for their department. When adding a class slot, they have to manually type the room number every time. There is no conflict detection — two classes can be scheduled in the same room at the same time without any warning.

### What is planned

- Teachers will be assigned to specific classrooms as part of their profile setup
- When the HOD creates a timetable slot, the room auto-fills from the teacher's assignment
- The system will detect conflicts (same teacher double-booked, same room double-booked) and warn or block

### What needs to be decided

**Decision 8-A: Should a room conflict be a hard block or a soft warning?**

Hard block: The HOD cannot save the slot if the room is already booked at that time.
Soft warning: The HOD sees a warning but can override it (useful for shared labs or flexible spaces).

**Decision 8-B: Can the HOD assign a teacher from another department?**

Some colleges have visiting lecturers or teachers who teach across departments. Should the HOD be able to add a slot for a teacher who belongs to a different department?

---

## Summary — Decisions Ranked by Urgency

### Must answer immediately (blocking current work)

| # | Decision | Why it cannot wait |
|---|---|---|
| 3 | Who has access to the Gmail account? | Emails have been broken for weeks. Every approval, rejection, payment receipt, and OTP is failing silently. |
| 1-A | Pricing tiers | The platform has zero revenue mechanism. Cannot build billing without knowing what to charge. |
| 1-B | Billing cycle | Affects every invoice, reminder, and expiry calculation. |
| 2 (migration window) | When can the platform go offline for 30–60 minutes? | The admission workflow redesign requires a one-time data migration. Cannot be done while the platform is live. |

### Answer before Phase 2 starts (admission workflow)

| # | Decision | Impact if delayed |
|---|---|---|
| 2-A | Offer email — automatic or manual? | Affects how the "Make Offer" button works |
| 2-B | Downpayment — required or optional? | Affects form validation |
| 2-C | Can withdrawn students be re-offered? | Affects status transition rules |
| 4-B | Can Admission Officer reject students? | Affects what buttons appear on the admission screen |

### Answer before Phase 4 starts (new roles)

| # | Decision | Impact if delayed |
|---|---|---|
| 4-A | Accountant fee structure access | Affects which screens the Accountant can see |
| 4-C | Who creates staff accounts? | Affects the staff creation flow |
| 4-D | Build Exam Coordinator now or later? | Affects Phase 4 scope and timeline |
| 5-A | Maximum ATKT count | Affects promotion gate logic |

### Answer before Phase 6 starts (ID cards, HOD timetable)

| # | Decision | Impact if delayed |
|---|---|---|
| 7-A | ID card size | Affects the PDF layout |
| 7-B | QR code on ID card | Affects what data is encoded |
| 7-C | Bulk output format | Affects the bulk generation endpoint |
| 7-D | Student self-download | Affects student dashboard |
| 8-A | Room conflict — hard block or warning | Affects timetable slot validation |
| 8-B | Cross-department teacher assignment | Affects HOD teacher dropdown |

---

## One Final Note

Several of these decisions have no wrong answer — they are product choices that depend on what kind of platform NOVAA wants to be. The development team is not asking for permission to build. They are asking for direction so they build the right thing the first time.

Every week these questions go unanswered is a week of development time spent on lower-priority work while the high-priority features wait.
