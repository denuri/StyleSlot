const StaffAvailability = require("../models/StaffAvailability");

exports.addAvailability = async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime, breaks } = req.body;

    const existingAvailability = await StaffAvailability.findOne({
      staff: req.user.id,
      dayOfWeek
    });

    if (existingAvailability) {
      return res.status(400).json({ 
        message: `Availability for ${dayOfWeek} already exists. Use update instead.` 
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({ 
        message: "End time must be after start time" 
      });
    }

    if (breaks && breaks.length > 0) {
      for (let br of breaks) {
        if (br.start >= br.end) {
          return res.status(400).json({ 
            message: "Break end time must be after start time" 
          });
        }
        if (br.start < startTime || br.end > endTime) {
          return res.status(400).json({ 
            message: "Break times must be within working hours" 
          });
        }
      }
    }

    const availability = await StaffAvailability.create({
      staff: req.user.id,
      dayOfWeek,
      startTime,
      endTime,
      breaks: breaks || []
    });

    res.status(201).json({
      success: true,
      data: availability
    });
  } catch (error) {
    console.error('Add availability error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.updateAvailability = async (req, res) => {
  try {
    const availability = await StaffAvailability.findById(req.params.id);

    if (!availability) {
      return res.status(404).json({ 
        success: false,
        message: "Availability not found" 
      });
    }

    if (req.user.role !== "admin" && availability.staff.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to update this availability" 
      });
    }

    const { startTime, endTime, breaks } = req.body;

    if (startTime && endTime && startTime >= endTime) {
      return res.status(400).json({ 
        success: false,
        message: "End time must be after start time" 
      });
    }

    if (breaks && breaks.length > 0) {
      const currentStartTime = startTime || availability.startTime;
      const currentEndTime = endTime || availability.endTime;
      
      for (let br of breaks) {
        if (br.start >= br.end) {
          return res.status(400).json({ 
            success: false,
            message: "Break end time must be after start time" 
          });
        }
        if (br.start < currentStartTime || br.end > currentEndTime) {
          return res.status(400).json({ 
            success: false,
            message: "Break times must be within working hours" 
          });
        }
      }
    }

    Object.assign(availability, req.body);
    await availability.save();

    res.json({
      success: true,
      data: availability
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getStaffAvailability = async (req, res) => {
  try {
    const { staffId } = req.params;
    
    if (!staffId) {
      return res.status(400).json({ 
        success: false,
        message: "Staff ID is required" 
      });
    }

    const availability = await StaffAvailability.find({ staff: staffId })
      .populate('staff', 'name email role');

    if (!availability || availability.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "No availability found for this staff member" 
      });
    }

    res.json({
      success: true,
      data: availability
    });
  } catch (error) {
    console.error('Get staff availability error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getAllStaffAvailability = async (req, res) => {
  try {
    const availability = await StaffAvailability.find()
      .populate("staff", "name email role")
      .sort({ 'staff.name': 1, dayOfWeek: 1 });

    res.json({
      success: true,
      count: availability.length,
      data: availability
    });
  } catch (error) {
    console.error('Get all staff availability error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};
