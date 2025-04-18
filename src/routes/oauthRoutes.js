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

      res.cookie("token", result.token);

      const isDev = process.env.NODE_ENV !== "production";
      const frontendURL = isDev ? process.env.FRONTEND_URL : process.env.FRONTEND_URL_PROD;

      res.redirect(`${frontendURL}/secure/administrador`);
    } catch (error) {
      const isDev = process.env.NODE_ENV !== "production";
      const frontendURL = isDev ? process.env.FRONTEND_URL : process.env.FRONTEND_URL_PROD;

      res.redirect(`${frontendURL}/notfound`);
    }
  }
);


router.post("/google/logout", googleLogout);

module.exports = router;
