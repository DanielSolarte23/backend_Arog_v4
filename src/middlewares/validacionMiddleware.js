const validacionEsquemas = (schema) => {
  return (req, res, next) => {
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
      const errores = resultado.error.issues.map(issue => issue.message); 
      return res.status(400).json({ error: errores });
    }

    next();
  };
};

module.exports = validacionEsquemas;
