const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const { sequelize, InMemoryDB } = require('../utils/database');
const User = require('../models/User');

const router = express.Router();

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (sequelize) {
      const user = await User.findByPk(userId);
      return res.json({ success: true, user });
    }
    const user = InMemoryDB.users.find((u) => u.id === userId);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

router.put('/', authMiddleware, [
  body('email').isEmail().withMessage('Must be a valid email'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const userId = req.user.id;
    const updateData = { ...req.body };
    delete updateData.password;
    delete updateData.role;
    if (sequelize) {
      const user = await User.findByPk(userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      await user.update(updateData);
      return res.json({ success: true, user });
    }
    const userIndex = InMemoryDB.users.findIndex((u) => u.id === userId);
    if (userIndex < 0) return res.status(404).json({ success: false, message: 'User not found' });
    InMemoryDB.users[userIndex] = { ...InMemoryDB.users[userIndex], ...updateData };
    res.json({ success: true, user: InMemoryDB.users[userIndex] });
  } catch (error) {
    next(error);
  }
});

router.put('/password', authMiddleware, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
], async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (sequelize) {
      const user = await User.findByPk(req.user.id);
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) return res.status(400).json({ success: false, message: 'Incorrect current password' });
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      return res.json({ success: true, message: 'Password updated' });
    }
    const user = InMemoryDB.users.find((u) => u.id === req.user.id);
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ success: false, message: 'Incorrect current password' });
    user.password = await bcrypt.hash(newPassword, 10);
    res.json({ success: true, message: 'Password updated' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
