const { User } = require('../models');

// Получить профиль текущего пользователя
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'isSubscribed', 'subscriptionTier', 'createdAt'],
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Получить всех пользователей (только для админа)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'isSubscribed', 'subscriptionTier', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Обновить пользователя
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, isSubscribed, subscriptionTier } = req.body;

  if (id !== req.user.id) {
    return res.status(403).json({ error: 'Нет прав для редактирования этого пользователя' });
  }

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (password !== undefined) updateData.passwordHash = password;
    if (isSubscribed !== undefined) updateData.isSubscribed = isSubscribed;
    if (subscriptionTier !== undefined) updateData.subscriptionTier = subscriptionTier;

    await user.update(updateData);

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      isSubscribed: user.isSubscribed,
      subscriptionTier: user.subscriptionTier,
      createdAt: user.createdAt,
    });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Email уже занят' });
    }

    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: err.errors.map((e) => e.message) });
    }

    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Удалить пользователя
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  if (id !== req.user.id) {
    return res.status(403).json({ error: 'Нет прав для удаления этого пользователя' });
  }

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    await user.destroy();
    res.json({ message: 'Пользователь удалён', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
