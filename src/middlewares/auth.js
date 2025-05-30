const bcrypt = require("bcryptjs"); // Uncommented for password hashing
const jwt = require("jsonwebtoken");
const User = require('../models/user')

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    //console.log(token)
    if (!token) {
      return res.status(400).send("Invalid Token");
    }

    const { _id } = await jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(_id);
    //console.log("user:   " + user);
    if (!user) {
      return res.status(404).send("No user found");
    }
    req.user = user;
    next(); // This is necessary to proceed to the next handler
  } catch (err) {
    res.status(400).send("Error : " + err.message);
  }
};

module.exports = { userAuth };
