const express = require("express");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {
  validateSignUpData,
  validateLoginData,
  verifyGoogleToken,
} = require("../utils/validation");
const authRouter = express.Router();
const { sanitizeUser } = require("../utils/sanitize");
authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);

    const { name, email, password, googleId } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("Email is already registered");
    }

    const userObj = {
      name,
      email,
      googleId: googleId || null,
      password: password || null,
    };

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      userObj.password = passwordHash;
    }

    const user = new User(userObj);
    await user.save();

    // Generate JWT token
    const token = await user.getJWT();
    res.cookie("token", token).status(201).send(user);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

authRouter.post("/login/google", async (req, res) => {
  try {
    const { name, email, googleId, photoUrl, age, gender } = req.body;

    // Verify Google token
    const payload = await verifyGoogleToken(token);
    if (!payload) {
      return res.status(400).send("Invalid Google token");
    }

    let user = await User.findOne({ email }).select("+password"); // select password for comparison

    if (!user) {
      const userObj = {
        name,
        email,
        googleId: googleId || null,
        password: null, // Explicitly set password to null for Google login
        age,
        gender,
        ...(photoUrl && { avatar: photoUrl }),
      };
      user = new User(userObj);
      await user.save();
    }

    // Generate JWT token
    const token = await user.getJWT();
    res.cookie("token", token).status(200).send(user);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    validateLoginData(req);

    const { email, password, googleId } = req.body;
    const user = await User.findOne({ email }).select("+password"); // select password for comparison
    // const user = await User.findOne({ email }).select("+password"); // select password for comparison

    if (!user) {
      return res.status(400).send("Invalid credentials 1");
    }

    if (password) {
      if (!user.password) {
        throw new Error("Invalid credentials 2");
      }

      const isMatch = await user.validatePassword(password);
      if (!isMatch) {
        throw new Error("Invalid credentials 3");
      }
    } else if (googleId && user.googleId !== googleId) {
      throw new Error("Google ID mismatch");
    }

    // Generate JWT token
    const token = await user.getJWT();
    // res
    //   .cookie("token", token, { expires: new Date(Date.now() + 8 * 3600000) })
    //   .status(200)
    //   .send(sanitizeUser(user));

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: true, // ✅ Important for HTTPS
        sameSite: "None", // ✅ Required when using cross-site cookies
        maxAge: 1000 * 60 * 60 * 24, // 1 day
      })
      .status(200)
      .send(sanitizeUser(user));
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/", // ensure it clears for all routes
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(400).json({ error: "ERROR: " + err.message });
  }
});


module.exports = authRouter;
