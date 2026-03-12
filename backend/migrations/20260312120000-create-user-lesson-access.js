'use strict';

async function tableExists(queryInterface, tableName) {
  try {
    await queryInterface.describeTable(tableName);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  async up(queryInterface, Sequelize) {
    if (await tableExists(queryInterface, 'user_lesson_access')) {
      return;
    }

    await queryInterface.createTable('user_lesson_access', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      lesson_slug: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      purchased_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('user_lesson_access', ['user_id', 'lesson_slug'], {
      unique: true,
      name: 'user_lesson_access_user_lesson_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_lesson_access');
  },
};
