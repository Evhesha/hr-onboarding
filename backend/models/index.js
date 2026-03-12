const sequelize = require('../config/database');

const User = require('./User')(sequelize);
const Lesson = require('./Lesson')(sequelize);
const UserProgress = require('./UserProgress')(sequelize);
const UserLessonAccess = require('./UserLessonAccess')(sequelize);

// Ассоциации
User.hasMany(UserProgress, { foreignKey: 'user_id', as: 'progress' });
UserProgress.belongsTo(User, { foreignKey: 'user_id', as: 'user' });


Lesson.hasMany(UserProgress, { foreignKey: 'lesson_id', as: 'progressRecords' });
UserProgress.belongsTo(Lesson, { foreignKey: 'lesson_id', as: 'lesson' });

User.hasMany(UserLessonAccess, { foreignKey: 'user_id', as: 'lessonAccess' });
UserLessonAccess.belongsTo(User, { foreignKey: 'user_id', as: 'user' });


module.exports = {
  sequelize,
  User,
  Lesson,
  UserProgress,
  UserLessonAccess,
  
  sync: async (force = false) => {
    try {
      await sequelize.sync({ force });
      console.log('База данных синхронизирована');
    } catch (error) {
      console.error('Ошибка синхронизации:', error);
    }
  }
};
