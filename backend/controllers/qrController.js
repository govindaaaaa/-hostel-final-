const crypto = require("crypto");
const QRCode = require("qrcode");
const QRToken = require("../models/qrtoken");
const Student = require("../models/student");

const generateQR = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);

    if (!student || !student.isActive) {
      return res.status(403).json({
        success: false,
        message: "Student account is inactive or not found."
      });
    }

    // Generate a secure, unpredictable token.
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Store only the hash in MongoDB.
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // Invalidate previous unused tokens for this student.
    await QRToken.updateMany(
      {
        student: student._id,
        usedAt: null
      },
      {
        $set: { usedAt: new Date() }
      }
    );

    const expiresAt = new Date(Date.now() + 60 * 1000);

    await QRToken.create({
      tokenHash,
      student: student._id,
      expiresAt
    });

    // Convert the raw token into a QR image.
    const qrImage = await QRCode.toDataURL(rawToken);

   
return res.status(201).json({
  success: true,
  message: "QR code generated. Valid for 60 seconds.",
  qrImage,
  qrToken: rawToken,
  expiresAt
});
  } catch (error) {
    console.error("QR generation error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during QR generation."
    });
  }
};

module.exports = { generateQR };
