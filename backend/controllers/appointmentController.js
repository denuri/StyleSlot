const Appointment = require("../models/Appointment");
const StaffAvailability = require("../models/StaffAvailability");
const Service = require("../models/Service");
const moment = require("moment");

// Create Appointment (with availability + duration check)
exports.createAppointment = async (req, res) => {
  try {
    const { staff, service, date } = req.body;
    const appointmentDate = new Date(date);

    // Get service info
    const serviceData = await Service.findById(service);
    if (!serviceData) {
      return res.status(400).json({ message: "Invalid service" });
    }

    const duration = serviceData.duration; // minutes

    // Get day of week
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const dayOfWeek = days[appointmentDate.getUTCDay()];

    // Find staff availability
    const availability = await StaffAvailability.findOne({ staff, dayOfWeek });
    if (!availability) {
      return res.status(400).json({ message: "Staff not available on this day" });
    }

    // Check working hours
    const startTime = moment(appointmentDate);
    const endTime = startTime.clone().add(duration, "minutes");

    const workStart = moment(`${appointmentDate.toISOString().split("T")[0]} ${availability.startTime}`, "YYYY-MM-DD HH:mm");
    const workEnd = moment(`${appointmentDate.toISOString().split("T")[0]} ${availability.endTime}`, "YYYY-MM-DD HH:mm");

    if (!(startTime.isSameOrAfter(workStart) && endTime.isSameOrBefore(workEnd))) {
      return res.status(400).json({ message: "Selected time is outside working hours" });
    }

    // Check breaks
    if (availability.breaks && availability.breaks.length > 0) {
      for (let br of availability.breaks) {
        const breakStart = moment(`${appointmentDate.toISOString().split("T")[0]} ${br.start}`, "YYYY-MM-DD HH:mm");
        const breakEnd = moment(`${appointmentDate.toISOString().split("T")[0]} ${br.end}`, "YYYY-MM-DD HH:mm");

        if (startTime.isBefore(breakEnd) && endTime.isAfter(breakStart)) {
          return res.status(400).json({ message: "Selected time overlaps with staff break" });
        }
      }
    }

    // Check for overlapping appointments
    const conflict = await Appointment.findOne({
      staff,
      status: "booked",
      $or: [
        { date: { $lte: endTime.toDate() }, },
        { date: { $gte: startTime.toDate() } }
      ]
    });

    if (conflict) {
      return res.status(400).json({ message: "This slot is already booked" });
    }

    // Create appointment
    const appointment = await Appointment.create({
      customer: req.user.id,
      staff,
      service,
      date: appointmentDate
    });

    // Get available slots for a given staff and date (configurable by service duration)
exports.getAvailableSlots = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { date, serviceId } = req.query;

    if (!date || !serviceId) return res.status(400).json({ message: "Date and serviceId are required" });

    const bookingDate = moment(date, "YYYY-MM-DD");
    if (!bookingDate.isValid()) return res.status(400).json({ message: "Invalid date format" });

    const serviceData = await Service.findById(serviceId);
    if (!serviceData) return res.status(400).json({ message: "Invalid service" });

    const duration = serviceData.duration;

    const dayOfWeek = bookingDate.format("dddd");

    // Staff availability
    const availability = await StaffAvailability.findOne({ staff: staffId, dayOfWeek });
    if (!availability) {
      return res.status(404).json({ message: "Staff not available on this day" });
    }

    const start = moment(`${date} ${availability.startTime}`, "YYYY-MM-DD HH:mm");
    const end = moment(`${date} ${availability.endTime}`, "YYYY-MM-DD HH:mm");

    let slots = [];
    let current = start.clone();

    while (current.add(0, "minutes") < end) {
      const slotStart = current.clone();
      const slotEnd = slotStart.clone().add(duration, "minutes");

      // Stop if slot goes past working hours
      if (slotEnd > end) break;

      // Check breaks
      let inBreak = false;
      if (availability.breaks) {
        for (let br of availability.breaks) {
          const breakStart = moment(`${date} ${br.start}`, "YYYY-MM-DD HH:mm");
          const breakEnd = moment(`${date} ${br.end}`, "YYYY-MM-DD HH:mm");
          if (slotStart.isBefore(breakEnd) && slotEnd.isAfter(breakStart)) {
            inBreak = true;
            break;
          }
        }
      }

      if (!inBreak) slots.push(slotStart.format("HH:mm"));

      current.add(30, "minutes"); // slot stepping interval (could also = duration)
    }

    // Filter out already booked slots
    const bookedAppointments = await Appointment.find({
      staff: staffId,
      status: "booked",
      date: { $gte: start.toDate(), $lt: end.toDate() }
    }).populate("service");

    const bookedTimes = bookedAppointments.map(appt => {
      const bookedStart = moment(appt.date);
      const bookedEnd = bookedStart.clone().add(appt.service.duration, "minutes");
      return { start: bookedStart, end: bookedEnd };
    });

    slots = slots.filter(slot => {
      const slotStart = moment(`${date} ${slot}`, "YYYY-MM-DD HH:mm");
      const slotEnd = slotStart.clone().add(duration, "minutes");

      return !bookedTimes.some(bt => slotStart.isBefore(bt.end) && slotEnd.isAfter(bt.start));
    });

    res.json({ staffId, date, serviceId, availableSlots: slots });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
