const mongoose = require("mongoose");
const sanitizeHtml = require("sanitize-html");
const slugify = require('../utils/slugify')

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      minlength: [2, "Category name must be at least 2 characters long"],
      maxlength: [100, "Category name must not exceed 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description must not exceed 500 characters"],
      default: "",
    },
  },
  { timestamps: true }
);

// Middleware to sanitize and generate slug before saving
CategorySchema.pre("save", function (next) {
  // Sanitize name and description
  this.name = sanitizeHtml(this.name);
  if (this.description) {
    this.description = sanitizeHtml(this.description);
  }

  // Generate slug from name
  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }

  next();
});

// Export the model
module.exports = mongoose.model("Category", CategorySchema);
