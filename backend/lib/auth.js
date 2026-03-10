const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET || 'dev-secret';

function toAuthUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isSubscribed: user.isSubscribed,
    subscriptionTier: user.subscriptionTier,
  };
}

function signAuthToken(user) {
  return jwt.sign(toAuthUser(user), jwtSecret, { expiresIn: '24h' });
}

function getAuthCookieOptions() {
  return {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  };
}

function setAuthCookie(res, user) {
  const token = signAuthToken(user);
  res.cookie('token', token, getAuthCookieOptions());
  return token;
}

module.exports = {
  getAuthCookieOptions,
  setAuthCookie,
  signAuthToken,
  toAuthUser,
};
