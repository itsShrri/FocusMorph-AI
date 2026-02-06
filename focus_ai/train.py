import pandas as pd
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import joblib
#from sklearnex import patch_sklearn
#patch_sklearn()

df = pd.read_csv("dataset.csv")

X = df.drop("focus_score", axis=1)
y = df["focus_score"]

X["mode"] = X["mode"].astype("category").cat.codes

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = lgb.LGBMRegressor(
    n_estimators=200,
    max_depth=5,
    learning_rate=0.051
)

model.fit(X_train, y_train)

pred = model.predict(X_test)
mae = mean_absolute_error(y_test, pred)
print("MAE:", mae)

joblib.dump(model, "focus_model.pkl")
print("Saved focus_model.pkl")
