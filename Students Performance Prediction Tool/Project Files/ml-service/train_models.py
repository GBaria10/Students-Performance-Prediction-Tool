import os
import joblib
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier

from .load_data import load_dataset
from .preprocess import preprocess_data

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
GPA_MODEL_FILE = "gpa_prediction_model.pkl"
DROP_MODEL_FILE = "dropout_risk_model.pkl"
ENCODER_FILE = "label_encoder.pkl"

FEATURES = [
    "Attendance_Percentage",
    "Study_Hours_Per_Week",
    "Previous_CGPA",
    "G1_Internal",
    "G2_Internal",
    "Final_Exam_Score",
    "Age",
    "Backlogs",
    "Semester",
    "Parent_Education_Level",
    "Gender",
    "Department",
    "Part_Time_Work",
]


def train_models():
    df = load_dataset()
    if df is None:
        raise RuntimeError("Dataset could not be loaded; aborting training.")

    (
        X_train,
        X_test,
        y_reg_train,
        y_reg_test,
        y_clf_train,
        y_clf_test,
        encoders,
    ) = preprocess_data(df)

    missing = [f for f in FEATURES if f not in X_train.columns]
    if missing:
        raise RuntimeError(f"Missing required features for training: {missing}")

    X_train_feat = X_train[FEATURES].copy()

    os.makedirs(MODEL_DIR, exist_ok=True)

    # Train GPA regression model (stronger estimator)
    gpa_model = RandomForestRegressor(random_state=42, n_estimators=200)
    gpa_model.fit(X_train_feat, y_reg_train)
    joblib.dump(gpa_model, os.path.join(MODEL_DIR, GPA_MODEL_FILE), compress=3)
    print("GPA prediction model saved.")

    # Train dropout risk classifier (stronger estimator)
    dropout_model = RandomForestClassifier(random_state=42, n_estimators=200, class_weight='balanced')
    dropout_model.fit(X_train_feat, y_clf_train)
    joblib.dump(dropout_model, os.path.join(MODEL_DIR, DROP_MODEL_FILE), compress=3)
    print("Dropout risk model saved.")

    # Save all encoders (including Academic_Risk_Level)
    joblib.dump(encoders, os.path.join(MODEL_DIR, ENCODER_FILE))
    print("Label encoders saved.")

    print("Training completed successfully.")


if __name__ == "__main__":
    train_models()
