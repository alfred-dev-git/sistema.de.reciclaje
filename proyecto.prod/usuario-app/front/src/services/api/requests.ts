// src/services/api/requests.ts
import { api } from "./http";

export type Residuo = { id: number; descripcion: string };

// Conservamos listResiduos.
// Soporta respuestas tipo {items: []} o array directo por si el backend cambia.
export async function listResiduos(): Promise<Residuo[]> {
  const res = await api.get<{ items?: any[] } | any[]>("/residuos");
  const items = Array.isArray(res) ? res : (res.items ?? []);
  return items.map((r) => ({
    id: Number(r.id ?? r.idtipo_reciclable),
    descripcion: String(r.descripcion ?? ""),
  }));
}

// 🔴 Cambio mínimo: incluir tipo_reciclable_idtipo_reciclable
export type CreatePedidoPayload = {
  usuario_idusuario: number;
  id_direccion: number;
  tipo_reciclable_idtipo_reciclable: number; // ← obligatorio según tu tabla/endpoint
  estado?: number;
  total_puntos?: number;
};

export async function createPedido(payload: CreatePedidoPayload) {
  const body = {
    usuario_idusuario: Number(payload.usuario_idusuario),
    id_direccion: Number(payload.id_direccion),
    tipo_reciclable_idtipo_reciclable: Number(
      payload.tipo_reciclable_idtipo_reciclable
    ),
    ...(payload.estado !== undefined && { estado: Number(payload.estado) }),
    ...(payload.total_puntos !== undefined && {
      total_puntos: Number(payload.total_puntos),
    }),
  };
  return api.post<{ id: number; idpedidos?: number }>("/pedidos", body);
}

// Dejamos createDetallePedido por compatibilidad (aunque ahora no sea necesario)
export type CreateDetallePayload = {
  pedidos_idpedidos: number;
  tipo_reciclable_idtipo_reciclable: number;
  puntoRecoleccion: number;
  observaciones?: string | null;
  peso_kg?: number | null;
  id_recolector?: number | null;
  orden?: number | null;
};

export async function createDetallePedido(payload: CreateDetallePayload) {
  const body = {
    pedidos_idpedidos: Number(payload.pedidos_idpedidos),
    tipo_reciclable_idtipo_reciclable: Number(
      payload.tipo_reciclable_idtipo_reciclable),
    puntoRecoleccion: Number(payload.puntoRecoleccion),
    observaciones: payload.observaciones ?? null,
    peso_kg: payload.peso_kg == null ? 0 : Number(payload.peso_kg),
    id_recolector:
      payload.id_recolector == null ? null : Number(payload.id_recolector),
    orden: payload.orden == null ? null : Number(payload.orden),
  };
  return api.post<{ id: number }>("/detalle_pedido", body);
}

export async function getHistorial(userId: number) {
  const res = await api.get<{ items?: any[] } | any[]>(
    `/pedidos/users/${userId}/historial`
  );
  return Array.isArray(res) ? res : (res.items ?? []);
}
// Traer detalle completo de un pedido
export async function getDetallePedido(idPedido: number) {
  return api.get(`/pedidos/detalle/${idPedido}`);
}

// Cancelar un pedido (envía el id del pedido)
export async function cancelarPedido(idPedido: number) {
  return api.put(`/pedidos/${idPedido}/cancelar`);
}
