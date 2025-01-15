const Campground = require("../models/campground");

module.exports = {
  index: async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  },

  renderNewForm: (req, res) => {
    res.render("campgrounds/new");
  },

  createCampground: async (req, res) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash("success", "Campground berhasil ditambahkan!");
    res.redirect(`/campgrounds/${campground._id}`);
  },

  showCampground: async (req, res) => {
    const campground = await Campground.findById(req.params.id)
      .populate({
        path: "reviews",
        populate: { path: "author" },
      })
      .populate("author");

    if (!campground) {
      req.flash("error", "Campground tidak ditemukan");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
  },

  renderEditForm: async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
      req.flash("error", "Campground tidak ditemukan");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
  },

  updateCampground: async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(
      id,
      { ...req.body.campground },
      { new: true }
    );
    if (!campground) {
      req.flash("error", "Campground tidak ditemukan");
      return res.redirect("/campgrounds");
    }
    req.flash("success", "Campground berhasil diupdate!");
    res.redirect(`/campgrounds/${id}`);
  },

  deleteCampground: async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    if (!campground) {
      req.flash("error", "Campground tidak ditemukan");
      return res.redirect("/campgrounds");
    }
    req.flash("success", "Campground berhasil dihapus!");
    res.redirect("/campgrounds");
  },
};