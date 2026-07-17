import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Manager from '../models/Manager.js';
import auth from '../middleware/auth.js';

const router = Router();

// Helper to generate JWT
const generateToken = (managerId) => {
  return jwt.sign({ managerId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password } = req.body;

      // Check if manager already exists
      const existingManager = await Manager.findOne({ email });
      if (existingManager) {
        return res.status(409).json({ message: 'Email already registered.' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const manager = await Manager.create({ name, email, passwordHash });
      const token = generateToken(manager._id);

      res.status(201).json({
        token,
        manager: manager.toJSON(),
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: 'Server error during registration.' });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const manager = await Manager.findOne({ email });
      if (!manager) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const isMatch = await manager.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const token = generateToken(manager._id);

      res.json({
        token,
        manager: manager.toJSON(),
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login.' });
    }
  }
);

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const manager = await Manager.findById(req.managerId).select('-passwordHash');
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found.' });
    }
    res.json({ manager });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

export default router;
