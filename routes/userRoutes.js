const express = require("express");
const User = require("../models/User");
const router = express.Router();
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");

// Function to create token
const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: "3d" });
};
router.get("/me", auth, async (req, res) => {
  try {
    console.log("Authenticated User Object:", req.user);
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user details:", error); // Detailed error log
    res.status(500).send({ message: "Error fetching user details", error });
  }
});

router.put("/update", auth, async (req, res) => {
  try {
    const { fname, phone, email, photo } = req.body;

    // Ensure that at least one field is provided for update
    if (!fname && !phone && !email && !photo) {
      return res.status(400).send({ message: "No fields provided for update" });
    }

    // Update user details directly
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fname, phone, email, photo },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    res.send({ message: "User details updated successfully", user });
  } catch (error) {
    console.error("Error updating user details:", error);
    res
      .status(500)
      .send({ message: "Error updating user details", error: error.message });
  }
});
const bcrypt = require('bcryptjs');
const router = require('express').Router();
const auth = require('../middleware/auth'); // Assuming you have an authentication middleware
const User = require('../models/User'); // Assuming your User model is imported here

router.put('/update-password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).send({ message: "Current and new passwords are required" });
        }

        // Find the user by ID
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        // Check if current password matches
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).send({ message: "Current password is incorrect" });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Save the updated user document
        await user.save();

        res.send({ message: "Password updated successfully" });
        console.log("Password updated successfully");
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).send({ message: "Error updating password", error: error.message });
    }
});

module.exports = router;

// Sign up route
router.post("/signup", async (req, res) => {
  const { fname, phone, email, password } = req.body;
  const user = new User({ fname, phone, email, password });

  try {
    const savedUser = await user.save();
    const token = createToken(savedUser._id);
    res
      .status(201)
      .json({ message: "User created successfully", user: savedUser, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = createToken(user._id);
    res.status(200).json({ message: "Login successful", user, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
