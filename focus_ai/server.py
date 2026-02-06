from fastapi import FastAPI
import joblib
import numpy as np
from pydantic import BaseModel

model = joblib.load("focus_model.pkl")
app = FastAPI()

class FocusFeatures(BaseModel):
    gaze_dispersion: float
    mouse_mean_vel: float
    mouse_idle_ratio: float
    scroll_mean_rate: float
    scroll_direction_changes: int
    tab_switch_count: int
    click_count: int
    inter_click_interval_mean: float
    gaze_entropy: float
    active_input_ratio: float
    time_since_last_tab: float
    session_length: float

@app.post("/predict")
def predict_focus(features: FocusFeatures):
    x = np.array([list(features.dict().values())])
    score = float(model.predict(x)[0])
    score = max(0.0, min(1.0, score))
    
    label = (
        "low" if score < 0.4 else
        "medium" if score < 0.75 else
        "high"
    )
    
    return {
        "focus_score": score,
        "label": label
    }
