const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const {
  campgroundValidation,
  reviewValidation,
  isLoggedIn,
} = require("../middleware/middleware");
const Campground = require("../models/campground");
const Review = require("../models/review");
const AppError = require("../utils/AppError");

const router = express.Router();

// Helper function to handle errors when campground is not found
const handleCampgroundNotFound = (campground, res) => {
  if (!campground) {
    req.flash("error", "Campground yang anda cari tidak dapat ditemukan!");
    return res.redirect("/campgrounds");
  }
  return true;
};

// Index route - Show all campgrounds
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

// New route - Show form to create a new campground
router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/new");
});

// Edit route - Show form to edit a campground
router.get(
  "/:id/edit",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!handleCampgroundNotFound(campground, res)) return;
    res.render("campgrounds/edit", { campground });
  })
);

// Post route - Create a new campground with validation
router.post(
  "/",
  isLoggedIn,
  campgroundValidation,
  wrapAsync(async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash("success", "Campground berhasil ditambahkan!");
    res.redirect("/campgrounds");
  })
);

// Show route - Show a specific campground
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate(
      "reviews"
    );
    if (!handleCampgroundNotFound(campground, res)) return;
    res.render("campgrounds/show", { campground });
  })
);

// Update route - Update an existing campground
router.put(
  "/:id",
  isLoggedIn,
  campgroundValidation,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(
      id,
      { ...req.body.campground },
      { new: true }
    );
    if (!campground) {
      throw new AppError("Campground not found", 404);
    }
    req.flash("success", "Campground berhasil diupdate!");
    res.redirect(`/campgrounds/${id}`);
  })
);

// Delete route - Delete a campground
router.delete(
  "/:id",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    if (!campground) {
      throw new AppError("Campground not found", 404);
    }
    req.flash("success", "Campground berhasil dihapus!");
    res.redirect("/campgrounds");
  })
);

// Reviews - Create a new review
router.post(
  "/:id/reviews",
  isLoggedIn,
  reviewValidation,
  wrapAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!handleCampgroundNotFound(campground, res)) return;

    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Review berhasil ditambahkan!");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// Reviews - Delete a specific review
router.delete(
  "/:id/reviews/:reviewId",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });
    if (!handleCampgroundNotFound(campground, res)) return;

    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) {
      req.flash("error", "Review yang anda cari tidak dapat ditemukan!");
      return res.redirect(`/campgrounds/${id}`);
    }

    req.flash("success", "Review berhasil dihapus!");
    res.redirect(`/campgrounds/${id}`);
  })
);

module.exports = router;
