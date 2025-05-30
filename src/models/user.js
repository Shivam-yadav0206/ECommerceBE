const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const sanitizeHtml = require("sanitize-html");
const jwt = require("jsonwebtoken");

// Sub-schema for cart items
const CartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      validate: {
        validator: (v) => mongoose.Types.ObjectId.isValid(v),
        message: "Invalid product ID in cart",
      },
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
      default: 1,
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be an integer",
      },
    },
  },
  { _id: false }
);

// Sub-schema for wishlist items
const WishlistItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      validate: {
        validator: (v) => mongoose.Types.ObjectId.isValid(v),
        message: "Invalid product ID in wishlist",
      },
    },
  },
  { _id: false }
);

// Address Subschema
const addressSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ["Home", "Work", "Other"],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
});

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [30, "Name must not exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    googleId: {
      type: String,
      sparse: true,
    },
    avatar: {
      type: String,
      default:
        "https://i.pinimg.com/1200x/eb/99/a2/eb99a2736e6237c3668de38bbe3eec32.jpg",
      validate: {
        validator: (v) => !v || validator.isURL(v),
        message: "Avatar must be a valid URL",
      },
    },
    role: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },
    age: {
      type: Number,
      min: 12,
      default: null,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Others"],
      default: null,
    },

    // 🛒 Embedded cart items
    cart: {
      type: [CartItemSchema],
      default: [],
    },

    // ❤️ Embedded wishlist items
    wishlist: {
      type: [WishlistItemSchema],
      default: [],
    },
    addresses: {
      type: [addressSchema],
      default: [], // ✅ Ensures it's an empty array by default
    },
  },
  { timestamps: true }
);

// Sanitize name
UserSchema.pre("save", function (next) {
  if (this.name) {
    this.name = sanitizeHtml(this.name);
  }
  next();
});

// Generate JWT
UserSchema.methods.getJWT = async function () {
  return jwt.sign({ _id: this._id }, "VATANBATAN", {
    expiresIn: "1d",
  });
};

// Compare password
UserSchema.methods.validatePassword = async function (inputPassword) {
  if (!this.password) {
    throw new Error("No password set for this user.");
  }
  return await bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
