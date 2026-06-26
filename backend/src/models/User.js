const { DataTypes } = require('sequelize');
const database = require('../utils/database');

// Use an IIFE getter so sequelize is resolved AFTER initializeDatabase() runs,
// not at module-load time when it may still be null.
const User = (() => {
  const db = database.sequelize;
  if (!db) return null;
  return db.define('User', {
    id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name:           { type: DataTypes.STRING,  allowNull: false },
    email:          { type: DataTypes.STRING,  allowNull: false, unique: true },
    password:       { type: DataTypes.STRING,  allowNull: false },
    // STRING instead of ENUM — works on both MySQL and Postgres
    role:           { type: DataTypes.STRING,  defaultValue: 'Student' },
    phone:          { type: DataTypes.STRING },
    profession:     { type: DataTypes.STRING },
    organization:   { type: DataTypes.STRING },
    bio:            { type: DataTypes.TEXT },
    skills:         { type: DataTypes.TEXT },
    experience:     { type: DataTypes.STRING },
    profilePicture: { type: DataTypes.TEXT },
    socialLinks:    { type: DataTypes.TEXT },
  }, { tableName: 'users', timestamps: true });
})();

module.exports = User;

