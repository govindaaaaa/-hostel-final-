const Student = require("../models/student");
const Guard = require("../models/guard");
const ScanLog = require("../models/ScanLog");

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalStudents,
      totalGuards,
      studentsIn,
      studentsOut,
      recentScans,
    ] = await Promise.all([
      Student.countDocuments({ isActive: true }),
      Guard.countDocuments({ isActive: true }),
      Student.countDocuments({
        isActive: true,
        currentStatus: "IN",
      }),
      Student.countDocuments({
        isActive: true,
        currentStatus: "OUT",
      }),
      ScanLog.countDocuments({
        scannedAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      }),
    ]);

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalGuards,
        studentsIn,
        studentsOut,
        scansToday: recentScans,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to load dashboard statistics.",
    });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error("Admin students error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to fetch students.",
    });
  }
};

const getAllGuards = async (req, res) => {
  try {
    const guards = await Guard.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: guards.length,
      guards,
    });
  } catch (error) {
    console.error("Admin guards error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to fetch guards.",
    });
  }
};

const getAllScanLogs = async (req, res) => {
  try {
    const logs = await ScanLog.find()
      .populate("student", "name email rollNumber roomNumber")
      .populate("guard", "name employeeId assignedGate")
      .sort({ scannedAt: -1 })
      .limit(100)
      .lean();

    res.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error("Admin scan logs error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to fetch scan logs.",
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllStudents,
  getAllGuards,
  getAllScanLogs,
};
