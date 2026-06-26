const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const mysqlConfig = process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME ? {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3307,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dialect: 'mysql',
  logging: false,
} : null;

let sequelize = mysqlConfig ? new Sequelize(mysqlConfig) : null;

const InMemoryDB = {
  users: [],
  projects: [],
  tasks: [],
  notifications: [],
};

async function createDatabaseIfMissing() {
  if (!mysqlConfig) return false;
  const { database, ...adminConfig } = mysqlConfig;
  const admin = new Sequelize({ ...adminConfig, dialect: 'mysql', logging: false });
  try {
    await admin.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    return true;
  } finally {
    await admin.close();
  }
}

async function initializeDatabase() {
  if (!mysqlConfig) {
    console.warn('No MySQL credentials provided. Using in-memory fallback database.');
    return false;
  }

  try {
    await createDatabaseIfMissing();
    await sequelize.authenticate();
    console.log('MySQL connected successfully.');
    return true;
  } catch (error) {
    console.warn('MySQL connection failed. Falling back to in-memory database.');
    console.warn(error.message);
    sequelize = null;
    return false;
  }
}

module.exports = {
  get sequelize() {
    return sequelize;
  },
  initializeDatabase,
  InMemoryDB,
};
