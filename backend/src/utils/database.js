const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Support DATABASE_URL (Render Postgres) or individual MySQL env vars (local dev)
let sequelize = null;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
    logging: false,
  });
} else if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME) {
  sequelize = new Sequelize({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dialect: 'mysql',
    logging: false,
  });
}

const InMemoryDB = {
  users: [],
  projects: [],
  tasks: [],
  notifications: [],
};

async function initializeDatabase() {
  if (!sequelize) {
    console.warn('No database credentials provided. Using in-memory fallback database.');
    return false;
  }

  // Only auto-create the DB for MySQL (local dev). Postgres on Render is managed.
  if (!process.env.DATABASE_URL && process.env.DB_HOST && process.env.DB_NAME) {
    try {
      const admin = new Sequelize({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        dialect: 'mysql',
        logging: false,
      });
      await admin.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      await admin.close();
    } catch (e) {
      // Ignore if already exists or no permission
    }
  }

  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    return true;
  } catch (error) {
    console.warn('Database connection failed. Falling back to in-memory database.');
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
