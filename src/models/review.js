const mongoose = require("mongoose");
const validator = require("validator");

const ReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must not exceed 5"],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, "Comment must not exceed 1000 characters"],
    },
    imageUrl: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.every((url) => validator.isURL(url));
        },
        message: "One or more image URLs are invalid",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent a user from reviewing the same product more than once
ReviewSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model("Review", ReviewSchema);
