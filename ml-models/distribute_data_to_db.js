const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bizconnect-ai';

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['admin', 'vendor', 'customer'], required: true },
  shopName: { type: String, trim: true },
  address: { type: String, trim: true },
  phone: { type: String, trim: true },
  businessType: { type: String, trim: true },
  city: { type: String, trim: true },
  annualTurnover: { type: String, trim: true },
  employeeCount: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  subcategory: { type: String, trim: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stock: { type: Number, required: true, min: 0, default: 0 },
  image: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  tags: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  shippingAddress: { type: String, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  orderNumber: { type: String, unique: true, required: true }
});

const cartSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 }
  }],
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);
const Cart = mongoose.model('Cart', cartSchema);

async function distributeDataToDatabase() {
  try {
    console.log('🚀 Starting data distribution to database...');

    // Step 1: Get existing vendors or create them
    console.log('📋 Getting existing vendors...');
    let existingVendors = await User.find({ role: 'vendor' });
    console.log(`Found ${existingVendors.length} existing vendors`);

    // If no vendors exist, create them from ML data
    if (existingVendors.length === 0) {
      console.log('👥 No vendors found. Creating vendors from ML data...');
      const vendorsData = fs.readFileSync(path.join(__dirname, 'data', 'vendors.csv'), 'utf8');
      const vendors = parseCSV(vendorsData);
      
      for (const vendor of vendors) {
        try {
          const newVendor = new User({
            name: vendor.name,
            email: vendor.email,
            password: 'password123', // Default password
            role: 'vendor',
            shopName: vendor.name,
            businessType: vendor.business_type,
            city: vendor.city,
            annualTurnover: vendor.annual_turnover,
            employeeCount: vendor.employee_count,
            createdAt: new Date(vendor.created_at)
          });
          const savedVendor = await newVendor.save();
          existingVendors.push(savedVendor);
        } catch (error) {
          console.log(`⚠️ Error creating vendor ${vendor.vendor_id}: ${error.message}`);
        }
      }
      console.log(`✅ Created ${existingVendors.length} vendors`);
    }

    // Step 2: Clear existing products and orders (but keep vendors)
    console.log('🗑️ Clearing existing products and orders...');
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Cart.deleteMany({});
    console.log('✅ Cleared existing products and orders');

    // Step 3: Read ML training data
    console.log('📖 Reading ML training data...');
    const productsData = fs.readFileSync(path.join(__dirname, 'data', 'products.csv'), 'utf8');
    const salesData = fs.readFileSync(path.join(__dirname, 'data', 'sales.csv'), 'utf8');
    const customersData = fs.readFileSync(path.join(__dirname, 'data', 'customers.csv'), 'utf8');

    // Parse CSV data
    const products = parseCSV(productsData);
    const sales = parseCSV(salesData);
    const customers = parseCSV(customersData);

    console.log(`📊 Loaded ${products.length} products, ${sales.length} sales, ${customers.length} customers`);

    // Step 4: Create customers
    console.log('👥 Creating customers...');
    const customerMap = new Map();
    for (const customer of customers) {
      try {
        const newCustomer = new User({
          name: customer.name || `Customer ${customer.customer_id}`,
          email: `customer${customer.customer_id}@example.com`,
          password: 'password123', // Default password
          role: 'customer',
          createdAt: new Date(customer.created_at || Date.now())
        });
        const savedCustomer = await newCustomer.save();
        customerMap.set(customer.customer_id, savedCustomer._id);
      } catch (error) {
        console.log(`⚠️ Customer ${customer.customer_id} already exists or error: ${error.message}`);
        // Try to find existing customer
        const existingCustomer = await User.findOne({ email: `customer${customer.customer_id}@example.com` });
        if (existingCustomer) {
          customerMap.set(customer.customer_id, existingCustomer._id);
        }
      }
    }
    console.log(`✅ Created/found ${customerMap.size} customers`);

    // Step 5: Distribute products among existing vendors
    console.log('📦 Distributing products among vendors...');
    const productMap = new Map();
    const vendorIds = existingVendors.map(v => v._id);
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const vendorIndex = i % vendorIds.length; // Distribute evenly
      const vendorId = vendorIds[vendorIndex];
      
      try {
        const newProduct = new Product({
          name: product.name,
          description: product.description,
          price: parseFloat(product.price),
          category: product.category,
          subcategory: product.subcategory,
          vendorId: vendorId,
          stock: parseInt(product.stock),
          isActive: product.is_active === 'True',
          tags: product.tags ? product.tags.replace(/'/g, '"').split(',').map(tag => tag.trim().replace(/[\[\]"]/g, '')) : [],
          createdAt: new Date(product.created_at)
        });
        
        const savedProduct = await newProduct.save();
        productMap.set(product.product_id, savedProduct._id);
      } catch (error) {
        console.log(`⚠️ Error creating product ${product.product_id}: ${error.message}`);
      }
    }
    console.log(`✅ Created ${productMap.size} products`);

    // Step 6: Create orders
    console.log('🛒 Creating orders...');
    let orderCount = 0;
    const orderMap = new Map();
    
    for (const sale of sales) {
      try {
        const customerId = customerMap.get(sale.customer_id);
        const productId = productMap.get(sale.product_id);
        
        if (!customerId || !productId) {
          continue; // Skip if customer or product not found
        }
        
        // Find vendor for this product
        const product = await Product.findById(productId);
        if (!product) continue;
        
        const orderNumber = `ORD-${Date.now()}-${orderCount}`;
        
        const newOrder = new Order({
          customerId: customerId,
          vendorId: product.vendorId,
          items: [{
            productId: productId,
            quantity: parseInt(sale.quantity),
            price: parseFloat(sale.unit_price)
          }],
          totalAmount: parseFloat(sale.total_amount),
          status: sale.status,
          paymentStatus: sale.payment_status,
          shippingAddress: `${sale.shipping_city}, India`,
          createdAt: new Date(sale.order_date),
          orderNumber: orderNumber
        });
        
        const savedOrder = await newOrder.save();
        orderMap.set(sale.order_id, savedOrder._id);
        orderCount++;
        
        if (orderCount % 1000 === 0) {
          console.log(`📝 Created ${orderCount} orders...`);
        }
      } catch (error) {
        console.log(`⚠️ Error creating order ${sale.order_id}: ${error.message}`);
      }
    }
    console.log(`✅ Created ${orderCount} orders`);

    // Step 7: Summary
    console.log('\n🎉 Data distribution completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Vendors: ${existingVendors.length} (kept existing)`);
    console.log(`   - Customers: ${customerMap.size}`);
    console.log(`   - Products: ${productMap.size}`);
    console.log(`   - Orders: ${orderCount}`);
    
    console.log('\n💡 ML predictions will now be based on real data from your database!');

  } catch (error) {
    console.error('❌ Error distributing data:', error);
  } finally {
    mongoose.connection.close();
  }
}

function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row = {};
    headers.forEach((header, index) => {
      row[header.trim()] = values[index] ? values[index].trim() : '';
    });
    data.push(row);
  }
  
  return data;
}

// Run the distribution
distributeDataToDatabase();
