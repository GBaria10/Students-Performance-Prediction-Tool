import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import Faculty from '../models/Faculty.js';

const router = express.Router();

// Sign Up
router.post('/signup', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password } = req.body;
    
    // Check if faculty exists
    let faculty = await Faculty.findOne({ email });
    if (faculty) {
      return res.status(400).json({ error: 'Faculty already exists' });
    }
    
    // Create new faculty
    faculty = new Faculty({ name, email, password });
    await faculty.save();
    
    // Create JWT token
    const token = jwt.sign({ facultyId: faculty._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION || '7d'
    });
    
    res.status(201).json({
      message: 'Faculty registered successfully',
      token,
      faculty: { id: faculty._id, name: faculty.name, email: faculty.email }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sign In
router.post('/signin', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    
    // Check if faculty exists
    const faculty = await Faculty.findOne({ email });
    if (!faculty) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isMatch = await faculty.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Create JWT token
    const token = jwt.sign({ facultyId: faculty._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION || '7d'
    });
    
    res.json({
      message: 'Login successful',
      token,
      faculty: { id: faculty._id, name: faculty.name, email: faculty.email }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
