const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { scanQR } = require("../controllers/scanController");

router.post(
  "/",
  authMiddleware,
  roleMiddleware("guard"),
  scanQR
);

module.exports = router;
