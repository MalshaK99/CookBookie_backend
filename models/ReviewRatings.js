const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const reviewRatingsSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  review: {
    type: String,
    required: true,
  },
});

const ReviewRatings = mongoose.model("Review_Ratings", reviewRatingsSchema);

module.exports = ReviewRatings;
