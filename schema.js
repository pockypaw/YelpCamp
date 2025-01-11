// models/campgroundSchema.js
const Joi = require("joi");

const campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().min(3).required().messages({
      "string.empty": "Title is required",
      "string.min": "Title must be at least 3 characters long",
    }),

    price: Joi.string()
      .pattern(/^\d+(\.\d{1,2})?$/)
      .required()
      .messages({
        "string.empty": "Price is required",
        "string.pattern.base": "Price must be a valid number (e.g. 10.99)",
      }),

    description: Joi.string().max(500).required().messages({
      "string.empty": "Description is required",
      "string.max": "Description cannot exceed 500 characters",
    }),

    location: Joi.string().required().messages({
      "string.empty": "Location is required",
    }),

    image: Joi.string().uri().required().messages({
      "string.empty": "Image URL is required",
      "string.uri": "Image URL must be a valid URL",
    }),
  }).required(),
});

const reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    body: Joi.string().required(),
  }).required(),
});

module.exports = { campgroundSchema, reviewSchema };
