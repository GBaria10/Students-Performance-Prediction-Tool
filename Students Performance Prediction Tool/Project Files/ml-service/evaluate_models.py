import os
import joblib
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, accuracy_score, classification_report

from .load_data import load_dataset
from .preprocess import preprocess_data

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
GPA_MODEL_FILE = "gpa_prediction_model.pkl"
DROP_MODEL_FILE = "dropout_risk_model.pkl"


def evaluate():
    df = load_dataset()
    if df is None:
        raise RuntimeError("Dataset not found")

    (
        X_train,
        X_test,
        y_reg_train,
        y_reg_test,
        y_clf_train,
        y_clf_test,
        encoders,
    ) = preprocess_data(df)

    gpa_model = joblib.load(os.path.join(MODEL_DIR, GPA_MODEL_FILE))
    drop_model = joblib.load(os.path.join(MODEL_DIR, DROP_MODEL_FILE))

    features = [
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

    X_test_f = X_test.reindex(columns=features, fill_value=0)

    # Regression metrics
    y_pred_reg = gpa_model.predict(X_test_f)
    mae = mean_absolute_error(y_reg_test, y_pred_reg)
    mse = mean_squared_error(y_reg_test, y_pred_reg)
    r2 = r2_score(y_reg_test, y_pred_reg)

    print("Regression metrics on test set:")
    print(f"  MAE: {mae:.4f}")
    print(f"  MSE: {mse:.4f}")
    print(f"  R2:  {r2:.4f}")

    # Classification metrics
    y_pred_clf = drop_model.predict(X_test_f)
    acc = accuracy_score(y_clf_test, y_pred_clf)

    print("\nClassification metrics on test set:")
    print(f"  Accuracy: {acc:.4f}")
    print("  Classification report:\n", classification_report(y_clf_test, y_pred_clf))


if __name__ == "__main__":
    evaluate()
