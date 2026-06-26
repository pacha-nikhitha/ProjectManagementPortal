const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { sequelize, InMemoryDB } = require('../utils/database');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projects = sequelize
      ? await require('../models/Project').findAll({ where: { ownerId: userId } })
      : InMemoryDB.projects.filter(p => p.ownerId === userId);
    const tasks = sequelize
      ? await require('../models/Task').findAll({ where: { ownerId: userId } })
      : InMemoryDB.tasks.filter(t => t.ownerId === userId);

    const now = new Date();
    const projectSummary = projects.map(p => {
      const pData = p.dataValues || p;
      const pTasks = tasks.filter(t => (t.dataValues || t).projectId == pData.id);
      const completed = pTasks.filter(t => (t.dataValues || t).status === 'Completed').length;
      return {
        id: pData.id,
        name: pData.name,
        status: pData.status,
        priority: pData.priority,
        totalTasks: pTasks.length,
        completedTasks: completed,
        completionRate: pTasks.length > 0 ? Math.round((completed / pTasks.length) * 100) : 0,
        deadline: pData.deadline,
      };
    });

    const taskSummary = {
      total: tasks.length,
      pending: tasks.filter(t => (t.dataValues || t).status === 'Pending').length,
      inProgress: tasks.filter(t => (t.dataValues || t).status === 'In Progress').length,
      completed: tasks.filter(t => (t.dataValues || t).status === 'Completed').length,
      overdue: tasks.filter(t => { const d = t.dataValues || t; return d.deadline && new Date(d.deadline) < now && d.status !== 'Completed'; }).length,
    };

    // Monthly data (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString('default', { month: 'short' });
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const created = projects.filter(p => { const d = p.dataValues || p; return new Date(d.createdAt) >= monthStart && new Date(d.createdAt) <= monthEnd; }).length;
      const done = tasks.filter(t => { const d = t.dataValues || t; return d.status === 'Completed' && new Date(d.updatedAt) >= monthStart && new Date(d.updatedAt) <= monthEnd; }).length;
      monthlyData.push({ month, projects: created, completed: done });
    }

    res.json({ success: true, projectSummary, taskSummary, monthlyData, projects, tasks });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
