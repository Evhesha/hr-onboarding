const { User, UserLessonAccess } = require('../models');
const { setAuthCookie, toAuthUser } = require('../lib/auth');
const { getPurchasedLessonSlugs } = require('../lib/purchases');

exports.activatePremium = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (!user.isSubscribed) {
      await user.update({
        isSubscribed: true,
      });
    }

    const purchasedLessons = await getPurchasedLessonSlugs(user.id);
    const token = setAuthCookie(res, user, purchasedLessons);

    res.json({
      user: toAuthUser(user, purchasedLessons),
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.activateLessonAccess = async (req, res) => {
  try {
    const { lessonSlug } = req.body;

    if (!lessonSlug) {
      return res.status(400).json({ error: 'lessonSlug обязателен' });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    await UserLessonAccess.findOrCreate({
      where: { userId: user.id, lessonSlug },
    });

    const purchasedLessons = await getPurchasedLessonSlugs(user.id);
    const token = setAuthCookie(res, user, purchasedLessons);

    res.json({
      user: toAuthUser(user, purchasedLessons),
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.activateLessonsAccess = async (req, res) => {
  try {
    const { lessonSlugs } = req.body;

    if (!Array.isArray(lessonSlugs) || lessonSlugs.length === 0) {
      return res.status(400).json({ error: 'lessonSlugs обязателен' });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const uniqueSlugs = [...new Set(lessonSlugs.map((slug) => String(slug).trim()).filter(Boolean))];

    await Promise.all(
      uniqueSlugs.map((lessonSlug) =>
        UserLessonAccess.findOrCreate({
          where: { userId: user.id, lessonSlug },
        })
      )
    );

    const purchasedLessons = await getPurchasedLessonSlugs(user.id);
    const token = setAuthCookie(res, user, purchasedLessons);

    res.json({
      user: toAuthUser(user, purchasedLessons),
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
