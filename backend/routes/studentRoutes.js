const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  getStudentProfile,
  getStudentHistory
} = require("../controllers/studentController");

router.get(
  "/profile",
  authMiddleware,
  roleMiddleware("student"),
  getStudentProfile
);

router.get(
  "/history",
  authMiddleware,
  roleMiddleware("student"),
  getStudentHistory
);

module.exports = router;
