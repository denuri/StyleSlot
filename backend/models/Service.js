const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  duration: { type: Number, required: true }, // in minutes
  price: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Service", serviceSchema);
