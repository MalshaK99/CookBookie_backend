const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const auth = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Token:', token); // Check if token is being received

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded ID:', decoded._id); // Check if the token is valid and ID is decoded

        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(401).json({ message: 'User not found, authorization denied' });
        }

        req.userId = user._id;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token is not valid', error: error.message });
    }
};


module.exports = auth;
