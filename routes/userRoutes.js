const express = require('express');
const User = require('../models/User');
const router = express.Router();
const jwt = require('jsonwebtoken'); 

// Function to create token
const createToken = (_id) => {
    return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: '3d' }); 
};

// Sign up route
router.post('/signup', async (req, res) => {
    const { fname, lname, email, password } = req.body;
    const user = new User({ fname, lname, email, password });

    try {
        const savedUser = await user.save();
        const token = createToken(savedUser._id);
        res.status(201).json({ message: "User created successfully", user: savedUser, token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
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
