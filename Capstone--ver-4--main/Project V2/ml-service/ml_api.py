import logging
import os
from typing import Optional

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ml_api")

app = FastAPI(title="Student Performance Prediction API")

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
GPA_MODEL_FILE = "gpa_prediction_model.pkl"
DROP_MODEL_FILE = "dropout_risk_model.pkl"
ENCODER_FILE = "label_encoder.pkl"

GPA_DEFAULT_FEATURES = [
    "Student_Name",
    "Enrollment_No",
    "Semester",
    "Department",
    "Age",
    "Gender",
    "G1_Internal",
    "G2_Internal",
    "Final_Exam_Score",
    "Attendance_Percentage",
    "Study_Hours_Per_Week",
    "Backlogs",
    "Parent_Education_Level",
    "Part_Time_Work",
    "Previous_CGPA",
    "Academic_Risk_Level",
]

DROPOUT_DEFAULT_FEATURES = [
    "Student_Name",
    "Enrollment_No",
    "Semester",
    "Department",
    "Age",
    "Gender",
    "G1_Internal",
    "G2_Internal",
    "Final_Exam_Score",
    "Attendance_Percentage",
    "Study_Hours_Per_Week",
    "Backlogs",
    "Parent_Education_Level",
    "Part_Time_Work",
    "Previous_CGPA",
    "predicted_CGPA",
]

CATEGORICAL_FIELDS = [
    "Gender",
    "Department",
    "Part_Time_Work",
    "Parent_Education_Level",
    "Semester",
    "Academic_Risk_Level",
]


def _load_artifact(filename: str, label: str):
    path = os.path.join(MODEL_DIR, filename)
    try:
        return joblib.load(path)
    except FileNotFoundError as e:
        raise RuntimeError(f"Missing {label} file: {path}") from e


try:
    gpa_model = _load_artifact(GPA_MODEL_FILE, "GPA model")
    dropout_model = _load_artifact(DROP_MODEL_FILE, "dropout model")
    label_encoders = _load_artifact(ENCODER_FILE, "label encoders")

    expected_gpa_features = list(getattr(gpa_model, "feature_names_in_", [])) or GPA_DEFAULT_FEATURES
    expected_dropout_features = (
        list(getattr(dropout_model, "feature_names_in_", [])) or DROPOUT_DEFAULT_FEATURES
    )

    def _assert_predictable(obj, name):
        if not hasattr(obj, "predict"):
            raise RuntimeError(f"Loaded '{name}' does not expose predict().")

    _assert_predictable(gpa_model, "gpa_prediction_model")
    _assert_predictable(dropout_model, "dropout_risk_model")

    print("Models and encoders loaded successfully.")
except Exception as e:
    print(f"Error loading/validating models: {e}")
    raise


class StudentInput(BaseModel):
    Student_Name: Optional[str] = None
    Enrollment_No: Optional[str] = None
    Semester: int
    Department: str
    Age: int
    Gender: str
    G1_Internal: Optional[float] = None
    G2_Internal: Optional[float] = None
    Final_Exam_Score: Optional[float] = None
    Attendance_Percentage: int
    Study_Hours_Per_Week: int
    Backlogs: int
    Part_Time_Work: str
    Previous_CGPA: float
    Parent_Education_Level: str = "Graduate"
    Academic_Risk_Level: Optional[str] = None


def preprocess_input(data: dict) -> pd.DataFrame:
    """Preprocess input data and encode categorical features."""
    df = pd.DataFrame([data])

    for col in CATEGORICAL_FIELDS:
        encoder = label_encoders.get(col)
        if encoder is None:
            continue
        default_value = (
            "Medium" if col == "Academic_Risk_Level" and "Medium" in encoder.classes_ else encoder.classes_[0]
        )

        if col not in df.columns or df[col].isna().all():
            df[col] = encoder.transform([default_value])[0]
            continue

        df[col] = df[col].replace({None: default_value, "": default_value}).fillna(default_value)

        try:
            df[col] = encoder.transform(df[col].astype(str))
        except ValueError as e:
            raise ValueError(
                f"Unknown value for '{col}': '{df[col].values[0]}'. "
                f"Expected one of: {list(encoder.classes_)}"
            ) from e

    df.fillna(0, inplace=True)

    # Coerce any remaining object columns to numeric-safe values to satisfy XGBoost
    for col in df.columns:
        if df[col].dtype == object:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    expected_cols = set(expected_gpa_features + expected_dropout_features)
    for col in expected_cols:
        if col not in df.columns:
            df[col] = 0
        df[col] = df[col].fillna(0)

    return df


@app.get("/")
def root():
    return {
        "message": "API is running",
        "expected_gpa_features": expected_gpa_features,
        "expected_dropout_features": expected_dropout_features,
    }


@app.post("/predict")
def predict_student(input_data: StudentInput):
    """Predict student CGPA and academic risk level."""
    try:
        data_dict = input_data.model_dump()
        logger.info("Prediction request: %s", data_dict)

        try:
            df = preprocess_input(data_dict)
        except ValueError as ve:
            raise HTTPException(status_code=400, detail=str(ve))

        X_gpa = df.reindex(columns=expected_gpa_features, fill_value=0)
        X_gpa = X_gpa.astype(float)
        logger.info("GPA features used: %s", X_gpa.to_dict(orient="list"))
        predicted_cgpa = gpa_model.predict(X_gpa)[0]

        # Ensure dropout model receives the CGPA the GPA model just predicted
        if "predicted_CGPA" in expected_dropout_features:
            df["predicted_CGPA"] = predicted_cgpa

        X_dropout = df.reindex(columns=expected_dropout_features, fill_value=0)
        X_dropout = X_dropout.astype(float)
        logger.info("Dropout features used: %s", X_dropout.to_dict(orient="list"))

        dropout_pred_raw = dropout_model.predict(X_dropout)[0]

        # Decode dropout risk label if encoder is available
        if "Academic_Risk_Level" in label_encoders:
            try:
                dropout_label = label_encoders["Academic_Risk_Level"].inverse_transform(
                    [int(dropout_pred_raw)]
                )[0]
            except Exception:
                dropout_label = str(dropout_pred_raw)
        else:
            dropout_label = str(dropout_pred_raw)

        return {
            "predicted_CGPA": round(float(predicted_cgpa), 2),
            "academic_risk_level": dropout_label,
        }

    except HTTPException:
        raise
    except Exception as general_error:
        logger.exception("Prediction failed")
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected server error: {general_error}",
        )
