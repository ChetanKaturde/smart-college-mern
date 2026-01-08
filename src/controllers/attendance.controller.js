// const Attendance = require("../models/Attendance");

// exports.mark = async (req, res) => {
//   res.status(201).json(await Attendance.create(req.body));
// };

// exports.list = async (req, res) => {
//   res.json(await Attendance.find(req.query));
// };



const Attendance = require("../models/attendance.model");

exports.mark = async (req, res, next) => {
  try {
    const attendance = await Attendance.create({
      ...req.body,
      markedBy: req.user.id
    });

    res.status(201).json(attendance);
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const records = await Attendance.find(req.query)
      .populate("studentId", "name email")
      .populate("markedBy", "name role");

    res.json(records);
  } catch (err) {
    next(err);
  }
};
