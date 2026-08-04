export const esTelefonoValido = (telefono: string) => {
  const limpio = telefono.replace(/[^0-9]/g, "");
  // Acepta formato local o internacional argentino (+54 o 549)
  return /^(\+?54)?9?\d{10}$/.test(limpio);
};

export const esDniValido = (dni: string) => {
  return /^\d{7,9}$/.test(dni);
};

export const esMayorDeEdad = (fechaNacimiento: Date) => {
  const hoy = new Date();
  const edad =
    hoy.getFullYear() -
    fechaNacimiento.getFullYear() -
    (hoy < new Date(hoy.getFullYear(), fechaNacimiento.getMonth(), fechaNacimiento.getDate()) ? 1 : 0);
  return edad >= 18;
};

export const validarCamposRegistro = (data: {
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  dni: string;
  password: string;
  fecha: Date;
}) => {
  const { email, nombre, apellido, telefono, dni, password, fecha } = data;
  if (!email || !nombre || !telefono || !dni || !password || !apellido) {
    return "Por favor complete todos los campos.";
  }

  if (email.length < 4 || nombre.length < 4 || apellido.length < 4 || password.length < 4) {
    return "El correo, nombre, apellido y contraseña deben tener al menos 4 caracteres.";
  }

  if (!esDniValido(dni)) {
    return "El DNI debe tener entre 7 y 9 números.";
  }

  if (!esTelefonoValido(telefono)) {
    return "El número de teléfono debe ser válido (puede incluir +54 o 549).";
  }

  if (!esMayorDeEdad(fecha)) {
    return "Debe ser mayor de edad para registrarse.";
  }

  return null; // todo válido
};
