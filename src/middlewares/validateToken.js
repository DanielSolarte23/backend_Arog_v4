const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/config.js");

const authRequire = (req, res, next) => {
  const { token } = req.cookies;

  if (!token)
    return res.status(401).json({ mensaje: "No autorizacion de token" });

  jwt.verify(token, JWT_SECRET, (err, usuario) => {
    if (err) return res.status(403).json({ mensaje: "Token Invalido" });

    req.usuario = usuario;

    next();
  });
};

module.exports = {
  authRequire,
};