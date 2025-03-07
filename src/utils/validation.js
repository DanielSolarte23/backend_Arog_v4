const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/; // 3-20 caracteres, sin espacios
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Formato de correo válido
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/; // Contraseña segura
const phoneRegex = /^\+?[0-9]{10,15}$/; // Formato internacional de teléfono

const validateNombres = (nombres) => {
  if (!nombres || nombres.trim().length < 2 || nombres.trim().length > 200) {
    return 'El nombre debe tener entre 2 y 200 caracteres';
  }
  return null;
};

const validateApellidos = (apellidos) => {
  if (!apellidos || apellidos.trim().length < 2 || apellidos.trim().length > 200) {
    return 'Los apellidos deben tener entre 2 y 200 caracteres';
  }
  return null;
};

const validateEmail = (email) => {
  if (!email || !emailRegex.test(email)) {
    return 'El correo electrónico no es válido';
  }
  return null;
};

const validatePassword = (password) => {
  if (!password || !passwordRegex.test(password)) {
    return 'La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula, un número y un carácter especial (@#$%^&+=!)';
  }
  return null;
};

const validatePhone = (phone) => {
  if (phone && !phoneRegex.test(phone)) {
    return 'El número de teléfono no es válido';
  }
  return null;
};

module.exports = {
  usernameRegex,
  emailRegex,
  passwordRegex,
  phoneRegex,
  validateNombres,
  validateApellidos,
  validateEmail,
  validatePassword,
  validatePhone
};