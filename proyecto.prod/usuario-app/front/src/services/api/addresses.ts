// src/services/api/addresses.ts
import { api } from "./http";

export type Address = {
  id: number; // alias de iddirecciones
  usuario_idusuario: number;
  latitud: number;
  longitud: number;
  calle?: string | null;
  numero?: string | null;
  barrio?: string | null;
  referencias?: string | null;
};

export async function createAddress(payload: Omit<Address, "id">) {
  const body = {
    ...payload,
    latitud: Number(payload.latitud),
    longitud: Number(payload.longitud),
  };
  return api.post<{ id: number }>("/addresses", body);
}

export async function listUserAddresses(userId: number) {
  const data = await api.get<{ addresses: any[] }>(`/users/${userId}/addresses`);
  const items: Address[] = (data.addresses || []).map((a) => ({
    id: Number(a.id),
    usuario_idusuario: Number(a.usuario_idusuario),
    latitud: Number(a.latitud),
    longitud: Number(a.longitud),
    calle: a.calle ?? null,
    numero: a.numero ?? null,
    barrio: a.barrio ?? null,
    referencias: a.referencias ?? null,
  }));
  return items;
}
