const bcrypt = require("bcryptjs");

const Student = require("../models/student");
const Guard = require("../models/guard");
const generateToken = require("../utils/generateToken");

// Register a student
const registerStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      rollNumber,
      roomNumber,
      phone,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !rollNumber ||
      !roomNumber
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingStudent = await Student.findOne({
      $or: [
        { email: normalizedEmail },
        { rollNumber: rollNumber.trim() },
      ],
    });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: "Email or roll number already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const student = await Student.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      rollNumber: rollNumber.trim(),
      roomNumber,
      phone,
    });

    const token = generateToken(
      student._id.toString(),
      "student"
    );

    return res.status(201).json({
      success: true,
      message: "Student registered successfully.",
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        roomNumber: student.roomNumber,
        currentStatus: student.currentStatus,
      },
    });
  } catch (error) {
    console.error("Student registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error during registration.",
    });
  }
};

// Student login
const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const student = await Student.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!student || !student.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials or inactive account.",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      student.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials or inactive account.",
      });
    }

    const token = generateToken(
      student._id.toString(),
      "student"
    );

    return res.status(200).json({
      success: true,
      message: "Student login successful.",
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        roomNumber: student.roomNumber,
        currentStatus: student.currentStatus,
      },
    });
  } catch (error) {
    console.error("Student login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
};

// Guard login
const loginGuard = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const guard = await Guard.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!guard || !guard.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials or inactive account.",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      guard.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials or inactive account.",
      });
    }

    const token = generateToken(
      guard._id.toString(),
      "guard"
    );

    return res.status(200).json({
      success: true,
      message: "Guard login successful.",
      token,
      guard: {
        id: guard._id,
        name: guard.name,
        email: guard.email,
        employeeId: guard.employeeId,
        assignedGate: guard.assignedGate,
      },
    });
  } catch (error) {
    console.error("Guard login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
};

module.exports = {
  registerStudent,
  loginStudent,
  loginGuard,
};
