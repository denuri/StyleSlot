const User = require("../models/User");

exports.getAllStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ['staff', 'admin'] } })
      .select('name email role')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: staff.length,
      data: staff
    });
  } catch (error) {
    console.error('Get all staff error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getStaffById = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id)
      .select('name email role phone');

    if (!staff) {
      return res.status(404).json({ 
        success: false,
        message: "Staff member not found" 
      });
    }

    if (staff.role === 'customer') {
      return res.status(404).json({ 
        success: false,
        message: "User is not a staff member" 
      });
    }

    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error('Get staff by ID error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};
