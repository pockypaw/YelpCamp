const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const ejsMate = require("ejs-mate");
const AppError = require("./utils/AppError");
const { globalErrorHandler } = require("./utils/errorHandlers");
require("dotenv").config();
const campgroundsRouter = require("./routes/campgrounds");
const authRouter = require("./routes/auth");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user");
const { isLoggedIn } = require("./middleware/middleware");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sessionOptions = {
  secret: "mySecret",
  resave: false, // Jangan resave jika tidak ada perubahan
  saveUninitialized: true,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 minggu dalam milidetik
    secure: false, // Set ke true jika menggunakan HTTPS
    httpOnly: true, // Mencegah akses JavaScript ke cookie
  },
};

app.use(express.static(path.join(__dirname, "public")));

app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(cookieParser("thismysecret"));
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Ensure to use this to parse JSON request body
app.use(methodOverride("_method"));
app.use(morgan("tiny"));
app.use(flash());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.successMessage = req.flash("success");
  res.locals.errorMessage = req.flash("error");
  next();
});

// Route for the homepage
app.get("/", (req, res) => {
  res.cookie("name", "Ardy", { signed: true });
  if (req.session.count) {
    req.session.count += 1;
  } else {
    req.session.count = 1;
  }
  res.send(`Count: ${req.session.count}`);
});

app.get("/fakeuser", isLoggedIn, async (req, res) => {
  try {
    const user = new User({ email: "test@test.com", username: "test" });
    const newUser = await User.register(user, "test123");
    res.send(newUser);
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("campgrounds");
  }
});
app.use("/", authRouter);
app.use("/campgrounds/", campgroundsRouter);

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
