const StaffAvailability = require("../models/StaffAvailability");

// 📌 Add availability (Admin/Staff)
exports.addAvailability = async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime, breaks } = req.body;

    const availability = await StaffAvailability.create({
      staff: req.user.id,
      dayOfWeek,
      startTime,
      endTime,
      breaks
    });

    res.status(201).json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Update availability
exports.updateAvailability = async (req, res) => {
  try {
    const availability = await StaffAvailability.findById(req.params.id);

    if (!availability) return res.status(404).json({ message: "Availability not found" });

    // Only the staff themselves or admin can update
    if (req.user.role !== "admin" && availability.staff.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    Object.assign(availability, req.body);
    await availability.save();

    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Get staff availability (for booking)
exports.getStaffAvailability = async (req, res) => {
  try {
    const { staffId } = req.params;
    const availability = await StaffAvailability.find({ staff: staffId });
    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Admin: Get all staff availability
exports.getAllStaffAvailability = async (req, res) => {
  try {
    const availability = await StaffAvailability.find().populate("staff", "name email role");
    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
