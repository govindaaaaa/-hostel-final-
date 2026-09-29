const express = require("express");
const router = express.Router();

const {
  registerStudent,
  loginStudent,
  loginGuard,
} = require("../controllers/authController");

const { loginAdmin } = require("../controllers/adminAuthController");

const {
  studentLoginLimiter,
  guardLoginLimiter,
  adminLoginLimiter,
  registrationLimiter
} = require("../middleware/rateLimiters");

// Student authentication
router.post(
  "/student/register",
  registrationLimiter,
  registerStudent
);

router.post(
  "/student/login",
  studentLoginLimiter,
  loginStudent
);

// Guard authentication
router.post(
  "/guard/login",
  guardLoginLimiter,
  loginGuard
);

// Admin authentication
router.post(
  "/admin/login",
  adminLoginLimiter,
  loginAdmin
);

module.exports = router;
