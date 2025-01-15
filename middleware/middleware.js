const { campgroundSchema, reviewSchema } = require("../schema");
const AppError = require("../utils/AppError");
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

module.exports = {
  campgroundValidation,
  reviewValidation,
  verifyPassword,
  isLoggedIn,
  storeReturnTo,
};
