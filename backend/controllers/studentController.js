const Student = require("../models/Student");
const ScanLog = require("../models/ScanLog");

// GET /api/student/profile
const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select("-password");

    if (!student || !student.isActive) {
      return res.status(404).json({
        success: false,
        message: "Student not found or account is inactive."
      });
    }

    return res.status(200).json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        roomNumber: student.roomNumber,
        phone: student.phone,
        photo: student.photo,
        currentStatus: student.currentStatus
      }
    });
  } catch (error) {
    console.error("Student profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch student profile."
    });
  }
};

// GET /api/student/history
const getStudentHistory = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select("_id isActive");

    if (!student || !student.isActive) {
      return res.status(404).json({
        success: false,
        message: "Student not found or account is inactive."
      });
    }

    const history = await ScanLog.find({
      student: student._id
    })
      .populate("guard", "name employeeId assignedGate")
      .sort({ scannedAt: -1 })
      .limit(50)
      .lean();

    return res.status(200).json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    console.error("Student history error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch student history."
    });
  }
};

module.exports = {
  getStudentProfile,
  getStudentHistory
};
