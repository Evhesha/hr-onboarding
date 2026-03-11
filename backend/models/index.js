const sequelize = require('../config/database');

const User = require('./User')(sequelize);
const Lesson = require('./Lesson')(sequelize);
const UserProgress = require('./UserProgress')(sequelize);

// Ассоциации
User.hasMany(UserProgress, { foreignKey: 'user_id', as: 'progress' });
UserProgress.belongsTo(User, { foreignKey: 'user_id', as: 'user' });


Lesson.hasMany(UserProgress, { foreignKey: 'lesson_id', as: 'progressRecords' });
UserProgress.belongsTo(Lesson, { foreignKey: 'lesson_id', as: 'lesson' });


module.exports = {
  sequelize,
  User,
  Lesson,
  UserProgress,
  
  sync: async (force = false) => {
    try {
      await sequelize.sync({ force });
      console.log('База данных синхронизирована');
    } catch (error) {
      console.error('Ошибка синхронизации:', error);
    }
  }
};
