const mongoose = require("mongoose");

const staffAvailabilitySchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  dayOfWeek: {
    type: String,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    required: true
  },
  startTime: {
    type: String, // Example: "09:00"
    required: true
  },
  endTime: {
    type: String, // Example: "17:00"
    required: true
  },
  breaks: [
    {
      start: String, // "12:00"
      end: String    // "13:00"
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("StaffAvailability", staffAvailabilitySchema);
