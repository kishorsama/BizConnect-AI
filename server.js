require('dotenv').config();

const express = require('express')
const app = express()
const port = 3000;

const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required but not set');
  console.error('Please set MONGODB_URI in your environment variables');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('Connected to MongoDB successfully');
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

// User Schema
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

// Update the updatedAt field before saving


const User = mongoose.model('User', userSchema);

// API Routes (must come before static middleware)
// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Simple password check (in production, use bcrypt)
    if (user.password !== password) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Return user data (excluding password)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    res.json({
      message: 'Login successful',
      user: userResponse,
      accessToken: `token-${user._id}-${Date.now()}` // Simple token for demo
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        error: 'All fields are required' 
      });
    }

    if (!['admin', 'vendor', 'customer'].includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role. Must be admin, vendor, or customer' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ 
        error: 'User with this email already exists' 
      });
    }

    // Create new user
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password, // In production, hash this password
      role
    });

    await newUser.save();

    // Return user data (excluding password)
    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt
    };

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse,
      accessToken: `token-${newUser._id}-${Date.now()}`
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// Get current user endpoint
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization;
    
    if (!token) {
      return res.status(401).json({ 
        error: 'No token provided' 
      });
    }

    // Simple token validation (in production, use JWT)
    const tokenParts = token.replace('Bearer ', '').split('-');
    if (tokenParts.length !== 3) {
      return res.status(401).json({ 
        error: 'Invalid token' 
      });
    }

    const userId = tokenParts[1];
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found' 
      });
    }

    res.json({ user });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// Static file serving (must come after API routes)
app.use(express.static(__dirname + "/public"));

// Static Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + "/public/index.html")
})


app.get('/customer-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'customer.html'));
});

app.get('/vendor-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'vendor.html'));
});

app.get('/customer-dashboard' , (req , res) => {
    res.sendFile(path.join(__dirname, 'public', 'customer-dashboard.html'));
})


app.get('/vendor-dashboard' , (req , res) => {
    res.sendFile(path.join(__dirname, 'public', 'vendor-dashboard.html'));
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
