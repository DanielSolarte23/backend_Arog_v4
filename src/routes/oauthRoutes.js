const express = require("express");
const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const {
  googleCallback,
  googleLogout,
} = require("../controllers/oauthController");
const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();

// Configurar Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.CALL_BACK_URL,
      prompt: "select_account",
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        const userData = {
          googleId: profile.id,
          nombres: profile.displayName,
          apellidos: profile.name.familyName,
          correoElectronico: profile.emails[0].value,
          accessToken, // Guardar el accessToken
        };
        done(null, userData);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    try {
      const result = await googleCallback(req, req.user);
      
      const isDev = process.env.NODE_ENV !== "production";
      const frontendURL = isDev ? process.env.FRONTEND_URL : process.env.FRONTEND_URL_PROD;
      
      // Extraer el dominio del frontend
      const frontendDomain = new URL(frontendURL).hostname;
      
      // Configurar la cookie con las opciones adecuadas
      res.cookie("token", result.token, {
        httpOnly: true,           // Previene acceso desde JavaScript
        secure: !isDev,           // Solo HTTPS en producción
        sameSite: 'lax',          // Configuración para redirecciones cross-site
        domain: frontendDomain,   // Establecer dominio para compartir cookie
        maxAge: 24 * 60 * 60 * 1000  // Expiración (24 horas en este ejemplo)
      });

      res.redirect(`${frontendURL}/secure/administrador`);
    } catch (error) {
      console.error("Error en callback de Google:", error);
      const isDev = process.env.NODE_ENV !== "production";
      const frontendURL = isDev ? process.env.FRONTEND_URL : process.env.FRONTEND_URL_PROD;
      res.redirect(`${frontendURL}/notfound`);
    }
  }
);

router.post("/google/logout", googleLogout);

module.exports = router;
