const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const { reviewValidation, isLoggedIn, isReviewAuthor } = require("../middleware/middleware");
const review = require("../controllers/reviewControllers");

const router = express.Router();

// Routes that modify data (POST, DELETE)
router.post(
  "/:id/reviews",
  isLoggedIn,
  reviewValidation,
  wrapAsync(review.createReview) // Create a review for a campground
);

router.delete(
  "/:id/reviews/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(review.deleteReview) // Delete a specific review
);

module.exports = router;
