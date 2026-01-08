// const mongoose = require("mongoose");

// module.exports = mongoose.model(
//   "Department",
//   new mongoose.Schema({
//     name: String,
//     code: String,
//     status: { type: String, default: "Active" }
//   })
// );




// const mongoose = require("mongoose");

// const departmentSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true
//     },
//     description: {
//       type: String,
//       trim: true
//     }
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Department", departmentSchema);





const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Department", departmentSchema);

