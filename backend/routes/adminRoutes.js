const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  getDashboardStats,
  getAllStudents,
  getAllGuards,
  getAllScanLogs,
} = require("../controllers/adminController");

router.use(authMiddleware);
router.use(roleMiddleware("admin"));

router.get("/stats", getDashboardStats);
router.get("/students", getAllStudents);
router.get("/guards", getAllGuards);
router.get("/logs", getAllScanLogs);

module.exports = router;
