const { campgroundSchema, reviewSchema } = require("../schema");
const AppError = require("../utils/AppError");
const wrapAsync = require("../utils/wrapAsync");
const Campground = require("../models/campground");
const Review = require("../models/review");

// Joi validation middleware
const campgroundValidation = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(", ");
    return next(new AppError(msg, 400));
  }
  next(); // If validation passes, move to next middleware
};
const reviewValidation = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(", ");
    return next(new AppError(msg, 400));
  }
  next(); // If validation passes, move to next middleware
};

// Verify Password Middleware (as you've defined earlier)
const verifyPassword = (req, res, next) => {
  const { password } = req.query;
  if (password === "test") {
    next();
  } else {
    return next(new AppError("Wrong Password, Access Denied!", 401));
  }
};

const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in first");
    return res.redirect("/login");
  }

  next();
};

const storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

// Middleware to check if the logged-in user is the author of the campground
const isAuthor = wrapAsync(async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Campground tidak ditemukan");
    return res.redirect("/campgrounds");
  }
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
});
const isReviewAuthor = wrapAsync(async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review) {
    req.flash("error", "Review tidak ditemukan");
    return res.redirect("/campgrounds");
  }
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
});

module.exports = {
  campgroundValidation,
  reviewValidation,
  verifyPassword,
  isLoggedIn,
  storeReturnTo,
  isAuthor,
  isReviewAuthor
};
