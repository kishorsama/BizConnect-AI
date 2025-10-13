"""
Synthetic Dataset Generator for BizConnect-AI ML Models
Mimics VISUELLE dataset structure for e-commerce sales prediction
"""

import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta
import json
import os

class SyntheticDataGenerator:
    def __init__(self):
        self.categories = [
            'Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books',
            'Beauty', 'Automotive', 'Food & Beverage', 'Health', 'Toys'
        ]
        
        self.subcategories = {
            'Electronics': ['Smartphones', 'Laptops', 'Tablets', 'Headphones', 'Cameras'],
            'Clothing': ['Men\'s Wear', 'Women\'s Wear', 'Kids\' Wear', 'Shoes', 'Accessories'],
            'Home & Garden': ['Furniture', 'Kitchen', 'Decor', 'Tools', 'Garden'],
            'Sports': ['Fitness', 'Outdoor', 'Team Sports', 'Water Sports', 'Winter Sports'],
            'Books': ['Fiction', 'Non-Fiction', 'Educational', 'Children\'s', 'Technical'],
            'Beauty': ['Skincare', 'Makeup', 'Hair Care', 'Fragrance', 'Bath & Body'],
            'Automotive': ['Parts', 'Accessories', 'Tools', 'Maintenance', 'Electronics'],
            'Food & Beverage': ['Snacks', 'Beverages', 'Cooking', 'Health Food', 'International'],
            'Health': ['Supplements', 'Medical', 'Fitness', 'Personal Care', 'Wellness'],
            'Toys': ['Action Figures', 'Educational', 'Outdoor', 'Board Games', 'Electronic']
        }
        
        self.business_types = [
            'Retail Store', 'Online Store', 'Wholesale', 'Manufacturer',
            'Distributor', 'Service Provider', 'Consultant', 'Agency'
        ]
        
        self.cities = [
            'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata',
            'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat'
        ]

    def generate_products(self, num_products=1000):
        """Generate synthetic product data"""
        products = []
        
        for i in range(num_products):
            category = random.choice(self.categories)
            subcategory = random.choice(self.subcategories[category])
            
            # Generate realistic product names
            product_name = f"{subcategory} Product {i+1}"
            
            # Generate realistic descriptions
            descriptions = [
                f"High-quality {subcategory.lower()} with excellent features",
                f"Premium {subcategory.lower()} designed for modern needs",
                f"Professional-grade {subcategory.lower()} for everyday use",
                f"Stylish and functional {subcategory.lower()}",
                f"Advanced {subcategory.lower()} with innovative design"
            ]
            
            # Generate realistic prices based on category
            base_prices = {
                'Electronics': (500, 50000),
                'Clothing': (100, 5000),
                'Home & Garden': (200, 10000),
                'Sports': (150, 8000),
                'Books': (50, 2000),
                'Beauty': (100, 3000),
                'Automotive': (200, 15000),
                'Food & Beverage': (20, 1000),
                'Health': (100, 5000),
                'Toys': (50, 3000)
            }
            
            price_range = base_prices[category]
            price = random.randint(price_range[0], price_range[1])
            
            # Generate stock levels
            stock = random.randint(0, 1000)
            
            # Generate vendor ID (assuming we have vendors 1-50)
            vendor_id = random.randint(1, 50)
            
            product = {
                'product_id': i + 1,
                'name': product_name,
                'description': random.choice(descriptions),
                'category': category,
                'subcategory': subcategory,
                'price': price,
                'stock': stock,
                'vendor_id': vendor_id,
                'is_active': random.choice([True, True, True, False]),  # 75% active
                'created_at': self.random_date_in_range(days_back=365),
                'tags': [category.lower(), subcategory.lower()]
            }
            
            products.append(product)
        
        return pd.DataFrame(products)

    def generate_customers(self, num_customers=500):
        """Generate synthetic customer data"""
        customers = []
        
        for i in range(num_customers):
            customer = {
                'customer_id': i + 1,
                'name': f"Customer {i+1}",
                'email': f"customer{i+1}@example.com",
                'city': random.choice(self.cities),
                'age': random.randint(18, 65),
                'gender': random.choice(['M', 'F']),
                'income_level': random.choice(['Low', 'Medium', 'High']),
                'created_at': self.random_date_in_range(days_back=730)
            }
            customers.append(customer)
        
        return pd.DataFrame(customers)

    def generate_vendors(self, num_vendors=50):
        """Generate synthetic vendor data"""
        vendors = []
        
        for i in range(num_vendors):
            vendor = {
                'vendor_id': i + 1,
                'name': f"Vendor {i+1}",
                'email': f"vendor{i+1}@example.com",
                'business_type': random.choice(self.business_types),
                'city': random.choice(self.cities),
                'annual_turnover': random.choice(['<1L', '1L-10L', '10L-50L', '50L-1Cr', '>1Cr']),
                'employee_count': random.choice(['1-10', '11-50', '51-200', '200+']),
                'created_at': self.random_date_in_range(days_back=1095)
            }
            vendors.append(vendor)
        
        return pd.DataFrame(vendors)

    def generate_sales_data(self, products_df, customers_df, vendors_df, num_sales=10000):
        """Generate synthetic sales/order data"""
        sales = []
        
        for i in range(num_sales):
            # Select random customer and product
            customer = random.choice(customers_df['customer_id'].tolist())
            product = random.choice(products_df['product_id'].tolist())
            
            # Get product details
            product_info = products_df[products_df['product_id'] == product].iloc[0]
            vendor_id = product_info['vendor_id']
            
            # Generate realistic quantities
            quantity = random.choices([1, 2, 3, 4, 5], weights=[0.4, 0.3, 0.15, 0.1, 0.05])[0]
            
            # Generate order date (more recent sales are more likely)
            order_date = self.random_date_in_range(days_back=365)
            
            # Generate order status
            statuses = ['delivered', 'shipped', 'processing', 'pending', 'cancelled']
            status_weights = [0.6, 0.15, 0.1, 0.1, 0.05]
            status = random.choices(statuses, weights=status_weights)[0]
            
            # Calculate total amount
            total_amount = product_info['price'] * quantity
            
            # Generate payment status
            payment_status = 'paid' if status in ['delivered', 'shipped'] else random.choice(['pending', 'paid', 'failed'])
            
            sale = {
                'order_id': i + 1,
                'customer_id': customer,
                'vendor_id': vendor_id,
                'product_id': product,
                'quantity': quantity,
                'unit_price': product_info['price'],
                'total_amount': total_amount,
                'status': status,
                'payment_status': payment_status,
                'order_date': order_date,
                'shipping_city': random.choice(self.cities)
            }
            
            sales.append(sale)
        
        return pd.DataFrame(sales)

    def random_date_in_range(self, days_back=365):
        """Generate random date within specified range"""
        start_date = datetime.now() - timedelta(days=days_back)
        end_date = datetime.now()
        
        time_between = end_date - start_date
        days_between = time_between.days
        random_days = random.randint(0, days_between)
        
        return start_date + timedelta(days=random_days)

    def generate_seasonal_patterns(self, sales_df):
        """Add seasonal patterns to sales data"""
        # Add seasonal multipliers
        seasonal_multipliers = {
            1: 1.2,   # January - New Year sales
            2: 0.8,   # February - Low season
            3: 0.9,   # March - Spring
            4: 1.0,   # April - Normal
            5: 1.1,   # May - Pre-summer
            6: 1.3,   # June - Summer sales
            7: 1.1,   # July - Mid-summer
            8: 0.9,   # August - Back to school prep
            9: 1.0,   # September - Normal
            10: 1.2,  # October - Festival season
            11: 1.4,  # November - Diwali/Black Friday
            12: 1.5   # December - Christmas/Year-end
        }
        
        # Apply seasonal patterns
        sales_df['month'] = pd.to_datetime(sales_df['order_date']).dt.month
        sales_df['seasonal_multiplier'] = sales_df['month'].map(seasonal_multipliers)
        
        # Adjust quantities based on seasonal patterns
        sales_df['adjusted_quantity'] = (sales_df['quantity'] * sales_df['seasonal_multiplier']).round().astype(int)
        sales_df['adjusted_total'] = sales_df['adjusted_quantity'] * sales_df['unit_price']
        
        return sales_df

    def save_datasets(self, products_df, customers_df, vendors_df, sales_df):
        """Save all datasets to CSV files"""
        # Create data directory if it doesn't exist
        os.makedirs('ml-models/data', exist_ok=True)
        
        # Save datasets
        products_df.to_csv('ml-models/data/products.csv', index=False)
        customers_df.to_csv('ml-models/data/customers.csv', index=False)
        vendors_df.to_csv('ml-models/data/vendors.csv', index=False)
        sales_df.to_csv('ml-models/data/sales.csv', index=False)
        
        print("Datasets saved successfully!")
        print(f"Products: {len(products_df)} records")
        print(f"Customers: {len(customers_df)} records")
        print(f"Vendors: {len(vendors_df)} records")
        print(f"Sales: {len(sales_df)} records")

    def generate_all_data(self):
        """Generate complete dataset"""
        print("Generating synthetic dataset...")
        
        # Generate base data
        products_df = self.generate_products(1000)
        customers_df = self.generate_customers(500)
        vendors_df = self.generate_vendors(50)
        
        # Generate sales data
        sales_df = self.generate_sales_data(products_df, customers_df, vendors_df, 10000)
        
        # Add seasonal patterns
        sales_df = self.generate_seasonal_patterns(sales_df)
        
        # Save all datasets
        self.save_datasets(products_df, customers_df, vendors_df, sales_df)
        
        return products_df, customers_df, vendors_df, sales_df

if __name__ == "__main__":
    generator = SyntheticDataGenerator()
    products_df, customers_df, vendors_df, sales_df = generator.generate_all_data()
    
    print("\nDataset Summary:")
    print(f"Products: {len(products_df)}")
    print(f"Customers: {len(customers_df)}")
    print(f"Vendors: {len(vendors_df)}")
    print(f"Sales: {len(sales_df)}")
    
    print("\nSample Data:")
    print("\nProducts:")
    print(products_df.head())
    print("\nSales:")
    print(sales_df.head())
