import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  enrollmentNumber: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  midsem1Marks: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  midsem2Marks: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  comprehensiveExamMarks: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  attendancePercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  studyHoursPerWeek: {
    type: Number,
    required: true,
    min: 0
  },
  totalBacklogs: {
    type: Number,
    required: true,
    min: 0
  },
  hasPartTimeJob: {
    type: String,
    enum: ['yes', 'no'],
    required: true
  },
  currentGPA: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Student', studentSchema);
