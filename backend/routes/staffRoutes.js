const express = require("express");
const { body } = require('express-validator');
const {
  addAvailability,
  updateAvailability,
  getStaffAvailability,
  getAllStaffAvailability
} = require("../controllers/staffController");
const { protect, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");

const router = express.Router();

const availabilityValidation = [
  body('dayOfWeek').isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    .withMessage('Invalid day of week'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
  body('breaks').optional().isArray().withMessage('Breaks must be an array'),
  body('breaks.*.start').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Break start time must be in HH:MM format'),
  body('breaks.*.end').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Break end time must be in HH:MM format')
];

router.get("/all", protect, authorize("admin"), getAllStaffAvailability);
router.post("/", protect, authorize("staff", "admin"), availabilityValidation, validate, addAvailability);
router.put("/:id", protect, authorize("staff", "admin"), availabilityValidation, validate, updateAvailability);
router.get("/:staffId", getStaffAvailability);

module.exports = router;
