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

    // ✅ If catId is not a valid Mongo ObjectId, return empty data
    if (!validator.isMongoId(catId)) {
      return res.status(200).json({
        data: [],
        category: {
          name: "Others",
          description: "Some items just can't be categorized",
        },
      });
    }

    // Default category details
    let catName = "Others";
    let catDesc = "Some items just can't be categorized";

    // ✅ Fetch products for given category
    const productDetails = await Product.find({ category: catId });

    // ✅ Update category details if it's a known category
    if (catId === "6827bfad058c645e30d4598a") {
      catName = "Smartphones";
      catDesc = "All kinds of mobile devices and accessories.";
    }

    // ✅ Always return 200 with data (even if empty)
    res.status(200).json({
      data: productDetails || [],
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
