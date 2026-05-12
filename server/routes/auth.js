const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const auth = require("../middleware/auth");

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ msg: "Username and password are required" });
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );
    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/verify", auth, (req, res) => {
  res.json({ valid: true, username: req.user.username });
});

// ✅ POST /api/auth/forgot-password — no token needed, uses recoveryPin
router.post("/forgot-password", async (req, res) => {
  const { username, recoveryPin, newPassword } = req.body;
  if (!username || !recoveryPin || !newPassword)
    return res.status(400).json({ msg: "All fields are required" });
  if (newPassword.length < 8)
    return res
      .status(400)
      .json({ msg: "New password must be at least 8 characters" });
  try {
    const user = await User.findOne({ username });
    if (!user || !user.recoveryPin)
      return res.status(400).json({ msg: "Invalid username or recovery PIN" });
    const pinMatch = await bcrypt.compare(recoveryPin, user.recoveryPin);
    if (!pinMatch)
      return res.status(400).json({ msg: "Invalid username or recovery PIN" });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ msg: "Password reset successfully" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.put("/change-password", auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    return res.status(400).json({ msg: "Both passwords are required" });
  if (newPassword.length < 8)
    return res
      .status(400)
      .json({ msg: "New password must be at least 8 characters" });
  try {
    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: "Old password is incorrect" });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ msg: "Password updated successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.put("/change-username", auth, async (req, res) => {
  const { newUsername } = req.body;
  if (!newUsername)
    return res.status(400).json({ msg: "New username is required" });
  try {
    const existing = await User.findOne({ username: newUsername });
    if (existing)
      return res.status(400).json({ msg: "Username already taken" });
    const user = await User.findById(req.user.id);
    user.username = newUsername;
    await user.save();
    res.json({ msg: "Username updated successfully" });
  } catch (err) {
    console.error("Change username error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
