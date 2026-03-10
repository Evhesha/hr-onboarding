const app = require('../app');
const { sequelize } = require('../models');

let initPromise = null;

async function ensureDatabaseReady() {
  if (!initPromise) {
    initPromise = (async () => {
      await sequelize.authenticate();
      if (process.env.DB_SYNC === 'true') {
        await sequelize.sync();
      }
    })().catch((error) => {
      initPromise = null;
      throw error;
    });
  }

  return initPromise;
}

module.exports = async (req, res) => {
  try {
    await ensureDatabaseReady();
    return app(req, res);
  } catch (error) {
    console.error('Failed to initialize database in serverless runtime:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: 'Database initialization failed',
        details: error instanceof Error ? error.message : String(error),
      })
    );
  }
};
