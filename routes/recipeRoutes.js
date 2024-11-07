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
    router.put("/update/:id", auth, upload.single('image'), async (req, res) => {
        try {
            const { recipeName, description } = req.body;
            const imagePath = req.file ? req.file.path : null;
    
            // Check if at least one field is provided for the update
            if (!recipeName && !description && !imagePath) {
                return res.status(400).json({ message: "No fields provided for update" });
            }
    
            // Prepare the fields to update
            let updateFields = {};
            if (recipeName) updateFields.recipeName = recipeName;
            if (description) updateFields.description = description;
            if (imagePath) updateFields.imagePath = imagePath;
    
            // Find and update the recipe
            const recipe = await Recipe.findOne({ _id: req.params.id, userId: req.user._id });
    
            if (!recipe) {
                return res.status(404).json({ message: "Recipe not found or unauthorized to update" });
            }
    
            // Remove the old image if a new one is uploaded
            if (imagePath && recipe.imagePath) {
                fs.unlinkSync(recipe.imagePath); // Remove the existing image file
            }
    
            // Update the recipe properties and save
            if (recipeName) recipe.recipeName = recipeName;
            if (description) recipe.description = description;
            if (imagePath) recipe.imagePath = imagePath;
    
            await recipe.save();
    
            res.status(200).json({ message: "Recipe updated successfully", recipe });
        } catch (error) {
            console.error("Error updating recipe:", error);
            res.status(500).json({ message: "Error updating recipe", error: error.message });
        }
    });
    

module.exports = router;
