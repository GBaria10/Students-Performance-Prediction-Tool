# ML Service — improvements and usage

Summary of changes made
- Fixed a bug that caused a ValueError when reading model.feature_names_in_ (truth-testing numpy arrays). The prediction helpers now safely convert feature_names_in_ to lists when present.
- Improved the model workflow by adding exam-related features (G1_Internal, G2_Internal, Final_Exam_Score) to the training/prediction feature set.
- Replaced LinearRegression and DecisionTreeClassifier with RandomForestRegressor and RandomForestClassifier for much better accuracy.
- Added an evaluation script with summary metrics (evaluate_models.py) and a small test harness (run_predictions.py) to verify predictions.

Quick commands (run from the repository `Project V2` directory):

1) Install Python requirements for ml-service
```powershell
cd "Project V2/ml-service"
python -m pip install -r requirements.txt
```

2) Train models (saves to `ml-service/models`)
```powershell
cd "Project V2"
python -m ml-service.train_models
```

3) Evaluate models on hold-out test set
```powershell
python -m ml-service.evaluate_models
```

4) Run a quick sample prediction
```powershell
python -m ml-service.run_predictions
```

5) Start the FastAPI server for API testing
```powershell
cd "Project V2/ml-service"
uvicorn ml_api:app --reload --port 8000
```

If you need help integrating this with the backend API routes in `backend/`, I can update routes or add a small suite of unit tests to ensure outputs remain stable. 
