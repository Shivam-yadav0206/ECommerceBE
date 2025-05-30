const mongoose = require("mongoose");

const connectDb = async () => {
  const connect = await mongoose.connect(process.env.MONGO_URI);
  
    console.log("Database Connected:", connect.connection.name);
};

module.exports = { connectDb };