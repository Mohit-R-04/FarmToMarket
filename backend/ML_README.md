# ML Features - Crop Recommendation & Yield Prediction

This directory contains the Machine Learning service for FarmToMarket application.

## Features

1. **Crop Recommendation**: AI-powered crop recommendations based on soil NPK levels and climate conditions
2. **Yield Prediction**: Predict expected crop yield based on environmental factors

## Pre-trained Models

The following pre-trained models have been integrated from the `dav` directory:

- `ml_models/rf_crop_model.pkl` - Random Forest Classifier for crop recommendation
- `ml_models/reg_model.pkl` - Random Forest Regressor for yield prediction

## Setup

### 1. Install Python Dependencies

```bash
cd backend
pip3 install -r ml_requirements.txt
```

### 2. Start the ML Service

The ML service runs as a separate Flask microservice on port 5001:

```bash
cd backend
python3 ml_service.py
```

You should see:
```
==================================================
ML Service Starting on http://localhost:5001
==================================================

✓ Crop recommendation model loaded
✓ Yield prediction model loaded
```

### 3. Start the Main Application

In separate terminals:

**Backend (Spring Boot)**:
```bash
cd backend
./mvnw spring-boot:run
```

**Frontend (React)**:
```bash
cd frontend
yarn dev
```

## Usage

### Farmer Dashboard

Once logged in as a farmer, navigate to the bottom tabs:

1. **Crop Recommendation Tab**
   - Enter soil NPK values (Nitrogen, Phosphorus, Potassium)
   - Enter climate conditions (Temperature, Humidity, Rainfall)
   - Click "Get Recommendation"
   - View the recommended crop with confidence score

2. **Yield Prediction Tab**
   - Select a crop from the dropdown
   - Enter soil NPK values
   - Enter climate conditions
   - Click "Predict Yield"
   - View the predicted yield in kg/acre

## API Endpoints

The ML service exposes the following REST API endpoints:

### Health Check
```
GET http://localhost:5001/health
```

### Crop Recommendation
```
POST http://localhost:5001/recommend
Content-Type: application/json

{
  "n": 90,
  "p": 42,
  "k": 43,
  "temperature": 25.5,
  "humidity": 80,
  "rainfall": 200
}
```

Response:
```json
{
  "recommendation": "rice",
  "confidence": 95.67,
  "input": {...}
}
```

### Yield Prediction
```
POST http://localhost:5001/predict-yield
Content-Type: application/json

{
  "crop": "rice",
  "n": 90,
  "p": 42,
  "k": 43,
  "temperature": 25.5,
  "humidity": 80,
  "rainfall": 200
}
```

Response:
```json
{
  "predicted_yield": 4523.45,
  "unit": "kg/acre",
  "crop": "rice",
  "input": {...}
}
```

## Model Details

### Crop Recommendation Model
- **Algorithm**: Random Forest Classifier with Polynomial Features
- **Features**: NPK values, temperature, humidity, rainfall, soil type, state
- **Feature Engineering**: NPK ratios, polynomial interactions
- **Accuracy**: ~95%+

### Yield Prediction Model
- **Algorithm**: Random Forest Regressor
- **Features**: NPK values, temperature, humidity, rainfall, crop type, soil type, state
- **Metric**: R² Score ~85%+

## Troubleshooting

### ML Service Not Starting
- Ensure Python 3.8+ is installed
- Install dependencies: `pip3 install -r ml_requirements.txt`
- Check if port 5001 is available

### "Failed to get recommendation" Error
- Ensure ML service is running on port 5001
- Check browser console for CORS errors
- Verify the ML service logs for errors

### Model Files Missing
- Ensure `ml_models/rf_crop_model.pkl` and `ml_models/reg_model.pkl` exist
- These files were copied from `/Users/mohitreddy/Documents/dav/`

## Architecture

```
FarmToMarket/
├── backend/
│   ├── ml_service.py          # Flask ML microservice (port 5001)
│   ├── ml_requirements.txt    # Python dependencies
│   └── ml_models/
│       ├── rf_crop_model.pkl  # Crop recommendation model
│       └── reg_model.pkl      # Yield prediction model
│
└── frontend/
    └── src/components/farmer/
        ├── CropRecommendation.tsx  # Crop recommendation UI
        └── YieldPrediction.tsx     # Yield prediction UI
```

## Credits

ML models and training code adapted from the crop analytics dashboard in the `dav` directory.
