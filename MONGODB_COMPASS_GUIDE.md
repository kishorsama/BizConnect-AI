# MongoDB Compass Connection Guide - LOCAL DATABASE

## 🔗 **Connection Details**

### **Connection String**
```
mongodb://localhost:27017/bizconnect-ai
```

### **Alternative Connection String**
```
mongodb://127.0.0.1:27017/bizconnect-ai
```

### **Database Name**
```
bizconnect-ai
```

### **Collections**
- `users` - User accounts (admin, vendors, customers)
- `products` - Product catalog
- `orders` - Customer orders
- `carts` - Shopping carts

---

## 📊 **Database Structure**

### **Users Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String,
  role: String (enum: ['admin', 'vendor', 'customer']),
  phone: String,
  address: String,
  businessType: String,
  createdAt: Date,
  updatedAt: Date
}
```

### **Products Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  category: String,
  subcategory: String,
  vendorId: ObjectId (ref: 'User'),
  stock: Number,
  image: String,
  isActive: Boolean,
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### **Orders Collection**
```javascript
{
  _id: ObjectId,
  customerId: ObjectId (ref: 'User'),
  vendorId: ObjectId (ref: 'User'),
  items: [{
    productId: ObjectId (ref: 'Product'),
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  status: String (enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  shippingAddress: String,
  paymentStatus: String (enum: ['pending', 'paid', 'failed']),
  orderNumber: String (unique),
  createdAt: Date,
  updatedAt: Date
}
```

### **Carts Collection**
```javascript
{
  _id: ObjectId,
  customerId: ObjectId (ref: 'User', unique),
  items: [{
    productId: ObjectId (ref: 'Product'),
    quantity: Number
  }],
  updatedAt: Date
}
```

---

## 👥 **Sample Data Overview**

### **Users (17 total)**
- **1 Admin**: admin@bizconnect.com
- **11 Vendors**: Various business types
- **5 Customers**: Different locations

### **Vendors by Business Type**
1. **Rajesh Grocery Store** - Grocery Store
2. **FreshMart Supermarket** - Supermarket
3. **Organic Corner** - Organic Store
4. **TechZone Electronics** - Electronics Store
5. **Mobile Hub** - Mobile Store
6. **Fashion Forward** - Fashion Store
7. **Kids Corner** - Kids Clothing
8. **HealthPlus Pharmacy** - Pharmacy
9. **MediCare Store** - Medical Store
10. **BuildRight Hardware** - Hardware Store
11. **ToolMaster** - Tools Store

### **Products (34 total)**
- **Vegetables**: Fresh Tomatoes, Onions, Organic Spinach
- **Grains**: Basmati Rice, Wheat Flour, Organic Quinoa
- **Dairy**: Milk, Eggs, Butter
- **Electronics**: Chargers, Headphones, Power Banks
- **Clothing**: T-Shirts, Jeans, Shirts
- **Medicine**: Paracetamol, Vitamins, Cough Syrup
- **Tools**: Screwdrivers, Hammers, Drill Machine
- **And more...**

### **Sample Orders (2 total)**
- **ORD-001**: Grocery order (delivered)
- **ORD-002**: Electronics order (processing)

---

## 🔍 **MongoDB Compass Queries**

### **Find All Users**
```javascript
{}
```

### **Find Vendors Only**
```javascript
{ "role": "vendor" }
```

### **Find Products by Category**
```javascript
{ "category": "Electronics" }
```

### **Find Orders by Status**
```javascript
{ "status": "pending" }
```

### **Find Products with Low Stock**
```javascript
{ "stock": { $lt: 20 } }
```

### **Find Orders by Customer**
```javascript
{ "customerId": ObjectId("customer_id_here") }
```

### **Find Products by Vendor**
```javascript
{ "vendorId": ObjectId("vendor_id_here") }
```

### **Search Products by Name**
```javascript
{ "name": { $regex: "tomato", $options: "i" } }
```

### **Find Active Products**
```javascript
{ "isActive": true }
```

### **Find Orders by Date Range**
```javascript
{ 
  "createdAt": { 
    $gte: ISODate("2024-01-01"), 
    $lte: ISODate("2024-12-31") 
  } 
}
```

---

## 🚀 **How to Connect with MongoDB Compass**

### **Step 1: Download MongoDB Compass**
- Download from: https://www.mongodb.com/products/compass
- Install and open MongoDB Compass

### **Step 2: Connect to Local Database**
1. Click "New Connection"
2. Paste the connection string:
   ```
   mongodb://localhost:27017/bizconnect-ai
   ```
3. Click "Connect"

### **Step 3: Explore Collections**
1. Click on `bizconnect-ai` database
2. Browse through collections: `users`, `products`, `orders`, `carts`
3. Use the query interface to explore data

---

## 📈 **Database Statistics**

### **Collection Counts**
- **Users**: 17 documents
- **Products**: 34 documents
- **Orders**: 2 documents
- **Carts**: 1 document

### **Product Categories**
- Vegetables: 3 products
- Grains: 3 products
- Dairy: 3 products
- Electronics: 6 products
- Clothing: 4 products
- Medicine: 4 products
- Tools: 6 products
- And more...

### **Order Status Distribution**
- Delivered: 1 order
- Processing: 1 order
- Pending: 0 orders

---

## 🔧 **Useful Commands**

### **Reset Database**
```bash
npm run seed-comprehensive
```

### **Check Database**
```bash
npm run check-db
```

### **Start Server**
```bash
npm start
```

---

## 📝 **Notes**

- All passwords are set to `vendor123` for vendors and `customer123` for customers
- Admin password is `admin123`
- The database is hosted on MongoDB Atlas (cloud)
- Connection string includes authentication credentials
- All data is realistic and suitable for testing

---

## 🎯 **Next Steps**

1. **Connect to MongoDB Compass** using the provided connection string
2. **Explore the collections** and understand the data structure
3. **Run queries** to analyze the data
4. **Test the application** with the comprehensive dataset
5. **Add more data** as needed for your development

This comprehensive database provides a realistic foundation for further development and testing of your BizConnect AI application! 🚀
