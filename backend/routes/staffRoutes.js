const express = require("express");
const {
  addAvailability,
  updateAvailability,
  getStaffAvailability,
  getAllStaffAvailability
} = require("../controllers/staffController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Staff adds their own availability
router.post("/", protect, authorize("staff", "admin"), addAvailability);

// Staff/Admin update availability
router.put("/:id", protect, authorize("staff", "admin"), updateAvailability);

// Get availability of a specific staff (public for booking)
router.get("/:staffId", protect, getStaffAvailability);

// Admin gets all staff availability
router.get("/", protect, authorize("admin"), getAllStaffAvailability);

module.exports = router;
