// controllers/auth.controller.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { prisma } = require("../models/prisma");
const { createAccesToken } = require("../libs/jwt");
const { JWT_SECRET } = require("../config/config");

exports.register = async (req, res) => {
    try {
        const { nombres, apellidos, correoElectronico, contraseña, telefono } = req.body;

        const userFound = await prisma.usuario.findUnique({ where: { correoElectronico } });
        if (userFound) return res.status(400).json(["El correo ya está en uso"]);

        const passwordHash = await bcrypt.hash(contraseña, 10);

        const newUser = await prisma.usuario.create({
            data: {
                nombres,
                apellidos,
                correoElectronico,
                contraseña: passwordHash,
                telefono,
                rol: 'ciudadano',
                estado: 'activo'
            },
        });


        const token = await createAccesToken({
            id: newUser.id, rol: newUser.rol
        });

        res.cookie("token", token);
        res.json({
            id: newUser.id,
            nombres: newUser.nombres,
            correoElectronico: newUser.correoElectronico,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { correoElectronico, contraseña } = req.body;
        const userFound = await prisma.user.findUnique({ where: { correoElectronico } });

        if (!userFound) return res.status(400).json(["Usuario no encontrado"]);

        const isMatch = await bcrypt.compare(contraseña, userFound.contraseña);
        if (!isMatch) return res.status(400).json(["Contraseña incorrecta"]);

        if (!userFound.verified) {
            return res.status(400).json(["Por favor verifica tu correo electrónico antes de iniciar sesión"]);
        }

        const token = await createAccesToken({
            id: userFound.id,
            verified: userFound.verified,
        });

        res.cookie("token", token);
        res.json({
            id: userFound.id,
            nombres: userFound.nombres,
            correoElectronico: userFound.correoElectronico,
            verified: userFound.verified,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.logout = (req, res) => {
    try {
        res.cookie("token", "", { expires: new Date(0) });

        if (req.logout) {
            req.logout();
        }

        return res.sendStatus(200);
    } catch (error) {
        return res.status(500).json({ message: "Error al cerrar sesión" });
    }
};

exports.profile = async (req, res) => {
    try {
        const userFound = await prisma.user.findUnique({ where: { id: req.user.id } });

        if (!userFound) return res.status(400).json({ mensaje: "Usuario no encontrado" });

        return res.json({
            id: userFound.id,
            nombres: userFound.nombres,
            correoElectronico: userFound.correoElectronico,
            createdAt: userFound.createdAt,
            updatedAt: userFound.updatedAt,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.verifyToken = async (req, res) => {
    try {
        const { token } = req.cookies;

        if (!token) return res.status(401).json({ message: "No autorizado" });

        jwt.verify(token, JWT_SECRET, async (err, user) => {
            if (err) return res.status(401).json({ message: "No autorizado" });

            const userFound = await prisma.user.findUnique({ where: { id: user.id } });

            if (!userFound) return res.status(401).json({ message: "No autorizado" });

            return res.json({
                id: userFound.id,
                nombres: userFound.nombres,
                correoElectronico: userFound.correoElectronico,
                verified: userFound.verified,
            });
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
