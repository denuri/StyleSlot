const express = require("express");
const { getAllStaff, getStaffById } = require("../controllers/userController");

const router = express.Router();

router.get("/staff", getAllStaff);
router.get("/staff/:id", getStaffById);

module.exports = router;
