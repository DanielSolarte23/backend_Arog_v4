const prisma = require('../models/prisma');

const encuestaController = {
  async create(req, res) {
    try {
      const { titulo, descripcion, fechaExpiracion, preguntas, creadorId } = req.body;

      const encuesta = await prisma.encuesta.create({
        data: {
          titulo,
          descripcion,
          fechaExpiracion: fechaExpiracion ? new Date(fechaExpiracion) : null,
          creador: {
            connect: { id: creadorId }
          },
          preguntas: {
            create: preguntas.map((pregunta, index) => ({
              texto: pregunta.texto,
              tipo: pregunta.tipo,
              requerida: pregunta.requerida ?? true,
              orden: index + 1,
              opciones: pregunta.tipo === 'texto_libre' ? undefined : {
                create: (pregunta.opciones || []).map((opcion, opIndex) => ({
                  texto: opcion.texto,
                  orden: opIndex + 1
                }))
              }
            }))
          }
        },
        include: {
          preguntas: {
            include: {
              opciones: true
            }
          }
        }
      });

      res.status(201).json(encuesta);
    } catch (error) {
      console.error('Error al crear encuesta:', error);
      res.status(400).json({ error: error.message });
    }
  },

  // Obtener todas las encuestas
  async findAll(req, res) {
    try {
      const encuestas = await prisma.encuesta.findMany({
        include: {
          creador: {
            select: {
              nombres: true,
              apellidos: true
            }
          },
          _count: {
            select: {
              respuestas: true,
              preguntas: true
            }
          }
        }
      });
      res.json(encuestas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener una encuesta específica con todas sus preguntas y opciones
  async findOne(req, res) {
    try {
      const { id } = req.params;
      const encuesta = await prisma.encuesta.findUnique({
        where: { id: parseInt(id) },
        include: {
          preguntas: {
            orderBy: { orden: 'asc' },
            include: {
              opciones: {
                orderBy: { orden: 'asc' }
              }
            }
          },
          creador: {
            select: {
              nombres: true,
              apellidos: true
            }
          }
        }
      });

      if (!encuesta) {
        return res.status(404).json({ message: 'Encuesta no encontrada' });
      }

      res.json(encuesta);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Actualizar una encuesta
  async update(req, res) {
    try {
      const { id } = req.params;
      const { titulo, descripcion, fechaExpiracion, estado } = req.body;

      const encuesta = await prisma.encuesta.update({
        where: { id: parseInt(id) },
        data: {
          titulo,
          descripcion,
          fechaExpiracion: fechaExpiracion ? new Date(fechaExpiracion) : null,
          estado
        },
        include: {
          preguntas: {
            include: {
              opciones: true
            }
          }
        }
      });

      res.json(encuesta);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Eliminar una encuesta
  async delete(req, res) {
    try {
      const { id } = req.params;
      await prisma.encuesta.delete({
        where: { id: parseInt(id) }
      });
      
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Responder una encuesta
  async responder(req, res) {
    try {
      const { encuestaId } = req.params;
      const { usuarioId, ciudadanoId, respuestas } = req.body;

      const respuestaEncuesta = await prisma.respuestaEncuesta.create({
        data: {
          encuesta: {
            connect: { id: parseInt(encuestaId) }
          },
          usuario: {
            connect: { id: usuarioId }
          },
          ciudadano: {
            connect: { id: ciudadanoId }
          },
          completada: true,
          respuestas: {
            create: respuestas.map(resp => ({
              pregunta: {
                connect: { id: resp.preguntaId }
              },
              ...(resp.opcionSeleccionadaId && {
                opcionSeleccionada: {
                  connect: { id: resp.opcionSeleccionadaId }
                }
              }),
              textoRespuesta: resp.textoRespuesta,
              valorEscala: resp.valorEscala
            }))
          }
        },
        include: {
          respuestas: true
        }
      });

      res.status(201).json(respuestaEncuesta);
    } catch (error) {
      console.error('Error al responder encuesta:', error);
      res.status(400).json({ error: error.message });
    }
  },

  // Obtener resultados de una encuesta
  async getResultados(req, res) {
    try {
      const { id } = req.params;
      
      const resultados = await prisma.encuesta.findUnique({
        where: { id: parseInt(id) },
        include: {
          preguntas: {
            include: {
              opciones: {
                include: {
                  respuestas: true
                }
              },
              respuestas: true
            }
          },
          respuestas: {
            include: {
              respuestas: true
            }
          }
        }
      });

      if (!resultados) {
        return res.status(404).json({ message: 'Encuesta no encontrada' });
      }

      // Procesar resultados
      const estadisticas = {
        totalRespuestas: resultados.respuestas.length,
        preguntas: resultados.preguntas.map(pregunta => {
          let estadisticasPregunta = {
            id: pregunta.id,
            texto: pregunta.texto,
            tipo: pregunta.tipo,
            totalRespuestas: pregunta.respuestas.length
          };

          if (pregunta.tipo === 'opcion_multiple' || pregunta.tipo === 'seleccion_unica') {
            estadisticasPregunta.opciones = pregunta.opciones.map(opcion => ({
              texto: opcion.texto,
              cantidad: opcion.respuestas.length,
              porcentaje: (opcion.respuestas.length / pregunta.respuestas.length * 100) || 0
            }));
          } else if (pregunta.tipo === 'escala') {
            const valores = pregunta.respuestas.map(r => r.valorEscala).filter(v => v !== null);
            estadisticasPregunta.promedio = valores.length ? 
              valores.reduce((a, b) => a + b, 0) / valores.length : 0;
          }

          return estadisticasPregunta;
        })
      };

      res.json(estadisticas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = encuestaController;