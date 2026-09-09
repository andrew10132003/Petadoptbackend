require("dotenv").config();

const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected");
    process.exit();
  })
  .catch((err) => {
    console.error(err);
    process.exit();
  });