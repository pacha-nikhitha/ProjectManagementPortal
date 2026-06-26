const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const Task = sequelize
  ? sequelize.define('Task', {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT },
      projectId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      category: { type: DataTypes.STRING },
      status: { type: DataTypes.STRING, defaultValue: 'Pending' },
      priority: { type: DataTypes.STRING, defaultValue: 'Medium' },
      deadline: { type: DataTypes.DATEONLY },
      assignedTo: { type: DataTypes.STRING },
      estimatedHours: { type: DataTypes.INTEGER, defaultValue: 0 },
      tags: { type: DataTypes.TEXT },
      notes: { type: DataTypes.TEXT },
      attachments: { type: DataTypes.TEXT },
      archived: { type: DataTypes.BOOLEAN, defaultValue: false },
      ownerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    }, { tableName: 'tasks', timestamps: true })
  : null;

module.exports = Task;
