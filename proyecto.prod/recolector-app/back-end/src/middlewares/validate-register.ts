import { Request, Response, NextFunction } from "express";

// --- Funciones de validación ---
const esTelefonoValido = (telefono: string) => {
  const limpio = telefono.replace(/[^0-9]/g, "");
  return /^(\+?54)?9?\d{10}$/.test(limpio);
};

const esDniValido = (dni: string) => /^\d{7,9}$/.test(dni);

const esMayorDeEdad = (fechaNacimiento: string) => {
  const fecha = new Date(fechaNacimiento);
  const hoy = new Date();
  const edad =
    hoy.getFullYear() -
    fecha.getFullYear() -
    (hoy <
    new Date(hoy.getFullYear(), fecha.getMonth(), fecha.getDate())
      ? 1
      : 0);
  return edad >= 18;
};

// --- Middleware principal ---
export const validarRegistro = (req: Request, res: Response, next: NextFunction): void => {
  const { email, nombre, apellido, telefono, dni, password, fecha_nacimiento } = req.body;
 
  if (!email || !nombre || !apellido || !telefono || !dni || !password || !fecha_nacimiento) {
    res.status(400).json({ message: "Por favorrrr complete todos los campos." });
    return;
  }

  if (email.length < 4 || nombre.length < 4 || apellido.length < 4 || password.length < 4) {
    res
      .status(400)
      .json({ message: "El correo, nombre, apellido y contraseña deben tener al menos 4 caracteres." });
    return;
  }

  if (!esDniValido(dni)) {
    res.status(400).json({ message: "El DNI debe tener entre 7 y 9 números." });
    return;
  }

  if (!esTelefonoValido(telefono)) {
    res
      .status(400)
      .json({ message: "El número de teléfono debe ser válido (puede incluir +54 o 549)." });
    return;
  }

  if (!esMayorDeEdad(fecha_nacimiento)) {
    res.status(400).json({ message: "Debe ser mayor de edad para registrarse." });
    return;
  }

  // ✅ Si todo está bien, continúa al siguiente middleware / controller
  next();
};
