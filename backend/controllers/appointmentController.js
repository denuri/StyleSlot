const Appointment = require("../models/Appointment");
const StaffAvailability = require("../models/StaffAvailability");
const Service = require("../models/Service");
const moment = require("moment");

exports.createAppointment = async (req, res) => {
  try {
    const { staff, service, date, notes } = req.body;
    const appointmentDate = new Date(date);

    if (!staff || !service || !date) {
      return res.status(400).json({ 
        success: false,
        message: "Staff, service, and date are required" 
      });
    }

    if (appointmentDate <= new Date()) {
      return res.status(400).json({ 
        success: false,
        message: "Appointment date must be in the future" 
      });
    }

    const serviceData = await Service.findById(service);
    if (!serviceData) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid service" 
      });
    }

    const duration = serviceData.duration;

    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const dayOfWeek = days[appointmentDate.getUTCDay()];

    const availability = await StaffAvailability.findOne({ staff, dayOfWeek });
    if (!availability) {
      return res.status(400).json({ 
        success: false,
        message: "Staff not available on this day" 
      });
    }

    const startTime = moment(appointmentDate);
    const endTime = startTime.clone().add(duration, "minutes");

    const workStart = moment(`${appointmentDate.toISOString().split("T")[0]} ${availability.startTime}`, "YYYY-MM-DD HH:mm");
    const workEnd = moment(`${appointmentDate.toISOString().split("T")[0]} ${availability.endTime}`, "YYYY-MM-DD HH:mm");

    if (!(startTime.isSameOrAfter(workStart) && endTime.isSameOrBefore(workEnd))) {
      return res.status(400).json({ 
        success: false,
        message: "Selected time is outside working hours" 
      });
    }

    if (availability.breaks && availability.breaks.length > 0) {
      for (let br of availability.breaks) {
        const breakStart = moment(`${appointmentDate.toISOString().split("T")[0]} ${br.start}`, "YYYY-MM-DD HH:mm");
        const breakEnd = moment(`${appointmentDate.toISOString().split("T")[0]} ${br.end}`, "YYYY-MM-DD HH:mm");

        if (startTime.isBefore(breakEnd) && endTime.isAfter(breakStart)) {
          return res.status(400).json({ 
            success: false,
            message: "Selected time overlaps with staff break" 
          });
        }
      }
    }

    const existingAppointments = await Appointment.find({
      staff,
      status: { $in: ["pending", "confirmed"] },
      date: { $gte: startTime.toDate(), $lt: endTime.toDate() }
    });

    if (existingAppointments.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: "This slot is already booked" 
      });
    }

    const appointment = await Appointment.create({
      customer: req.user.id,
      staff,
      service,
      date: appointmentDate,
      startTime: startTime.format("HH:mm"),
      endTime: endTime.format("HH:mm"),
      totalPrice: serviceData.price,
      notes: notes || ""
    });

    await appointment.populate([
      { path: 'customer', select: 'name email' },
      { path: 'staff', select: 'name email' },
      { path: 'service', select: 'name duration price' }
    ]);

    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { date, serviceId } = req.query;

    if (!date || !serviceId) {
      return res.status(400).json({ 
        success: false,
        message: "Date and serviceId are required" 
      });
    }

    const bookingDate = moment(date, "YYYY-MM-DD");
    if (!bookingDate.isValid()) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD" 
      });
    }

    if (bookingDate.isSameOrBefore(moment(), 'day')) {
      return res.status(400).json({ 
        success: false,
        message: "Date must be in the future" 
      });
    }

    const serviceData = await Service.findById(serviceId);
    if (!serviceData) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid service" 
      });
    }

    const duration = serviceData.duration;
    const dayOfWeek = bookingDate.format("dddd");

    const availability = await StaffAvailability.findOne({ staff: staffId, dayOfWeek });
    if (!availability) {
      return res.status(404).json({ 
        success: false,
        message: "Staff not available on this day" 
      });
    }

    const start = moment(`${date} ${availability.startTime}`, "YYYY-MM-DD HH:mm");
    const end = moment(`${date} ${availability.endTime}`, "YYYY-MM-DD HH:mm");

    let slots = [];
    let current = start.clone();

    while (current.isBefore(end)) {
      const slotStart = current.clone();
      const slotEnd = slotStart.clone().add(duration, "minutes");

      if (slotEnd.isAfter(end)) break;

      let inBreak = false;
      if (availability.breaks && availability.breaks.length > 0) {
        for (let br of availability.breaks) {
          const breakStart = moment(`${date} ${br.start}`, "YYYY-MM-DD HH:mm");
          const breakEnd = moment(`${date} ${br.end}`, "YYYY-MM-DD HH:mm");
          if (slotStart.isBefore(breakEnd) && slotEnd.isAfter(breakStart)) {
            inBreak = true;
            break;
          }
        }
      }

      if (!inBreak) {
        slots.push({
          time: slotStart.format("HH:mm"),
          endTime: slotEnd.format("HH:mm")
        });
      }

      current.add(30, "minutes");
    }

    const bookedAppointments = await Appointment.find({
      staff: staffId,
      status: { $in: ["pending", "confirmed"] },
      date: { $gte: start.toDate(), $lt: end.toDate() }
    }).populate("service");

    const bookedTimes = bookedAppointments.map(appt => {
      const bookedStart = moment(appt.date);
      const bookedEnd = bookedStart.clone().add(appt.service.duration, "minutes");
      return { start: bookedStart, end: bookedEnd };
    });

    slots = slots.filter(slot => {
      const slotStart = moment(`${date} ${slot.time}`, "YYYY-MM-DD HH:mm");
      const slotEnd = moment(`${date} ${slot.endTime}`, "YYYY-MM-DD HH:mm");

      return !bookedTimes.some(bt => 
        slotStart.isBefore(bt.end) && slotEnd.isAfter(bt.start)
      );
    });

    res.json({
      success: true,
      data: {
        staffId,
        date,
        serviceId,
        serviceName: serviceData.name,
        duration,
        availableSlots: slots.map(slot => slot.time)
      }
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ customer: req.user.id })
      .populate([
        { path: 'staff', select: 'name email' },
        { path: 'service', select: 'name duration price' }
      ])
      .sort({ date: 1 });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Get my appointments error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getStaffAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ staff: req.user.id })
      .populate([
        { path: 'customer', select: 'name email phone' },
        { path: 'service', select: 'name duration price' }
      ])
      .sort({ date: 1 });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Get staff appointments error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getAllAppointments = async (req, res) => {
  try {
    const { status, date, staff, customer } = req.query;
    
    let filter = {};
    
    if (status) filter.status = status;
    if (date) {
      const startOfDay = moment(date).startOf('day');
      const endOfDay = moment(date).endOf('day');
      filter.date = { $gte: startOfDay.toDate(), $lte: endOfDay.toDate() };
    }
    if (staff) filter.staff = staff;
    if (customer) filter.customer = customer;

    const appointments = await Appointment.find(filter)
      .populate([
        { path: 'customer', select: 'name email phone' },
        { path: 'staff', select: 'name email' },
        { path: 'service', select: 'name duration price' }
      ])
      .sort({ date: 1 });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Get all appointments error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        message: "Appointment not found" 
      });
    }

    if (req.user.role !== "admin" && 
        appointment.customer.toString() !== req.user.id && 
        appointment.staff.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to cancel this appointment" 
      });
    }

    if (appointment.status === "cancelled" || appointment.status === "completed") {
      return res.status(400).json({ 
        success: false,
        message: "Appointment cannot be cancelled" 
      });
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.json({
      success: true,
      message: "Appointment cancelled successfully",
      data: appointment
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.rescheduleAppointment = async (req, res) => {
  try {
    const { newDate } = req.body;
    
    if (!newDate) {
      return res.status(400).json({ 
        success: false,
        message: "New date is required" 
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        message: "Appointment not found" 
      });
    }
    
    if (req.user.role !== "admin" && 
        appointment.customer.toString() !== req.user.id && 
        appointment.staff.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to reschedule this appointment" 
      });
    }


    if (appointment.status === "cancelled" || appointment.status === "completed") {
      return res.status(400).json({ 
        success: false,
        message: "Appointment cannot be rescheduled" 
      });
    }

    const newAppointmentDate = new Date(newDate);
    

    if (newAppointmentDate <= new Date()) {
      return res.status(400).json({ 
        success: false,
        message: "New appointment date must be in the future" 
      });
    }

    appointment.date = newAppointmentDate;
    await appointment.save();

    res.json({
      success: true,
      message: "Appointment rescheduled successfully",
      data: appointment
    });
  } catch (error) {
    console.error('Reschedule appointment error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};
