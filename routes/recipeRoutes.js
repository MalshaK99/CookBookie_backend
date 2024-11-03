const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth=require('../middleware/auth')
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
router.post('/recipe', auth, upload.single('image'), async (req, res) => {
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
    description: description,
     userId: req.userId 
         });
    
    await newRecipe.save();
    res.status(201).json(newRecipe); // Respond with the created recipe
     } catch (error) {
     console.error('Error creating recipe:', error.message);
     res.status(500).json({ message: 'Error creating recipe', error: error.message });
     }
    });
        
    // Delete a recipe by ID (with auth and ownership check)
    router.delete('/recipe/:id', auth, async (req, res) => {
        try {
            // Find the recipe by ID
            const recipe = await Recipe.findById(req.params.id);
    
            // Check if recipe exists
            if (!recipe) {
                return res.status(404).json({ message: 'Recipe not found.' });
            }
    
            // Ensure the logged-in user is the owner of the recipe
            if (recipe.author.toString() !== req.userId) {
                return res.status(403).json({ message: 'Unauthorized to delete this recipe.' });
            }
    
            // Delete the recipe
            await recipe.remove();
            res.status(200).json({ message: 'Recipe deleted successfully.', recipe });
        } catch (error) {
            console.error('Error deleting recipe:', error.message);
            res.status(500).json({ message: 'Error deleting recipe', error: error.message });
        }
    });
    
    
router.get("/my-recipes",auth,async (req, res) => {
    console.log('first')
    try {
        const recipes = await Recipe.find({userId:req.userId});
        console.log('User ID ',req.userId)
        console.log('recipes ',recipes)
        res.status(200).json(recipes);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({ message: 'Error fetching recipes', error: error.message });
    }
});


module.exports = router;
