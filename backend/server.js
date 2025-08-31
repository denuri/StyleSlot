// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require("./routes/appointmentRoutes");
const staffRoutes = require("./routes/staffRoutes");

// Connect Database
connectDB();

// Init Middleware
app.use(express.json());
app.use(cors());

// Test Route
app.get('/', (req, res) => res.send('✅ API Running'));

// Example route placeholder
// app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/users', authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/staff-availability", staffRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`✅ Server started on port ${PORT}`));
