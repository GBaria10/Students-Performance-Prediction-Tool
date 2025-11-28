from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
import pandas as pd
import os
import joblib

router = APIRouter()

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

CATEGORICAL_FIELDS = ["Gender", "Department", "Part_Time_Work", "Parent_Education_Level", "Semester", "Academic_Risk_Level"]

reg_model = joblib.load(os.path.join(MODEL_DIR, GPA_MODEL_FILE))
clf_model = joblib.load(os.path.join(MODEL_DIR, DROP_MODEL_FILE))
encoders = joblib.load(os.path.join(MODEL_DIR, ENCODER_FILE))

_reg_tmp = getattr(reg_model, "feature_names_in_", None)
reg_features = list(_reg_tmp) if _reg_tmp is not None and len(_reg_tmp) > 0 else FEATURES

_clf_tmp = getattr(clf_model, "feature_names_in_", None)
clf_features = list(_clf_tmp) if _clf_tmp is not None and len(_clf_tmp) > 0 else FEATURES


class StudentInput(BaseModel):
    Semester: int
    Department: str
    Age: int
    Gender: str
    Attendance_Percentage: int
    Study_Hours_Per_Week: int
    Backlogs: int
    Part_Time_Work: str
    Previous_CGPA: float
    Parent_Education_Level: str = "Graduate"


def preprocess(data_dict):
    df = pd.DataFrame([data_dict])

    for col in CATEGORICAL_FIELDS:
        encoder = encoders.get(col)
        if encoder is None:
            continue
        if col not in df.columns:
            df[col] = encoder.transform([encoder.classes_[0]])[0]
        else:
            df[col] = encoder.transform(df[col].astype(str))

    for col in FEATURES:
        if col not in df.columns:
            df[col] = 0

    return df


@router.post("/predict")
def predict(input_data: StudentInput):
    try:
        data_dict = input_data.model_dump()
        df = preprocess(data_dict)

        X_reg = df.reindex(columns=reg_features, fill_value=0)
        X_clf = df.reindex(columns=clf_features, fill_value=0)

        predicted_cgpa = float(reg_model.predict(X_reg)[0])
        academic_risk_raw = clf_model.predict(X_clf)[0]

        if "Academic_Risk_Level" in encoders:
            try:
                academic_risk_label = encoders["Academic_Risk_Level"].inverse_transform([int(academic_risk_raw)])[0]
            except Exception:
                academic_risk_label = str(academic_risk_raw)
        else:
            academic_risk_label = str(academic_risk_raw)

        return {
            "predicted_CGPA": round(predicted_cgpa, 2),
            "academic_risk_level": academic_risk_label,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during prediction: {str(e)}")
