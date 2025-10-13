"""
Feature Engineering Pipeline for BizConnect-AI ML Models
Creates features for sales prediction and product performance analysis
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

class FeatureEngineer:
    def __init__(self):
        self.feature_columns = []
        self.scaler = None
        
    def load_data(self):
        """Load all datasets"""
        try:
            self.products_df = pd.read_csv('ml-models/data/products.csv')
            self.customers_df = pd.read_csv('ml-models/data/customers.csv')
            self.vendors_df = pd.read_csv('ml-models/data/vendors.csv')
            self.sales_df = pd.read_csv('ml-models/data/sales.csv')
            
            # Convert date columns
            self.products_df['created_at'] = pd.to_datetime(self.products_df['created_at'])
            self.customers_df['created_at'] = pd.to_datetime(self.customers_df['created_at'])
            self.vendors_df['created_at'] = pd.to_datetime(self.vendors_df['created_at'])
            self.sales_df['order_date'] = pd.to_datetime(self.sales_df['order_date'])
            
            print("Data loaded successfully!")
            return True
        except Exception as e:
            print(f"Error loading data: {e}")
            return False
    
    def create_product_features(self):
        """Create product-level features"""
        print("Creating product features...")
        
        # Basic product features
        product_features = self.products_df.copy()
        
        # Price features
        product_features['price_log'] = np.log1p(product_features['price'])
        product_features['price_category'] = pd.cut(
            product_features['price'], 
            bins=[0, 500, 2000, 10000, float('inf')], 
            labels=['Low', 'Medium', 'High', 'Premium']
        )
        
        # Stock features
        product_features['stock_status'] = product_features['stock'].apply(
            lambda x: 'Out of Stock' if x == 0 else 'Low Stock' if x < 10 else 'In Stock'
        )
        
        # Age features
        product_features['product_age_days'] = (datetime.now() - product_features['created_at']).dt.days
        
        # Category encoding
        category_dummies = pd.get_dummies(product_features['category'], prefix='category')
        product_features = pd.concat([product_features, category_dummies], axis=1)
        
        # Subcategory encoding
        subcategory_dummies = pd.get_dummies(product_features['subcategory'], prefix='subcategory')
        product_features = pd.concat([product_features, subcategory_dummies], axis=1)
        
        self.product_features = product_features
        print(f"Product features created: {len(product_features.columns)} columns")
        
    def create_sales_features(self):
        """Create sales-level features"""
        print("Creating sales features...")
        
        # Merge sales with product and customer data
        sales_features = self.sales_df.merge(
            self.products_df[['product_id', 'category', 'subcategory', 'price', 'vendor_id']], 
            on='product_id', 
            how='left'
        )
        
        sales_features = sales_features.merge(
            self.customers_df[['customer_id', 'city', 'age', 'gender', 'income_level']], 
            on='customer_id', 
            how='left'
        )
        
        # Check if vendor_id exists in both dataframes
        if 'vendor_id' in sales_features.columns and 'vendor_id' in self.vendors_df.columns:
            sales_features = sales_features.merge(
                self.vendors_df[['vendor_id', 'business_type', 'annual_turnover', 'employee_count']], 
                on='vendor_id', 
                how='left'
            )
        else:
            print("Warning: vendor_id column not found for merge")
        
        # Temporal features
        sales_features['order_year'] = sales_features['order_date'].dt.year
        sales_features['order_month'] = sales_features['order_date'].dt.month
        sales_features['order_day'] = sales_features['order_date'].dt.day
        sales_features['order_weekday'] = sales_features['order_date'].dt.weekday
        sales_features['order_quarter'] = sales_features['order_date'].dt.quarter
        
        # Seasonal features
        sales_features['is_weekend'] = sales_features['order_weekday'].isin([5, 6])
        sales_features['is_month_start'] = sales_features['order_day'] <= 7
        sales_features['is_month_end'] = sales_features['order_day'] >= 25
        
        # Holiday features (simplified)
        sales_features['is_holiday_season'] = sales_features['order_month'].isin([10, 11, 12])
        sales_features['is_summer_season'] = sales_features['order_month'].isin([6, 7, 8])
        
        # Customer features
        sales_features['customer_age_group'] = pd.cut(
            sales_features['age'], 
            bins=[0, 25, 35, 50, 100], 
            labels=['Young', 'Adult', 'Middle-aged', 'Senior']
        )
        
        # Order value features
        sales_features['order_value_category'] = pd.cut(
            sales_features['total_amount'], 
            bins=[0, 500, 2000, 10000, float('inf')], 
            labels=['Small', 'Medium', 'Large', 'Premium']
        )
        
        # Quantity features
        sales_features['quantity_category'] = pd.cut(
            sales_features['quantity'], 
            bins=[0, 1, 3, 10, float('inf')], 
            labels=['Single', 'Small', 'Medium', 'Bulk']
        )
        
        # Status features
        sales_features['is_delivered'] = sales_features['status'] == 'delivered'
        sales_features['is_cancelled'] = sales_features['status'] == 'cancelled'
        sales_features['is_paid'] = sales_features['payment_status'] == 'paid'
        
        self.sales_features = sales_features
        print(f"Sales features created: {len(sales_features.columns)} columns")
        
    def create_aggregated_features(self):
        """Create aggregated features for products and customers"""
        print("Creating aggregated features...")
        
        # Product performance features
        product_performance = self.sales_features.groupby('product_id').agg({
            'quantity': ['sum', 'mean', 'count'],
            'total_amount': ['sum', 'mean'],
            'order_date': ['min', 'max'],
            'customer_id': 'nunique',
            'is_delivered': 'mean',
            'is_cancelled': 'mean'
        }).round(2)
        
        # Flatten column names
        product_performance.columns = ['_'.join(col).strip() for col in product_performance.columns]
        product_performance = product_performance.reset_index()
        
        # Calculate additional metrics
        product_performance['total_sales'] = product_performance['quantity_sum']
        product_performance['avg_order_quantity'] = product_performance['quantity_mean']
        product_performance['order_count'] = product_performance['quantity_count']
        product_performance['total_revenue'] = product_performance['total_amount_sum']
        product_performance['avg_order_value'] = product_performance['total_amount_mean']
        product_performance['unique_customers'] = product_performance['customer_id_nunique']
        product_performance['delivery_rate'] = product_performance['is_delivered_mean']
        product_performance['cancellation_rate'] = product_performance['is_cancelled_mean']
        
        # Calculate sales velocity
        product_performance['first_sale'] = product_performance['order_date_min']
        product_performance['last_sale'] = product_performance['order_date_max']
        product_performance['sales_period_days'] = (
            product_performance['last_sale'] - product_performance['first_sale']
        ).dt.days + 1
        
        product_performance['sales_velocity'] = (
            product_performance['total_sales'] / product_performance['sales_period_days']
        ).fillna(0)
        
        self.product_performance = product_performance
        print(f"Aggregated features created for {len(product_performance)} products")
        
    def create_ml_features(self):
        """Create final ML-ready features"""
        print("Creating ML-ready features...")
        
        # Merge all features
        ml_features = self.product_features.merge(
            self.product_performance, 
            on='product_id', 
            how='left'
        )
        
        # Handle categorical columns properly before fillna
        for col in ml_features.columns:
            if ml_features[col].dtype.name == 'category':
                ml_features[col] = ml_features[col].astype(str)
                ml_features[col] = ml_features[col].replace('nan', 'Unknown')
        
        # Fill missing values
        ml_features = ml_features.fillna(0)
        
        # Create target variables
        ml_features['sales_performance'] = pd.cut(
            ml_features['total_sales'],
            bins=[0, 10, 50, 200, float('inf')],
            labels=['Low', 'Medium', 'High', 'Very High']
        )
        
        ml_features['revenue_performance'] = pd.cut(
            ml_features['total_revenue'],
            bins=[0, 5000, 25000, 100000, float('inf')],
            labels=['Low', 'Medium', 'High', 'Very High']
        )
        
        # Create binary targets for classification
        ml_features['is_high_performer'] = (ml_features['total_sales'] > 50).astype(int)
        ml_features['is_low_performer'] = (ml_features['total_sales'] < 10).astype(int)
        
        # Select features for ML
        feature_columns = [
            'price', 'price_log', 'stock', 'product_age_days',
            'total_sales', 'avg_order_quantity', 'order_count',
            'total_revenue', 'avg_order_value', 'unique_customers',
            'delivery_rate', 'cancellation_rate', 'sales_velocity'
        ]
        
        # Add category dummies
        category_cols = [col for col in ml_features.columns if col.startswith('category_')]
        subcategory_cols = [col for col in ml_features.columns if col.startswith('subcategory_')]
        
        feature_columns.extend(category_cols)
        feature_columns.extend(subcategory_cols)
        
        # Create final dataset
        self.ml_dataset = ml_features[feature_columns + ['product_id', 'sales_performance', 'revenue_performance', 'is_high_performer', 'is_low_performer']]
        
        # Handle categorical columns before fillna
        for col in self.ml_dataset.columns:
            if self.ml_dataset[col].dtype.name == 'category':
                self.ml_dataset[col] = self.ml_dataset[col].astype(str)
                self.ml_dataset[col] = self.ml_dataset[col].replace('nan', 'Unknown')
        
        # Remove any remaining NaN values
        self.ml_dataset = self.ml_dataset.fillna(0)
        
        self.feature_columns = feature_columns
        
        print(f"ML features created: {len(self.ml_dataset)} products, {len(feature_columns)} features")
        
    def save_features(self):
        """Save all feature datasets"""
        print("Saving feature datasets...")
        
        # Save main datasets
        self.product_features.to_csv('ml-models/data/product_features.csv', index=False)
        self.sales_features.to_csv('ml-models/data/sales_features.csv', index=False)
        self.product_performance.to_csv('ml-models/data/product_performance.csv', index=False)
        self.ml_dataset.to_csv('ml-models/data/ml_dataset.csv', index=False)
        
        # Save feature column names
        with open('ml-models/data/feature_columns.txt', 'w') as f:
            for col in self.feature_columns:
                f.write(f"{col}\n")
        
        print("All features saved successfully!")
        
    def run_feature_engineering(self):
        """Run complete feature engineering pipeline"""
        print("Starting feature engineering pipeline...")
        
        if not self.load_data():
            return False
        
        self.create_product_features()
        self.create_sales_features()
        self.create_aggregated_features()
        self.create_ml_features()
        self.save_features()
        
        print("Feature engineering completed successfully!")
        return True

if __name__ == "__main__":
    engineer = FeatureEngineer()
    engineer.run_feature_engineering()