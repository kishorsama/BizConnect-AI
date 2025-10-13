"""
Complete ML Pipeline Runner for BizConnect-AI
Runs the entire ML pipeline from data generation to model training
"""

import sys
import os
import subprocess
import time

def run_python_script(script_name, description):
    """Run a Python script and handle errors"""
    print(f"\n{description}...")
    try:
        # Use absolute path for the script
        script_path = os.path.join('ml-models', script_name)
        result = subprocess.run([sys.executable, script_path], 
                              capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"SUCCESS: {description} completed successfully")
            if result.stdout:
                print(result.stdout)
            return True
        else:
            print(f"FAILED: {description} failed")
            print(f"Error: {result.stderr}")
            return False
    except Exception as e:
        print(f"ERROR running {script_name}: {e}")
        return False

def check_dependencies():
    """Check if required Python packages are installed"""
    print("Checking dependencies...")
    
    required_packages = [
        'pandas', 'numpy', 'scikit-learn', 'matplotlib', 
        'seaborn', 'plotly', 'joblib'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"Missing packages: {', '.join(missing_packages)}")
        print("Installing missing packages...")
        
        try:
            subprocess.run([sys.executable, '-m', 'pip', 'install'] + missing_packages, 
                          check=True)
            print("All packages installed successfully")
        except subprocess.CalledProcessError:
            print("Failed to install packages")
            return False
    else:
        print("All required packages are available")
    
    return True

def main():
    """Run the complete ML pipeline"""
    print("BizConnect-AI ML Pipeline")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists('ml-models'):
        print("ERROR: ml-models directory not found. Please run this script from the project root.")
        return False
    
    # Check dependencies
    if not check_dependencies():
        return False
    
    # Step 1: Generate synthetic data
    if not run_python_script('data_generator.py', 'Generating synthetic dataset'):
        return False
    
    # Step 2: Feature engineering
    if not run_python_script('feature_engineering.py', 'Running feature engineering'):
        return False
    
    # Step 3: Train models
    if not run_python_script('model_trainer.py', 'Training ML models'):
        return False
    
    print("\nML Pipeline completed successfully!")
    print("\nGenerated Files:")
    print("   - ml-models/data/products.csv")
    print("   - ml-models/data/customers.csv")
    print("   - ml-models/data/vendors.csv")
    print("   - ml-models/data/sales.csv")
    print("   - ml-models/data/ml_dataset.csv")
    print("   - ml-models/models/*.joblib")
    print("   - ml-models/data/product_predictions.csv")
    
    print("\nYour ML models are ready!")
    print("   - Sales Performance Classification")
    print("   - Revenue Performance Classification")
    print("   - High Performer Detection")
    print("   - Low Performer Detection")
    print("   - Sales Prediction")
    print("   - Revenue Prediction")
    
    return True

if __name__ == "__main__":
    success = main()
    if success:
        print("\nSUCCESS: ML Pipeline completed successfully!")
        print("You can now use the ML predictions in your web application.")
    else:
        print("\nFAILED: ML Pipeline failed!")
        print("Please check the error messages above and try again.")
        sys.exit(1)
