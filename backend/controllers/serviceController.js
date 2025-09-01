const Service = require("../models/Service");

exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ name: 1 });

    res.json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Get all services error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ 
        success: false,
        message: "Service not found" 
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Get service by ID error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};
