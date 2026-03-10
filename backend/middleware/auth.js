const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET || 'dev-secret';

// Аутентификация
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const token = req.cookies?.token || bearerToken;

  if (!token) {
    return res.status(401).json({ error: 'Токен не предоставлен' });
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
};

// Проверка роли администратора
const checkAdmin = (req, res, next) => {
  if (req.user.subscriptionTier !== 'admin' && req.user.isAdmin !== true) {
    return res.status(403).json({ error: 'Требуются права администратора' });
  }
  next();
};

module.exports = { authenticateToken, checkAdmin };
