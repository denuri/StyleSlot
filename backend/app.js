const express = require('express');
const cors = require('cors');
require('dotenv').config();

const errorHandler = require('./middlewares/errorHandler');

const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointmentRoutes');
const staffRoutes = require('./routes/staffRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/staff-availability', staffRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/users', userRoutes);

app.use(errorHandler);

module.exports = app;
