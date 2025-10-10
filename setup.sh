#!/bin/bash

# BizConnect-AI Quick Setup Script
# This script automates the setup process for BizConnect-AI

echo "🚀 BizConnect-AI Setup Script"
echo "=============================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher from https://nodejs.org/"
    exit 1
fi

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "❌ MongoDB is not installed. Please install MongoDB from https://www.mongodb.com/try/download/community"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Start MongoDB (if not already running)
echo "🗄️ Starting MongoDB..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    net start MongoDB 2>/dev/null || echo "MongoDB might already be running"
else
    # macOS/Linux
    sudo systemctl start mongod 2>/dev/null || brew services start mongodb-community 2>/dev/null || echo "MongoDB might already be running"
fi

# Wait a moment for MongoDB to start
sleep 3

# Seed the database
echo "🌱 Seeding database..."
npm run seed

if [ $? -ne 0 ]; then
    echo "❌ Failed to seed database"
    exit 1
fi

echo "✅ Database seeded successfully"

# Start the application
echo "🎉 Starting BizConnect-AI..."
echo "📱 Application will be available at: http://localhost:3000"
echo ""
echo "🔑 Test Accounts:"
echo "   Admin: admin@test.com / admin123"
echo "   Customer: customer@test.com / customer123"
echo "   Vendor: rajesh@grocery.com / vendor123"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=============================="

npm start
