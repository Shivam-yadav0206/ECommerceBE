const { v4: uuidv4 } = require("uuid"); // You can install uuid package or generate your own id logic
const express = require("express")
const { userAuth } = require("../middlewares/auth");
const User = require("../models/user")
const addressRouter = express.Router()


addressRouter.post("/add/address", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const newAddressData = req.body;

    if (!newAddressData) {
      return res.status(400).json({ error: "Address data is required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check if address already exists (compare relevant fields)
    const exists = user.addresses.some(
      (addr) =>
        addr.type === newAddressData.type &&
        addr.name === newAddressData.name &&
        addr.address === newAddressData.address &&
        addr.phone === newAddressData.phone &&
        addr.pincode === newAddressData.pincode
    );

    if (exists) {
      return res.status(400).json({ error: "Address already exists" });
    }

    // Generate a unique id for the new address
    // Option 1: Use max existing id + 1
    let maxId = 0;
    user.addresses.forEach((addr) => {
      if (addr.id > maxId) maxId = addr.id;
    });
    const newId = maxId + 1;

    // Or Option 2: Use UUID (if you prefer)
    // const newId = uuidv4();

    // If new address isDefault, unset other defaults
    if (newAddressData.isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    // Add new address with generated id
    user.addresses.push({
      ...newAddressData,
      id: newId,
    });

    await user.save();

    res
      .status(201)
      .json({ message: "Address added", addresses: user.addresses });
  } catch (err) {
    console.error("Error adding address:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Remove an address by id
addressRouter.patch("/remove/address", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.body; // address id to remove

    if (!id) return res.status(400).json({ error: "Address id is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const initialCount = user.addresses.length;

    user.addresses = user.addresses.filter((addr) => addr.id !== id);

    if (user.addresses.length === initialCount) {
      return res.status(404).json({ error: "Address not found" });
    }

    await user.save();

    res
      .status(200)
      .json({ message: "Address removed", addresses: user.addresses });
  } catch (err) {
    console.error("Error removing address:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all addresses of logged-in user
addressRouter.get("/address", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("addresses");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ addresses: user.addresses });
  } catch (err) {
    console.error("Error fetching addresses:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = addressRouter;
