// scripts/seedDatabase.js
const mongoose = require('mongoose');

// User Schema (same as in server.js)
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'vendor', 'customer'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bizconnect-ai';

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB for seeding...');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users...');

    // Create test users
    const testUsers = [
      {
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        name: 'Vendor User',
        email: 'vendor@test.com',
        password: 'vendor123',
        role: 'vendor'
      },
      {
        name: 'Customer User',
        email: 'customer@test.com',
        password: 'customer123',
        role: 'customer'
      }
    ];

    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`Created ${userData.role} user: ${userData.email}`);
    }

    console.log('Database seeded successfully!');
    console.log('\nTest users created:');
    console.log('Admin: admin@test.com / admin123');
    console.log('Vendor: vendor@test.com / vendor123');
    console.log('Customer: customer@test.com / customer123');

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

seedDatabase();
