const mongoose = require("mongoose");
const validator = require("validator");
const sanitizeHtml = require("sanitize-html");

// Sub-schema for an individual item in an order
const OrderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      validate: {
        validator: mongoose.Types.ObjectId.isValid,
        message: "Invalid product ID in cart",
      },
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [3, "Product name should be at least 3 characters"],
      maxlength: [100, "Product name should not exceed 100 characters"],
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be an integer",
      },
    },
    specs: {
      type: Map,
      of: String,
      default: {},
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0.01, "Price must be greater than 0"],
      validate: {
        validator: Number.isFinite,
        message: "Price must be a valid number",
      },
    },
    imageUrls: {
      type: [String],
      default: [
        "https://hips.hearstapps.com/hmg-prod/images/iphone-16-review-lead-6724ffef2985f.jpg?crop=0.6668170878459687xw:1xh;center,top&resize=640:*",
      ],
      validate: {
        validator: function (arr) {
          return arr.every((url) => validator.isURL(url));
        },
        message: "One or more image URLs are invalid",
      },
    },
  },
  { _id: false }
);

// Main Order schema
const OrderSchema = new mongoose.Schema(
  {
    order: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "Order must contain at least one item",
      },
    },

    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator: mongoose.Types.ObjectId.isValid,
        message: "Invalid user ID",
      },
    },

    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered","completed", "cancelled", "out for delivery"],
      default: "processing",
    },
  },
  { timestamps: true }
);


// Pre-save hook to sanitize text fields
OrderSchema.pre("save", function (next) {
  this.order.forEach((item) => {
    item.name = sanitizeHtml(item.name);
    for (let [key, val] of item.specs.entries()) {
      item.specs.set(key, sanitizeHtml(val));
    }
  });
  next();
});

module.exports = mongoose.model("Order", OrderSchema);
