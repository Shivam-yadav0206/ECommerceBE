const mongoose = require("mongoose");

const connectDb = async () => {
  const connect = await mongoose.connect(
    "mongodb+srv://shivam0206:shivam@cluster0.7byo72m.mongodb.net/DevTinder "
    );
    console.log("Database Connected:", connect.connection.name);
};

module.exports = { connectDb };