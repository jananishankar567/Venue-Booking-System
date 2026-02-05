const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const router = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;  // Use environment variable
const SECRET = process.env.JWT_SECRET;  // Use environment variable
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

/* -------- REGISTER -------- */
router.post("/register", async (req, res) => {
  console.log("Register request received:", req.body);  // Added logging
  try {
    const { firstName, lastName, email, password, dob, gender, mobile, address, agree } = req.body;
    console.log("Processing registration for:", email);  // Added logging
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      dob,
      gender,
      mobile,
      address,
      agree
    });

    console.log("User registered successfully");  // Added logging
    res.json({ message: "Registered successfully" });
  } catch (err) {
    console.error("Registration server error:", err);  // Added logging
    res.status(500).json({ message: "Server error" });
  }
});

/* -------- LOGIN -------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for:", email);  // Added logging
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);  // Added logging
    res.status(500).json({ message: "Server error" });
  }
});

/* -------- GOOGLE LOGIN -------- */
router.post("/auth/google", async (req, res) => {
  try {
    const { id_token } = req.body;
    console.log("Google login attempt");  // Added logging
    const ticket = await googleClient.verifyIdToken({
      idToken: id_token,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { name, email, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        firstName: name,
        email,
        agree: true,
        googleId
      });
    }

    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (err) {
    console.error("Google login error:", err);  // Added logging
    res.status(400).json({ message: "Google login failed" });
  }
});

module.exports = router;