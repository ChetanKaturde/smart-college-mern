# Bugs & Security — Open GitHub Issues

All issues currently open on https://github.com/ChetanKaturde/smart-college-mern/issues

---

## 🔴 Critical — Legal / Security (Do First, No Dependencies)

### Issue #182 — Student documents in public GitHub repo
**Status:** OPEN
**Assigned:** Rohidas
**Severity:** DPDPA 2026 violation — 19 real student PDF files (SSC marksheets) are publicly downloadable right now

**What to do:**
```bash
git rm -r --cached backend/uploads/
echo 'uploads/' >> backend/.gitignore
git add .gitignore
git commit -m 'fix: remove student documents from repo, add uploads to gitignore'
java -jar bfg.jar --delete-folders uploads
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --force
```
Note: `bfg.jar` already exists at `/home/lemmecode-novaa/smart-college-mern/bfg.jar`

---

### Issue #225 — Weak credentials in production `.env`
**Status:** OPEN
**Severity:** Security — credentials are guessable or dummy

Problems:
- `JWT_SECRET=supersecretjwtkey` — guessable, must be rotated
- `STRIPE_SECRET_KEY=sk_test_dummy_key_for_presentation` — payments silently fail
- `SUPER_ADMIN_PASSWORD=admin123` — trivially weak

Fix:
```bash
openssl rand -hex 64   # use output as new JWT_SECRET
```
Then update `.env` on server and restart. Rotate Stripe key from Stripe dashboard.

---

### Issue #223 — Localhost fallback URLs in production backend
**Status:** OPEN

Missing env vars in production `.env`:
- `FRONTEND_URL` — not set, falls back to `http://localhost:5173`
- `CORS_ORIGINS` — not set, CORS may be misconfigured

Impact: QR codes in attendance broken, CORS errors possible.

Fix: Add correct values to `.env` on server.

---

### Issue #224 — Localhost fallback in 4 frontend files
**Status:** OPEN

Files with `|| "http://localhost:5000/api"` hardcoded:
- `ViewApproveStudent.jsx`
- `StripeConfiguration.jsx`
- `RazorpayConfiguration.jsx`
- `StudentProfile.jsx`

Fix: Replace with relative `/api` path or use `import.meta.env.VITE_API_URL`.

---

## 🔴 Critical — Functional Bugs

### Issue #233 — Student Admission Process: Multiple Critical Issues
**Status:** OPEN
**Filed:** April 14, 2026

Six bugs in the admission flow:

**Bug 1 — Duplicate `/registered` route (dead code)**
File: `backend/src/routes/student.routes.js`
`GET /registered` is declared twice. Express matches the first, second is never reached.

**Bug 2 — Category `OTHER` blocks student approval**
Files: `backend/src/middlewares/validators/student.validator.js`, `backend/src/models/feeStructure.model.js`
- Student validator accepts: `GEN, OBC, SC, ST, OTHER`
- FeeStructure enum only has: `GEN, OBC, SC, ST`
- Students who register with `OTHER` cannot be approved — throws `FEE_STRUCTURE_NOT_FOUND`

**Bug 3 — Orphaned User account on failed registration**
File: `backend/src/controllers/student.controller.js`
User record is created before Student record. If Student creation fails, User is left orphaned in DB.

**Bug 4 — `validateStudentId` validates wrong param**
File: `backend/src/middlewares/validators/student.validator.js`
Validator checks `param('studentId')` but delete/update routes use `param('id')`. Validation silently passes without actually validating.

**Bug 5 — Missing `next` in `updateMyProfile` and `updateStudentByAdmin`**
File: `backend/src/controllers/student.controller.js`
Both functions declared as `async (req, res)` but catch block calls `next(error)`. Throws `ReferenceError` on any error instead of passing to global error handler.

**Bug 6 — Enrollment number never generated**
File: `backend/src/controllers/studentApproval.controller.js`
Approval email references `enrollmentNumber` but it is never generated or saved. Always shows "Will be assigned shortly" with no mechanism to ever assign it.

Note: Bugs 2, 3, and 6 overlap heavily with the Phase 2 admission workflow redesign. Consider fixing them as part of Phase 2 rather than as isolated patches.

---

## 🟡 Medium Priority

### Issue #194 — Razorpay webhook duplicate payment protection audit
**Status:** OPEN
Webhook needs idempotency check to prevent double-charging. Needs audit of current implementation.

### Issue #215 — Admissions missing intermediate verification states
**Status:** OPEN
Directly addressed by Phase 2 (admission workflow redesign).

### Issue #217 — Data retention policy not implemented
**Status:** OPEN
No policy for how long student/college data is retained after deactivation.

### Issue #212 — GST not calculated on fee receipts
**Status:** OPEN
Compliance issue — receipts don't include GST breakdown.

### Issue #213 — File uploads go to local disk, not S3
**Status:** OPEN
All uploaded files stored on server disk. No backup, no CDN, breaks on server migration.

### Issue #214 — Both payment gateways on test keys
**Status:** OPEN
Razorpay and Stripe both configured with test/dummy keys in production.

---

## 🟢 Feature Issues (Open but Planned)

### Issue #178 — College User Management System (CRUD + Lifecycle)
Covered by Phase 4 (new roles + staff management).

### Issue #123 — HOD role not implemented as proper role
Covered by Phase 4 (HOD as standalone role, not a permission overlay on TEACHER).

### Issue #118 — Missing student promotion logic
Covered by Phase 5 (promotion with academic status).
