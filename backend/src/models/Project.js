const { DataTypes } = require('sequelize');
const database = require('../utils/database');

// Use an IIFE getter so sequelize is resolved AFTER initializeDatabase() runs,
// not at module-load time when it may still be null.
const Project = (() => {
  const db = database.sequelize;
  if (!db) return null;
  return db.define('Project', {
    id:             { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name:           { type: DataTypes.STRING,  allowNull: false },
    description:    { type: DataTypes.TEXT },
    category:       { type: DataTypes.STRING },
    status:         { type: DataTypes.STRING,  defaultValue: 'Planning' },
    priority:       { type: DataTypes.STRING,  defaultValue: 'Medium' },
    startDate:      { type: DataTypes.DATEONLY },
    deadline:       { type: DataTypes.DATEONLY },
    endDate:        { type: DataTypes.DATEONLY },
    tags:           { type: DataTypes.TEXT },
    teamMembers:    { type: DataTypes.TEXT },
    estimatedHours: { type: DataTypes.INTEGER, defaultValue: 0 },
    progress:       { type: DataTypes.INTEGER, defaultValue: 0 },
    attachments:    { type: DataTypes.TEXT },
    notes:          { type: DataTypes.TEXT },
    archived:       { type: DataTypes.BOOLEAN, defaultValue: false },
    ownerId:        { type: DataTypes.INTEGER, allowNull: false },
  }, { tableName: 'projects', timestamps: true });
})();

module.exports = Project;

