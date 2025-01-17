const Review = require("./review");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: String,
  filename: String,
});
//https://res.cloudinary.com/dexuavxln/image/upload/w_200/v1736995142/YelpCamp/r46t494nxunyhddko98v.jpg
ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema(
  {
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    images: [ImageSchema],
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
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
      maxlength: [1500, "Description cannot exceed 1500 characters"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },

    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts
);

CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return  `
  <b>${this.title}</b>
  <center>${this.location}</center>
  <center>Price: <strong>$${this.price}</strong></center>
  <center><a href="/campgrounds/${this._id}">View Details</a></center>
`
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
