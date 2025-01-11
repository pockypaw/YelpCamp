const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Campground = require("./models/campground");
const methodOverride = require("method-override");
const morgan = require("morgan");
const ejsMate = require("ejs-mate");
const AppError = require("./utils/AppError");
const { globalErrorHandler } = require("./utils/errorHandlers");
const wrapAsync = require("./utils/wrapAsync");
require("dotenv").config();
const { campgroundSchema, reviewSchema } = require("./schema"); // Import the schema
const Review = require("./models/review");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Ensure to use this to parse JSON request body
app.use(methodOverride("_method"));
app.use(morgan("tiny"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

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

// Route for the homepage
app.get("/", verifyPassword, (req, res) => {
  res.render("home");
});

app.get(
  "/campgrounds",
  wrapAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

app.get(
  "/campgrounds/new",
  wrapAsync((req, res, next) => {
    res.render("campgrounds/new");
  })
);

app.get(
  "/campground/:id/edit",
  wrapAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
      throw new AppError("Campground not found", 404); // Fixed error message
    }
    res.render("campgrounds/edit", { campground });
  })
);

// Post route with validation middleware
app.post(
  "/campgrounds",
  campgroundValidation, // Use the validation middleware here
  wrapAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/`);
  })
);

// Show route
app.get(
  "/campgrounds/:id",
  wrapAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate(
      "reviews"
    );
    console.log(campground);
    if (!campground) {
      throw new AppError("Campground not found", 404); // Not found
    }
    res.render("campgrounds/show", { campground });
  })
);

// Update route
app.put(
  "/campgrounds/:id",
  campgroundValidation, // Use validation middleware again for updates
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    res.redirect(`/campgrounds/${id}`);
  })
);

// Delete route
app.delete(
  "/campgrounds/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect(`/campgrounds`);
  })
);

// Reviews
app.post(
  "/campgrounds/:id/reviews",
  reviewValidation,
  wrapAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// Global error handler middleware
app.use(globalErrorHandler);
app.all("*", (req, res, next) => {
  next(new AppError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { status = 500 } = err;
  if (!err.message) err.message = "Something went wrong";
  res.status(status).render("error/error", { err });
});

// Start the server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
