const express = require('express');
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const { sequelize, InMemoryDB } = require('../utils/database');
const Task = require('../models/Task');
const { addNotification } = require('./notifications');

const sanitizeDates = require('../middleware/sanitizeDates');

const router = express.Router();
router.use(authMiddleware);
router.use(sanitizeDates);

router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (sequelize) {
      const tasks = await Task.findAll({ where: { ownerId: userId } });
      return res.json({ success: true, tasks });
    }
    const tasks = InMemoryDB.tasks.filter(t => t.ownerId === userId);
    res.json({ success: true, tasks });
  } catch (error) {
    next(error);
  }
});

router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const body = { ...req.body };
    // Sanitize empty projectId to null
    if (!body.projectId) body.projectId = null;
    else body.projectId = Number(body.projectId) || null;
    const payload = { ...body, ownerId: req.user.id, archived: false };
    if (sequelize) {
      const task = await Task.create(payload);
      addNotification(req.user.id, 'success', 'Task Created', `Task "${task.title}" has been created.`);
      return res.json({ success: true, task });
    }
    const id = Date.now();
    const task = { id, ...payload, createdAt: new Date(), updatedAt: new Date() };
    InMemoryDB.tasks.push(task);
    addNotification(req.user.id, 'success', 'Task Created', `Task "${task.title}" has been created.`);
    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const taskId = Number(req.params.id);
    const userId = req.user.id;
    if (sequelize) {
      const task = await Task.findOne({ where: { id: taskId, ownerId: userId } });
      if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
      await task.update(req.body);
      addNotification(req.user.id, 'info', 'Task Updated', `Task "${task.title}" has been updated.`);
      return res.json({ success: true, task });
    }
    const task = InMemoryDB.tasks.find(t => t.id === taskId && t.ownerId === userId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    Object.assign(task, req.body, { updatedAt: new Date() });
    addNotification(req.user.id, 'info', 'Task Updated', `Task "${task.title}" has been updated.`);
    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const taskId = Number(req.params.id);
    const userId = req.user.id;
    if (sequelize) {
      const task = await Task.findOne({ where: { id: taskId, ownerId: userId } });
      if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
      const title = task.title;
      await task.destroy();
      addNotification(req.user.id, 'alert', 'Task Deleted', `Task "${title}" has been deleted.`);
      return res.json({ success: true, message: 'Task deleted' });
    }
    const index = InMemoryDB.tasks.findIndex(t => t.id === taskId && t.ownerId === userId);
    if (index < 0) return res.status(404).json({ success: false, message: 'Task not found' });
    const title = InMemoryDB.tasks[index].title;
    InMemoryDB.tasks.splice(index, 1);
    addNotification(req.user.id, 'alert', 'Task Deleted', `Task "${title}" has been deleted.`);
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const taskId = Number(req.params.id);
    const userId = req.user.id;
    const { status } = req.body;
    if (sequelize) {
      const task = await Task.findOne({ where: { id: taskId, ownerId: userId } });
      if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
      task.status = status;
      await task.save();
      addNotification(req.user.id, 'success', 'Task Status Changed', `Task "${task.title}" status is now ${status}.`);
      return res.json({ success: true, task });
    }
    const task = InMemoryDB.tasks.find(t => t.id === taskId && t.ownerId === userId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    task.status = status;
    task.updatedAt = new Date();
    addNotification(req.user.id, 'success', 'Task Status Changed', `Task "${task.title}" status is now ${status}.`);
    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/archive', async (req, res, next) => {
  try {
    const taskId = Number(req.params.id);
    const userId = req.user.id;
    if (sequelize) {
      const task = await Task.findOne({ where: { id: taskId, ownerId: userId } });
      if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
      task.archived = true; await task.save();
      addNotification(req.user.id, 'info', 'Task Archived', `Task "${task.title}" has been archived.`);
      return res.json({ success: true, task });
    }
    const task = InMemoryDB.tasks.find(t => t.id === taskId && t.ownerId === userId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    task.archived = true; task.updatedAt = new Date();
    addNotification(req.user.id, 'info', 'Task Archived', `Task "${task.title}" has been archived.`);
    res.json({ success: true, task });
  } catch (error) { next(error); }
});

router.patch('/:id/restore', async (req, res, next) => {
  try {
    const taskId = Number(req.params.id);
    const userId = req.user.id;
    if (sequelize) {
      const task = await Task.findOne({ where: { id: taskId, ownerId: userId } });
      if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
      task.archived = false; await task.save();
      addNotification(req.user.id, 'success', 'Task Restored', `Task "${task.title}" has been restored.`);
      return res.json({ success: true, task });
    }
    const task = InMemoryDB.tasks.find(t => t.id === taskId && t.ownerId === userId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    task.archived = false; task.updatedAt = new Date();
    addNotification(req.user.id, 'success', 'Task Restored', `Task "${task.title}" has been restored.`);
    res.json({ success: true, task });
  } catch (error) { next(error); }
});

router.post('/:id/duplicate', async (req, res, next) => {
  try {
    const taskId = Number(req.params.id);
    const userId = req.user.id;
    if (sequelize) {
      const task = await Task.findOne({ where: { id: taskId, ownerId: userId } });
      if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
      const dup = await Task.create({ ...task.toJSON(), id: undefined, title: `${task.title} Copy` });
      addNotification(req.user.id, 'success', 'Task Duplicated', `Task "${task.title}" has been duplicated.`);
      return res.json({ success: true, task: dup });
    }
    const original = InMemoryDB.tasks.find(t => t.id === taskId && t.ownerId === userId);
    if (!original) return res.status(404).json({ success: false, message: 'Task not found' });
    const copy = { ...original, id: Date.now(), title: `${original.title} Copy`, createdAt: new Date(), updatedAt: new Date() };
    InMemoryDB.tasks.push(copy);
    addNotification(req.user.id, 'success', 'Task Duplicated', `Task "${original.title}" has been duplicated.`);
    res.json({ success: true, task: copy });
  } catch (error) { next(error); }
});

module.exports = router;
