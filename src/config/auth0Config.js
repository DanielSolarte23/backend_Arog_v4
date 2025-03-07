require('dotenv').config();

console.log("AUTH0_SECRET:", process.env.AUTH0_SECRET);
console.log("AUTH0_BASE_URL:", process.env.AUTH0_BASE_URL);
console.log("AUTH0_CLIENT_ID:", process.env.AUTH0_CLIENT_ID);
console.log("AUTH0_ISSUER_BASE_URL:", process.env.AUTH0_ISSUER_BASE_URL);
console.log("AUTH0_CLIENT_SECRET:", process.env.AUTH0_CLIENT_SECRET);

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  routes: {
    login: '/login',
    callback: '/auth/callback'
  },
  authorizationParams: {
    response_type: 'code',
    scope: 'openid profile email'
  }
};

module.exports = { config };