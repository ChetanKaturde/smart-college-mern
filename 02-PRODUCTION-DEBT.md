# Production Debt

Problems found in production that are NOT tracked as GitHub issues yet.
Sources: chat history, log analysis, code investigation.

---

## 🔴 Critical

### P1 — Email completely broken in production
**Found in:** Chat history (amazonq2.md), MASTER_PLAN/06-phase1-email-config.md
**Error in logs:** `534 Application-specific password required` (EAUTH)

Gmail requires an App Password but a plain password is configured in `.env`.
All email notifications are silently failing:
- Student registration confirmation
- Admission approval/rejection emails
- Payment receipts
- Payment reminders
- Low attendance alerts
- OTP / password reset emails

Immediate fix: Generate a Gmail App Password and update `EMAIL_PASS` in `.env`.
Proper fix: Phase 1 — per-college email configuration.

---

### P2 — `subscriptionExpiry` field doesn't exist on College model
**Found in:** MASTER_PLAN/00-master.md, MASTER_PLAN/02-phase1-billing.md

`collegeIsolation.middleware.js` checks `college.subscriptionExpiry` to block expired colleges — but this field does not exist on the College model. The check never triggers. Every college has indefinite free access regardless of payment.

The platform has zero revenue enforcement mechanism.

Fix: Phase 1 — billing model.

---

### P3 — Mock payment endpoint in production codebase
**Found in:** Chat history (amazonq2.md)

`mock.payment.controller.js` exists in the production codebase. This is a development artifact that should be removed before any public release.

---

### P4 — Local is 18 commits behind remote main
**Found in:** git status check

Local server has not pulled the latest 18 commits from `origin/main`. Notable recent merges:
- PR #232 — Features merge
- PR #229 — Issue-Solving (Rohidas)
- PR #231 — Student docs removal (Sandesh)
- Payment gateway security fixes (Issues #2–#6)
- Timetable display fixes

The server is running stale code. Need to pull and redeploy.

---

### P5 — Unpushed local commit on server
**Found in:** git status check

Local server has 1 commit not pushed to remote:
- `9211410` — `fix: resolve login failure and production build issues`

This commit exists only on the server. If the server is rebuilt or reset, this fix is lost.
Push it or verify the fix is already in remote.

---

## 🟡 Medium

### P6 — Academic year hardcoded in receipt responses
**Found in:** Chat history (amazonq2.md)

Receipt responses hardcode `"2025-2026"` as academic year. This is a minor bug that will cause wrong data on receipts after the academic year changes.

---

### P7 — Stripe fully implemented backend-side but not exposed in student UI
**Found in:** Chat history (amazonq2.md)

Stripe checkout session flow is fully built in the backend but only Razorpay is active for students in the frontend. Stripe is effectively dead code from the student's perspective.

---

### P8 — HOD is not a separate role — it's a permission overlay
**Found in:** Chat history (amazonq2.md), MASTER_PLAN/07-phase4-roles.md

HOD privileges are dynamically checked against `department.hod_id` field. Any teacher assigned as HOD gets timetable creation rights. This is inconsistent with the planned role system.

`hod.middleware.js` checks `req.user.role !== "TEACHER"` — this needs to change to `req.user.role !== "HOD"` once HOD becomes a standalone role in Phase 4.

---

### P9 — Production `app.js` diverged from repo `app.js`
**Found in:** Chat history (just previouschatamazonq.md)

During earlier debugging sessions, the production `app.js` at `/home/lemmecode-novaa/htdocs/novaa.lemmecode.com/app.js` was manually edited (dashboard route added, alias route added). These changes are NOT in the GitHub repository.

The production server is running a manually patched version of `app.js` that will be overwritten on next deploy from GitHub.

---

### P10 — Frontend build in production may be stale
**Found in:** Chat history

Multiple rounds of manual build + copy to `/home/lemmecode-novaa/htdocs/novaa.lemmecode.com/public/` were done during debugging. The current deployed frontend may not match the current `frontend/src` source code.

Verify by checking build timestamps vs last source edit.

---

## 🟢 Low

### P11 — 36+ console.log statements in frontend production code
**Found in:** GITHUB_ISSUES.md

Console statements left in production build. Minor performance and security concern (potential data leakage in browser console).

### P12 — No `.env.example` file in repository
**Found in:** Chat history

GitHub code requires `VITE_API_BASE_URL` and other env vars but no `.env.example` is provided. New developers have no reference for what env vars are needed.

### P13 — No S3 / cloud storage for uploads
**Found in:** Issue #213

All uploaded files (student documents, photos) stored on local server disk. No backup strategy. Will be lost if server is migrated or disk fails.
