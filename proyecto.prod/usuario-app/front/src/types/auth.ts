export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  };
};

export type RegisterRequest = {
  email: string;
  password: string;
  nombre?: string;
  apellido?: string;
};

export type RegisterResponse = {
  id: number;
  email: string;
};
