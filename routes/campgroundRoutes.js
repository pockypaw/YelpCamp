const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const {
  campgroundValidation,
  isLoggedIn,
  isAuthor,
} = require("../middleware/middleware");
const campgrounds = require("../controllers/campgroundControllers");

const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudinary/config");
const upload = multer({ storage });

// Public routes (GET)
router.get("/", wrapAsync(campgrounds.index)); // Display all campgrounds

// Routes that require authentication (GET)
router.get("/new", isLoggedIn, campgrounds.renderNewForm); // Show form to create new campground

router.get("/:id", wrapAsync(campgrounds.showCampground)); // Show a specific campground
router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  wrapAsync(campgrounds.renderEditForm)
); // Show form to edit a campground

// Routes that modify data (POST, PUT, DELETE)
router.post(
  "/",
  isLoggedIn,
  upload.array("campground[images]", 5),
  campgroundValidation,

  wrapAsync(campgrounds.createCampground) // Create new campground
);

router.put(
  "/:id",
  isLoggedIn,
  isAuthor,
  upload.array("campground[images]", 5),
  // campgroundValidation,
  wrapAsync(campgrounds.updateCampground) // Update campground
);

router.delete(
  "/:id",
  isLoggedIn,
  isAuthor,
  wrapAsync(campgrounds.deleteCampground) // Delete campground
);

module.exports = router;
