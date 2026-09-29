
const mongoose = require("mongoose");

const scanLogSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    guard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guard",
      required: true,
    },

    action: {
      type: String,
      enum: ["ENTRY", "EXIT"],
      required: true,
    },

    scannedAt: {
      type: Date,
      default: Date.now,
    },

    gate: {
      type: String,
      required: true,
    },

    qrToken: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QRToken",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ScanLog = mongoose.model("ScanLog", scanLogSchema);

module.exports = ScanLog;