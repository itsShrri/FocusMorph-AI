import numpy as np
import pandas as pd

np.random.seed(42)

N = 50000  # Total windows/samples
modes = ["focused", "distracted", "multitask"]

# Transition Matrix: P(State_t | State_t-1)
# Higher values on the diagonal (0.9, 0.8, etc.) create "behavioral streaks"
transitions = np.array([
    [0.90, 0.07, 0.03], # From Focused -> [F, D, M]
    [0.10, 0.80, 0.10], # From Distracted -> [F, D, M]
    [0.05, 0.15, 0.80]  # From Multitask -> [F, D, M]
])

data = []
current_mode_idx = 0 # Start in 'focused' state

for i in range(N):
    # 1. State Transition
    current_mode_idx = np.random.choice([0, 1, 2], p=transitions[current_mode_idx])
    mode = modes[current_mode_idx]
    
    # 2. Parameter Generation based on Mode
    if mode == "focused":
        gaze_disp = np.random.normal(5, 2)
        mouse_vel = np.random.gamma(2, 2)      # Gamma: many small moves, few bursts
        tab_switch = np.random.poisson(0.1)
        scroll_rate = np.random.normal(40, 10)
        click_count = np.random.poisson(1)
        focus_score = np.random.uniform(0.8, 1.0)
        idle_ratio = np.random.uniform(0.4, 0.8) # Focused people often read (idle)
        entropy = np.random.uniform(0.5, 1.2)    # Low chaos
        
    elif mode == "distracted":
        gaze_disp = np.random.normal(30, 10)
        mouse_vel = np.random.gamma(5, 4)      # Erratic, high-speed movement
        tab_switch = np.random.poisson(5)
        scroll_rate = np.random.normal(250, 60)
        click_count = np.random.poisson(10)
        focus_score = np.random.uniform(0.0, 0.3)
        idle_ratio = np.random.uniform(0.0, 0.2) # High activity, low idle
        entropy = np.random.uniform(2.2, 4.0)    # High chaos
        
    else: # Multitask
        gaze_disp = np.random.normal(18, 6)
        mouse_vel = np.random.normal(15, 5)
        tab_switch = np.random.poisson(2.5)
        scroll_rate = np.random.normal(130, 40)
        click_count = np.random.poisson(4)
        focus_score = np.random.uniform(0.4, 0.7)
        idle_ratio = np.random.uniform(0.2, 0.5)
        entropy = np.random.uniform(1.3, 2.5)

    # 3. Create Data Row
    row = {
        "mode": mode, # Label for training
        "gaze_dispersion": max(0, gaze_disp),
        "mouse_mean_vel": max(0, mouse_vel),
        "mouse_idle_ratio": idle_ratio,
        "scroll_mean_rate": max(0, scroll_rate),
        "tab_switch_count": tab_switch,
        "click_count": click_count,
        "gaze_entropy": entropy,
        "focus_score": focus_score
    }
    data.append(row)

df = pd.DataFrame(data)
df.to_csv("dataset.csv", index=False)
print("Generated dataset.csv")