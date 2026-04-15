# Sprint Order — Recommended Sequence

Based on: dependency map, severity of issues, what blocks what.

---

## Sprint 0 — Immediate Fixes (No Dependencies, Do Now)

These are all independent. Can be done in any order. No feature work should start until these are done.

| Task | Issue | Who | Time |
|---|---|---|---|
| Fix Gmail App Password in `.env` (unblocks all emails) | — | DevOps | 15 min |
| Pull remote main (18 commits behind) | — | DevOps | 30 min |
| Push unpushed local commit `9211410` to remote | — | DevOps | 10 min |
| Remove student PDFs from GitHub repo + BFG history rewrite | #182 | Rohidas | 1 hr |
| Rotate JWT_SECRET, fix SUPER_ADMIN_PASSWORD, fix Stripe key | #225 | DevOps | 30 min |
| Add FRONTEND_URL and CORS_ORIGINS to production `.env` | #223 | DevOps | 15 min |
| Fix localhost fallback in 4 frontend files | #224 | Frontend dev | 1 hr |
| Remove `mock.payment.controller.js` from codebase | — | Backend dev | 15 min |

**Goal:** Production is secure, emails work, server is up to date.

---

## Sprint 1 — Phase 1 Foundation (3 parallel tracks)

These three tracks are independent of each other. Assign to different developers.

### Track A — Billing Model
**Blocked by:** Q-B1 (pricing tiers) and Q-B6 (billing cycle) — get answers before starting invoice UI
**Can start now:** College model additions (B1), Invoice model (B2), fix collegeIsolation middleware (B3)

Order:
1. Add subscription/billing fields to College model
2. Create Invoice model
3. Fix `collegeIsolation.middleware.js` to actually check `subscriptionExpiry`
4. (Wait for Q-B1, Q-B6 answers)
5. Invoice CRUD endpoints + PDF generation
6. Frontend invoice pages

---

### Track B — Credential Delivery
**No blockers.** Start immediately after Sprint 0.

Order:
1. Add fields to User model (`mustChangePassword`, `tempPasswordExpiresAt`, etc.)
2. `mustChangePassword` middleware
3. `changePassword` endpoint
4. Temp password expiry check on login
5. Show credentials once on college creation (modal)
6. Reset credentials endpoint
7. Frontend: Change Password page + axios interceptor
8. (Wait for Q-C2 answer)
9. Frontend: Onboarding wizard

---

### Track C — Per-College Email Config
**No blockers.** Start immediately after Sprint 0 immediate fix.

Order:
1. `CollegeEmailConfig` model
2. `collegeEmail.service.js` with transporter caching + fallback
3. Update all 8 email send functions to accept `collegeId`
4. Config endpoints (GET/POST/DELETE/verify)
5. Frontend: Email Configuration page in System Settings

---

## Sprint 2 — Phase 2: Admission Workflow Redesign

**Blocked by:** Sprint 1 Track B (credential delivery must exist — credentials sent at SEAT_CONFIRMED)
**Blocked by:** Q-A1, Q-A2, Q-A3 answers

Order:
1. Run migration script: `APPROVED` → `ENROLLED` on all existing students (do first, before any code change)
2. Update student status constants + Student model (new statuses + new fields)
3. New controller actions: `makeOffer`, `confirmSeat`, `enrollStudent`, `withdrawOffer`
4. Fix orphaned User bug (User only created at `enrollStudent`)
5. Update all `status === "APPROVED"` checks across codebase → `ENROLLED`
6. New routes
7. Frontend: replace Approve button with 4 state-aware buttons
8. Frontend: admission funnel view
9. Frontend: update all student list filters

---

## Sprint 3 — Phase 3: Year Labels + Teacher Classroom

**Blocked by:** Sprint 0 (server sync)
**Blocked by:** Q-Y1, Q-T1, Q-T3 answers

Order:
1. Add `yearLabels` to Course model
2. `getYearLabel()` utility function
3. Migration script: auto-generate default labels for existing courses
4. Update all display points (promotion, student, timetable, attendance controllers)
5. Frontend: year label fields in AddCourse/EditCourse
6. Replace `courses[]` with `courseAssignments[]` on Teacher model
7. Teacher controller: accept courseAssignments
8. Timetable slot: auto-fill room + conflict detection
9. Migration script: convert existing teacher courses
10. Frontend: courseAssignments form in AddTeacher/EditTeacher
11. Frontend: timetable builder room auto-fill

---

## Sprint 4 — Phase 4: New Roles

**Blocked by:** Sprint 2 (ADMISSION_OFFICER depends on new status states)
**Blocked by:** Sprint 1 Track B (credential delivery needed for staff account creation)
**Blocked by:** Q-R1, Q-R2, Q-R5, Q-R6 answers

Order:
1. Foundation: add all roles to constants + User model enum
2. Fix HOD middleware (TEACHER → HOD role check)
3. Staff account management endpoints (create/list/update/link-parent)
4. ACCOUNTANT role — backend routes + frontend pages
5. ADMISSION_OFFICER role — backend routes + frontend pages
6. PRINCIPAL role — backend routes + frontend pages
7. EXAM_COORDINATOR role — backend routes + placeholder frontend (if Q-R6 says build now)
8. PARENT_GUARDIAN role — new model + middleware + routes + frontend pages
9. PLATFORM_SUPPORT role — backend routes
10. Login routing: add redirect cases for all new roles

---

## Sprint 5 — Phase 5: Promotion with Academic Status

**Blocked by:** Sprint 2 (uses ENROLLED status)
**Blocked by:** Q-P1 answer (max ATKT count)

Order:
1. Add `promotionEligibility` to Student model
2. Update promotion gate logic
3. New `setAcademicStatus` endpoint
4. Fix hardcoded year label in promotion response (use `getYearLabel()` from Sprint 3)
5. Frontend: academic status column + set-status UI in promotion screen

---

## Sprint 6 — Phase 6: HOD Timetable + ID Card

**Blocked by:** Sprint 3 (year labels + teacher classroom assignment)
**Blocked by:** Q-H1, Q-H2, Q-I1, Q-I2, Q-I3 answers

Order:
1. HOD-scoped timetable endpoints (teachers, subjects, rooms)
2. Timetable builder: department-scoped teacher dropdown
3. Subject dropdown filtered by teacher
4. Room auto-fill
5. HOD dashboard: "My Teaching Schedule" tab + "Add My Slot" shortcut
6. ID card generator utility (pdfkit)
7. ID card endpoints (single + bulk)
8. Frontend: Download ID Card button in ViewStudent + StudentProfile
9. Frontend: bulk ID card generation in student list

---

## Dependency Map (Visual)

```
Sprint 0 (security/legal fixes)
    │
    ├── Sprint 1A (billing)          ← blocked by Q-B1, Q-B6
    ├── Sprint 1B (credentials)      ← no blockers
    └── Sprint 1C (email config)     ← no blockers
              │
              └── Sprint 2 (admission workflow)   ← blocked by Sprint 1B + Q-A1,A2,A3
                        │
                        ├── Sprint 4 (new roles)  ← blocked by Sprint 2 + Sprint 1B + Q-R1,R2,R5
                        └── Sprint 5 (promotion)  ← blocked by Sprint 2 + Q-P1

Sprint 3 (year labels + teacher classroom)   ← blocked by Sprint 0 + Q-Y1,T1,T3
    │
    └── Sprint 6 (HOD timetable + ID card)   ← blocked by Sprint 3 + Q-H1,H2,I1,I2,I3
```

---

## What to Do Right Now (Today)

1. Answer the open questions in `04-OPEN-QUESTIONS.md` — especially Q-B1, Q-B6, Q-A1, Q-A2, Q-C2
2. Run Sprint 0 fixes (security/legal — no questions needed, just do it)
3. Assign Sprint 1 tracks to developers (all three can run in parallel)
4. Pull remote main to server after Sprint 0 security fixes are confirmed
