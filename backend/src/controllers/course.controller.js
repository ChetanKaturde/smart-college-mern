<<<<<<< HEAD
// src/controllers/course.controller.js
const Course = require("../models/course.model");

// Utility: Generate course code
const generateCourseCode = (name) => {
  return name
    .replace(/[^a-zA-Z ]/g, "")
    .split(" ")
    .map(w => w.substring(0, 2))
    .join("")
    .toUpperCase();
};

// Admin: Create course
exports.createCourse = async (req, res) => {
  try {
    const { name, code, departmentId, teacherId, duration } = req.body;

    if (!name || !code || !departmentId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const course = await Course.create({
      name,
      code,
      departmentId,
      teacherId,
      duration,
    });

    res.status(201).json({
      message: "Course created successfully",
      data: course,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Get all courses
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("departmentId", "name")
      .populate("teacherId", "name email");

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Teacher: Get assigned courses
exports.getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ teacherId: req.user.id }).populate(
      "departmentId",
      "name"
    );

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.assignTeacher = async (req, res) => {
  const { teacherId } = req.body;

  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { teacherId },
    { new: true }
  );

  res.json({
    success: true,
    data: course,
  });
};

exports.getMyCourses = async (req, res) => {
  const courses = await Course.find({
    teacherId: req.user.id,
    status: "Active",
  });

  res.json({
    success: true,
    data: courses,
  });
=======
const Course = require("../models/course.model");
const Department = require("../models/department.model");
const AppError = require("../utils/AppError");
const ApiResponse = require("../utils/ApiResponse");

/**
 * CREATE Course
 */
exports.createCourse = async (req, res, next) => {
  console.log('📝 [CREATE COURSE] Request body:', req.body);
  console.log('📝 [CREATE COURSE] College ID:', req.college_id);
  console.log('📝 [CREATE COURSE] User ID:', req.user?.id);
  
  const {
    department_id,
    name,
    code,
    type,
    programLevel,
    durationSemesters,
    durationYears,
    credits,
    maxStudents
  } = req.body;

  // Validate department
  const department = await Department.findOne({
    _id: department_id,
    college_id: req.college_id
  });

  if (!department) {
    throw new AppError("Invalid department", 404, "DEPARTMENT_NOT_FOUND");
  }

  // ✅ Validate duration
  if (!durationSemesters || durationSemesters < 1 || durationSemesters > 8) {
    throw new AppError("Program duration must be 1-8 semesters", 400, "INVALID_DURATION");
  }

  // Note: durationYears is auto-calculated by the model's pre-save hook
  // If provided, it will be validated by the model

  // Warn if creating long duration program
  if (durationSemesters > 6 && programLevel === "UG") {
    console.warn(`⚠️ Creating advanced program "${name}" with ${durationSemesters} semesters`);
  }

  // Create course with new duration fields
  // Note: durationYears will be auto-calculated by the model's pre-save hook
  const courseData = {
    college_id: req.college_id,
    department_id,
    name,
    code,
    type,
    programLevel,
    durationSemesters,
    credits,
    maxStudents,
    createdBy: req.user.id
  };

  // Only add durationYears if provided (otherwise let pre-save hook calculate it)
  if (durationYears) {
    courseData.durationYears = durationYears;
  }

  console.log('📝 [CREATE COURSE] Course data to save:', courseData);

  try {
    const course = await Course.create(courseData);
    console.log('✅ [CREATE COURSE] Course created:', course._id);
    ApiResponse.created(res, { course }, "Course created successfully");
  } catch (error) {
    console.error('❌ [CREATE COURSE] Error creating course:', error.message);
    console.error('❌ [CREATE COURSE] Full error:', error);
    throw error;
  }
};

/**
 * READ Courses by Department
 */
exports.getCoursesByDepartment = async (req, res, next) => {
  try {
    console.log('[getCoursesByDepartment] Department ID:', req.params.departmentId);
    console.log('[getCoursesByDepartment] College ID:', req.college_id);
    
    const courses = await Course.find({
      department_id: req.params.departmentId,
      college_id: req.college_id
    });
    
    console.log('[getCoursesByDepartment] Found courses:', courses.length);

    ApiResponse.success(res, { courses }, "Department courses fetched successfully");
  } catch (error) {
    console.error('[getCoursesByDepartment] Error:', error);
    next(error);
  }
};

/**
 * READ All Courses (College-wise)
 */
exports.getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({
      college_id: req.college_id
    })
      .populate("department_id", "name code")
      .sort({ name: 1 });

    ApiResponse.success(res, { courses }, "Courses fetched successfully");
  } catch (error) {
    next(error);
  }
};


/**
 * READ Single Course (by ID)
 */
exports.getCourseById = async (req, res, next) => {
  try {
    console.log('[getCourseById] Request ID:', req.params.id);
    console.log('[getCourseById] College ID:', req.college_id);
    
    const course = await Course.findOne({
      _id: req.params.id,
      college_id: req.college_id
    }).populate("department_id", "name code type");
    
    console.log('[getCourseById] Found course:', course ? course.name : 'NULL');

    if (!course) {
      throw new AppError("Course not found", 404, "COURSE_NOT_FOUND");
    }

    ApiResponse.success(res, { course }, "Course fetched successfully");
  } catch (error) {
    console.error('[getCourseById] Error:', error);
    next(error);
  }
};


/**
 * UPDATE Course
 */
exports.updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findOneAndUpdate(
      {
        _id: req.params.id,
        college_id: req.college_id
      },
      req.body,
      { new: true }
    );

    if (!course) {
      throw new AppError("Course not found", 404, "COURSE_NOT_FOUND");
    }

    ApiResponse.success(res, { course }, "Course updated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE Course
 */
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findOneAndDelete({
      _id: req.params.id,
      college_id: req.college_id
    });

    if (!course) {
      throw new AppError("Course not found", 404, "COURSE_NOT_FOUND");
    }

    ApiResponse.success(res, null, "Course deleted successfully");
  } catch (error) {
    next(error);
  }
>>>>>>> 6775443517519e74caa3663cb2d91343cefdf9a0
};
