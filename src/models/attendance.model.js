// const mongoose = require("mongoose");

// module.exports = mongoose.model(
//   "Attendance",
//   new mongoose.Schema({
//     studentId: mongoose.Schema.Types.ObjectId,
//     date: String,
//     status: String,
//     markedBy: mongoose.Schema.Types.ObjectId
//   })
// );



const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },
    date: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["Present", "Absent"],
      required: true
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
