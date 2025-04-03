const express = require("express");
const {
    login,
    register,
    logout,
    profile,
    verifyToken,
} = require("../controllers/aauthController.js");
const {
    verifyEmail,
    requestPasswordReset,
    resetPassword,
} = require("../controllers/emailController.js");
const { authRequire } = require("../middlewares/validateToken.js");
// const { validateSchema } = require("../middlewares/validator.middleware.js");
// const {
//   registerShema,
//   loginShema,
//   resetPasswordSchema,
// } = require("../schemas/auth.schema.js");

const router = express.Router();

// Rutas existentes
router.post("/register",
    // validateSchema(registerShema), 
    register);
router.post("/login",
    // validateSchema(loginShema), 
    login);
router.post("/logout", logout);
router.get("/verify", verifyToken);
router.get("/profile", authRequire, profile);

router.get("/verify-email/:token", verifyEmail);
router.post("/request-password-reset", requestPasswordReset);

// Procesa la nueva contraseña
router.post(
    "/reset-password/:token",
    //   validateSchema(resetPasswordSchema),
    resetPassword
);

module.exports = router;