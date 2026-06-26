const express = require('express');
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const { sequelize, InMemoryDB } = require('../utils/database');
const Project = require('../models/Project');
const { addNotification } = require('./notifications');

const sanitizeDates = require('../middleware/sanitizeDates');

const router = express.Router();
router.use(authMiddleware);
router.use(sanitizeDates);

router.get('/', async (req, res, next) => {
  try {
    const query = req.query;
    if (sequelize) {
      const projects = await Project.findAll({ where: { ownerId: req.user.id } });
      return res.json({ success: true, projects });
    }
    const projects = InMemoryDB.projects.filter((project) => project.ownerId === req.user.id);
    res.json({ success: true, projects });
  } catch (error) {
    next(error);
  }
});

router.post('/', [
  body('name').notEmpty().withMessage('Project name is required'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const payload = { ...req.body, ownerId: req.user.id };
    if (sequelize) {
      const project = await Project.create(payload);
      addNotification(req.user.id, 'success', 'Project Created', `Project "${project.name}" has been created.`);
      return res.json({ success: true, project });
    }
    const id = InMemoryDB.projects.length + 1;
    const project = { id, ...payload, archived: false, createdAt: new Date(), updatedAt: new Date() };
    InMemoryDB.projects.push(project);
    addNotification(req.user.id, 'success', 'Project Created', `Project "${project.name}" has been created.`);
    res.json({ success: true, project });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const projectId = Number(req.params.id);
    if (sequelize) {
      const project = await Project.findOne({ where: { id: projectId, ownerId: req.user.id } });
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
      await project.update(req.body);
      addNotification(req.user.id, 'info', 'Project Updated', `Project "${project.name}" has been updated.`);
      return res.json({ success: true, project });
    }
    const project = InMemoryDB.projects.find((p) => p.id === projectId && p.ownerId === req.user.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    Object.assign(project, req.body, { updatedAt: new Date() });
    addNotification(req.user.id, 'info', 'Project Updated', `Project "${project.name}" has been updated.`);
    res.json({ success: true, project });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const projectId = Number(req.params.id);
    if (sequelize) {
      const project = await Project.findOne({ where: { id: projectId, ownerId: req.user.id } });
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
      const name = project.name;
      await project.destroy();
      addNotification(req.user.id, 'alert', 'Project Deleted', `Project "${name}" has been deleted.`);
      return res.json({ success: true, message: 'Project deleted' });
    }
    const index = InMemoryDB.projects.findIndex((p) => p.id === projectId && p.ownerId === req.user.id);
    if (index < 0) return res.status(404).json({ success: false, message: 'Project not found' });
    const name = InMemoryDB.projects[index].name;
    InMemoryDB.projects.splice(index, 1);
    addNotification(req.user.id, 'alert', 'Project Deleted', `Project "${name}" has been deleted.`);
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/archive', async (req, res, next) => {
  try {
    const projectId = Number(req.params.id);
    if (sequelize) {
      const project = await Project.findOne({ where: { id: projectId, ownerId: req.user.id } });
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
      project.archived = true;
      await project.save();
      addNotification(req.user.id, 'info', 'Project Archived', `Project "${project.name}" has been archived.`);
      return res.json({ success: true, project });
    }
    const project = InMemoryDB.projects.find((p) => p.id === projectId && p.ownerId === req.user.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    project.archived = true;
    project.updatedAt = new Date();
    addNotification(req.user.id, 'info', 'Project Archived', `Project "${project.name}" has been archived.`);
    res.json({ success: true, project });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/restore', async (req, res, next) => {
  try {
    const projectId = Number(req.params.id);
    if (sequelize) {
      const project = await Project.findOne({ where: { id: projectId, ownerId: req.user.id } });
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
      project.archived = false;
      await project.save();
      addNotification(req.user.id, 'success', 'Project Restored', `Project "${project.name}" has been restored.`);
      return res.json({ success: true, project });
    }
    const project = InMemoryDB.projects.find((p) => p.id === projectId && p.ownerId === req.user.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    project.archived = false;
    project.updatedAt = new Date();
    addNotification(req.user.id, 'success', 'Project Restored', `Project "${project.name}" has been restored.`);
    res.json({ success: true, project });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/duplicate', async (req, res, next) => {
  try {
    const projectId = Number(req.params.id);
    if (sequelize) {
      const project = await Project.findOne({ where: { id: projectId, ownerId: req.user.id } });
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
      const duplicate = await Project.create({ ...project.toJSON(), id: undefined, name: `${project.name} Copy` });
      addNotification(req.user.id, 'success', 'Project Duplicated', `Project "${project.name}" has been duplicated.`);
      return res.json({ success: true, project: duplicate });
    }
    const original = InMemoryDB.projects.find((p) => p.id === projectId && p.ownerId === req.user.id);
    if (!original) return res.status(404).json({ success: false, message: 'Project not found' });
    const id = InMemoryDB.projects.length + 1;
    const copy = { ...original, id, name: `${original.name} Copy`, createdAt: new Date(), updatedAt: new Date() };
    InMemoryDB.projects.push(copy);
    addNotification(req.user.id, 'success', 'Project Duplicated', `Project "${original.name}" has been duplicated.`);
    res.json({ success: true, project: copy });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
