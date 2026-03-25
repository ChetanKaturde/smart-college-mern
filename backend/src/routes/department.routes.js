<<<<<<< HEAD
const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const ctrl = require("../controllers/department.controller");

router.post("/", auth, role("admin"), ctrl.createDepartment);
router.get("/", auth, ctrl.getDepartments);
router.get("/:id", auth, ctrl.getDepartmentById);
router.put("/:id", auth, role("admin"), ctrl.updateDepartment);
router.delete("/:id", auth, role("admin"), ctrl.deleteDepartment);
=======
const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");
const collegeMiddleware = require("../middlewares/college.middleware");

const {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
  getDepartmentById,
  assignHOD,
} = require("../controllers/department.controller");

// Apply middlewares to ALL department routes
router.use(auth, role("COLLEGE_ADMIN"), collegeMiddleware);

// Create Department
router.post("/", createDepartment);

// Get All Departments (college-wise)
router.get("/", getDepartments);

// Get Single Department
router.get("/:id", getDepartmentById);

// Update Department
router.put("/:id", updateDepartment);

// Delete Department
router.delete("/:id", deleteDepartment);

// Assign HOD
router.put("/:id/assign-hod", assignHOD);
>>>>>>> 6775443517519e74caa3663cb2d91343cefdf9a0

module.exports = router;