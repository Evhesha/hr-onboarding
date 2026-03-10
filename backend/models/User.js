const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'password_hash',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    isSubscribed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_subscribed',
    },
    subscriptionTier: {
      type: DataTypes.ENUM('free', 'premium'),
      defaultValue: 'free',
      field: 'subscription_tier',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  }, {
    tableName: 'users',
    timestamps: false,
    underscored: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.passwordHash) {
          const salt = await bcrypt.genSalt(10);
          user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('passwordHash')) {
          const salt = await bcrypt.genSalt(10);
          user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
        }
      },
    },
  });

  User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  };

  return User;
};
