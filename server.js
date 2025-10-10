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

// MongoDB Connection - Local Database
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bizconnect-ai';

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

// Product Schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  image: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
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

// Order Schema
const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
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

// Cart Schema (for customer cart)
const cartSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);
const Cart = mongoose.model('Cart', cartSchema);

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

// ==================== PRODUCT MANAGEMENT API ====================

// Get all products (for customer browsing)
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate('vendorId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get products by vendor
app.get('/api/vendor/products', async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const tokenParts = token.replace('Bearer ', '').split('-');
    if (tokenParts.length !== 3) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const vendorId = tokenParts[1];
    const vendor = await User.findById(vendorId);
    
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const products = await Product.find({ vendorId }).sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    console.error('Get vendor products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add product (vendor only)
app.post('/api/vendor/products', async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const tokenParts = token.replace('Bearer ', '').split('-');
    if (tokenParts.length !== 3) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const vendorId = tokenParts[1];
    const vendor = await User.findById(vendorId);
    
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { name, description, price, category, stock, image } = req.body;

    if (!name || !description || !price || !category || stock === undefined) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      vendorId,
      stock,
      image: image || ''
    });

    await product.save();
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== CART MANAGEMENT API ====================

// Get customer cart
app.get('/api/cart', async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const tokenParts = token.replace('Bearer ', '').split('-');
    if (tokenParts.length !== 3) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const customerId = tokenParts[1];
    const customer = await User.findById(customerId);
    
    if (!customer || customer.role !== 'customer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const cart = await Cart.findOne({ customerId }).populate('items.productId');
    res.json({ cart: cart || { items: [] } });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add item to cart
app.post('/api/cart/add', async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const tokenParts = token.replace('Bearer ', '').split('-');
    if (tokenParts.length !== 3) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const customerId = tokenParts[1];
    const customer = await User.findById(customerId);
    
    if (!customer || customer.role !== 'customer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ error: 'Product ID and quantity are required' });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    let cart = await Cart.findOne({ customerId });
    
    if (!cart) {
      cart = new Cart({ customerId, items: [] });
    }

    // Check if product already exists in cart
    const existingItem = cart.items.find(item => item.productId.toString() === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    cart.updatedAt = new Date();
    await cart.save();

    res.json({ message: 'Item added to cart successfully', cart });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove item from cart
app.delete('/api/cart/remove/:productId', async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const tokenParts = token.replace('Bearer ', '').split('-');
    if (tokenParts.length !== 3) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const customerId = tokenParts[1];
    const customer = await User.findById(customerId);
    
    if (!customer || customer.role !== 'customer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { productId } = req.params;

    const cart = await Cart.findOne({ customerId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    cart.updatedAt = new Date();
    await cart.save();

    res.json({ message: 'Item removed from cart successfully', cart });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== ORDER MANAGEMENT API ====================

// Create order from cart
app.post('/api/orders/create', async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const tokenParts = token.replace('Bearer ', '').split('-');
    if (tokenParts.length !== 3) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const customerId = tokenParts[1];
    const customer = await User.findById(customerId);
    
    if (!customer || customer.role !== 'customer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { shippingAddress } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({ error: 'Shipping address is required' });
    }

    const cart = await Cart.findOne({ customerId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Group items by vendor
    const vendorOrders = {};
    let totalAmount = 0;

    for (const item of cart.items) {
      const product = item.productId;
      const vendorId = product.vendorId.toString();

      if (!vendorOrders[vendorId]) {
        vendorOrders[vendorId] = {
          vendorId,
          items: [],
          vendorTotal: 0
        };
      }

      const itemTotal = product.price * item.quantity;
      vendorOrders[vendorId].items.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price
      });
      vendorOrders[vendorId].vendorTotal += itemTotal;
      totalAmount += itemTotal;

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Create orders for each vendor
    const orders = [];
    for (const vendorId in vendorOrders) {
      const order = new Order({
        customerId,
        vendorId,
        items: vendorOrders[vendorId].items,
        totalAmount: vendorOrders[vendorId].vendorTotal,
        shippingAddress,
        status: 'pending',
        paymentStatus: 'pending'
      });
      await order.save();
      orders.push(order);
    }

    // Clear cart
    await Cart.findOneAndDelete({ customerId });

    res.status(201).json({ 
      message: 'Orders created successfully', 
      orders,
      totalAmount 
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get vendor orders
app.get('/api/vendor/orders', async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const tokenParts = token.replace('Bearer ', '').split('-');
    if (tokenParts.length !== 3) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const vendorId = tokenParts[1];
    const vendor = await User.findById(vendorId);
    
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const orders = await Order.find({ vendorId })
      .populate('customerId', 'name email')
      .populate('items.productId', 'name price')
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    console.error('Get vendor orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update order status
app.put('/api/vendor/orders/:orderId/status', async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const tokenParts = token.replace('Bearer ', '').split('-');
    if (tokenParts.length !== 3) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const vendorId = tokenParts[1];
    const vendor = await User.findById(vendorId);
    
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { orderId } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findOne({ _id: orderId, vendorId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    order.updatedAt = new Date();
    await order.save();

    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Internal server error' });
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
