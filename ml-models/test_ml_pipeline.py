"""
ML Pipeline Test Script for BizConnect-AI
Tests the ML models and API endpoints
"""

import requests
import json
import time

class MLPipelineTester:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.api_base = f"{base_url}/api/ml"
    
    def test_server_connection(self):
        """Test if the server is running"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=5)
            if response.status_code == 200:
                print("✅ Server is running")
                return True
            else:
                print(f"❌ Server returned status code: {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"❌ Cannot connect to server: {e}")
            return False
    
    def test_ml_initialization(self):
        """Test ML pipeline initialization"""
        try:
            print("\n🚀 Testing ML pipeline initialization...")
            response = requests.post(f"{self.api_base}/initialize", timeout=60)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('status') == 'success':
                    print("✅ ML pipeline initialized successfully")
                    return True
                else:
                    print(f"❌ ML initialization failed: {result.get('error')}")
                    return False
            else:
                print(f"❌ ML initialization request failed: {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"❌ Error testing ML initialization: {e}")
            return False
    
    def test_top_products(self):
        """Test getting top performing products"""
        try:
            print("\n🏆 Testing top performing products...")
            response = requests.get(f"{self.api_base}/top-products?limit=5", timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('status') == 'success':
                    products = result.get('products', [])
                    print(f"✅ Retrieved {len(products)} top performing products")
                    for i, product in enumerate(products[:3], 1):
                        print(f"   {i}. Product {product.get('product_id', 'N/A')} - High performer probability: {product.get('high_performer_classifier_probability', 0):.2f}")
                    return True
                else:
                    print(f"❌ Top products request failed: {result.get('error')}")
                    return False
            else:
                print(f"❌ Top products request failed: {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"❌ Error testing top products: {e}")
            return False
    
    def test_low_products(self):
        """Test getting low performing products"""
        try:
            print("\n⚠️ Testing low performing products...")
            response = requests.get(f"{self.api_base}/low-products?limit=5", timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('status') == 'success':
                    products = result.get('products', [])
                    print(f"✅ Retrieved {len(products)} low performing products")
                    for i, product in enumerate(products[:3], 1):
                        print(f"   {i}. Product {product.get('product_id', 'N/A')} - Low performer probability: {product.get('low_performer_classifier_probability', 0):.2f}")
                    return True
                else:
                    print(f"❌ Low products request failed: {result.get('error')}")
                    return False
            else:
                print(f"❌ Low products request failed: {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"❌ Error testing low products: {e}")
            return False
    
    def test_category_insights(self):
        """Test getting category insights"""
        try:
            print("\n📊 Testing category insights...")
            categories = ['Electronics', 'Clothing', 'Home & Garden']
            
            for category in categories:
                response = requests.get(f"{self.api_base}/category-insights/{category}", timeout=30)
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get('status') == 'success':
                        insights = result.get('insights', {})
                        print(f"✅ {category}: {insights.get('total_products', 0)} products, {insights.get('high_performers', 0)} high performers")
                    else:
                        print(f"❌ Category insights failed for {category}: {result.get('error')}")
                else:
                    print(f"❌ Category insights request failed for {category}: {response.status_code}")
            
            return True
        except requests.exceptions.RequestException as e:
            print(f"❌ Error testing category insights: {e}")
            return False
    
    def run_all_tests(self):
        """Run all ML pipeline tests"""
        print("🧪 BizConnect-AI ML Pipeline Test Suite")
        print("=" * 50)
        
        tests = [
            ("Server Connection", self.test_server_connection),
            ("ML Initialization", self.test_ml_initialization),
            ("Top Products", self.test_top_products),
            ("Low Products", self.test_low_products),
            ("Category Insights", self.test_category_insights)
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            try:
                if test_func():
                    passed += 1
                else:
                    print(f"❌ {test_name} test failed")
            except Exception as e:
                print(f"❌ {test_name} test error: {e}")
        
        print(f"\n📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! ML pipeline is working correctly.")
            return True
        else:
            print("⚠️ Some tests failed. Please check the errors above.")
            return False

def main():
    """Main test function"""
    tester = MLPipelineTester()
    
    print("🔍 Starting ML Pipeline Tests...")
    print("Make sure your server is running on http://localhost:3000")
    print("Press Ctrl+C to cancel\n")
    
    try:
        success = tester.run_all_tests()
        if success:
            print("\n✅ ML Pipeline is ready for production!")
        else:
            print("\n❌ ML Pipeline needs attention before production.")
    except KeyboardInterrupt:
        print("\n⏹️ Tests cancelled by user")
    except Exception as e:
        print(f"\n❌ Test suite error: {e}")

if __name__ == "__main__":
    main()
