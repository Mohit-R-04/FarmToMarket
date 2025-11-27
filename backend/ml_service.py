"""
ML Service for Crop Recommendation and Yield Prediction
Runs as a separate Flask microservice on port 5001
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from pathlib import Path
import pickle
import numpy as np
import pandas as pd

app = Flask(__name__)
CORS(app)

# Model paths
BASE = Path(__file__).parent
MODEL_DIR = BASE / 'ml_models'
CROP_MODEL_FILE = MODEL_DIR / 'rf_crop_model.pkl'
YIELD_MODEL_FILE = MODEL_DIR / 'reg_model.pkl'

# ML Features (must match training)
ML_FEATURES = ['n', 'p', 'k', 'temperature', 'humidity', 'rainfall']
CATEGORICAL_FEATURES = ['soil type', 'state']

# Load models on startup
print("Loading ML models...")
crop_model_data = None
yield_model_data = None

if CROP_MODEL_FILE.exists():
    with open(CROP_MODEL_FILE, 'rb') as f:
        crop_model_data = pickle.load(f)
    print("✓ Crop recommendation model loaded")
else:
    print("✗ Crop model not found")

if YIELD_MODEL_FILE.exists():
    with open(YIELD_MODEL_FILE, 'rb') as f:
        yield_model_data = pickle.load(f)
    print("✓ Yield prediction model loaded")
else:
    print("✗ Yield model not found")


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'crop_model_loaded': crop_model_data is not None,
        'yield_model_loaded': yield_model_data is not None
    })


@app.route('/recommend', methods=['POST'])
def recommend_crop():
    """
    Recommend crop based on soil and climate conditions
    Expected input: {n, p, k, temperature, humidity, rainfall, soil_type?, state?}
    """
    if not crop_model_data:
        return jsonify({'error': 'Crop model not loaded'}), 500
    
    try:
        data = request.json
        
        # Extract model components
        model = crop_model_data['model']
        scaler = crop_model_data.get('scaler')
        poly = crop_model_data.get('poly')
        label_encoders = crop_model_data.get('label_encoders', {})
        base_features = crop_model_data.get('base_features', ML_FEATURES)
        feature_names = crop_model_data.get('feature_names', ML_FEATURES)
        
        # Collect numeric features
        vals = []
        for feat in ML_FEATURES:
            val = data.get(feat, 0)
            try:
                vals.append(float(val))
            except:
                vals.append(0)
        
        # Create feature DataFrame
        X_pred = pd.DataFrame([vals], columns=ML_FEATURES)
        
        # Add categorical features if they exist
        if label_encoders:
            for cat_col, le in label_encoders.items():
                # Use provided value or default to first class
                cat_val = data.get(cat_col.replace(' ', '_'), le.classes_[0])
                try:
                    encoded_val = le.transform([cat_val])[0]
                except:
                    encoded_val = le.transform([le.classes_[0]])[0]
                X_pred[cat_col] = encoded_val
        
        # Feature Engineering (must match training)
        if all(f in X_pred.columns for f in ['n', 'p', 'k']):
            X_pred['n_p_ratio'] = X_pred['n'] / (X_pred['p'] + 1)
            X_pred['n_k_ratio'] = X_pred['n'] / (X_pred['k'] + 1)
            X_pred['p_k_ratio'] = X_pred['p'] / (X_pred['k'] + 1)
            X_pred['npk_sum'] = X_pred['n'] + X_pred['p'] + X_pred['k']
            X_pred['npk_mean'] = (X_pred['n'] + X_pred['p'] + X_pred['k']) / 3
        
        # Ensure base features are in correct order
        if base_features:
            X_pred = X_pred[base_features]
        
        # Apply polynomial transformation
        if poly:
            X_pred_poly = poly.transform(X_pred)
            X_pred = pd.DataFrame(X_pred_poly, columns=feature_names)
        else:
            X_pred = X_pred[feature_names]
        
        # Scale features
        if scaler:
            X_pred_scaled = scaler.transform(X_pred)
        else:
            X_pred_scaled = X_pred.values
        
        # Make prediction
        prediction = model.predict(X_pred_scaled)[0]
        
        # Get confidence
        confidence = None
        try:
            proba = model.predict_proba(X_pred_scaled)
            confidence = round(float(proba.max()) * 100, 2)
        except:
            pass
        
        return jsonify({
            'recommendation': str(prediction),
            'confidence': confidence,
            'input': data
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/predict-yield', methods=['POST'])
def predict_yield():
    """
    Predict crop yield based on conditions and crop type
    Expected input: {n, p, k, temperature, humidity, rainfall, crop, soil_type?, state?}
    """
    if not yield_model_data or not crop_model_data:
        return jsonify({'error': 'Models not loaded'}), 500
    
    try:
        data = request.json
        
        # Extract model components
        model = yield_model_data['model']
        scaler = yield_model_data.get('scaler')
        label_encoders = crop_model_data.get('label_encoders', {})
        
        # Collect numeric features
        vals = []
        for feat in ML_FEATURES:
            val = data.get(feat, 0)
            try:
                vals.append(float(val))
            except:
                vals.append(0)
        
        # Create feature DataFrame
        X_pred = pd.DataFrame([vals], columns=ML_FEATURES)
        
        # Add categorical features
        if label_encoders:
            for cat_col, le in label_encoders.items():
                cat_val = data.get(cat_col.replace(' ', '_'), le.classes_[0])
                try:
                    encoded_val = le.transform([cat_val])[0]
                except:
                    encoded_val = le.transform([le.classes_[0]])[0]
                X_pred[cat_col] = encoded_val
        
        # Add crop encoding (required for yield prediction)
        crop = data.get('crop', 'rice')
        # Create a simple label encoder for crop if not exists
        from sklearn.preprocessing import LabelEncoder
        le_crop = LabelEncoder()
        # Common crops
        crops = ['rice', 'wheat', 'maize', 'cotton', 'sugarcane', 'jute', 'coffee', 'tea']
        le_crop.fit(crops)
        try:
            crop_encoded = le_crop.transform([crop.lower()])[0]
        except:
            crop_encoded = 0
        X_pred['crop_encoded'] = crop_encoded
        
        # Scale features
        if scaler:
            X_pred_scaled = scaler.transform(X_pred)
        else:
            X_pred_scaled = X_pred.values
        
        # Make prediction
        yield_pred = model.predict(X_pred_scaled)[0]
        
        return jsonify({
            'predicted_yield': round(float(yield_pred), 2),
            'unit': 'kg/acre',
            'crop': crop,
            'input': data
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    print("\n" + "="*50)
    print("ML Service Starting on http://localhost:5001")
    print("="*50 + "\n")
    app.run(host='0.0.0.0', port=5001, debug=True)
