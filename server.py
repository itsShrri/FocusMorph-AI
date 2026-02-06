from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import numpy as np
import os
import focus_model

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        metrics = data.get("metrics", {})
        
        # Use logic from focus_model.py
        score_val = focus_model.predict_focus_score(metrics)
        
        # Interpreting score (0.0-1.0)
        if score_val > 0.7:
            level = "DEEP_WORK"
        elif score_val > 0.4:
            level = "FOCUS"
        else:
            level = "NORMAL"
            
        return jsonify({
            "score": score_val * 100, 
            "level": level
        })
        
    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
