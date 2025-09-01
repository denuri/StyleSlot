const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/db');
require('dotenv').config();

const initializeUsers = async () => {
  try {
    await connectDB();
    console.log('Connected to database for user initialization...');

    const existingUsers = await User.find({});
    if (existingUsers.length > 0) {
      console.log('Users already exist in database. Skipping initialization.');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPasswordAdmin = await bcrypt.hash('admin', salt);
    const hashedPasswordStaff = await bcrypt.hash('staff', salt);
    const hashedPasswordCustomer = await bcrypt.hash('customer', salt);

    const defaultUsers = [
      {
        name: 'Admin User',
        email: 'admin@gmail.com',
        password: hashedPasswordAdmin,
        phone: '+94771234567',
        role: 'admin'
      },
      {
        name: 'Staff User',
        email: 'staff@gmail.com',
        password: hashedPasswordStaff,
        phone: '+94771234568',
        role: 'staff'
      },
      {
        name: 'Customer User',
        email: 'customer@gmail.com',
        password: hashedPasswordCustomer,
        phone: '+94771234569',
        role: 'customer'
      }
    ];

    const createdUsers = await User.insertMany(defaultUsers);

    console.log('✅ Default users created successfully:');
    createdUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    console.log('\n📝 Login credentials:');
    console.log('Email: admin@gmail.com | Password: admin');
    console.log('Email: staff@gmail.com | Password: staff');
    console.log('Email: customer@gmail.com | Password: customer');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing users:', error);
    process.exit(1);
  }
};

initializeUsers();
