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
    if (await tableExists(queryInterface, 'users')) {
      return;
    }

    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'enum_users_subscription_tier'
        ) THEN
          CREATE TYPE "enum_users_subscription_tier" AS ENUM('free', 'premium');
        END IF;
      END $$;
    `);

    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      is_subscribed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      subscription_tier: {
        type: 'enum_users_subscription_tier',
        defaultValue: 'free',
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.createTable('lessons', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
      },
      is_free: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
      },
      content: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
    });

    await queryInterface.createTable('user_progress', {
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
      lesson_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'lessons',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      current_step: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      is_completed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      last_accessed: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('user_progress', ['user_id', 'lesson_id'], {
      unique: true,
      name: 'user_progress_user_lesson_unique',
    });
    
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_progress');
    await queryInterface.dropTable('lessons');
    await queryInterface.dropTable('users');

    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_subscription_tier";');
  },
};
