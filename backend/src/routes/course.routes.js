<<<<<<< HEAD
// src/routes/course.routes.js
const express = require("express");
const router = express.Router();

const {
  createCourse,
  getCourses,
  getMyCourses,
  assignTeacher,
} = require("../controllers/course.controller");

const auth = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

// Admin only
router.post("/", auth, authorize("admin"), createCourse);
router.get("/", auth, authorize("admin"), getCourses);
router.put(
  "/:id/assign-teacher",
  authMiddleware,
  roleMiddleware("admin"),
  assignTeacher
);


// Teacher only
router.get(
  "/my",
  authMiddleware,
  roleMiddleware("teacher"),
  getMyCourses
);


module.exports = router;


=======
const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");
const collegeMiddleware = require("../middlewares/college.middleware");

const {
  createCourse,
  getCoursesByDepartment,
  getCourseById,
  updateCourse,
  deleteCourse,
  getAllCourses,
} = require("../controllers/course.controller");

// Create Course
router.post("/", auth, role("COLLEGE_ADMIN"), collegeMiddleware, createCourse);

// Get All Courses (College-wise)
router.get(
  "/",
  auth,
  role("COLLEGE_ADMIN", "TEACHER"),
  collegeMiddleware,
  getAllCourses,
);

// Get Courses by Department
router.get(
  "/department/:departmentId",
  auth,
  role("COLLEGE_ADMIN", "TEACHER"),
  collegeMiddleware,
  getCoursesByDepartment,
);

// Get Single Course
router.get(
  "/:id",
  auth,
  role("COLLEGE_ADMIN"),
  collegeMiddleware,
  getCourseById,
);

// Update Course
router.put(
  "/:id",
  auth,
  role("COLLEGE_ADMIN"),
  collegeMiddleware,
  updateCourse,
);

// Delete Course
router.delete(
  "/:id",
  auth,
  role("COLLEGE_ADMIN"),
  collegeMiddleware,
  deleteCourse,
);

module.exports = router;
>>>>>>> 6775443517519e74caa3663cb2d91343cefdf9a0
