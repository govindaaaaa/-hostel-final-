const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { generateQR } = require("../controllers/qrController");

router.post(
  "/generate",
  authMiddleware,
  roleMiddleware("student"),
  generateQR
);

module.exports = router;
