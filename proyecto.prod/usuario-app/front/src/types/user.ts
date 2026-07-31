export type User = {
  id: number;
  dni: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string | null;
  fecha_nacimiento?: string;
  municipio_idmunicipio?: number;
  sexo?: "M" | "F" | "O";
  foto_perfil?: string | null;
};

export type Address = {
  id: number;
  calle?: string | null;
  numero?: string | null;
  barrio?: string | null;
  referencias?: string | null;
  latitud: number;
  longitud: number;
};

export type Residuo = {
  id: number;
  descripcion: string;
};
