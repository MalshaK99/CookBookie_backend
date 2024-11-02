const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const RecipeSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        
    },
    phone: {
        type: String,
        required: true
    },
    imagePath: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
});

const Recipe = mongoose.model("Recipe", RecipeSchema);

module.exports = Recipe;
