const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const User = sequelize
  ? sequelize.define('User', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
      role: { type: DataTypes.ENUM('Student','Working Professional','Freelancer','Team Leader','Faculty','Startup Founder','Admin'), defaultValue: 'Student' },
      phone: { type: DataTypes.STRING },
      profession: { type: DataTypes.STRING },
      organization: { type: DataTypes.STRING },
      bio: { type: DataTypes.TEXT },
      skills: { type: DataTypes.TEXT },
      experience: { type: DataTypes.STRING },
      profilePicture: { type: DataTypes.TEXT },
      socialLinks: { type: DataTypes.TEXT },
    }, { tableName: 'users', timestamps: true })
  : null;

module.exports = User;
