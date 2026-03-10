const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Lesson = sequelize.define('Lesson', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
    isFree: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_free',
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    content: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
  }, {
    tableName: 'lessons',
    timestamps: false,
    underscored: true,
  });

  return Lesson;
};