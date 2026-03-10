require('dotenv').config();

const { sequelize } = require('./models');
const app = require('./app');

const PORT = Number(process.env.PORT || 3001);

async function start() {
  try {
    await sequelize.authenticate();
    const shouldSync = process.env.DB_SYNC === 'true';
    if (shouldSync) {
      await sequelize.sync();
    }

    app.listen(PORT, () => {
      console.log(`Backend API started on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start backend:', err);
    process.exit(1);
  }
}

start();
