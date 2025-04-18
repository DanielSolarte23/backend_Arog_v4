const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Obtener todas las incidencias
exports.getAllIncidencias = async (req, res) => {
    try {
        const incidencias = await prisma.incidencias.findMany({
            include: {
                creador: true,
                usuarioAsignado: true,
            },
        });
        res.json(incidencias);
    } catch (error) {
        console.error('Error al obtener incidencias:', error);
        res.status(500).json({ error: 'Error al obtener las incidencias' });
    }
};

// Obtener una incidencia por ID
exports.getIncidenciaById = async (req, res) => {
    const { id } = req.params;
    try {
        const incidencia = await prisma.incidencias.findUnique({
            where: {
                id: parseInt(id),
            },
            include: {
                creador: true,
                usuarioAsignado: true,
            },
        });

        if (!incidencia) {
            return res.status(404).json({ error: 'Incidencia no encontrada' });
        }

        res.json(incidencia);
    } catch (error) {
        console.error('Error al obtener la incidencia:', error);
        res.status(500).json({ error: 'Error al obtener la incidencia' });
    }
};

// Crear una nueva incidencia
exports.createIncidencia = async (req, res) => {
    const {
        fechaIncidencia,
        tituloIncidencia,
        descripcionIncidencia,
        tipoIncidencia,
        estadoIncidencia,
        idUsuario,
        idUsuarioCiudadano,
        idUsuarioCreador,
    } = req.body;

    try {
        const nuevaIncidencia = await prisma.incidencias.create({
            data: {
                fechaIncidencia: new Date(fechaIncidencia),
                tituloIncidencia,
                descripcionIncidencia,
                tipoIncidencia,
                estadoIncidencia: estadoIncidencia || 'abierta',
                idUsuario: idUsuario ? parseInt(idUsuario) : null,
                idUsuarioCiudadano: idUsuarioCiudadano ? parseInt(idUsuarioCiudadano) : null,
                idUsuarioCreador: parseInt(idUsuarioCreador),
            },
        });

        res.status(201).json(nuevaIncidencia);
    } catch (error) {
        console.error('Error al crear la incidencia:', error);
        res.status(500).json({ error: 'Error al crear la incidencia' });
    }
};

// Actualizar una incidencia existente
exports.updateIncidencia = async (req, res) => {
    const { id } = req.params;
    const {
        fechaIncidencia,
        tituloIncidencia,
        descripcionIncidencia,
        tipoIncidencia,
        estadoIncidencia,
        idUsuario,
        idUsuarioCiudadano,
    } = req.body;

    try {
        const incidencia = await prisma.incidencias.update({
            where: {
                id: parseInt(id),
            },
            data: {
                fechaIncidencia: fechaIncidencia ? new Date(fechaIncidencia) : undefined,
                tituloIncidencia,
                descripcionIncidencia,
                tipoIncidencia,
                estadoIncidencia,
                idUsuario: idUsuario ? parseInt(idUsuario) : null,
                idUsuarioCiudadano: idUsuarioCiudadano ? parseInt(idUsuarioCiudadano) : null,
            },
        });

        res.json(incidencia);
    } catch (error) {
        console.error('Error al actualizar la incidencia:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Incidencia no encontrada' });
        }
        res.status(500).json({ error: 'Error al actualizar la incidencia' });
    }
};

// Eliminar una incidencia
exports.deleteIncidencia = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.incidencias.delete({
            where: {
                id: parseInt(id),
            },
        });

        res.json({ message: 'Incidencia eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar la incidencia:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Incidencia no encontrada' });
        }
        res.status(500).json({ error: 'Error al eliminar la incidencia' });
    }
};

// Filtrar incidencias por estado
exports.getIncidenciasByEstado = async (req, res) => {
    const { estado } = req.params;
    
    try {
        const incidencias = await prisma.incidencias.findMany({
            where: {
                estadoIncidencia: estado,
            },
            include: {
                creador: true,
                usuarioAsignado: true,
            },
        });
        
        res.json(incidencias);
    } catch (error) {
        console.error('Error al filtrar incidencias por estado:', error);
        res.status(500).json({ error: 'Error al filtrar las incidencias' });
    }
};

// Actualizar el estado de una incidencia
exports.updateIncidenciaEstado = async (req, res) => {
    const { id } = req.params;
    const { estadoIncidencia } = req.body;

    if (!estadoIncidencia) {
        return res.status(400).json({ error: 'El estado de la incidencia es requerido' });
    }

    try {
        const incidenciaActualizada = await prisma.incidencias.update({
            where: {
                id: parseInt(id),
            },
            data: {
                estadoIncidencia,
            },
        });

        res.json({
            message: 'Estado de incidencia actualizado correctamente',
            incidencia: incidenciaActualizada
        });
    } catch (error) {
        console.error('Error al actualizar el estado de la incidencia:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Incidencia no encontrada' });
        }
        res.status(500).json({ error: 'Error al actualizar el estado de la incidencia' });
    }
};

// Obtener incidencias por usuario asignado
exports.getIncidenciasByUsuario = async (req, res) => {
    const { idUsuario } = req.params;
    
    try {
        const incidencias = await prisma.incidencias.findMany({
            where: {
                idUsuario: parseInt(idUsuario),
            },
            include: {
                creador: true,
                usuarioAsignado: true,
            },
        });
        
        res.json(incidencias);
    } catch (error) {
        console.error('Error al obtener incidencias por usuario:', error);
        res.status(500).json({ error: 'Error al obtener las incidencias' });
    }
};