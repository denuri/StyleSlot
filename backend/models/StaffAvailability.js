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
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please provide time in HH:MM format"]
  },
  endTime: {
    type: String, 
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please provide time in HH:MM format"]
  },
  breaks: [
    {
      start: {
        type: String,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please provide time in HH:MM format"]
      }, 
      end: {
        type: String,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please provide time in HH:MM format"]
      }    
    }
  ]
}, { timestamps: true });

staffAvailabilitySchema.index({ staff: 1, dayOfWeek: 1 }, { unique: true });

module.exports = mongoose.model("StaffAvailability", staffAvailabilitySchema);
