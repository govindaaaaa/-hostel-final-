const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  getRecentScans
} = require("../controllers/guardController");

router.get(
  "/recent-scans",
  authMiddleware,
  roleMiddleware("guard"),
  getRecentScans
);

module.exports = router;
