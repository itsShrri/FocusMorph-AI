import joblib
import pandas as pd
import numpy as np
import os

# Load model once when module is imported
MODEL_PATH = "focus_model.pkl"
try:
    model = joblib.load(MODEL_PATH)
    print(f"Model loaded from {MODEL_PATH}")
except FileNotFoundError:
    print(f"Warning: {MODEL_PATH} not found.")
    model = None

# Default values mirroring the training data distribution
DEFAULT_FEATURES = {
    "gaze_dispersion": 5.0,
    "mouse_idle_ratio": 0.5,
    "scroll_mean_rate": 40.0,
    "click_count": 1,
    "gaze_entropy": 0.8,
    "mode": 0
}

def predict_focus_score(metrics):
    """
    Takes a dictionary of metrics from the extension, 
    fills in missing features, and returns a focus score.
    """
    if model is None:
        raise Exception("Model not loaded")

    # Map incoming metrics to model features
    input_data = {
        "mode": DEFAULT_FEATURES["mode"],
        "gaze_dispersion": DEFAULT_FEATURES["gaze_dispersion"],
        "mouse_mean_vel": metrics.get("mouseVelocity", 0),
        "mouse_idle_ratio": DEFAULT_FEATURES["mouse_idle_ratio"],
        "scroll_mean_rate": metrics.get("scrollAcceleration", 0) * 100,
        "tab_switch_count": metrics.get("tabSwitchCount", 0),
        "click_count": DEFAULT_FEATURES["click_count"],
        "gaze_entropy": DEFAULT_FEATURES["gaze_entropy"]
    }

    # Create DataFrame with single row
    df = pd.DataFrame([input_data])
    
    # Predict
    score = model.predict(df)[0]
    return float(score)

