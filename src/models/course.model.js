// const mongoose = require("mongoose");

// module.exports = mongoose.model(
//   "Course",
//   new mongoose.Schema({
//     name: String,
//     departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
//     duration: String,
//     status: String
//   })
// );




// const mongoose = require("mongoose");

// const courseSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true
//     },
//     code: {
//       type: String,
//       required: true,
//       unique: true,
//       uppercase: true
//     },
//     department: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Department",
//       required: true
//     },
//     duration: {
//       type: String
//     }
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Course", courseSchema);





// const mongoose = require("mongoose");

// const courseSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     departmentId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Department",
//       required: true
//     },
//     duration: { type: String, required: true },
//     status: {
//       type: String,
//       enum: ["Active", "Inactive"],
//       default: "Active"
//     }
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Course", courseSchema);





const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);

