# MongoDB Setup Instructions

## Prerequisites
1. Install MongoDB on your system
2. Make sure MongoDB is running on `mongodb://localhost:27017`

## Quick Start

1. **Start MongoDB** (if not already running):
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Seed the database with test users**:
   ```bash
   npm run seed
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

## Test Users
After seeding, you can use these test accounts:

- **Admin**: admin@test.com / admin123
- **Vendor**: vendor@test.com / vendor123  
- **Customer**: customer@test.com / customer123

## API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user (requires token)

## Environment Variables

Create a `.env` file in the root directory with:

```
MONGODB_URI=mongodb://localhost:27017/bizconnect-ai
PORT=3000
NODE_ENV=development
```

## Database Schema

### User Model
- `name`: String (required)
- `email`: String (required, unique)
- `password`: String (required, min 6 chars)
- `role`: String (enum: 'admin', 'vendor', 'customer')
- `createdAt`: Date
- `updatedAt`: Date
