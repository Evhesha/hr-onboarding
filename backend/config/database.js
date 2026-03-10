require('dotenv').config();
const { Sequelize } = require('sequelize');
const pg = require('pg');

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL_PROD;
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && !databaseUrl) {
  throw new Error('DATABASE_URL or POSTGRES_URL is required in production.');
}

const commonOptions = {
  dialect: 'postgres',
  // Force including pg in serverless bundles (Vercel) instead of relying on dynamic require.
  dialectModule: pg,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    underscored: true,
  },
};

const sslOptions = isProduction
  ? {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    }
  : undefined;

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
      ...commonOptions,
      dialectOptions: sslOptions,
    })
  : new Sequelize(
      process.env.DB_NAME || process.env.DB_DATABASE || 'hr-onboarding-db',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || 'postgres',
      {
        ...commonOptions,
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432),
        dialectOptions: sslOptions,
      }
    );

module.exports = sequelize;
