const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET || 'dev-secret';

function toAuthUser(user, purchasedLessons = []) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isSubscribed: user.isSubscribed,
    purchasedLessons,
  };
}

function signAuthToken(user, purchasedLessons = []) {
  return jwt.sign(toAuthUser(user, purchasedLessons), jwtSecret, { expiresIn: '24h' });
}

function getAuthCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: false,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  };
}

function setAuthCookie(res, user, purchasedLessons = []) {
  const token = signAuthToken(user, purchasedLessons);
  res.cookie('token', token, getAuthCookieOptions());
  return token;
}

module.exports = {
  getAuthCookieOptions,
  setAuthCookie,
  signAuthToken,
  toAuthUser,
};
