@echo off
REM BizConnect-AI Quick Setup Script for Windows
REM This script automates the setup process for BizConnect-AI

echo 🚀 BizConnect-AI Setup Script
echo ==============================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js v16 or higher from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if MongoDB is installed
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ MongoDB is not installed. Please install MongoDB from https://www.mongodb.com/try/download/community
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Install dependencies
echo 📦 Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

REM Start MongoDB
echo 🗄️ Starting MongoDB...
net start MongoDB >nul 2>&1
if %errorlevel% neq 0 (
    echo MongoDB might already be running
)

REM Wait a moment for MongoDB to start
timeout /t 3 /nobreak >nul

REM Seed the database
echo 🌱 Seeding database...
npm run seed
if %errorlevel% neq 0 (
    echo ❌ Failed to seed database
    pause
    exit /b 1
)

echo ✅ Database seeded successfully

REM Start the application
echo 🎉 Starting BizConnect-AI...
echo 📱 Application will be available at: http://localhost:3000
echo.
echo 🔑 Test Accounts:
echo    Admin: admin@test.com / admin123
echo    Customer: customer@test.com / customer123
echo    Vendor: rajesh@grocery.com / vendor123
echo.
echo Press Ctrl+C to stop the server
echo ==============================

npm start
