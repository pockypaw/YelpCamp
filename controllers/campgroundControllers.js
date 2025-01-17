const Campground = require("../models/campground");
const { cld } = require("../cloudinary/config");

const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports = {
  index: async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  },

  renderNewForm: (req, res) => {
    res.render("campgrounds/new");
  },

  createCampground: async (req, res) => {
    const geoData = await maptilerClient.geocoding.forward(
      req.body.campground.location,
      { limit: 1 }
    );
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.features[0].geometry;
    campground.images = req.files.map((f) => ({
      url: f.path,
      filename: f.filename,
    }));
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
    const campgroundsGeometry = await Campground.findById(req.params.id).select(
      "title location geometry -_id"
    );
    if (!campground) {
      req.flash("error", "Campground tidak ditemukan");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground, campgroundsGeometry });
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
    const geoData = await maptilerClient.geocoding.forward(
      req.body.campground.location,
      { limit: 1 }
    );
    campground.geometry = geoData.features[0].geometry;
    const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));

    if (imgs.length > 0) {
      campground.images = imgs;
    }

    if (req.body.deleteImages) {
      for (let filename of req.body.deleteImages) {
        await cld.uploader.destroy(filename);
      }
      await campground.updateOne({
        $pull: { images: { filename: { $in: req.body.deleteImages } } },
      });
    }

    await campground.save();
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
