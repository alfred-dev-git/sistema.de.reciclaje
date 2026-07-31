// src/services/api/requests.ts
import { api } from "./http";

export type Residuo = { id: number; descripcion: string };

export type CronogramaItem = {
  id: number;
  dia_semana: number;
  semana_mes: number;
  hora_inicio: string;
  hora_fin: string;
  tipo_reciclable: string;
};
export type NotificacionItem = {
  titulo: string;
  mensaje: string;
};
// Soporta respuestas tipo {items: []} o array directo por si el backend cambia.
export async function listResiduos(): Promise<Residuo[]> {
  const res = await api.get<{ items?: any[] } | any[]>("/residuos");
  const items = Array.isArray(res) ? res : (res.items ?? []);
  return items.map((r) => ({
    id: Number(r.id ?? r.idtipo_reciclable),
    descripcion: String(r.descripcion ?? ""),
  }));
}

export async function listCronograma(): Promise<CronogramaItem[]> {
  const res = await api.get<{ items?: any[] } | any[]>("/residuos/cronograma");
  const items = Array.isArray(res) ? res : (res.items ?? []);

  return items.map((r) => ({
    id: Number(r.id ?? 0),
    dia_semana: Number(r.dia_semana ?? 0),
    semana_mes: Number(r.semana_mes ?? 0),
    hora_inicio: String(r.hora_inicio ?? ""),
    hora_fin: String(r.hora_fin ?? ""),
    tipo_reciclable: String(r.tipo_reciclable ?? ""),
  }));
}

export async function listNotificaciones(): Promise<NotificacionItem[]> {
  const res = await api.get<{ items?: any[] } | any[]>(
    "/residuos/notificaciones"
  );

  const items = Array.isArray(res) ? res : (res.items ?? []);

  return items.map((n) => ({
    titulo: String(n.titulo ?? ""),
    mensaje: String(n.mensaje ?? ""),
  }));
}
// 🔴 Cambio mínimo: incluir tipo_reciclable_idtipo_reciclable
export type CreatePedidoPayload = {
  id_direccion: number;
  tipo_reciclable_idtipo_reciclable: number; // ← obligatorio según tu tabla/endpoint
};

export async function createPedido(payload: CreatePedidoPayload) {
  const body = {
    id_direccion: Number(payload.id_direccion),
    tipo_reciclable_idtipo_reciclable: Number(
      payload.tipo_reciclable_idtipo_reciclable
    ),
  };
  return api.post<{ id: number; idpedidos?: number }>("/pedidos", body);
}

// Dejamos createDetallePedido por compatibilidad (aunque ahora no sea necesario)
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


//GEOCODING PARA PRODUCCIÓN
// export async function autocompleteDireccion(input: string) {
//   // el back ya espera ?input=...
//   return api.get(`/addresses/google/autocomplete?input=${encodeURIComponent(input)}`);
// }

// export async function geocodeDireccion(address: string) {
//   return api.get(`/addresses/google/geocode?address=${encodeURIComponent(address)}`);
// }
