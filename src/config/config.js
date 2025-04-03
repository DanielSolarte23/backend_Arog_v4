require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'tu_super_secreto_jwt',
  // TOKEN_SECRET: process.env.JWT_SECRET || 'tu_super_secreto_jwt',
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'tu_super_secreto_refresh',
  JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || '7d',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'tu_secreto_cookie',
  NODE_ENV: process.env.NODE_ENV || 'development',
  GOOGLE_CLIENT_ID: process.env.CLIENT_ID
};