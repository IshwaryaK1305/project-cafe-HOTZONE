const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  type: String,
  image: String,
  desc: String,
  available: Boolean,
});

module.exports = mongoose.model("Menu", menuSchema);
