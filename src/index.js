const express = require("express");
const { connectDb } = require("./config/database");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;
const DB = process.env.MONGO_URI;

// console.log(PORT, DB);
// Import Routes
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const productRouter = require("./routes/product");
const cartRouter = require("./routes/cart");
const { userAuth } = require("./middlewares/auth");
const wishlistRouter = require("./routes/wishlist");
const feedRouter = require("./routes/feed");
const Product = require("./models/product");
const mongoose = require("mongoose");
const orderRouter = require("./routes/order");
const cors = require("cors");
const addressRouter = require("./routes/address");

// Enable CORS for all routes and origins
const allowedOrigins = ["http://localhost:3000", process.env.FRONTEND_URI];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin like mobile apps or curl requests
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // if you're using cookies or authorization headers
  })
);
// Middleware Setup
app.use(express.json());
app.use(cookieParser());

// Database Connection
connectDb()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed", err);
  });

// Test Route (for testing purposes)

app.get("/test", async (req, res, next) => {
  try {
    //console.log(req.user.cart)
    await Product.insertMany(notebook);

    res.send("✅ server running successfully!");
  } catch (err) {
    //console.error("❌ Error:", err.message);
    res.status(500).send("Error seeding products: " + err.message);
  }
});

// Use Routers
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", productRouter);
app.use("/", cartRouter);
app.use("/", wishlistRouter);
app.use("/", feedRouter);
app.use("/", orderRouter);
app.use("/", addressRouter);

// Global Error Handler (always at the end)
app.use((err, req, res, next) => {
  console.error(err); // Log the error
  res.status(500).send("Something went wrong!");
});
