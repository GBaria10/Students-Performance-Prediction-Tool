import express from 'express';
import axios from 'axios';
import Prediction from '../models/Prediction.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const ML_BASE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Get all predictions for a faculty
router.get('/', authMiddleware, async (req, res) => {
  try {
    const predictions = await Prediction.find({ facultyId: req.facultyId })
      .sort({ createdAt: -1 });
    res.json(predictions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new prediction
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      studentName,
      enrollmentNumber,
      midsem1Marks,
      midsem2Marks,
      comprehensiveExamMarks,
      attendancePercentage,
      studyHoursPerWeek,
      totalBacklogs,
      hasPartTimeJob,
      currentGPA,
      age,
      gender,
      department,
      parentEducationLevel
    } = req.body;

    // Basic numeric coercion/validation
    const toNumber = (val) => Number(val);
    const payload = {
      studentName,
      enrollmentNumber,
      midsem1Marks: toNumber(midsem1Marks),
      midsem2Marks: toNumber(midsem2Marks),
      comprehensiveExamMarks: toNumber(comprehensiveExamMarks),
      attendancePercentage: toNumber(attendancePercentage),
      studyHoursPerWeek: toNumber(studyHoursPerWeek),
      totalBacklogs: toNumber(totalBacklogs),
      hasPartTimeJob,
      currentGPA: toNumber(currentGPA),
      age: toNumber(age),
      gender,
      department,
      parentEducationLevel: parentEducationLevel || 'Graduate'
    };

    const requiredNumeric = [
      'midsem1Marks',
      'midsem2Marks',
      'comprehensiveExamMarks',
      'attendancePercentage',
      'studyHoursPerWeek',
      'totalBacklogs',
      'currentGPA',
      'age'
    ];

    const invalidFields = requiredNumeric.filter(
      (field) => Number.isNaN(payload[field])
    );
    if (!payload.studentName || invalidFields.length) {
      return res.status(400).json({
        error: 'Invalid or missing fields',
        invalidFields
      });
    }

    // Calculate average exam marks
    const avgExamMarks =
      (payload.midsem1Marks + payload.midsem2Marks + payload.comprehensiveExamMarks) / 3;

    // Prepare data for ML service (match FastAPI schema)
    const normalizedGender =
      (payload.gender || '').toLowerCase() === 'female' ? 'Female' : 'Male';
    const normalizedDepartment = (payload.department || 'CSE').toUpperCase();
    const normalizedPartTime = payload.hasPartTimeJob === 'yes' ? 'Yes' : 'No';
    const semester = Math.min(8, Math.max(1, Math.round(payload.currentGPA || 1)));
    const normalizedParentEducation = payload.parentEducationLevel;

    const mlInput = {
      Student_Name: payload.studentName,
      Enrollment_No: payload.enrollmentNumber,
      Semester: semester,
      Department: normalizedDepartment,
      Age: payload.age,
      Gender: normalizedGender,
      G1_Internal: payload.midsem1Marks,
      G2_Internal: payload.midsem2Marks,
      Final_Exam_Score: payload.comprehensiveExamMarks,
      Attendance_Percentage: payload.attendancePercentage,
      Study_Hours_Per_Week: payload.studyHoursPerWeek,
      Backlogs: payload.totalBacklogs,
      Part_Time_Work: normalizedPartTime,
      Previous_CGPA: payload.currentGPA,
      Parent_Education_Level: normalizedParentEducation,
      Academic_Risk_Level: 'Medium'
    };

    // Call ML microservice
    const mlResponse = await axios.post(`${ML_BASE_URL.replace(/\/$/, '')}/predict`, mlInput);

    // Save prediction to database
    const prediction = new Prediction({
      facultyId: req.facultyId,
      studentName: studentName,
      inputData: {
        semester: mlInput.Semester,
        department: mlInput.Department,
        age: mlInput.Age,
        gender: mlInput.Gender,
        attendance_percentage: mlInput.Attendance_Percentage,
        study_hours_per_week: mlInput.Study_Hours_Per_Week,
        backlogs: mlInput.Backlogs,
        part_time_work: mlInput.Part_Time_Work,
        previous_cgpa: mlInput.Previous_CGPA,
        avg_exam_marks: avgExamMarks,
        g1_internal: mlInput.G1_Internal,
        g2_internal: mlInput.G2_Internal,
        final_exam_score: mlInput.Final_Exam_Score,
        parent_education_level: mlInput.Parent_Education_Level
      },
      predictedCGPA: mlResponse.data.predicted_CGPA ?? mlResponse.data.predicted_cgpa,
      academicRiskLevel: mlResponse.data.academic_risk_level || mlResponse.data.academicRiskLevel,
      confidence: mlResponse.data.confidence || mlResponse.data.confidence_score || 0.75
    });

    await prediction.save();

    res.status(201).json({
      message: 'Prediction created',
      prediction: prediction
    });
  } catch (error) {
    const status = error.response?.status || 500;
    const detail = error.response?.data || error.message;
    console.error('Prediction error:', detail);

    // Surface ML validation errors (e.g., 422) to the client for clarity
    if (status === 422 || status === 400) {
      return res.status(400).json({
        error: 'ML service validation failed',
        detail
      });
    }

    res.status(500).json({ error: 'Prediction failed', detail });
  }
});

// Get prediction by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const prediction = await Prediction.findById(req.params.id);
    if (!prediction) {
      return res.status(404).json({ error: 'Prediction not found' });
    }
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
