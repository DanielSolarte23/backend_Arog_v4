const { 
    validateNombres, 
    validateApellidos, 
    validateEmail, 
    validatePassword, 
    validatePhone 
  } = require('../utils/validation');
  
  // Middleware para validar datos de registro
  const validateRegistration = (req, res, next) => {
    const { nombres, apellidos, correoElectronico, contraseña, telefono } = req.body;
    const errors = [];
  
    // Validar campos obligatorios
    const nombresError = validateNombres(nombres);
    if (nombresError) errors.push(nombresError);
  
    const apellidosError = validateApellidos(apellidos);
    if (apellidosError) errors.push(apellidosError);
  
    const emailError = validateEmail(correoElectronico);
    if (emailError) errors.push(emailError);
  
    const passwordError = validatePassword(contraseña);
    if (passwordError) errors.push(passwordError);
  
    // Validar campo opcional
    if (telefono) {
      const phoneError = validatePhone(telefono);
      if (phoneError) errors.push(phoneError);
    }
  
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }
  
    next();
  };
  
  // Middleware para validar datos de inicio de sesión
  const validateLogin = (req, res, next) => {
    const { correoElectronico, contraseña } = req.body;
    const errors = [];
  
    const emailError = validateEmail(correoElectronico);
    if (emailError) errors.push(emailError);
  
    if (!contraseña) {
      errors.push('La contraseña es requerida');
    }
  
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }
  
    next();
  };
  
  module.exports = {
    validateRegistration,
    validateLogin
  };