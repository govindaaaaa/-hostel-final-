
const mongoose = require("mongoose");

const qrTokenSchema = new mongoose.Schema(
  {
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    usedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Automatically remove expired token documents.
// Actual expiry validation will also happen in our scan API.
qrTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const QRToken = mongoose.model("QRToken", qrTokenSchema);

module.exports = QRToken;