const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: [100, "Service name cannot be more than 100 characters"]
  },
  description: {
    type: String,
    maxlength: [500, "Description cannot be more than 500 characters"]
  },
  duration: { 
    type: Number, 
    required: true,
  },
  price: { 
    type: Number, 
    required: true,
    min: [0, "Price cannot be negative"]
  },
  category: {
    type: String,
    required: true,
    enum: ['haircut', 'styling', 'coloring', 'treatment', 'other']
  }
}, { timestamps: true });

module.exports = mongoose.model("Service", serviceSchema);
