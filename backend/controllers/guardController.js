const ScanLog = require("../models/ScanLog");

// GET /api/guard/recent-scans
const getRecentScans = async (req, res) => {
  try {
    const logs = await ScanLog.find()
      .populate("student", "name rollNumber roomNumber currentStatus")
      .populate("guard", "name employeeId assignedGate")
      .sort({ scannedAt: -1 })
      .limit(100)
      .lean();

    return res.status(200).json({
      success: true,
      count: logs.length,
      scans: logs
    });
  } catch (error) {
    console.error("Recent scans error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch recent scans."
    });
  }
};

module.exports = { getRecentScans };
