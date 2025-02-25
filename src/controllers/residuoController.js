const prisma = require('../models/prisma');

const residuoController = {
  // Mostrar residuos
async findAll(req, res) {
    try {const residuos = await prisma.residuo.findMany();
    res.json(residuos);
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
},

  // Eliminar residuo
async delete(req, res) {
    try {const { id } = req.params;
    await prisma.residuo.delete({
        where: { id: parseInt(id) }
    });
    res.status(204).send();
    } catch (error) {
    res.status(400).json({ error: error.message });
    }
},

  // Actualizar residuo
async update(req, res) {
    try {
    const { id } = req.params;
    const { nombre, tipo, cantidad } = req.body;
    const residuo = await prisma.residuo.update({
        where: { id: parseInt(id) },
        data: { nombre, tipo, cantidad }
    });
    res.json(residuo);
    } catch (error) {
    res.status(400).json({ error: error.message });
    }
},

  // Agregar residuo
async create(req, res) {
    try {
    const { nombre, tipo, cantidad } = req.body;
    const residuo = await prisma.residuo.create({
        data: { nombre, tipo, cantidad }
    });
    res.status(201).json(residuo);
    } catch (error) {
    res.status(400).json({ error: error.message });
    }
}
};

module.exports = residuoController;