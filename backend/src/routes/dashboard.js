const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { sequelize, InMemoryDB } = require('../utils/database');
const Project = require('../models/Project');
const Task = require('../models/Task');

const router = express.Router();
router.use(authMiddleware);

router.get('/stats', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    if (sequelize) {
      const { Op } = require('sequelize');
      const projects = await Project.findAll({ where: { ownerId: userId } });
      const tasks = await Task.findAll({ where: { ownerId: userId } });

      const totalProjects = projects.length;
      const activeProjects = projects.filter(p => p.status === 'Active').length;
      const completedProjects = projects.filter(p => p.status === 'Completed').length;
      const archivedProjects = projects.filter(p => p.archived).length;

      const totalTasks = tasks.length;
      const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
      const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
      const completedTasks = tasks.filter(t => t.status === 'Completed').length;
      const highPriorityTasks = tasks.filter(t => t.priority === 'High' || t.priority === 'Critical').length;
      const overdueTasks = tasks.filter(t => t.deadline && new Date(t.deadline) < now && t.status !== 'Completed').length;

      const todayStart = new Date(); todayStart.setHours(0,0,0,0);
      const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);
      const todayTasks = tasks.filter(t => t.deadline && new Date(t.deadline) >= todayStart && new Date(t.deadline) <= todayEnd);
      const upcomingDeadlines = tasks.filter(t => t.deadline && new Date(t.deadline) > now && t.status !== 'Completed').slice(0, 5);
      const recentProjects = projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

      const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return res.json({
        success: true,
        stats: {
          totalProjects, activeProjects, completedProjects, archivedProjects,
          totalTasks, pendingTasks, inProgressTasks, completedTasks,
          highPriorityTasks, overdueTasks, productivityScore,
        },
        todayTasks, upcomingDeadlines, recentProjects,
      });
    }

    // In-memory fallback
    const projects = InMemoryDB.projects.filter(p => p.ownerId === userId);
    const tasks = InMemoryDB.tasks.filter(t => t.ownerId === userId);

    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'Active').length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    const archivedProjects = projects.filter(p => p.archived).length;

    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const highPriorityTasks = tasks.filter(t => t.priority === 'High' || t.priority === 'Critical').length;
    const overdueTasks = tasks.filter(t => t.deadline && new Date(t.deadline) < now && t.status !== 'Completed').length;

    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);
    const todayTasks = tasks.filter(t => t.deadline && new Date(t.deadline) >= todayStart && new Date(t.deadline) <= todayEnd);
    const upcomingDeadlines = tasks.filter(t => t.deadline && new Date(t.deadline) > now && t.status !== 'Completed').slice(0, 5);
    const recentProjects = [...projects].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({
      success: true,
      stats: {
        totalProjects, activeProjects, completedProjects, archivedProjects,
        totalTasks, pendingTasks, inProgressTasks, completedTasks,
        highPriorityTasks, overdueTasks, productivityScore,
      },
      todayTasks, upcomingDeadlines, recentProjects,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
