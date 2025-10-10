# BizConnect AI – Digital Assistant for Local Vendor Empowerment 🛍️

## 📖 Overview
BizConnect AI is an AI-powered web application designed to simplify business management and promote digital literacy for local vendors, especially in rural and semi-urban communities.  
It replaces manual, paper-based systems with an easy-to-use digital assistant that supports natural language and voice input and provides real-time business insights.

---

## 💡 The Problem
Local vendors often struggle to compete because they rely on manual, un-digitized processes.  
This leads to errors, poor insights, and low competitiveness.  
Existing business management tools are either too complex or too expensive and are not adapted to low digital-literacy contexts.  
BizConnect AI empowers these vendors by providing an affordable, AI-driven solution.

---

## ✨ Key Features

- **AI Chatbot & Voice Support**  
  Vendors can interact via text or voice (multi-language support, speech-to-text).

- **Real-time Insights & Analytics**  
  Sales and demand analytics powered by machine learning; real-time dashboards and reports.

- **Payment & UPI Tracking**  
  Integrated digital transaction tracking for better financial management.

- **Vendor & Product Management**  
  Manage vendor and product databases, stock tracking, and pricing.

- **Engagement & Notifications**  
  Alerts, offers, and loyalty programs to improve customer engagement.

---

## ⚙️ Architecture

### Highlights
- **Login Modules** – separate access for Admin, Vendors, and Customers.  
- **Core Services** – vendor, product, catalogue, and order management.  
- **AI Engine** – inventory management, recommendations, analytics, and reporting.  
- **Payments & Notifications** – integration with payment gateways and SMS/notification services.

### Role-Based Workflow
- **Admin Control** – oversight, fraud control, dispute resolution.  
- **Vendor Dashboard** – onboarding, catalog, stock, pricing.  
- **Customer View** – browse, compare, order tracking.  
- **Analytics** – sales trends, forecasting, and vendor insights.

---

## 🔬 Methodology

- **Data Validation** – automatic cross-checks with external APIs and human review for flagged data.  
- **Evaluation** – compared against manual entry and basic digital apps with goals to maximize accuracy, efficiency, and minimize cost and errors.

---

## ✅ Expected Outcomes

- Simplified digital management for local vendors.  
- Accurate stock, sales, and payment tracking.  
- Real-time AI-driven business insights and alerts.  
- Increased vendor efficiency and reduced errors.  
- Enhanced customer engagement and loyalty.

---

## ⚠️ Limitations

- Requires smartphone and internet access.  
- Limited offline capability in current version.

---

## 🚀 Quick Setup & Run

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/omkar-90/BizConnect-AI.git
cd BizConnect-AI
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start MongoDB
**Windows:**
```bash
net start MongoDB
```

**macOS/Linux:**
```bash
sudo systemctl start mongod
```

### 4. Seed the Database
```bash
npm run seed
```

### 5. Start the Application
```bash
npm start
```

The application will be available at: `http://localhost:3000`

## 🔑 Test Accounts

After seeding, you can use these test accounts:

- **Admin**: `admin@test.com` / `admin123`
- **Customer**: `customer@test.com` / `customer123`
- **Vendors**: `rajesh@grocery.com` / `vendor123`, `priya@electronics.com` / `vendor123`, etc.

## 📱 Available Pages

- **Homepage**: `http://localhost:3000`
- **Customer Dashboard**: `http://localhost:3000/customer-dashboard`
- **Vendor Dashboard**: `http://localhost:3000/vendor-dashboard`

## 🛠️ Development Commands

```bash
npm start          # Start production server
npm run dev        # Start development server with auto-reload
npm run seed       # Seed database with test data
npm run check-db   # Check database connection
```

For detailed setup instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md)
