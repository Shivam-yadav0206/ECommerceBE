const express = require("express");
const validator = require("validator");
const { userAuth } = require("../middlewares/auth");
const Product = require("../models/product");

const feedRouter = express.Router();

// GET /products/view/:productId
feedRouter.get("/feed", async (req, res) => {
  try {
    // Fetch product by ID
    const notebookCatId = "6827bfad058c645e30d4598c";
    const smartPhoneCatId = "6827bfad058c645e30d4598a";
    const productDetails = await Product.find({});
    const notebooks = await Product.find({ category: notebookCatId });
    const smartPhones = await Product.find({ category: smartPhoneCatId });
    //console.log(productDetails);
    const feed = {
      offers: productDetails,
      smartPhones,
      notebooks,
    };
    // if (!productDetails) {
    //   return res.status(404).json({ error: "Products not found" });
    // }

    res.status(200).send(feed);
  } catch (err) {
    console.error("❌ Error fetching product or reviews:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});


feedRouter.get("/feed/:catId", async (req, res) => {
  try {
    const { catId } = req.params;
    const SMARTPHONE_ID = "6827bfad058c645e30d4598a";

    // ✅ If catId is not a valid Mongo ObjectId → return empty array
    if (!validator.isMongoId(catId)) {
      return res.status(200).json({
        data: [],
        category: {
          name: "Others",
          description: "Some items just can't be categorized",
        },
      });
    }

    let productDetails = [];
    let catName = "Others";
    let catDesc = "Some items just can't be categorized";

    // ✅ If catId is Smartphones ID → fetch only smartphones
    if (catId === SMARTPHONE_ID) {
      catName = "Smartphones";
      catDesc = "All kinds of mobile devices and accessories.";
      productDetails = await Product.find({ category: SMARTPHONE_ID });
    } else {
      // ✅ For any other valid category → fetch all except smartphones
      productDetails = await Product.find({ category: { $ne: SMARTPHONE_ID } });
    }

    // ✅ Always return status 200 with data
    res.status(200).json({
      data: productDetails,
      category: { name: catName, description: catDesc },
    });
  } catch (err) {
    console.error("❌ Error fetching products:", err.message);
    res.status(200).json({
      data: [],
      category: {
        name: "Others",
        description: "Some items just can't be categorized",
      },
    });
  }
});



module.exports = feedRouter;
