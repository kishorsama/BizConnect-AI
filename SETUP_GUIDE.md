# BizConnect-AI Setup Guide

## Prerequisites
Before setting up the project, ensure you have the following installed:

### Required Software
1. **Node.js** (v16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **MongoDB** (v4.4 or higher)
   - Download from: https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas

3. **Git**
   - Download from: https://git-scm.com/
   - Verify installation: `git --version`

## Quick Setup (Local Machine)

### Step 1: Clone the Repository
```bash
git clone https://github.com/omkar-90/BizConnect-AI.git
cd BizConnect-AI
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start MongoDB
**Windows:**
```bash
net start MongoDB
```

**macOS/Linux:**
```bash
sudo systemctl start mongod
# or
brew services start mongodb-community
```

### Step 4: Seed the Database
```bash
npm run seed
```

### Step 5: Start the Application
```bash
npm start
```

The application will be available at: `http://localhost:3000`

## Test Accounts

After seeding the database, you can use these test accounts:

### Admin Account
- **Email**: `admin@test.com`
- **Password**: `admin123`

### Customer Account  
- **Email**: `customer@test.com`
- **Password**: `customer123`

### Vendor Accounts
1. **Rajesh Grocery Store**: `rajesh@grocery.com` / `vendor123`
2. **Priya Electronics**: `priya@electronics.com` / `vendor123`
3. **Amit Clothing Store**: `amit@clothing.com` / `vendor123`
4. **Sunita Pharmacy**: `sunita@pharmacy.com` / `vendor123`
5. **Vikram Hardware**: `vikram@hardware.com` / `vendor123`

## Available Pages

- **Homepage**: `http://localhost:3000`
- **Customer Login**: `http://localhost:3000/customer-login`
- **Vendor Login**: `http://localhost:3000/vendor-login`
- **Customer Dashboard**: `http://localhost:3000/customer-dashboard`
- **Vendor Dashboard**: `http://localhost:3000/vendor-dashboard`

## Troubleshooting

### MongoDB Connection Issues
If MongoDB fails to start:
1. Check if MongoDB service is running
2. Verify MongoDB is installed correctly
3. Check if port 27017 is available

### Port Already in Use
If port 3000 is already in use:
1. Kill the process using port 3000
2. Or change the port in `server.js` (line 5)

### Database Seeding Issues
If seeding fails:
1. Ensure MongoDB is running
2. Check database connection
3. Run `npm run check-db` to verify connection

## Project Structure

```
BizConnect-AI/
├── public/                 # Frontend files
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript files
│   ├── img/               # Images
│   └── *.html             # HTML pages
├── scripts/               # Database scripts
├── server.js              # Main server file
├── db.js                  # Database configuration
├── package.json           # Dependencies
└── README.md              # Project documentation
```

## Features

- **User Authentication**: Login/Register for Admin, Vendor, Customer
- **Product Management**: Add, edit, view products
- **Shopping Cart**: Add items, manage quantities
- **Order Management**: Create and track orders
- **Dashboard**: Role-based dashboards for different user types
- **Responsive Design**: Works on desktop and mobile

## Development Commands

```bash
# Start development server with auto-reload
npm run dev

# Seed database with test data
npm run seed

# Comprehensive database seeding
npm run seed-comprehensive

# Check database connection
npm run check-db

# Start production server
npm start
```

## Environment Variables

Create a `.env` file in the root directory (optional):

```env
MONGODB_URI=mongodb://localhost:27017/bizconnect-ai
PORT=3000
NODE_ENV=development
```

## Support

If you encounter any issues:
1. Check the console for error messages
2. Verify all prerequisites are installed
3. Ensure MongoDB is running
4. Check if all dependencies are installed correctly

---

**Happy coding! 🚀**
