export type User = {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string | null;
  puntos?: number; // para mostrar en el menú
};

export type Address = {
  id: number;
  calle?: string | null;
  numero?: string | null;
  barrio?: string | null;
  referencias?: string | null;
  latitud: number;
  longitud: number;
  usuario_idusuario: number; // FK
};

export type Residuo = {
  id: number;                 // idtipo_reciclable
  descripcion: string;        // e.g. "plástico", "cartón", "vidrio", "compostables"
};

export type PedidoDetalle = {
  id: number;                 // iddetalle_pedido
  pedidos_idpedidos: number;  // FK a la cabecera (si existe)
  tipo_reciclable_idtipo_reciclable: number; // FK a Residuo
  id_recolector?: number | null;
  puntoRecoleccion?: number | null;
  orden?: number | null;
  observaciones?: string | null;
  peso_kg?: number | null;
  created_at?: string; // para historial
};
