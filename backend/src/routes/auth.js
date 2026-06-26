const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const dotenv = require('dotenv');
const { sequelize, InMemoryDB } = require('../utils/database');
const User = require('../models/User');

dotenv.config();

const router = express.Router();

const createToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });

const safeUser = (u) => {
  const { password, ...safe } = u.dataValues || u;
  return safe;
};

router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const { name, email, password, organization, role, phone, profession, bio, skills, experience, profilePicture, socialLinks } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const userData = { name, email, password: hashed, organization, role: role || 'Student', phone, profession, bio, skills, experience, profilePicture, socialLinks };
    if (sequelize) {
      const existing = await User.findOne({ where: { email } });
      if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });
      const user = await User.create(userData);
      const token = createToken(user);
      return res.json({ success: true, token, user: safeUser(user) });
    }
    const duplicate = InMemoryDB.users.find((u) => u.email === email);
    if (duplicate) return res.status(400).json({ success: false, message: 'Email already registered' });
    const id = Date.now();
    const user = { id, ...userData };
    InMemoryDB.users.push(user);
    const token = createToken(user);
    const { password: _, ...safeUserData } = user;
    res.json({ success: true, token, user: safeUserData });
  } catch (error) {
    next(error);
  }
});

router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const { email, password } = req.body;
    let user;
    if (sequelize) {
      user = await User.findOne({ where: { email } });
      if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).json({ success: false, message: 'Invalid credentials' });
      const token = createToken(user);
      return res.json({ success: true, token, user: safeUser(user) });
    }
    user = InMemoryDB.users.find((u) => u.email === email);
    if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ success: false, message: 'Invalid credentials' });
    const token = createToken(user);
    const { password: _, ...safeUserData } = user;
    res.json({ success: true, token, user: safeUserData });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out' });
});

router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email required'),
], async (req, res) => {
  res.json({ success: true, message: 'If this email exists, reset instructions were sent' });
});

module.exports = router;
