const express = require("express");
const { body } = require('express-validator');
const {
  createAppointment,
  getMyAppointments,
  getStaffAppointments,
  getAllAppointments,
  cancelAppointment,
  rescheduleAppointment,
  getAvailableSlots
} = require("../controllers/appointmentController");

const { protect, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");

const router = express.Router();

const appointmentValidation = [
  body('staff').isMongoId().withMessage('Valid staff ID is required'),
  body('service').isMongoId().withMessage('Valid service ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
];

const rescheduleValidation = [
  body('newDate').isISO8601().withMessage('Valid new date is required')
];

router.get("/available/:staffId", getAvailableSlots);
router.get("/my", protect, authorize("customer"), getMyAppointments);
router.get("/staff", protect, authorize("staff"), getStaffAppointments);
router.get("/all", protect, authorize("admin"), getAllAppointments);
router.post("/", protect, authorize("customer"), appointmentValidation, validate, createAppointment);
router.put("/:id/cancel", protect, cancelAppointment);
router.put("/:id/reschedule", protect, rescheduleValidation, validate, rescheduleAppointment);

module.exports = router;

