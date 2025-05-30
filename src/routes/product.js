const express = require("express");
const { userAuth } = require("../middlewares/auth");
const Product = require("../models/product");
const Review = require("../models/review");
const { validate } = require("../models/user");
const { validateReview, validateReviewEdit } = require("../utils/validation");

const productRouter = express.Router();

// GET /products/view/:productId
productRouter.get("/view/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    //console.log(productId)
    // Validate productId
    if (!productId || productId.length !== 24) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    // Fetch product by ID
    const productDetails = await Product.findById(productId);
    console.log(productDetails);
    if (!productDetails) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Fetch all reviews for the product
    const reviews = await Review.find({ product: productId })
      .populate("user", "name avatar") // Optional: include user details
      .sort({ createdAt: -1 }) // Optional: newest first
      .lean();

    res.json({
      product: productDetails,
      reviews,
    });
  } catch (err) {
    console.error("❌ Error fetching product or reviews:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

productRouter.post("/review/add", userAuth, async (req, res) => {
  try {
    validateReview(req);
    const { productId, rating, comment, imageUrl } = req.body;
    // Fetch product by ID
    const productDetails = await Product.findById(productId);

    // console.log("Incoming req.body:", req.body);
    // console.log("Type of imageUrl:", typeof req.body.imageUrl);
    // console.log("Is array?", Array.isArray(req.body.imageUrl));
    

    //console.log(productDetails);
    if (!productDetails) {
      return res.status(404).json({ error: "Product does not exist" });
    }

    // Fetch all reviews for the product
    const curReview = new Review({
      user: req.user._id,
      product: productId,
      rating,
      comment,
      imageUrl,
    });
    await curReview.save();

    res.json({ message: "Review added successfully" });
  } catch (err) {
    //console.error("❌ Error fetching product or reviews:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

productRouter.post("/review/edit", userAuth, async (req, res) => {
  try {
    validateReviewEdit(req);
    //console.log(req.body);
    const { reviewId, rating, comment, imageUrl } = req.body;
    // Fetch product by ID
    const review = await Review.findById(reviewId);
    //console.log(productDetails);
    if (!review) {
      return res.status(404).json({ error: "Product does not exist" });
    }

    await Review.findByIdAndUpdate(
      reviewId,
      { $set: { rating, comment, imageUrl } },
      { new: true }
    );

    res.json({ message: "Review updated successfully" });
  } catch (err) {
    console.error("❌ Error fetching product or reviews:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});



productRouter.post("/review/delete", userAuth, async (req, res) => {
  try {
    //console.log(req.body);
    const { reviewId } = req.body;
    // Fetch product by ID
    const review = await Review.findById(reviewId);
    //console.log(productDetails);
    if (!review) {
      return res.status(404).json({ error: "Review does not exist" });
    }

    await Review.findByIdAndDelete(reviewId)

    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error("❌ Error fetching product or reviews:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = productRouter;
