const express = require("express");
const validator = require("validator");
const { userAuth } = require("../middlewares/auth");
const Product = require("../models/product");
const Order = require("../models/order");
const mongoose = require("mongoose");

const orderRouter = express.Router();

// 🔁 Helper function to enrich products with quantities
const getProductsWithQuantities = async (items) => {
  const quantityMap = {};
  const objectIds = [];

  for (const item of items) {
    const productId = item.product.toString();
    if (validator.isMongoId(productId)) {
      quantityMap[productId] = item.quantity;
      objectIds.push(new mongoose.Types.ObjectId(productId));
    }
  }

  const products = await Product.find({ _id: { $in: objectIds } })
    .select("name imageUrls specs price stock")
    .lean();

  const enrichedProducts = products.map((product) => {
    const quantity = quantityMap[product._id.toString()] || 0;

    // Optional: Validate stock availability
    if (product.stock < quantity) {
      throw new Error(`Insufficient stock for product: ${product.name}`);
    }

    return {
      product: product._id,
      name: product.name,
      specs: product.specs,
      price: product.price,
      imageUrls: product.imageUrls,
      quantity,
    };
  });

  return enrichedProducts;
};

// ✅ POST: Place an order
orderRouter.post("/order/place", userAuth, async (req, res) => {
  try {
    const { itemsInCart = false, item } = req.body;

    const items = itemsInCart ? req.user.cart : [item];

    const orderDetails = await getProductsWithQuantities(items);

    const newOrder = new Order({
      order: orderDetails,
      buyer: req.user._id,
      status: "pending", // Ensure this matches your schema enum
    });

    await newOrder.save();

    return res.status(201).send({
      message: "Order placed successfully",
      data: orderDetails,
    });
  } catch (error) {
    console.error("❌ Error placing order:", error);
    return res.status(500).send({ message: `Error: ${error.message}` });
  }
});

// ✅ POST: Cancel an order
orderRouter.post("/order/cancel/:orderId", userAuth, async (req, res) => {
  try {
    const { orderId } = req.params;

    const orderDetails = await Order.findById(orderId);
    if (!orderDetails) {
      return res.status(400).send({ message: "Order not found" });
    }

    const nonCancelableStatuses = ["delivered", "shipped", "out for delivery"];
    if (nonCancelableStatuses.includes(orderDetails.status)) {
      return res
        .status(400)
        .send({ message: `Order already ${orderDetails.status}` });
    }

    await Order.findByIdAndUpdate(orderId, { $set: { status: "cancelled" } });

    return res.status(200).send({ message: "Order cancelled successfully" });
  } catch (error) {
    console.error("❌ Error cancelling order:", error);
    return res.status(500).send({ message: `Error: ${error.message}` });
  }
});

orderRouter.get("/order", userAuth, async (req, res) => {
  try {
    const myOrders = await Order.find({ buyer: req?.user._id })
    res.status(200).send(myOrders)
  } catch (error) {
    res.status(500).json("Error : " + error.message)
  }
})

module.exports = orderRouter;
