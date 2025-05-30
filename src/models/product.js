const mongoose = require("mongoose");
const validator = require("validator"); // For validation
const sanitizeHtml = require("sanitize-html"); // For sanitizing strings

// Define the Product schema
const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true, // Trimming any leading or trailing spaces
      minlength: [3, "Product name should be at least 3 characters"],
      maxlength: [100, "Product name should not exceed 100 characters"],
    },
    // product-model.js
    rating: {
      average: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    specs: {
      type: Map,
      of: String, // or `mongoose.Schema.Types.Mixed` for mixed types
      default: {},
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      minlength: [10, "Description should be at least 10 characters"],
      maxlength: [1000, "Description should not exceed 1000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0.01, "Price must be greater than 0"],
      validate: {
        validator: (v) => Number.isFinite(v),
        message: "Price must be a valid number",
      },
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Stock must be an integer",
      },
    },
    imageUrls: {
      type: [String],
      default: [
        "https://hips.hearstapps.com/hmg-prod/images/iphone-16-review-lead-6724ffef2985f.jpg?crop=0.6668170878459687xw:1xh;center,top&resize=640:*"
      ],
      validate: {
        validator: function (arr) {
          return arr.every(url => validator.isURL(url));
        },
        message: "One or more image URLs are invalid",
      },
    },    
    category: {
      type: mongoose.Schema.Types.ObjectId, // Assuming Category is another model
      ref: "Category",
      required: [true, "Product category is required"],
    },
    tags: {
      type: [String],
      validate: {
        validator: (v) => v.length <= 5, // Limit to 5 tags max
        message: "You can add a maximum of 5 tags",
      },
    },
  },
  { timestamps: true }
);

// Pre-save hook to sanitize fields before saving
ProductSchema.pre("save", function (next) {
  // Sanitize the name and description
  this.name = sanitizeHtml(this.name);
  this.description = sanitizeHtml(this.description);

  // Ensure no HTML or script injections in tags
  if (this.tags && Array.isArray(this.tags)) {
    this.tags = this.tags.map((tag) => sanitizeHtml(tag));
  }

  next();
});

// Creating a virtual field for price in different currencies (just an example)
ProductSchema.virtual("priceInUSD").get(function () {
  return this.price * 0.85; // Example conversion rate
});

// Export the model
module.exports = mongoose.model("Product", ProductSchema);
