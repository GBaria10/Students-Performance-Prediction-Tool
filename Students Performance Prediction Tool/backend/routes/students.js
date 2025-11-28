import express from 'express';
import Student from '../models/Student.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all students for a faculty
router.get('/', authMiddleware, async (req, res) => {
  try {
    const students = await Student.find({ facultyId: req.facultyId });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new student
router.post('/', authMiddleware, async (req, res) => {
  try {
    const studentData = req.body;
    const student = new Student({
      ...studentData,
      facultyId: req.facultyId
    });
    await student.save();
    res.status(201).json({ message: 'Student created', student });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get student by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update student
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Student updated', student });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete student
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
