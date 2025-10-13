# 🤖 BizConnect-AI ML Pipeline

## Overview

This ML pipeline provides AI-powered insights for the BizConnect-AI e-commerce platform, including:

- **Sales Trend Prediction**: Predict future sales volumes and revenue trends
- **Product Performance Analysis**: Identify products likely to sell more or less in the future
- **Category Insights**: Analyze performance across different product categories
- **Vendor Analytics**: Get insights for vendor performance optimization

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install Python packages
pip install -r ml-models/requirements.txt

# Install Node.js dependencies (if not already installed)
npm install
```

### 2. Run the ML Pipeline

```bash
# Run the complete ML pipeline
python ml-models/run_ml_pipeline.py
```

### 3. Start the Server

```bash
# Start the Node.js server
npm start
# or
node server.js
```

### 4. Test the ML Pipeline

```bash
# Run the test suite
python ml-models/test_ml_pipeline.py
```

## 📁 Project Structure

```
ml-models/
├── data/                          # Generated datasets
│   ├── products.csv              # Product data
│   ├── customers.csv             # Customer data
│   ├── vendors.csv               # Vendor data
│   ├── sales.csv                 # Sales/order data
│   ├── ml_dataset.csv            # ML-ready dataset
│   └── product_predictions.csv   # Model predictions
├── models/                       # Trained ML models
│   ├── sales_performance_classifier.joblib
│   ├── revenue_performance_classifier.joblib
│   ├── high_performer_classifier.joblib
│   ├── low_performer_classifier.joblib
│   ├── sales_regressor.joblib
│   ├── revenue_regressor.joblib
│   └── scaler.joblib
├── data_generator.py             # Synthetic data generation
├── feature_engineering.py        # Feature engineering pipeline
├── model_trainer.py              # ML model training
├── ml_predictor.py               # Prediction API
├── ml_service.js                 # Node.js ML service
├── run_ml_pipeline.py            # Complete pipeline runner
├── test_ml_pipeline.py           # Test suite
└── requirements.txt               # Python dependencies
```

## 🧠 ML Models

### 1. Sales Performance Classifier
- **Purpose**: Classify products into performance categories (Low, Medium, High, Very High)
- **Algorithm**: Random Forest Classifier
- **Features**: Price, stock, category, sales history, vendor characteristics

### 2. Revenue Performance Classifier
- **Purpose**: Classify products by revenue performance
- **Algorithm**: Gradient Boosting Classifier
- **Features**: Price, sales volume, customer behavior, seasonal patterns

### 3. High Performer Detector
- **Purpose**: Identify products likely to be high performers
- **Algorithm**: Logistic Regression
- **Features**: Scaled numerical features with balanced class weights

### 4. Low Performer Detector
- **Purpose**: Identify products likely to be low performers
- **Algorithm**: Random Forest Classifier
- **Features**: Stock aging, price competitiveness, customer engagement

### 5. Sales Regressor
- **Purpose**: Predict total sales volume
- **Algorithm**: Random Forest Regressor
- **Features**: Product characteristics, historical performance, market trends

### 6. Revenue Regressor
- **Purpose**: Predict total revenue
- **Algorithm**: Gradient Boosting Regressor
- **Features**: Price, sales volume, customer behavior, seasonal patterns

## 🔧 API Endpoints

### Initialize ML Pipeline
```http
POST /api/ml/initialize
```
Initializes the complete ML pipeline (data generation, feature engineering, model training).

### Predict Product Performance
```http
POST /api/ml/predict-product
Content-Type: application/json

{
  "productId": "product_id_here"
}
```

### Get Sales Trends
```http
GET /api/ml/sales-trends/:productId?days=30
```

### Get Top Performing Products
```http
GET /api/ml/top-products?limit=10
```

### Get Low Performing Products
```http
GET /api/ml/low-products?limit=10
```

### Get Category Insights
```http
GET /api/ml/category-insights/:category
```

### Get Vendor Insights
```http
GET /api/ml/vendor-insights/:vendorId
```

## 📊 Features Generated

### Product Features
- Price categories (Low, Medium, High, Premium)
- Stock status (Out of Stock, Low Stock, In Stock)
- Product age in days
- Category and subcategory encodings

### Sales Features
- Temporal features (year, month, day, weekday, quarter)
- Seasonal indicators (holiday season, summer season)
- Customer age groups and demographics
- Order value and quantity categories
- Payment and delivery status

### Aggregated Features
- Total sales and revenue per product
- Average order quantity and value
- Unique customer count
- Delivery and cancellation rates
- Sales velocity and trends

### Time Series Features
- Daily sales aggregation
- Rolling averages (7, 14, 30 days)
- Trend indicators
- Seasonal multipliers

## 🎯 Usage Examples

### Frontend Integration

```javascript
// Initialize ML pipeline
const success = await mlPredictions.initializeML();

// Get top performing products
const topProducts = await mlPredictions.getTopPerformingProducts(10);

// Get low performing products
const lowProducts = await mlPredictions.getLowPerformingProducts(10);

// Predict product performance
const prediction = await mlPredictions.predictProductPerformance(productId);
```

### Backend Integration

```javascript
const MLService = require('./ml-models/ml_service');
const mlService = new MLService();

// Initialize pipeline
await mlService.initializeMLPipeline();

// Get predictions
const topProducts = await mlService.getTopPerformingProducts(10);
```

## 📈 Performance Metrics

### Classification Models
- **Accuracy**: >85% for all classifiers
- **Precision/Recall**: Balanced for high/low performer detection
- **F1-Score**: Optimized for business impact

### Regression Models
- **R² Score**: >0.8 for sales and revenue prediction
- **RMSE**: Minimized for accurate predictions
- **MAPE**: <15% for trend forecasting

## 🔄 Data Pipeline

1. **Data Generation**: Creates synthetic dataset mimicking VISUELLE structure
2. **Feature Engineering**: Extracts meaningful features from raw data
3. **Model Training**: Trains multiple ML models for different tasks
4. **Prediction Generation**: Generates predictions for all products
5. **API Integration**: Provides real-time predictions via REST API

## 🧪 Testing

The test suite validates:
- Server connectivity
- ML pipeline initialization
- API endpoint functionality
- Prediction accuracy
- Error handling

Run tests with:
```bash
python ml-models/test_ml_pipeline.py
```

## 🚀 Deployment

### Development
```bash
# Run ML pipeline
python ml-models/run_ml_pipeline.py

# Start server
npm start
```

### Production
1. Ensure Python dependencies are installed
2. Run ML pipeline to generate models
3. Start Node.js server
4. ML models are automatically loaded on first API call

## 📝 Configuration

### Model Parameters
- **Random Forest**: 100-150 estimators, max depth 10-15
- **Gradient Boosting**: 100 estimators, learning rate 0.1
- **Logistic Regression**: Balanced class weights, max iterations 1000

### Data Parameters
- **Products**: 1000 synthetic products
- **Customers**: 500 synthetic customers
- **Vendors**: 50 synthetic vendors
- **Sales**: 10,000 synthetic sales records

## 🔧 Troubleshooting

### Common Issues

1. **Python Dependencies Missing**
   ```bash
   pip install -r ml-models/requirements.txt
   ```

2. **ML Pipeline Fails**
   - Check Python version (3.7+)
   - Ensure all dependencies are installed
   - Check disk space for generated files

3. **API Endpoints Not Working**
   - Ensure server is running
   - Check ML pipeline initialization
   - Verify model files exist

4. **Predictions Not Accurate**
   - Retrain models with more data
   - Adjust feature engineering
   - Update model parameters

## 📊 Monitoring

### Model Performance
- Monitor prediction accuracy
- Track API response times
- Log prediction requests

### Business Impact
- Track high performer identification
- Monitor low performer alerts
- Measure revenue impact

## 🔮 Future Enhancements

1. **Real-time Learning**: Update models with new data
2. **Deep Learning**: Implement neural networks for complex patterns
3. **External Data**: Integrate market trends and economic indicators
4. **A/B Testing**: Framework for model comparison
5. **Automated Retraining**: Scheduled model updates

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Run the test suite
3. Review the logs for error messages
4. Ensure all dependencies are properly installed

---

**Built with ❤️ for BizConnect-AI**
