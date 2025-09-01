const mongoose = require('mongoose');
const Service = require('./models/Service');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const sampleServices = [
  {
    name: 'Haircut & Styling',
    description: 'Professional haircut with styling and blow-dry',
    duration: 60,
    price: 45,
    category: 'haircut'
  },
  {
    name: 'Hair Coloring',
    description: 'Full hair coloring service with premium products',
    duration: 120,
    price: 85,
    category: 'coloring'
  },
  {
    name: 'Hair Treatment',
    description: 'Deep conditioning treatment for damaged hair',
    duration: 45,
    price: 35,
    category: 'treatment'
  },
  {
    name: 'Hair Extensions',
    description: 'Professional hair extension application',
    duration: 180,
    price: 150,
    category: 'styling'
  },
  {
    name: 'Men\'s Haircut',
    description: 'Classic men\'s haircut and styling',
    duration: 30,
    price: 25,
    category: 'haircut'
  },
  {
    name: 'Kids Haircut',
    description: 'Haircut for children under 12',
    duration: 30,
    price: 20,
    category: 'haircut'
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Service.deleteMany({});
    console.log('Cleared existing services');

    const services = await Service.insertMany(sampleServices);
    console.log(`Inserted ${services.length} services`);
    
    const existingStaff = await User.find({ role: 'staff' });
    if (existingStaff.length === 0) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const sampleStaff = [
        {
          name: 'Sarah Johnson',
          email: 'sarah@styleslot.com',
          password: hashedPassword,
          phone: '+1234567890',
          role: 'staff'
        },
        {
          name: 'Mike Chen',
          email: 'mike@styleslot.com',
          password: hashedPassword,
          phone: '+1234567891',
          role: 'staff'
        },
        {
          name: 'Emma Davis',
          email: 'emma@styleslot.com',
          password: hashedPassword,
          phone: '+1234567892',
          role: 'staff'
        }
      ];

      const staff = await User.insertMany(sampleStaff);
      console.log(`Inserted ${staff.length} staff members`);
    } else {
      console.log('Staff members already exist, skipping...');
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
