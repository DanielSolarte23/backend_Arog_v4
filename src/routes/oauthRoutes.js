  // const Router = require('express');
  // const passport = require('passport');
  // const GoogleStrategy = require('passport-google-oauth20').Strategy;
  // const { googleCallback, googleLogout } = require('../controllers/oauthController');
  // const dotenv = require("dotenv");
  // dotenv.config()

  // const router = Router();

  // // Configurar Google Strategy
  // passport.use(
  //   new GoogleStrategy(
  //     {
  //       clientID: process.env.CLIENT_ID,
  //       clientSecret: process.env.CLIENT_SECRET,
  //       callbackURL: process.env.CALL_BACK_URL,
  //       prompt: "select_account",
  //     },
  //     async function (accessToken, refreshToken, profile, done) {
  //       try {
  //         // Estructura de datos adaptada para el nuevo modelo de Usuario
  //         const userData = {
  //           googleId: profile.id, // Aunque no esté en el modelo, es útil mantenerlo para el proceso de autenticación
  //           name: profile.displayName,
  //           email: profile.emails[0].value,
  //           accessToken, // Guardar el accessToken para poder revocarlo después
  //         };
  //         done(null, userData);
  //       } catch (error) {
  //         done(error, null);
  //       }
  //     }
  //   )
  // );

  // // Ruta de inicio de autenticación con Google
  // router.get(
  //   "/google",
  //   passport.authenticate("google", {
  //     scope: ["profile", "email"],
  //     prompt: "select_account",
  //   })
  // );

  // // Callback de Google
  // router.get(
  //   "/google/callback",
  //   passport.authenticate("google", { session: false }),
  //   async (req, res) => {
  //     try {
  //       const result = await googleCallback(req, req.user);
  //       // Establecer la cookie con el token generado
  //       res.cookie("token", result.token, {
  //         httpOnly: true, // Aumenta la seguridad
  //         secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
  //         sameSite: 'strict', // Protección contra CSRF
  //       });

  //       // Redirección al front después de la autenticación exitosa
  //       res.redirect(`http://localhost:3000/secure/administrador`);
  //     } catch (error) {
  //       console.error('Error en callback de Google:', error);
  //       res.redirect("http://localhost:3000/auth/inicio");
  //     }
  //   }
  // );

  // // Ruta para cerrar sesión
  // router.post("/google/logout", googleLogout);

  // module.exports = router;

  const express = require("express");
  const passport = require("passport");
  const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
  const {
    googleCallback,
    googleLogout,
  } = require("../controllers/googleAuthController");
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
  
  // Callback de Google
  router.get(
    "/google/callback",
    passport.authenticate("google", { session: false }),
    async (req, res) => {
      try {
        const result = await googleCallback(req, req.user);
  
        res.cookie("token", result.token);
  
        //Redireccion al front despues de la autenticacion
        res.redirect(`http://localhost:3000/secure/administrador`);
      } catch (error) {
        res.redirect("http://localhost:3000/notfound");
      }
    }
  );
  
  router.post("/google/logout", googleLogout);
  
  module.exports = router;