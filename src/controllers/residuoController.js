const prisma = require('../models/prisma');

const residuoController = {
  // Mostrar residuos
async findAll(req, res) {
    try {const residuos = await prisma.residuos.findMany();
    res.json(residuos);
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
},

  // Eliminar residuo
async delete(req, res) {
    try {
      const { id } = req.params;
      console.log("ID recibido para eliminar:", id);

      const residuoExistente = await prisma.residuos.findUnique({
        where: { id: parseInt(id) }
    });

    if (!residuoExistente) {
      console.log("Residuo no encontrado con ID:", id);
      return res.status(404).json({ error: "Residuo no encontrado" });
  }

    // Eliminar el residuo
      await prisma.residuos.delete({
      where: { id: parseInt(id) }
  });

  res.json({ message: "Residuo eliminado correctamente" });
} catch (error) {
    console.error("Error al eliminar residuo:", error);
    res.status(400).json({ error: error.message });
}
},

  // Actualizar residuo
  async update(req, res) {
    try {
        const { id } = req.params;
        const { tipoDeResiduo, ubicacion, cantidad, estado } = req.body;

        // Verificar si el residuo existe antes de actualizar
        const existeResiduo = await prisma.residuos.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existeResiduo) {
            return res.status(404).json({ error: "Residuo no encontrado" });
        }

        // Proceder con la actualización
        const residuoActualizado = await prisma.residuos.update({
            where: { id: parseInt(id) },
            data: { tipoDeResiduo, ubicacion, cantidad, estado }
        });

        res.json(residuoActualizado);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
},


  // Agregar residuo
async create(req, res) {
    try {
      console.log("Cuerpo de la solicitud:", req.body);
    const { tipoDeResiduo, ubicacion, cantidad, estado } = req.body;
    if (!tipoDeResiduo || !ubicacion || !cantidad || !estado) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }
    const residuo = await prisma.residuos.create({
        data: { 
          tipoDeResiduo,
          ubicacion, 
          cantidad, 
          estado: estado.toLowerCase()
        }
    });
    res.status(201).json(residuo);
    } catch (error) {
    res.status(400).json({ error: error.message });
    }
}
};

module.exports = residuoController;