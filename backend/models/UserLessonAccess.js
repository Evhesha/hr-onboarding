const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserLessonAccess = sequelize.define('UserLessonAccess', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    lessonSlug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'lesson_slug',
    },
    purchasedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'purchased_at',
    },
  }, {
    tableName: 'user_lesson_access',
    timestamps: false,
    underscored: true,
  });

  return UserLessonAccess;
};
