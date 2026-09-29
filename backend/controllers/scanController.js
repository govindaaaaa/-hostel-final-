const crypto = require("crypto");
const mongoose = require("mongoose");

const QRToken = require("../models/QRToken");
const Student = require("../models/Student");
const Guard = require("../models/Guard");
const ScanLog = require("../models/ScanLog");

const scanQR = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { token } = req.body;

    if (!token || typeof token !== "string") {
      return res.status(400).json({
        success: false,
        message: "QR token is required."
      });
    }

    // Verify that the guard account is active.
    const guard = await Guard.findById(req.user.id);

    if (!guard || !guard.isActive) {
      return res.status(403).json({
        success: false,
        message: "Guard account is inactive or not found."
      });
    }

    // Hash the QR token before searching MongoDB.
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    let result;

    await session.withTransaction(async () => {

      // Atomically claim the QR token.
      // A token can only be used once and before expiry.
      const qrToken = await QRToken.findOneAndUpdate(
        {
          tokenHash,
          usedAt: null,
          expiresAt: { $gt: new Date() }
        },
        {
          $set: { usedAt: new Date() }
        },
        {
          returnDocument: "after",
          session
        }
      );

      if (!qrToken) {
        const error = new Error(
          "QR code is invalid, expired, or already used."
        );
        error.statusCode = 400;
        throw error;
      }

      // Toggle the student's status atomically.
      const student = await Student.findOneAndUpdate(
        {
          _id: qrToken.student,
          isActive: true
        },
        [
          {
            $set: {
              currentStatus: {
                $cond: [
                  { $eq: ["$currentStatus", "OUT"] },
                  "IN",
                  "OUT"
                ]
              }
            }
          }
        ],
        {
          returnDocument: "after",
          updatePipeline: true,
          session
        }
      );

      if (!student) {
        const error = new Error(
          "Student account is inactive or not found."
        );
        error.statusCode = 403;
        throw error;
      }

      // Determine whether this scan was an entry or exit.
      const action =
        student.currentStatus === "IN" ? "ENTRY" : "EXIT";

      // Record the successful scan in the database.
      const [scanLog] = await ScanLog.create(
        [
          {
            student: student._id,
            guard: guard._id,
            action,
            gate: guard.assignedGate || "Main Gate",
            qrToken: qrToken._id
          }
        ],
        { session }
      );

      result = {
        student: {
          id: student._id,
          name: student.name,
          rollNumber: student.rollNumber,
          roomNumber: student.roomNumber,
          currentStatus: student.currentStatus
        },
        action,
        scannedAt: scanLog.scannedAt
      };
    });

    return res.status(200).json({
      success: true,
      message:
        result.action === "ENTRY"
          ? "Student entered successfully."
          : "Student exited successfully.",
      ...result
    });

  } catch (error) {
    console.error("QR scan error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Server error while scanning QR."
    });

  } finally {
    await session.endSession();
  }
};

module.exports = { scanQR };
