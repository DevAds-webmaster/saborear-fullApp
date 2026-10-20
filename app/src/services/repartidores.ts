import type { RepartidorCercano, RepartidoresCercanosResponse } from '../types';

const authHeaders = () => ({
    'ngrok-skip-browser-warning': 'true',
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem("authToken")}`
});

export const repartidoresService = {
    async getCercanos(restoId: string): Promise<RepartidoresCercanosResponse> {
        const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/repartidores/cercanos?restoId=${encodeURIComponent(restoId)}`,
            { headers: authHeaders() }
        );
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data?.message || 'No se pudieron obtener los repartidores');
        }
        return {
            sinUbicacion: Boolean(data?.sinUbicacion),
            repartidores: Array.isArray(data?.repartidores) ? data.repartidores : [],
        };
    },

    async calificar(repartidorId: string, restoId: string, calif: number, observacion: string): Promise<RepartidorCercano> {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/repartidores/${repartidorId}/calificacion`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ restoId, calif, observacion }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.repartidor) {
            throw new Error(data?.message || 'No se pudo guardar la calificación');
        }
        return data.repartidor;
    },
};
