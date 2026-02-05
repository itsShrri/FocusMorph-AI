import numpy as np
import pandas as pd

np.random.seed(42)

N = 20000  # windows

data = []

for i in range(N):
    mode = np.random.choice(["focused", "distracted", "multitask"], p=[0.4,0.35,0.25])
    
    if mode == "focused":
        gaze_disp = np.random.normal(5, 2)
        mouse_vel = np.random.normal(8, 3)
        tab_switch = np.random.poisson(0.2)
        scroll_rate = np.random.normal(60, 15)
        click_count = np.random.poisson(2)
        focus = np.random.uniform(0.75, 1.0)
        
    elif mode == "distracted":
        gaze_disp = np.random.normal(25, 8)
        mouse_vel = np.random.normal(20, 6)
        tab_switch = np.random.poisson(4)
        scroll_rate = np.random.normal(200, 50)
        click_count = np.random.poisson(8)
        focus = np.random.uniform(0.0, 0.35)
        
    else:
        gaze_disp = np.random.normal(15, 5)
        mouse_vel = np.random.normal(15, 4)
        tab_switch = np.random.poisson(2)
        scroll_rate = np.random.normal(120, 30)
        click_count = np.random.poisson(4)
        focus = np.random.uniform(0.4, 0.7)

    row = {
        "gaze_dispersion": abs(gaze_disp),
        "mouse_mean_vel": abs(mouse_vel),
        "mouse_idle_ratio": np.random.uniform(0.0, 0.6),
        "scroll_mean_rate": abs(scroll_rate),
        "scroll_direction_changes": np.random.randint(0,5),
        "tab_switch_count": tab_switch,
        "click_count": click_count,
        "inter_click_interval_mean": np.random.uniform(0.2, 3.0),
        "gaze_entropy": np.random.uniform(0.5, 3.0),
        "active_input_ratio": np.random.uniform(0.2, 1.0),
        "time_since_last_tab": np.random.uniform(0, 15),
        "session_length": np.random.uniform(60, 3600),
        "focus_score": focus
    }
    
    data.append(row)

df = pd.DataFrame(data)
df.to_csv("dataset.csv", index=False)
print("Generated dataset.csv")
