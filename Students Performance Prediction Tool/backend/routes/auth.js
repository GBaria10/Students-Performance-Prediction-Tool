import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import Faculty from '../models/Faculty.js';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

const router = express.Router();
const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;

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

// Google OAuth login
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'Missing idToken' });
    }

    if (!googleClient) {
      return res.status(500).json({ error: 'Google client not configured' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: googleClientId
    });

    const payload = ticket.getPayload();
    if (!payload?.email_verified) {
      return res.status(401).json({ error: 'Email not verified by Google' });
    }

    const email = (payload.email || '').toLowerCase();
    const name = payload.name || email.split('@')[0];
    const googleId = payload.sub;

    let faculty = await Faculty.findOne({ email });
    if (!faculty) {
      faculty = new Faculty({
        name,
        email,
        password: crypto.randomUUID(), // satisfies schema; hashed by pre-save hook
        googleId
      });
      await faculty.save();
    } else if (!faculty.googleId) {
      faculty.googleId = googleId;
      await faculty.save();
    }

    const token = jwt.sign(
      { facultyId: faculty._id, googleId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      faculty: { id: faculty._id, name: faculty.name, email: faculty.email }
    });
  } catch (err) {
    console.error('Google auth failed:', err.message);
    res.status(401).json({ error: 'Invalid Google token' });
  }
});
