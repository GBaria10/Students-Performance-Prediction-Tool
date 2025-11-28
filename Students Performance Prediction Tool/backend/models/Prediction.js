import mongoose from 'mongoose';

const predictionSchema = new mongoose.Schema({
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  studentName: {
    type: String,
    required: true
  },
  inputData: {
    semester: Number,
    department: String,
    age: Number,
    gender: String,
    attendance_percentage: Number,
    study_hours_per_week: Number,
    backlogs: Number,
    part_time_work: String,
    previous_cgpa: Number,
    avg_exam_marks: Number,
    g1_internal: Number,
    g2_internal: Number,
    final_exam_score: Number,
    parent_education_level: String
  },
  predictedCGPA: {
    type: Number,
    required: true
  },
  academicRiskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Prediction', predictionSchema);
