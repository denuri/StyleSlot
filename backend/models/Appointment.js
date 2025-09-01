const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed", "no-show"],
    default: "pending"
  },
  notes: {
    type: String,
    maxlength: [500, "Notes cannot be more than 500 characters"]
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, "Price cannot be negative"]
  },
}, { timestamps: true });

appointmentSchema.index({ date: 1, staff: 1 });
appointmentSchema.index({ customer: 1, date: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
