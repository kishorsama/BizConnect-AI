// scripts/checkDatabase.js
const mongoose = require('mongoose');

// User Schema (same as in server.js)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  createdAt: Date,
  updatedAt: Date
});

const User = mongoose.model('User', userSchema);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bizconnect-ai';

async function checkDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB successfully');
    console.log('=====================================');

    // Get all users
    const users = await User.find({}).select('-password'); // Exclude passwords for security

    console.log(`Total users in database: ${users.length}`);
    console.log('=====================================');

    if (users.length === 0) {
      console.log('No users found in database.');
    } else {
      console.log('Users in database:');
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. User Details:`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Created: ${user.createdAt}`);
      });
    }

    console.log('\n=====================================');
    console.log('Database check completed!');

  } catch (error) {
    console.error('Database check error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

checkDatabase();
