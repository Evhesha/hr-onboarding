const { UserLessonAccess } = require('../models');

async function getPurchasedLessonSlugs(userId) {
  if (!userId) return [];
  const rows = await UserLessonAccess.findAll({
    where: { userId },
    attributes: ['lessonSlug'],
  });
  return rows.map((row) => row.lessonSlug);
}

module.exports = {
  getPurchasedLessonSlugs,
};
