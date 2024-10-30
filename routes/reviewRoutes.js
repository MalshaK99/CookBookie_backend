const ReviewRatings = require("../models/ReviewRatings"); 
const express = require('express');
const router = express.Router();

// Add a review
router.post("/review", async (req, res) => {
  const review = new ReviewRatings(req.body);

  try {
    await review.save();
    res.status(201).send(review);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all reviews and ratings
router.get("/review", async (req, res) => {
  try {
    const reviews = await ReviewRatings.find({});
    res.status(200).send(reviews);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
