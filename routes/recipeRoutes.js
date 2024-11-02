const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Check and create uploads directory if it doesn't exist
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Use Date.now() for simplicity and avoid any forbidden characters
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.post('/recipe', upload.single('image'), async (req, res) => {
    console.log('Request Body:', req.body);
    console.log('Uploaded File:', req.file);

    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Image file is required.' });
        }

        const { name, email, phone, description } = req.body;
        if (!name || !email || !phone || !description) {
            console.log('Name:', name, 'Email:', email, 'Phone:', phone, 'Description:', description);
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const newRecipe = new Recipe({
            name: name,
            email: email,
            phone: phone,
            imagePath: req.file.path,
            description: description
        });

        await newRecipe.save();
        res.status(201).json(newRecipe); // Respond with the created recipe
    } catch (error) {
        console.error('Error creating recipe:', error.message);
        res.status(500).json({ message: 'Error creating recipe', error: error.message });
    }
});

router.delete('/recipe/:id', async (req, res) => {
    try {
        const result = await Recipe.findByIdAndDelete(req.params.id);

        if (!result) {
            return res.status(404).json({ message: 'Recipe not found.' });
        }

        res.status(200).json({ message: 'Recipe deleted successfully.', recipe: result });
    } catch (error) {
        console.error('Error deleting recipe:', error.message);
        res.status(500).json({ message: 'Error deleting recipe', error: error.message });
    }
});
router.get("/recipe", async (req, res) => {
    try {
        const recipes = await Recipe.find({});
        res.status(200).json(recipes); 
    } catch (error) {
        console.error('Error fetching recipes:', error); 
        res.status(500).json({ message: 'Error fetching recipes', error: error.message });
    }
});

module.exports = router;
