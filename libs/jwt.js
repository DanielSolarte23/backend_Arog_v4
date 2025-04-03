const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/config.js");

function createAccesToken(payload) {
    return new Promise((resolve, reject) => {
        jwt.sign(
            payload,
            JWT_SECRET,
            {
                expiresIn: "1d",
            },
            (err, token) => {
                if (err) reject(err);
                resolve(token);
            }
        );
    });
}

module.exports = { createAccesToken };