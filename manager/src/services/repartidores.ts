import type { Repartidor, RepartidorPayload } from "../types";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const backendKey = import.meta.env.VITE_BACKEND_KEY;

const headers = () => ({
  Accept: "application/json",
  "Content-Type": "application/json",
  Authorization: `Bearer ${backendKey}`,
});

export const repartidoresService = {
  async list(): Promise<Repartidor[]> {
    const response = await fetch(`${backendUrl}/repartidores`, { method: "GET", headers: headers() });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.message || "No se pudo obtener el listado de repartidores");
    }
    return Array.isArray(data.repartidores) ? data.repartidores : [];
  },

  async create(payload: RepartidorPayload): Promise<Repartidor> {
    const response = await fetch(`${backendUrl}/repartidores`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.repartidor) {
      throw new Error(data?.message || "No se pudo crear el repartidor");
    }
    return data.repartidor;
  },

  async update(id: string, payload: RepartidorPayload): Promise<Repartidor> {
    const response = await fetch(`${backendUrl}/repartidores/${id}`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.repartidor) {
      throw new Error(data?.message || "No se pudo actualizar el repartidor");
    }
    return data.repartidor;
  },

  async remove(id: string): Promise<string> {
    const response = await fetch(`${backendUrl}/repartidores/${id}`, { method: "DELETE", headers: headers() });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.message || "No se pudo eliminar el repartidor");
    }
    return data?.message || "Repartidor eliminado";
  },
};
