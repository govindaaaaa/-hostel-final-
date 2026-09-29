require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Guard = require("../models/Guard");

const createGuard = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = "guard@example.com";
    const password = "Guard123456";

    const existingGuard = await Guard.findOne({ email });

    if (existingGuard) {
      console.log("Development guard already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await Guard.create({
      name: "Test Guard",
      email,
      password: hashedPassword,
      employeeId: "GUARD001",
      assignedGate: "Main Gate",
      isActive: true
    });

    console.log("Development guard created successfully.");
    console.log("Email: guard@example.com");
    console.log("Password: Guard123456");
  } catch (error) {
    console.error("Guard creation failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

createGuard();
