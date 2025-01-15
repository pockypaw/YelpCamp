const express = require("express");
const router = express.Router();
const passport = require("passport");
const { storeReturnTo } = require("../middleware/middleware");
const authController = require("../controllers/authController");
const wrapAsync = require("../utils/wrapAsync");

// Authentication Routes (GET)
router.get("/register", authController.renderRegister); // Render registration form
router.get("/login", authController.renderLogin); // Render login form
router.get("/logout", authController.logoutUser); // Log out user

// Authentication Routes (POST)
router.post("/register", wrapAsync(authController.registerUser)); // Handle registration
router.post(
  "/login",
  storeReturnTo,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  authController.loginUser // Handle login
);

module.exports = router;
