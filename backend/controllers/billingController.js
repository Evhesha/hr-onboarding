const { User } = require('../models');
const { setAuthCookie, toAuthUser } = require('../lib/auth');

exports.activatePremium = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (!user.isSubscribed || user.subscriptionTier !== 'premium') {
      await user.update({
        isSubscribed: true,
        subscriptionTier: 'premium',
      });
    }

    const token = setAuthCookie(res, user);

    res.json({
      user: toAuthUser(user),
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
