const express = require("express");
const User = require("../models/user");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { userAuth } = require("../middlewares/auth");
const profileRouter = express.Router();
const {validateEditProfileData} = require('../utils/validation');
const { sanitizeUser } = require("../utils/sanitize");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;

    //console.log(user);
    res.status(200).send(sanitizeUser(user));
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    const allowedFields = ["name", "avatar", "age", "gender"];
    const incomingFields = Object.keys(req.body);

    const isValidUpdate = incomingFields.every((field) =>
      allowedFields.includes(field)
    );

    if (!isValidUpdate) {
      throw new Error("Invalid fields in update request");
    }
      //throw new Error("Invalid edit request")
    
    // Optional: Convert age to number
    if (req.body.age) {
      req.body.age = Number(req.body.age);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: req.body },
      { new: true }
    );

    res.status(200).send(updatedUser);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

profileRouter.patch("/profile/edit/password", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const newPassword = req.body.password;

    if (!newPassword || !validator.isStrongPassword(newPassword)) {
      throw new Error(
        "Password must be strong: at least 8 characters, with uppercase, lowercase, number, and symbol."
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(
      userId,
      { $set: { password: hashedPassword } },
      { new: true }
    );

    res.status(200).send({ message: "Password updated successfully" });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});


module.exports = profileRouter; // Exporting the router directly
