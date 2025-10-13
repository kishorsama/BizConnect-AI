"""
ML Models for BizConnect-AI Sales Prediction and Product Performance
Implements multiple models for different prediction tasks
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, GradientBoostingClassifier
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
import joblib
import warnings
warnings.filterwarnings('ignore')

class MLModelTrainer:
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.encoders = {}
        self.feature_columns = []
        self.results = {}
        
    def load_data(self):
        """Load the ML dataset"""
        try:
            self.ml_dataset = pd.read_csv('ml-models/data/ml_dataset.csv')
            
            # Load feature columns
            with open('ml-models/data/feature_columns.txt', 'r') as f:
                self.feature_columns = [line.strip() for line in f.readlines()]
            
            print(f"ML dataset loaded: {len(self.ml_dataset)} products, {len(self.feature_columns)} features")
            return True
        except Exception as e:
            print(f"Error loading ML dataset: {e}")
            return False
    
    def prepare_data(self):
        """Prepare data for training"""
        print("Preparing data for training...")
        
        # Separate features and targets
        X = self.ml_dataset[self.feature_columns]
        y_sales_performance = self.ml_dataset['sales_performance']
        y_revenue_performance = self.ml_dataset['revenue_performance']
        y_high_performer = self.ml_dataset['is_high_performer']
        y_low_performer = self.ml_dataset['is_low_performer']
        y_total_sales = self.ml_dataset['total_sales']
        y_total_revenue = self.ml_dataset['total_revenue']
        
        # Handle missing values
        X = X.fillna(0)
        
        # Split data
        self.X_train, self.X_test, self.y_sales_perf_train, self.y_sales_perf_test = train_test_split(
            X, y_sales_performance, test_size=0.2, random_state=42, stratify=y_sales_performance
        )
        
        _, _, self.y_revenue_perf_train, self.y_revenue_perf_test = train_test_split(
            X, y_revenue_performance, test_size=0.2, random_state=42, stratify=y_revenue_performance
        )
        
        _, _, self.y_high_perf_train, self.y_high_perf_test = train_test_split(
            X, y_high_performer, test_size=0.2, random_state=42, stratify=y_high_performer
        )
        
        _, _, self.y_low_perf_train, self.y_low_perf_test = train_test_split(
            X, y_low_performer, test_size=0.2, random_state=42, stratify=y_low_performer
        )
        
        _, _, self.y_sales_train, self.y_sales_test = train_test_split(
            X, y_total_sales, test_size=0.2, random_state=42
        )
        
        _, _, self.y_revenue_train, self.y_revenue_test = train_test_split(
            X, y_total_revenue, test_size=0.2, random_state=42
        )
        
        # Scale features
        self.scaler = StandardScaler()
        self.X_train_scaled = self.scaler.fit_transform(self.X_train)
        self.X_test_scaled = self.scaler.transform(self.X_test)
        
        print("Data prepared for training")
        
    def train_sales_performance_classifier(self):
        """Train model to classify sales performance"""
        print("Training sales performance classifier...")
        
        # Random Forest Classifier
        rf_classifier = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            class_weight='balanced'
        )
        
        rf_classifier.fit(self.X_train, self.y_sales_perf_train)
        
        # Predictions
        y_pred = rf_classifier.predict(self.X_test)
        accuracy = accuracy_score(self.y_sales_perf_test, y_pred)
        
        self.models['sales_performance_classifier'] = rf_classifier
        self.results['sales_performance_classifier'] = {
            'accuracy': accuracy,
            'classification_report': classification_report(self.y_sales_perf_test, y_pred)
        }
        
        print(f"Sales performance classifier trained - Accuracy: {accuracy:.3f}")
        
    def train_revenue_performance_classifier(self):
        """Train model to classify revenue performance"""
        print("Training revenue performance classifier...")
        
        # Gradient Boosting Classifier
        gb_classifier = GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=6,
            random_state=42
        )
        
        gb_classifier.fit(self.X_train, self.y_revenue_perf_train)
        
        # Predictions
        y_pred = gb_classifier.predict(self.X_test)
        accuracy = accuracy_score(self.y_revenue_perf_test, y_pred)
        
        self.models['revenue_performance_classifier'] = gb_classifier
        self.results['revenue_performance_classifier'] = {
            'accuracy': accuracy,
            'classification_report': classification_report(self.y_revenue_perf_test, y_pred)
        }
        
        print(f"Revenue performance classifier trained - Accuracy: {accuracy:.3f}")
        
    def train_high_performer_classifier(self):
        """Train model to identify high-performing products"""
        print("Training high performer classifier...")
        
        # Check if we have both classes
        unique_classes = np.unique(self.y_high_perf_train)
        if len(unique_classes) < 2:
            print(f"Warning: Only {len(unique_classes)} class(es) found in high performer data. Skipping this model.")
            return
        
        # Logistic Regression with scaled features
        lr_classifier = LogisticRegression(
            random_state=42,
            class_weight='balanced',
            max_iter=1000
        )
        
        lr_classifier.fit(self.X_train_scaled, self.y_high_perf_train)
        
        # Predictions
        y_pred = lr_classifier.predict(self.X_test_scaled)
        accuracy = accuracy_score(self.y_high_perf_test, y_pred)
        
        self.models['high_performer_classifier'] = lr_classifier
        self.results['high_performer_classifier'] = {
            'accuracy': accuracy,
            'classification_report': classification_report(self.y_high_perf_test, y_pred)
        }
        
        print(f"High performer classifier trained - Accuracy: {accuracy:.3f}")
        
    def train_low_performer_classifier(self):
        """Train model to identify low-performing products"""
        print("Training low performer classifier...")
        
        # Check if we have both classes
        unique_classes = np.unique(self.y_low_perf_train)
        if len(unique_classes) < 2:
            print(f"Warning: Only {len(unique_classes)} class(es) found in low performer data. Skipping this model.")
            return
        
        # Random Forest Classifier
        rf_classifier = RandomForestClassifier(
            n_estimators=150,
            max_depth=12,
            random_state=42,
            class_weight='balanced'
        )
        
        rf_classifier.fit(self.X_train, self.y_low_perf_train)
        
        # Predictions
        y_pred = rf_classifier.predict(self.X_test)
        accuracy = accuracy_score(self.y_low_perf_test, y_pred)
        
        self.models['low_performer_classifier'] = rf_classifier
        self.results['low_performer_classifier'] = {
            'accuracy': accuracy,
            'classification_report': classification_report(self.y_low_perf_test, y_pred)
        }
        
        print(f"Low performer classifier trained - Accuracy: {accuracy:.3f}")
        
    def train_sales_regressor(self):
        """Train model to predict total sales"""
        print("Training sales regressor...")
        
        # Random Forest Regressor
        rf_regressor = RandomForestRegressor(
            n_estimators=100,
            max_depth=15,
            random_state=42
        )
        
        rf_regressor.fit(self.X_train, self.y_sales_train)
        
        # Predictions
        y_pred = rf_regressor.predict(self.X_test)
        mse = mean_squared_error(self.y_sales_test, y_pred)
        r2 = r2_score(self.y_sales_test, y_pred)
        
        self.models['sales_regressor'] = rf_regressor
        self.results['sales_regressor'] = {
            'mse': mse,
            'r2': r2,
            'rmse': np.sqrt(mse)
        }
        
        print(f"Sales regressor trained - R2: {r2:.3f}, RMSE: {np.sqrt(mse):.3f}")
        
    def train_revenue_regressor(self):
        """Train model to predict total revenue"""
        print("Training revenue regressor...")
        
        # Gradient Boosting Regressor
        from sklearn.ensemble import GradientBoostingRegressor
        
        gb_regressor = GradientBoostingRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=6,
            random_state=42
        )
        
        gb_regressor.fit(self.X_train, self.y_revenue_train)
        
        # Predictions
        y_pred = gb_regressor.predict(self.X_test)
        mse = mean_squared_error(self.y_revenue_test, y_pred)
        r2 = r2_score(self.y_revenue_test, y_pred)
        
        self.models['revenue_regressor'] = gb_regressor
        self.results['revenue_regressor'] = {
            'mse': mse,
            'r2': r2,
            'rmse': np.sqrt(mse)
        }
        
        print(f"Revenue regressor trained - R2: {r2:.3f}, RMSE: {np.sqrt(mse):.3f}")
        
    def get_feature_importance(self):
        """Get feature importance for all models"""
        print("Analyzing feature importance...")
        
        feature_importance = {}
        
        for model_name, model in self.models.items():
            if hasattr(model, 'feature_importances_'):
                importance = model.feature_importances_
                feature_importance[model_name] = dict(zip(self.feature_columns, importance))
            elif hasattr(model, 'coef_'):
                # For linear models
                coef = np.abs(model.coef_[0]) if len(model.coef_.shape) > 1 else np.abs(model.coef_)
                feature_importance[model_name] = dict(zip(self.feature_columns, coef))
        
        self.feature_importance = feature_importance
        
        # Save feature importance
        importance_df = pd.DataFrame(feature_importance).fillna(0)
        importance_df.to_csv('ml-models/data/feature_importance.csv')
        
        print("Feature importance analyzed and saved")
        
    def save_models(self):
        """Save all trained models"""
        print("Saving trained models...")
        
        # Create models directory
        import os
        os.makedirs('ml-models/models', exist_ok=True)
        
        # Save models
        for model_name, model in self.models.items():
            joblib.dump(model, f'ml-models/models/{model_name}.joblib')
        
        # Save scaler
        joblib.dump(self.scaler, 'ml-models/models/scaler.joblib')
        
        # Save feature columns
        with open('ml-models/models/feature_columns.txt', 'w') as f:
            for col in self.feature_columns:
                f.write(f"{col}\n")
        
        # Save results
        results_df = pd.DataFrame(self.results).T
        results_df.to_csv('ml-models/data/model_results.csv')
        
        print("All models saved successfully!")
        
    def generate_predictions(self):
        """Generate predictions for all products"""
        print("Generating predictions for all products...")
        
        predictions = self.ml_dataset[['product_id']].copy()
        
        # Use full dataset for predictions
        X_full = self.ml_dataset[self.feature_columns].fillna(0)
        X_full_scaled = self.scaler.transform(X_full)
        
        # Generate predictions for each model
        for model_name, model in self.models.items():
            if 'classifier' in model_name:
                if 'high_performer' in model_name or 'low_performer' in model_name:
                    pred = model.predict(X_full_scaled)
                    pred_proba = model.predict_proba(X_full_scaled)[:, 1]
                else:
                    pred = model.predict(X_full)
                    # For multi-class classifiers, get max probability
                    pred_proba_full = model.predict_proba(X_full)
                    pred_proba = np.max(pred_proba_full, axis=1)
            else:
                pred = model.predict(X_full)
                pred_proba = None
            
            predictions[f'{model_name}_prediction'] = pred
            if pred_proba is not None:
                predictions[f'{model_name}_probability'] = pred_proba
        
        # Save predictions
        predictions.to_csv('ml-models/data/product_predictions.csv', index=False)
        
        print("Predictions generated and saved")
        
    def train_all_models(self):
        """Train all ML models"""
        print("Starting ML model training...")
        
        if not self.load_data():
            return False
        
        self.prepare_data()
        
        # Train all models
        self.train_sales_performance_classifier()
        self.train_revenue_performance_classifier()
        self.train_high_performer_classifier()
        self.train_low_performer_classifier()
        self.train_sales_regressor()
        self.train_revenue_regressor()
        
        # Analyze and save
        self.get_feature_importance()
        self.save_models()
        self.generate_predictions()
        
        print("All ML models trained successfully!")
        return True

if __name__ == "__main__":
    trainer = MLModelTrainer()
    trainer.train_all_models()