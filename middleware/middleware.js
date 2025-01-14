const { campgroundSchema, reviewSchema } = require("../schema");
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

module.exports = { campgroundValidation, reviewValidation, verifyPassword };
