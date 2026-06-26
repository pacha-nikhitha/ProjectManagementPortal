const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { sequelize, InMemoryDB } = require('../utils/database');

const router = express.Router();
router.use(authMiddleware);

// Seed some default notifications for a user if none exist
function seedNotifications(userId) {
  const existing = InMemoryDB.notifications.filter(n => n.userId === userId);
  if (existing.length > 0) return;
  const defaults = [
    { id: Date.now() + 1, userId, type: 'info', title: 'Welcome to ProjectNest!', message: 'Your account has been created successfully.', read: false, createdAt: new Date().toISOString() },
    { id: Date.now() + 2, userId, type: 'reminder', title: 'Get Started', message: 'Create your first project to begin tracking tasks.', read: false, createdAt: new Date(Date.now() - 60000).toISOString() },
  ];
  InMemoryDB.notifications.push(...defaults);
}

router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (sequelize) {
      // Basic implementation for MySQL
      const notifications = InMemoryDB.notifications.filter(n => n.userId === userId);
      return res.json({ success: true, notifications, unreadCount: notifications.filter(n => !n.read).length });
    }
    seedNotifications(userId);
    const notifications = InMemoryDB.notifications.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, notifications, unreadCount: notifications.filter(n => !n.read).length });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    const notificationId = Number(req.params.id);
    const userId = req.user.id;
    const notification = InMemoryDB.notifications.find(n => n.id === notificationId && n.userId === userId);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    notification.read = true;
    res.json({ success: true, notification });
  } catch (error) {
    next(error);
  }
});

router.patch('/read-all', async (req, res, next) => {
  try {
    const userId = req.user.id;
    InMemoryDB.notifications.filter(n => n.userId === userId).forEach(n => { n.read = true; });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
});

// Internal helper to add notifications
function addNotification(userId, type, title, message) {
  const notification = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    userId,
    type,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  };
  InMemoryDB.notifications.push(notification);
  return notification;
}

module.exports = router;
module.exports.addNotification = addNotification;
