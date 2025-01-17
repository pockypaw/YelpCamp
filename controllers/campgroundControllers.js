const Campground = require("../models/campground");
const { cld } = require("../cloudinary/config");

const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports = {
  index: async (req, res) => {
    const { search = "", page = 1, sortBy = "title", filter = "" } = req.query;
    const limit = 5;
    const skip = (page - 1) * limit;

    // Build the query object based on search and filter criteria
    const query = {
      ...(search && { title: { $regex: search, $options: "i" } }), // Case-insensitive search by title
      ...(filter && { location: { $regex: filter, $options: "i" } }), // Filter by location
    };

    // Get the total number of campgrounds based on the query
    const totalCampgrounds = await Campground.countDocuments(query);
    const totalPages = Math.ceil(totalCampgrounds / limit); // Calculate total pages

    // Define sorting criteria based on the 'sortBy' parameter
    let sortCriteria = {};
    if (sortBy === "title") {
      sortCriteria = { title: 1 }; // Sort by title alphabetically
    } else if (sortBy === "price") {
      sortCriteria = { price: 1 }; // Sort by price in ascending order (cheapest first)
    } else if (sortBy === "date") {
      sortCriteria = { createdAt: -1 }; // Sort by date in descending order (newest first)
    }

    // Retrieve the campgrounds based on the query, pagination, and sorting criteria
    const campgrounds = await Campground.find(query)
      .skip(skip) // Apply pagination by skipping the appropriate number of documents
      .limit(limit) // Limit the number of documents per page
      .sort(sortCriteria); // Apply the sorting

    // Render the campgrounds page with the necessary data
    res.render("campgrounds/index", {
      campgrounds,
      currentPage: parseInt(page),
      totalPages,
      search,
      filter,
      sortBy,
    });
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
