// routes/auth0Routes.js
const express = require('express');
const router = express.Router();
const { requiresAuth } = require('express-openid-connect');
const auth0Controller = require('../controllers/auth0Controller');

router.get('/inicio/google', (req, res) => {
  console.log("Entrando a /inicio/google");
  console.log("req.oidc:", req.oidc);
  if (!req.oidc || !req.oidc.login) {
    console.log("req.oidc.login no está definido");
    return res.status(500).json({ error: "req.oidc.login no está definido.", oidcData: req.oidc });
  }
  console.log("Llamando a req.oidc.login");
  req.oidc.login({ returnTo: '/' });
});

// Ruta de callback después de autenticación exitosa
router.get('/callback', requiresAuth(), auth0Controller.handleAuth0Login);

// Obtener perfil de usuario Auth0 (útil para debugging)
router.get('/profile', requiresAuth(), (req, res) => {
  res.json(req.oidc.user);
});

// Logout de Auth0
router.get('/logout', (req, res) => {
  res.oidc.logout({
    returnTo: '/'
  });
});

module.exports = router;


