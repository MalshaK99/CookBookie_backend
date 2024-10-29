const express = require('express');
const User = require('../models/User');
const router = express.Router();
const jwt = require('jsonwebtoken'); 
const auth=require('../middleware/auth')

// Function to create token
const createToken = (_id) => {
    return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: '3d' }); 
};

router.get('/me', auth, async (req, res) => {
    try {
        res.json(req.user);  // Send the user data as JSON respons
    } catch (error) {
        res.status(500).send({ message: 'Error fetching user details', error });
    }
});


  // Update user details
  router.put("/update", auth, async (req, res) => {
    try {
      const { fname, lname, email, currentPassword, newPassword } = req.body;
  
      const user = req.user;
  
      // Check if current password matches
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).send({ message: "Current password is incorrect." });
      }
  
      // Update fields
      user.fname = fname;
      user.name = lname;
      user.email = email;
  
      // If new password is provided, hash it and update
      if (newPassword) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
      }
  
      await user.save();
      res.send({ message: "User details updated successfully" });
    } catch (error) {
      res.status(500).send({ message: "Error updating user details", error });
    }
  });
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
        localStorage.setItem('token', response.data.token);  // Save token to localStorage

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
