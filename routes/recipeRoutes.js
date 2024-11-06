const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

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

// POST endpoint to create a new recipe
router.post('/recipe', auth, upload.single('image'), async (req, res) => {
    console.log('User ID:', req.user?._id);  // Make sure user ID is attached
    console.log('Request Body:', req.body);
    console.log('Uploaded File:', req.file);

    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Image file is required.' });
        }
        const { recipeName, description } = req.body;

        if (!recipeName || !description) {
            return res.status(400).json({ message: 'Recipe name and description are required.' });
        }

        if (!req.user || !req.user._id) {
            return res.status(400).json({ message: 'User ID is required.' });
        }

        // Create new recipe with userId from req.user._id
        const newRecipe = new Recipe({
            recipeName,
            imagePath: req.file.path,
            description,
            userId: req.user._id // Attach user ID from the decoded token
        });

        await newRecipe.save();
        res.status(201).json(newRecipe); // Respond with the created recipe
    } catch (error) {
        console.error('Error creating recipe:', error.message);
        res.status(500).json({ message: 'Error creating recipe', error: error.message });
    }
});

    
    // GET endpoint to fetch recipes created by the logged-in user
    router.get("/my-recipes", auth, async (req, res) => {
        console.log('User ID:', req.user?._id);  // Log the user ID from the decoded token
        try {
            if (!req.user || !req.user._id) {
                return res.status(400).json({ message: "User not authenticated" });
            }
    
            const recipes = await Recipe.find({ userId: req.user._id });  // Query for recipes by user ID
            console.log('Recipes found:', recipes);  // Log the found recipes
    
            if (recipes.length === 0) {
                return res.status(404).json({ message: 'No recipes found for this user' });
            }
    
            res.status(200).json(recipes);  // Send the recipes in the response
        } catch (error) {
            console.error('Error fetching recipes:', error);  // Detailed error log
            res.status(500).json({ message: 'Error fetching recipes', error: error.message });
        }
    });
    
    
    // PUT endpoint to update an existing recipe
    router.put("/recipe/:id", auth, async (req, res) => {
     try {
    const { description } = req.body;
    
    if (!description) {
    return res.status(400).json({ message: "No fields provided for update" });
    }
    
     // Find the recipe by ID and ensure it belongs to the logged-in user
     const recipe = await Recipe.findOneAndUpdate(
     { _id: req.params.id, userId: req.userId },
     { description }, // Only update the description here
     { new: true }
     );
    
     if (!recipe) {
     return res.status(404).json({ message: "Recipe not found or unauthorized to update." });
     }
    
     res.status(200).json({ message: "Updated Successfully", recipe });
     } catch (error) {
     res.status(500).json({ message: "Error updating details", error: error.message });
     }
    });
    

module.exports = router;
