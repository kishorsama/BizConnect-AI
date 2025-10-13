#!/usr/bin/env python3
"""
ML Predictor CLI - Command line interface for ML predictions
This script handles command-line calls from Node.js ML service
"""

import sys
import json
import pandas as pd
from ml_predictor import get_ml_predictor

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No command specified"}))
        sys.exit(1)
    
    command = sys.argv[1]
    predictor = get_ml_predictor()
    
    try:
        if command == "predict_product":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "Product data required"}))
                sys.exit(1)
            
            product_data = json.loads(sys.argv[2])
            result = predictor.predict_product_performance(product_data)
            print(json.dumps(result))
            
        elif command == "sales_trends":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "Product ID required"}))
                sys.exit(1)
            
            product_id = sys.argv[2]
            days_ahead = int(sys.argv[3]) if len(sys.argv) > 3 else 30
            result = predictor.get_sales_trends(product_id, days_ahead)
            print(json.dumps(result))
            
        elif command == "category_insights":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "Category required"}))
                sys.exit(1)
            
            category = sys.argv[2]
            result = predictor.get_category_insights(category)
            print(json.dumps(result))
            
        elif command == "vendor_insights":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "Vendor ID required"}))
                sys.exit(1)
            
            vendor_id = sys.argv[2]
            print(f"Getting insights for vendor: {vendor_id}", file=sys.stderr)
            result = predictor.get_vendor_insights(vendor_id)
            print(f"Result: {result}", file=sys.stderr)
            print(json.dumps(result))
            
        elif command == "top_products":
            limit = int(sys.argv[2]) if len(sys.argv) > 2 else 10
            result = predictor.get_top_performing_products(limit)
            print(json.dumps(result))
            
        elif command == "low_products":
            limit = int(sys.argv[2]) if len(sys.argv) > 2 else 10
            result = predictor.get_low_performing_products(limit)
            print(json.dumps(result))
            
        else:
            print(json.dumps({"error": f"Unknown command: {command}"}))
            sys.exit(1)
            
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
