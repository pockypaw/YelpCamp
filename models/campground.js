const Review = require("./review");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    minlength: [3, "Title must be at least 3 characters long"],
  },
  price: {
    type: String,
    required: [true, "Price is required"],
    match: [/^\d+(\.\d{1,2})?$/, "Price must be a valid number (e.g. 10.99)"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    maxlength: [500, "Description cannot exceed 500 characters"],
  },
  location: {
    type: String,
    required: [true, "Location is required"],
  },
  image: {
    type: String,
    required: [true, "Image URL is required"],
    match: [/^https?:\/\/[^\s]+$/, "Image URL must be a valid URL"],
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

CampgroundSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});

// Create a model based on the schema
module.exports = mongoose.model("Campground", CampgroundSchema);
