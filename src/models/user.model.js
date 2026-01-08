// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");

// const userSchema = new mongoose.Schema(
//   {
//     name: String,
//     email: { type: String, unique: true },
//     password: String,
//     role: {
//       type: String,
//       enum: ["Admin", "Teacher", "Student", "Parent"],
//       required: true
//     },
//     status: { type: String, default: "Active" }
//   },
//   { timestamps: true }
// );

// userSchema.pre("save", async function () {
//   if (!this.isModified("password")) return;
//   this.password = await bcrypt.hash(this.password, 10);
// });

// module.exports = mongoose.model("User", userSchema);



// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true
//     },
//     password: {
//       type: String,
//       required: true
//     },
//     role: {
//       type: String,
//       enum: ["admin", "teacher", "student"],
//       default: "student"
//     }
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("User", userSchema);






const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["admin", "teacher", "student", "parent"],
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
