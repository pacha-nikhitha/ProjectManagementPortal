const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { sequelize, InMemoryDB } = require('../utils/database');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

const router = express.Router();
router.use(authMiddleware);
router.use(adminMiddleware);

// Get users list and admin stats
router.get('/users', async (req, res, next) => {
  try {
    let users = [];
    if (sequelize) {
      const dbUsers = await User.findAll({
        attributes: { exclude: ['password'] }
      });
      users = dbUsers.map(u => u.toJSON ? u.toJSON() : u);
    } else {
      users = InMemoryDB.users.map(({ password, ...u }) => u);
    }
    
    // System-wide statistics for admin
    const totalUsers = users.length;
    const rolesBreakdown = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      users,
      stats: {
        totalUsers,
        rolesBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update a user's role
router.patch('/users/:id/role', async (req, res, next) => {
  try {
    const targetUserId = Number(req.params.id);
    const { role } = req.body;

    const validRoles = ['Student', 'Working Professional', 'Freelancer', 'Team Leader', 'Faculty', 'Startup Founder', 'Admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    if (sequelize) {
      const user = await User.findByPk(targetUserId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      user.role = role;
      await user.save();
      const { password, ...safeUser } = user.toJSON();
      return res.json({ success: true, user: safeUser });
    }

    const user = InMemoryDB.users.find(u => u.id === targetUserId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.role = role;
    const { password, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (error) {
    next(error);
  }
});

// Delete a user
router.delete('/users/:id', async (req, res, next) => {
  try {
    const targetUserId = Number(req.params.id);
    if (req.user.id === targetUserId) {
      return res.status(400).json({ success: false, message: 'You cannot delete yourself' });
    }

    if (sequelize) {
      const user = await User.findByPk(targetUserId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      await user.destroy();
      return res.json({ success: true, message: 'User deleted successfully' });
    }

    const index = InMemoryDB.users.findIndex(u => u.id === targetUserId);
    if (index < 0) return res.status(404).json({ success: false, message: 'User not found' });
    InMemoryDB.users.splice(index, 1);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
