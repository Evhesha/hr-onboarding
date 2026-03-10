const { Lesson, UserProgress } = require('../models');

const defaultLessonMeta = {
  products: {
    title: 'Lesson 1: Products',
    description: 'Curd -> Milk -> Fridge',
    isFree: true,
    order: 1,
  },
  characters: {
    title: 'Lesson 2: Characters',
    description: 'Masha -> Girl -> Armchair',
    isFree: false,
    order: 2,
  },
  situations: {
    title: 'Lesson 3: Situations',
    description: 'Sled -> Winter -> Scarf',
    isFree: false,
    order: 3,
  },
};

function fallbackTitleFromSlug(slug) {
  const text = String(slug || '')
    .replace(/[-_]+/g, ' ')
    .trim();

  if (!text) {
    return 'Untitled lesson';
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
}

async function resolveLessonBySlug(slug) {
  const existing = await Lesson.findOne({ where: { slug } });
  if (existing) {
    return existing;
  }

  const meta = defaultLessonMeta[slug] || {};
  const maxOrder = (await Lesson.max('order')) || 0;

  const [lesson] = await Lesson.findOrCreate({
    where: { slug },
    defaults: {
      title: meta.title || fallbackTitleFromSlug(slug),
      description: meta.description || null,
      isFree: Boolean(meta.isFree),
      order: meta.order || maxOrder + 1,
      content: [],
    },
  });

  return lesson;
}

// Получить все уроки
exports.getAllLessons = async (req, res) => {
  try {
    const lessons = await Lesson.findAll({
      order: [['order', 'ASC']],
      attributes: ['id', 'title', 'slug', 'isFree', 'order', 'description']
    });

    const lessonsWithAccess = lessons.map(lesson => ({
      ...lesson.toJSON(),
      hasAccess: lesson.isFree || req.user.isSubscribed
    }));

    res.json(lessonsWithAccess);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Получить урок по slug
exports.getLessonBySlug = async (req, res) => {
  const { slug } = req.params;
  
  try {
    const lesson = await resolveLessonBySlug(slug);

    if (!lesson.isFree && !req.user.isSubscribed) {
      return res.status(403).json({ 
        error: 'Урок доступен только по подписке',
        requiresSubscription: true
      });
    }

    const progress = await UserProgress.findOne({
      where: {
        userId: req.user.id,
        lessonId: lesson.id
      }
    });

    res.json({
      ...lesson.toJSON(),
      progress: progress || { currentStep: 0, isCompleted: false }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Обновить прогресс
exports.updateProgress = async (req, res) => {
  const { slug } = req.params;
  const { currentStep, isCompleted } = req.body;

  try {
    const lesson = await resolveLessonBySlug(slug);

    const [progress] = await UserProgress.findOrCreate({
      where: {
        userId: req.user.id,
        lessonId: lesson.id
      },
      defaults: {
        currentStep: 0,
        isCompleted: false
      }
    });

    const stepFromRequest = Number(currentStep ?? progress.currentStep ?? 0);
    const safeRequestedStep = Number.isFinite(stepFromRequest) ? Math.max(0, stepFromRequest) : progress.currentStep;
    const nextStep = Math.max(progress.currentStep ?? 0, safeRequestedStep);

    await progress.update({
      currentStep: nextStep,
      isCompleted: Boolean(isCompleted) || progress.isCompleted,
      lastAccessed: new Date()
    });

    res.json(progress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Получить прогресс пользователя
exports.getUserProgress = async (req, res) => {
  try {
    const progress = await UserProgress.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Lesson,
        as: 'lesson',
        attributes: ['id', 'title', 'slug', 'order']
      }]
    });

    res.json(progress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Админ: создать урок
exports.createLesson = async (req, res) => {
  const { title, slug, description, isFree, order, content } = req.body;

  try {
    const lesson = await Lesson.create({
      title,
      slug,
      description,
      isFree: isFree || false,
      order,
      content: content || []
    });

    res.status(201).json(lesson);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Админ: обновить урок
exports.updateLesson = async (req, res) => {
  const { id } = req.params;
  const { title, slug, description, isFree, order, content } = req.body;

  try {
    const lesson = await Lesson.findByPk(id);
    if (!lesson) {
      return res.status(404).json({ error: 'Урок не найден' });
    }

    await lesson.update({
      title, slug, description, isFree, order, content
    });

    res.json(lesson);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Админ: удалить урок
exports.deleteLesson = async (req, res) => {
  const { id } = req.params;

  try {
    const lesson = await Lesson.findByPk(id);
    if (!lesson) {
      return res.status(404).json({ error: 'Урок не найден' });
    }

    await UserProgress.destroy({ where: { lessonId: id } });
    await lesson.destroy();

    res.json({ message: 'Урок удален' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
