const express = require("express");
const validator = require("validator");
const { userAuth } = require("../middlewares/auth");
const Product = require("../models/product");
const User = require("../models/user"); // ✅ Required
const cartRouter = express.Router();
const mongoose = require("mongoose");

cartRouter.get("/cart/viewItems", userAuth, async (req, res) => {
  try {
    const items = req.user.cart;
    //console.log(items)
      const cartDetails = await getProductsWithQuantities(items);
      //console.log(cartDetails);

      return res
        .status(201)
        .send( cartDetails );
    } catch (error) {
      console.error("❌ Error adding to cart:", error);
      return res.status(500).send({ message: `Error: ${error.message}` });
    }
});

cartRouter.post("/cart/addItem", userAuth, async (req, res) => {
  try {
    const { itemId, newQuantity } = req.body;

    const item = await Product.findById(itemId);
    if (!item) {
      return res.status(400).send({ message: "Product not found" });
    }
    console.log(item.stock);
    if (newQuantity > item.stock) {
      return res
        .status(400)
        .send({ message: "Quantity exceeds available stock" });
    }

    if (newQuantity > 10) {
      return res
        .status(400)
        .send({ message: "Maximum allowed quantity is 10" });
    }

    const alreadyInCart = req.user.cart.some(
      (cartItem) => cartItem.product.toString() === itemId
    );

    if (alreadyInCart) {
      await User.updateOne(
        { _id: req.user._id, "cart.product": itemId },
        { $set: { "cart.$.quantity": newQuantity } }
      );
    } else {
      await User.findByIdAndUpdate(
        req.user._id,
        {
          $push: {
            cart: { product: itemId, quantity: newQuantity },
          },
        },
        { new: true }
      );
    }

    return res.status(201).send({ message: "Item added to cart successfully" });
  } catch (error) {
    console.error("❌ Error adding to cart:", error);
    return res.status(500).send({ message: `Error: ${error.message}` });
  }
});


cartRouter.post("/cart/removeItem", userAuth, async (req, res) => {
  try {
    const { itemId } = req.body;
    if (!validator.isMongoId(itemId)) {
      return res.status(400).send({ message: "Invalid itemId format" });
    }
    const alreadyInCart = req.user.cart.some(
      (cartItem) => cartItem.product.toString() === itemId
    );

    if (alreadyInCart) {
      await User.findByIdAndUpdate(
        req.user._id,
        {
          $pull: {
            cart: { product: itemId },
          },
        },
        { new: true }
      );
    }
    return res.status(200).send({ message: "Item removed from cart" });
  } catch (error) {
    console.error("❌ Error removing fromo cart:", error);
    return res.status(500).send({ message: `Error: ${error.message}` });
  }
});

cartRouter.delete("/cart/emptyCart", userAuth, async (req, res) => {
  try {
    await User.updateOne({ _id: req.user._id }, { $set: { cart: [] } });
    return res.status(200).send({ message: "All items removed from Cart" });
  } catch (error) {
    console.error("❌ Error : ", error);
    return res.status(500).send({ message: `Error: ${error.message}` });
  }
});

module.exports = cartRouter;



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