require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/admin");

async function createAdmin() {
  try {
    const email = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
    const password = process.env.ADMIN_PASSWORD || "";

    if (!email || !password) {
      throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
    }

    if (password.length < 12) {
      throw new Error("Admin password must be at least 12 characters.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const existing = await Admin.findOne({ email });

    if (existing) {
      console.log("An admin with this email already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await Admin.create({
      name: "Hostel Administrator",
      email,
      password: hashedPassword,
      isActive: true,
    });

    console.log("Admin account created successfully.");
    console.log("Email:", email);
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
