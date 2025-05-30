const express = require("express");
const { connectDb } = require("./config/database");
const cookieParser = require("cookie-parser");
const app = express();
// Import Routes
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const productRouter = require("./routes/product");
const cartRouter = require("./routes/cart");
const { userAuth } = require("./middlewares/auth");
const wishlistRouter = require("./routes/wishlist");
const feedRouter = require("./routes/feed");
const Product = require("./models/product");
const mongoose = require('mongoose');
const orderRouter = require("./routes/order");
const cors = require("cors");
const addressRouter = require("./routes/address");


// Enable CORS for all routes and origins
app.use(
  cors({
    origin: "http://localhost:3000", // Frontend URL
    credentials: true, // Allow cookies and credentials
  })
);
// Middleware Setup
app.use(express.json());
app.use(cookieParser());

// Database Connection
connectDb()
  .then(() => {
    app.listen(3001, () => {
      console.log("Server running on port 3001");
    });
  })
  .catch((err) => {
    console.error("Database connection failed", err);
  });

// Test Route (for testing purposes)


app.use("/test", userAuth ,async (req, res, next) => {
  try {
    //console.log(req.user.cart)
    await Product.insertMany(notebook);

    res.send({ message: "✅ Products seeded successfully!" });
  } catch (err) {
    //console.error("❌ Error:", err.message);
    res.status(500).send("Error seeding products: " + err.message);
  }
});


// Use Routers
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", productRouter)
app.use("/", cartRouter)
app.use("/", wishlistRouter);
app.use("/", feedRouter);
app.use("/", orderRouter);
app.use("/", addressRouter);

// Global Error Handler (always at the end)
app.use((err, req, res, next) => {
  console.error(err); // Log the error
  res.status(500).send("Something went wrong!");
});

const notebook = [
  {
    name: "Dell XPS 13 Plus",
    description: "Ultra-thin premium laptop with 12th Gen Intel Core and InfinityEdge display.",
    price: 1299,
    stock: 20,
    imageUrl: "https://images.pexels.com/photos/1092652/pexels-photo-1092652.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    category: "6827bfad058c645e30d4598c",
    tags: ["laptop", "notebook", "dell"],
    rating: { average: 4.7, count: 340 },
    specs: {
      processor: "Intel Core i7-1260P",
      ram: "16GB LPDDR5",
      storage: "512GB SSD",
      display: "13.4-inch 4K+ OLED",
      batteryLife: "12 hours",
      color: "#3A3A3A,#FFFFFF,#C0C0C0",
    },
  },
  {
    name: "Apple MacBook Air M2",
    description: "Lightweight notebook with M2 chip, exceptional performance and battery life.",
    price: 1199,
    stock: 30,
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFjYm9vayUyMHByb3xlbnwwfHwwfHx8MA%3D%3D",
    category: "6827bfad058c645e30d4598c",
    tags: ["macbook", "apple", "notebook"],
    rating: { average: 4.8, count: 520 },
    specs: {
      processor: "Apple M2",
      ram: "8GB Unified",
      storage: "256GB SSD",
      display: "13.6-inch Retina",
      batteryLife: "18 hours",
      color: "#3B3B3B,#F5F5F7,#D4AF37",
    },
  },
  {
    name: "HP Spectre x360 14",
    description: "Convertible 2-in-1 notebook with touch display and long battery life.",
    price: 1399,
    stock: 25,
    imageUrl: "https://www.shutterstock.com/shutterstock/photos/1302914473/display_1500/stock-photo-jakarta-indonesia-february-side-part-of-hp-spectre-x-convertible-laptop-1302914473.jpg",
    category: "6827bfad058c645e30d4598c",
    tags: ["hp", "notebook", "2-in-1"],
    rating: { average: 4.6, count: 295 },
    specs: {
      processor: "Intel Core i7-1355U",
      ram: "16GB",
      storage: "1TB SSD",
      display: "13.5-inch 3:2 OLED",
      batteryLife: "17 hours",
      color: "#1A1A1A,#B0B0B0,#E5C07B",
    },
  },
  {
    name: "Lenovo Yoga Slim 7i",
    description: "Portable notebook with sleek aluminum chassis and strong battery life.",
    price: 1049,
    stock: 18,
    imageUrl: "https://rukminim2.flixcart.com/image/850/1000/xif0q/computer/j/g/f/yoga-slim-7-thin-and-light-laptop-lenovo-original-imah46z8kmgg3yga.jpeg?q=90&crop=false",
    category: "6827bfad058c645e30d4598c",
    tags: ["lenovo", "notebook", "slim"],
    rating: { average: 4.5, count: 220 },
    specs: {
      processor: "Intel Core i5-1240P",
      ram: "16GB",
      storage: "512GB SSD",
      display: "14-inch 2.2K",
      batteryLife: "15 hours",
      color: "#4B4B4B,#DADADA,#89CFF0",
    },
  },
  {
    name: "Asus ZenBook 14 OLED",
    description: "Stylish and powerful OLED notebook with ASUS AI noise-canceling tech.",
    price: 999,
    stock: 22,
    imageUrl: "https://www.shutterstock.com/shutterstock/photos/2396987091/display_1500/stock-photo-jakarta-indonesia-december-creator-series-laptops-asus-zenbook-pro-duo-oled-2396987091.jpg",
    category: "6827bfad058c645e30d4598c",
    tags: ["asus", "zenbook", "notebook"],
    rating: { average: 4.4, count: 180 },
    specs: {
      processor: "AMD Ryzen 7 7730U",
      ram: "16GB",
      storage: "512GB SSD",
      display: "14-inch 2.8K OLED",
      batteryLife: "13 hours",
      color: "#2E2E2E,#FFFFFF,#FF8C00",
    },
  },
  {
    name: "Acer Swift X 14",
    description: "Powerful notebook with dedicated GPU for creators and multitaskers.",
    price: 899,
    stock: 16,
    imageUrl: "https://static1.xdaimages.com/wordpress/wp-content/uploads/wm/2024/05/acer-swift-x-14-side-top.jpg",
    category: "6827bfad058c645e30d4598c",
    tags: ["acer", "swift", "notebook"],
    rating: { average: 4.3, count: 150 },
    specs: {
      processor: "Intel Core i7-13700H",
      ram: "16GB",
      storage: "1TB SSD",
      display: "14.5-inch 2.8K IPS",
      batteryLife: "12 hours",
      color: "#404040,#A9A9A9,#ADD8E6",
    },
  }
];


