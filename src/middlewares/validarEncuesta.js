const validarEncuesta = {
    crear: (req, res, next) => {
        const { titulo, preguntas, creadorId } = req.body;

        if (!titulo || !preguntas || !creadorId) {
            return res.status(400).json({
                error: 'Faltan campos requeridos (titulo, preguntas, creadorId)'
            });
        }

        if (!Array.isArray(preguntas) || preguntas.length === 0) {
            return res.status(400).json({
                error: 'Debe incluir al menos una pregunta'
            });
        }

        for (const pregunta of preguntas) {
            if (!pregunta.texto || !pregunta.tipo) {
                return res.status(400).json({
                    error: 'Cada pregunta debe tener texto y tipo'
                });
            }

            if (['opcion_multiple', 'seleccion_unica'].includes(pregunta.tipo) &&
                (!pregunta.opciones || pregunta.opciones.length < 2)) {
                return res.status(400).json({
                    error: 'Las preguntas de opción múltiple deben tener al menos 2 opciones'
                });
            }
        }

        next();
    },

    responder: (req, res, next) => {
        const { usuarioId, ciudadanoId, respuestas } = req.body;

        if (!usuarioId || !ciudadanoId || !respuestas) {
            return res.status(400).json({
                error: 'Faltan campos requeridos (usuarioId, ciudadanoId, respuestas)'
            });
        }

        if (!Array.isArray(respuestas) || respuestas.length === 0) {
            return res.status(400).json({
                error: 'Debe incluir al menos una respuesta'
            });
        }

        for (const respuesta of respuestas) {
            if (!respuesta.preguntaId) {
                return res.status(400).json({
                    error: 'Cada respuesta debe tener preguntaId'
                });
            }
        }

        next();
    }
};

module.exports = validarEncuesta;