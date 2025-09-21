const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    juice: String,
    name: String,
    phone: String,
    quantity: Number,
    instructions: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
