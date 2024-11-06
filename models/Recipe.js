const { object, required } = require("joi");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const RecipeSchema = new Schema({
    recipeName:{
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
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true

    }
});

const Recipe = mongoose.model("Recipe", RecipeSchema);

module.exports = Recipe;
