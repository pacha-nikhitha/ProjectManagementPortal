const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const Project = sequelize
  ? sequelize.define('Project', {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT },
      category: { type: DataTypes.STRING },
      status: { type: DataTypes.STRING, defaultValue: 'Planning' },
      priority: { type: DataTypes.STRING, defaultValue: 'Medium' },
      startDate: { type: DataTypes.DATEONLY },
      deadline: { type: DataTypes.DATEONLY },
      endDate: { type: DataTypes.DATEONLY },
      tags: { type: DataTypes.TEXT },
      teamMembers: { type: DataTypes.TEXT },
      estimatedHours: { type: DataTypes.INTEGER, defaultValue: 0 },
      progress: { type: DataTypes.INTEGER, defaultValue: 0 },
      attachments: { type: DataTypes.TEXT },
      notes: { type: DataTypes.TEXT },
      archived: { type: DataTypes.BOOLEAN, defaultValue: false },
      ownerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    }, { tableName: 'projects', timestamps: true })
  : null;

module.exports = Project;
