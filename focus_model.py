import joblib
import numpy as np

model = joblib.load("focus_model.pkl")

'''
features = [
    "gaze_dispersion",
    "mouse_mean_vel",
    "mouse_idle_ratio",
    "scroll_mean_rate",
    "scroll_direction_changes",
    "tab_switch_count",
    "click_count",
    "inter_click_interval_mean",
    "gaze_entropy",
    "active_input_ratio",
    "time_since_last_tab",
    "session_length"
]
'''

x = np.array([[ 
  6, 7, 0.1, 50, 1, 0, 2, 1.5, 0.8, 0.9, 12, 800
]])

score = model.predict(x)[0]
print(score)
