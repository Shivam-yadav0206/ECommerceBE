const express = require("express");
const validator = require("validator");
const { userAuth } = require("../middlewares/auth");
const Product = require("../models/product");
const User = require("../models/user"); // ✅ Required
const wishlistRouter = express.Router();
const mongoose = require("mongoose");

wishlistRouter.get("/wish/viewItems", userAuth, async (req, res) => {
  try {
    const items = req.user.wishlist;
    const objectIds = [];

    for (const item of items) {
      const productId = item.product.toString();
      if (validator.isMongoId(productId)) {
        objectIds.push(new mongoose.Types.ObjectId(productId));
      }
    }

    // Step 2: Query only required fields
    const products = await Product.find({ _id: { $in: objectIds } })
      .select("name stock imageUrls rating specs price") // ✅ Only selected fields
      .lean(); // ✅ Return plain JS objects for performance

    if (!products) {
      res.status(404).send({ message: "No items found", data: [] });
    }

    return res.status(201).send({ message: "Items found", data: products });
  } catch (error) {
    console.error("❌ Error adding to cart:", error);
    return res.status(500).send({ message: `Error: ${error.message}` });
  }
});

wishlistRouter.post("/wish/addItem", userAuth, async (req, res) => {
  try {
    const { itemId } = req.body;

    const item = await Product.findById(itemId);
    if (!item) {
      return res.status(400).send({ message: "Product not found" });
    }
    console.log(item.stock);

    const alreadyInWishList = req.user.wishlist.some(
      (listItem) => listItem.product.toString() === itemId
    );

    if (alreadyInWishList) {
      res.status(400).send({ message: "Item already in wishlist" });
    } else {
      await User.findByIdAndUpdate(
        req.user._id,
        {
          $push: {
            wishlist: { product: itemId },
          },
        },
        { new: true }
      );
    }

    return res
      .status(201)
      .send({ message: "Item added to wishList successfully" });
  } catch (error) {
    console.error("❌ Error adding to cart:", error);
    return res.status(500).send({ message: `Error: ${error.message}` });
  }
});

wishlistRouter.post("/wish/removeItem", userAuth, async (req, res) => {
  try {
    const { itemId } = req.body;
    if (!validator.isMongoId(itemId)) {
      return res.status(400).send({ message: "Invalid itemId format" });
    }
    const alreadyInWishList = req.user.wishlist.some(
      (listItem) => listItem.product.toString() === itemId
    );

    if (alreadyInWishList) {
      await User.findByIdAndUpdate(
        req.user._id,
        {
          $pull: {
            wishlist: { product: itemId },
          },
        },
        { new: true }
        );
        return res
          .status(200)
          .send({ message: "Item removed from wishlist" });

    } else {
        return res.status(400).send({ message: "Item not present" });
    }
    
  } catch (error) {
    console.error("❌ Error removing fromo cart:", error);
    return res.status(500).send({ message: `Error: ${error.message}` });
  }
});

wishlistRouter.delete("/wish/emptyList", userAuth, async (req, res) => {
  try {
    await User.updateOne({ _id: req.user._id }, { $set: { wishlist: [] } });
    return res.status(200).send({ message: "All items removed from Wishlist" });
  } catch (error) {
    console.error("❌ Error : ", error);
    return res.status(500).send({ message: `Error: ${error.message}` });
  }
});

module.exports = wishlistRouter;

const getProductsWithQuantities = async (items) => {
  // Step 1: Create a map of productId to quantity
  const quantityMap = {};
  const objectIds = [];

  for (const item of items) {
    const productId = item.product.toString();
    if (validator.isMongoId(productId)) {
      quantityMap[productId] = item.quantity;
      objectIds.push(new mongoose.Types.ObjectId(productId));
    }
  }

  // Step 2: Query only required fields
  const products = await Product.find({ _id: { $in: objectIds } })
    .select("name stock imageUrls rating specs price") // ✅ Only selected fields
    .lean(); // ✅ Return plain JS objects for performance

  // Step 3: Add quantity to each product
  const enrichedProducts = products.map((product) => ({
    ...product,
    quantity: quantityMap[product._id.toString()] || 0,
  }));

  return enrichedProducts;
};
