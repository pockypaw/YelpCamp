const Campground = require("../models/campground");
const Review = require("../models/review");

module.exports = {
  createReview: async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
      req.flash("error", "Campground tidak ditemukan");
      return res.redirect("/campgrounds");
    }

    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Review berhasil ditambahkan!");
    res.redirect(`/campgrounds/${campground._id}`);
  },

  deleteReview: async (req, res) => {
    const { id, reviewId } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });
    if (!campground) {
      req.flash("error", "Campground tidak ditemukan");
      return res.redirect("/campgrounds");
    }

    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) {
      req.flash("error", "Review tidak ditemukan");
      return res.redirect(`/campgrounds/${id}`);
    }

    req.flash("success", "Review berhasil dihapus!");
    res.redirect(`/campgrounds/${id}`);
  },
};
