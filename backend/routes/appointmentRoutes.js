const express = require("express");
const {
  createAppointment,
  getMyAppointments,
  getStaffAppointments,
  getAllAppointments,
  cancelAppointment,
  rescheduleAppointment,
  getAvailableSlots
} = require("../controllers/appointmentController");

console.log("getAllAppointments:", getAllAppointments);


const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Customer creates appointment
router.post("/", protect, authorize("customer"), createAppointment);

// Customer views their own appointments
router.get("/my", protect, authorize("customer"), getMyAppointments);

// Staff views their assigned appointments
router.get("/staff", protect, authorize("staff"), getStaffAppointments);

// Admin views all appointments
router.get("/", protect, authorize("admin"), getAllAppointments);

// Cancel appointment
router.put("/:id/cancel", protect, cancelAppointment);

// Reschedule appointment
router.put("/:id/reschedule", protect, rescheduleAppointment);

// Get available slots for a staff member
router.get("/available/:staffId", protect, getAvailableSlots);

module.exports = router;

