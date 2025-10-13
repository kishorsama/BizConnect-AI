"""
ML Prediction API for BizConnect-AI
Provides real-time predictions for sales trends and product performance
"""

import pandas as pd
import numpy as np
import joblib
import json
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

class MLPredictor:
    def __init__(self):
        self.models = {}
        self.scaler = None
        self.feature_columns = []
        self.is_loaded = False
        
    def load_models(self):
        """Load all trained models"""
        try:
            # Load feature columns
            with open('data/feature_columns.txt', 'r') as f:
                self.feature_columns = [line.strip() for line in f.readlines()]
            
            # Load scaler
            self.scaler = joblib.load('data/scaler.joblib')
            
            # Load all models
            model_files = [
                'sales_performance_classifier',
                'revenue_performance_classifier', 
                'high_performer_classifier',
                'low_performer_classifier',
                'sales_regressor',
                'revenue_regressor'
            ]
            
            for model_file in model_files:
                self.models[model_file] = joblib.load(f'data/{model_file}.joblib')
            
            self.is_loaded = True
            print("✅ ML models loaded successfully")
            return True
            
        except Exception as e:
            print(f"❌ Error loading ML models: {e}")
            return False
    
    def predict_product_performance(self, product_data):
        """Predict performance for a single product"""
        if not self.is_loaded:
            if not self.load_models():
                return None
        
        try:
            # Convert product data to DataFrame
            product_df = pd.DataFrame([product_data])
            
            # Ensure all required features are present
            for feature in self.feature_columns:
                if feature not in product_df.columns:
                    product_df[feature] = 0
            
            # Select features in correct order
            X = product_df[self.feature_columns].fillna(0)
            
            # Scale features
            X_scaled = self.scaler.transform(X)
            
            # Generate predictions
            predictions = {}
            
            # Classification predictions
            predictions['sales_performance'] = self.models['sales_performance_classifier'].predict(X)[0]
            predictions['revenue_performance'] = self.models['revenue_performance_classifier'].predict(X)[0]
            
            # High/Low performer predictions with probabilities
            high_perf_pred = self.models['high_performer_classifier'].predict(X_scaled)[0]
            high_perf_proba = self.models['high_performer_classifier'].predict_proba(X_scaled)[0][1]
            
            low_perf_pred = self.models['low_performer_classifier'].predict(X_scaled)[0]
            low_perf_proba = self.models['low_performer_classifier'].predict_proba(X_scaled)[0][1]
            
            predictions['is_high_performer'] = bool(high_perf_pred)
            predictions['high_performer_probability'] = float(high_perf_proba)
            predictions['is_low_performer'] = bool(low_perf_pred)
            predictions['low_performer_probability'] = float(low_perf_proba)
            
            # Regression predictions
            predictions['predicted_total_sales'] = float(self.models['sales_regressor'].predict(X)[0])
            predictions['predicted_total_revenue'] = float(self.models['revenue_regressor'].predict(X)[0])
            
            # Add confidence scores
            predictions['confidence_score'] = max(high_perf_proba, low_perf_proba)
            
            return predictions
            
        except Exception as e:
            print(f"❌ Error predicting product performance: {e}")
            return None
    
    def predict_multiple_products(self, products_data):
        """Predict performance for multiple products"""
        if not self.is_loaded:
            if not self.load_models():
                return None
        
        try:
            results = []
            
            for product_data in products_data:
                prediction = self.predict_product_performance(product_data)
                if prediction:
                    prediction['product_id'] = product_data.get('product_id', 'unknown')
                    results.append(prediction)
            
            return results
            
        except Exception as e:
            print(f"❌ Error predicting multiple products: {e}")
            return None
    
    def get_sales_trends(self, product_id, days_ahead=30):
        """Predict sales trends for a product"""
        if not self.is_loaded:
            if not self.load_models():
                return None
        
        try:
            # Load time series data
            time_series_df = pd.read_csv('ml-models/data/time_series_features.csv')
            product_ts = time_series_df[time_series_df['product_id'] == product_id]
            
            if product_ts.empty:
                return None
            
            # Get recent trends
            recent_data = product_ts.tail(30)
            
            # Calculate trend indicators
            trend_data = {
                'product_id': product_id,
                'current_sales_velocity': float(recent_data['quantity_ma_7'].iloc[-1]),
                'sales_trend_7d': float(recent_data['quantity_trend_7d'].iloc[-1]),
                'revenue_trend_7d': float(recent_data['revenue_trend_7d'].iloc[-1]),
                'predicted_sales_next_30d': float(recent_data['quantity_ma_30'].iloc[-1] * days_ahead),
                'trend_direction': 'increasing' if recent_data['quantity_trend_7d'].iloc[-1] > 0 else 'decreasing',
                'confidence': abs(float(recent_data['quantity_trend_7d'].iloc[-1]))
            }
            
            return trend_data
            
        except Exception as e:
            print(f"❌ Error getting sales trends: {e}")
            return None
    
    def get_top_performing_products(self, limit=10):
        """Get top performing products based on predictions"""
        try:
            predictions_df = pd.read_csv('data/product_predictions.csv')
            
            # Filter high performers
            high_performers = predictions_df[
                predictions_df['high_performer_classifier_prediction'] == 1
            ].sort_values('high_performer_classifier_probability', ascending=False)
            
            # Get top products
            top_products = high_performers.head(limit)
            
            return top_products.to_dict('records')
            
        except Exception as e:
            print(f"❌ Error getting top performing products: {e}")
            return []
    
    def get_low_performing_products(self, limit=10):
        """Get low performing products based on predictions"""
        try:
            predictions_df = pd.read_csv('data/product_predictions.csv')
            
            # Filter low performers
            low_performers = predictions_df[
                predictions_df['low_performer_classifier_prediction'] == 1
            ].sort_values('low_performer_classifier_probability', ascending=False)
            
            # Get top low performers
            low_products = low_performers.head(limit)
            
            return low_products.to_dict('records')
            
        except Exception as e:
            print(f"❌ Error getting low performing products: {e}")
            return []
    
    def get_category_insights(self, category):
        """Get insights for a specific category"""
        try:
            predictions_df = pd.read_csv('data/product_predictions.csv')
            products_df = pd.read_csv('data/products.csv')
            
            # Merge with product data
            merged_df = predictions_df.merge(
                products_df[['product_id', 'category', 'subcategory', 'price']], 
                on='product_id'
            )
            
            # Filter by category
            category_products = merged_df[merged_df['category'] == category]
            
            if category_products.empty:
                return None
            
            # Calculate category insights
            insights = {
                'category': category,
                'total_products': len(category_products),
                'high_performers': len(category_products[category_products['high_performer_classifier_prediction'] == 1]),
                'low_performers': len(category_products[category_products['low_performer_classifier_prediction'] == 1]),
                'avg_predicted_sales': float(category_products['sales_regressor_prediction'].mean()),
                'avg_predicted_revenue': float(category_products['revenue_regressor_prediction'].mean()),
                'avg_price': float(category_products['price'].mean()),
                'performance_score': float(category_products['high_performer_classifier_probability'].mean())
            }
            
            return insights
            
        except Exception as e:
            print(f"❌ Error getting category insights: {e}")
            return None
    
    def get_vendor_insights(self, vendor_id):
        """Get insights for a specific vendor"""
        try:
            predictions_df = pd.read_csv('data/product_predictions.csv')
            products_df = pd.read_csv('data/products.csv')
            
            # Merge with product data to get vendor information
            merged_df = predictions_df.merge(
                products_df[['product_id', 'vendor_id', 'category', 'price']], 
                on='product_id'
            )
            
            # Filter by vendor
            vendor_products = merged_df[merged_df['vendor_id'] == int(vendor_id)]
            
            if vendor_products.empty:
                return None
            
            # Calculate vendor insights
            insights = {
                'vendor_id': vendor_id,
                'total_products': len(vendor_products),
                'high_performers': len(vendor_products[vendor_products['high_performer_classifier_prediction'] == 1]),
                'low_performers': len(vendor_products[vendor_products['low_performer_classifier_prediction'] == 1]),
                'avg_predicted_sales': float(vendor_products['sales_regressor_prediction'].mean()),
                'avg_predicted_revenue': float(vendor_products['revenue_regressor_prediction'].mean()),
                'total_predicted_revenue': float(vendor_products['revenue_regressor_prediction'].sum()),
                'performance_score': float(vendor_products['high_performer_classifier_probability'].mean()),
                'categories': vendor_products['category'].value_counts().to_dict()
            }
            
            return insights
            
        except Exception as e:
            print(f"❌ Error getting vendor insights: {e}")
            return None

# Global predictor instance
ml_predictor = MLPredictor()

def get_ml_predictor():
    """Get the global ML predictor instance"""
    return ml_predictor
