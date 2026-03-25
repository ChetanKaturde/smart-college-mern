const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
<<<<<<< HEAD
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
=======
    college_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    code: {
      type: String,
      required: true,
      uppercase: true
    },

    type: {
      type: String,
      enum: ["ACADEMIC", "ADMINISTRATIVE"],
      required: true
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE"
    },

    hod_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      default: null // assigned later
    },

    programsOffered: {
      type: [String], // ["UG", "PG"]
      required: true
    },

    startYear: {
      type: Number,
      required: true
    },

    sanctionedFacultyCount: {
      type: Number,
      required: true
    },

    sanctionedStudentIntake: {
      type: Number,
      required: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
>>>>>>> 6775443517519e74caa3663cb2d91343cefdf9a0
    }
  },
  { timestamps: true }
);

<<<<<<< HEAD
module.exports = mongoose.model("Department", departmentSchema);

=======
// Prevent duplicate department code per college
departmentSchema.index(
  { college_id: 1, code: 1 },
  { unique: true }
);

module.exports = mongoose.model("Department", departmentSchema);
>>>>>>> 6775443517519e74caa3663cb2d91343cefdf9a0
