import os
import joblib
import pandas as pd

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


def load_models():
    gpa_model = joblib.load(os.path.join(MODEL_DIR, GPA_MODEL_FILE))
    dropout_model = joblib.load(os.path.join(MODEL_DIR, DROP_MODEL_FILE))
    label_encoders = joblib.load(os.path.join(MODEL_DIR, ENCODER_FILE))

    _gpa_tmp = getattr(gpa_model, "feature_names_in_", None)
    gpa_features = list(_gpa_tmp) if _gpa_tmp is not None and len(_gpa_tmp) > 0 else FEATURES

    _drop_tmp = getattr(dropout_model, "feature_names_in_", None)
    dropout_features = list(_drop_tmp) if _drop_tmp is not None and len(_drop_tmp) > 0 else FEATURES

    return gpa_model, dropout_model, label_encoders, gpa_features, dropout_features


def preprocess_input(input_data, label_encoders):
    df = pd.DataFrame([input_data])

    for col in CATEGORICAL_FIELDS:
        encoder = label_encoders.get(col)
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


def predict(input_data, gpa_model, dropout_model, label_encoders, gpa_features, dropout_features):
    df = preprocess_input(input_data, label_encoders)

    df_gpa = df.reindex(columns=gpa_features, fill_value=0)
    df_dropout = df.reindex(columns=dropout_features, fill_value=0)

    predicted_cgpa = float(gpa_model.predict(df_gpa)[0])
    dropout_raw = dropout_model.predict(df_dropout)[0]

    if "Academic_Risk_Level" in label_encoders:
        try:
            dropout_label = label_encoders["Academic_Risk_Level"].inverse_transform([int(dropout_raw)])[0]
        except Exception:
            dropout_label = str(dropout_raw)
    else:
        dropout_label = str(dropout_raw)

    return predicted_cgpa, dropout_label


if __name__ == "__main__":
    gpa_model, dropout_model, label_encoders, gpa_features, dropout_features = load_models()

    input_data = {
        "Semester": 3,
        "Department": "CSE",
        "Age": 20,
        "Gender": "Male",
        "Attendance_Percentage": 100,
        "Study_Hours_Per_Week": 9,
        "Backlogs": 0,
        "Part_Time_Work": "No",
        "Previous_CGPA": 8.8,
        "Parent_Education_Level": "Graduate",
    }

    predicted_cgpa, academic_risk = predict(
        input_data, gpa_model, dropout_model, label_encoders, gpa_features, dropout_features
    )

    print("\nPrediction Results:")
    print(f"  Predicted CGPA: {round(predicted_cgpa, 2)}")
    print(f"  Academic Risk Level: {academic_risk}")
