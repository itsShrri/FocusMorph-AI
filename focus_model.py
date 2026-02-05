import joblib
import numpy as np

model = joblib.load("focus_model.pkl")

x = np.array([[ 
  6, 7, 0.1, 50, 1, 0, 2, 1.5, 0.8, 0.9, 12, 800
]])

score = model.predict(x)[0]
print(score)
