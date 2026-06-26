const { DataTypes } = require('sequelize');
const database = require('../utils/database');

// Use an IIFE getter so sequelize is resolved AFTER initializeDatabase() runs,
// not at module-load time when it may still be null.
const Task = (() => {
  const db = database.sequelize;
  if (!db) return null;
  return db.define('Task', {
    id:             { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title:          { type: DataTypes.STRING,  allowNull: false },
    description:    { type: DataTypes.TEXT },
    projectId:      { type: DataTypes.INTEGER, allowNull: true },
    category:       { type: DataTypes.STRING },
    status:         { type: DataTypes.STRING,  defaultValue: 'Pending' },
    priority:       { type: DataTypes.STRING,  defaultValue: 'Medium' },
    deadline:       { type: DataTypes.DATEONLY },
    assignedTo:     { type: DataTypes.STRING },
    estimatedHours: { type: DataTypes.INTEGER, defaultValue: 0 },
    tags:           { type: DataTypes.TEXT },
    notes:          { type: DataTypes.TEXT },
    attachments:    { type: DataTypes.TEXT },
    archived:       { type: DataTypes.BOOLEAN, defaultValue: false },
    ownerId:        { type: DataTypes.INTEGER, allowNull: false },
  }, { tableName: 'tasks', timestamps: true });
})();

module.exports = Task;

