import { type Resto } from '../types';

export const restoService = {
    async getRestoById(restoId: string): Promise<Resto | null> {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/resto/id/${restoId}`);
            if (!response.ok) {
                return null;
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Resto error:', error);
            return null;
        }
    },

    async getRestoBySlug(restoSlug: string | undefined): Promise<Resto | null> {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/resto/slug/${restoSlug}`);
            if (!response.ok) {
                return null;
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Resto error:', error);
            return null;
        }
    },

    async updateResto(restoId: string, restoData: Partial<Resto>): Promise<Resto | null> {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/resto/${restoId}`, {
                method: 'PUT', // o 'PATCH' si tu API usa ese método
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("authToken")}`
                },
                body: JSON.stringify({
                    "token": localStorage.getItem("authToken"),
                    "restoData": restoData
                }),
            });

            if (!response.ok) {
                console.error('Error al actualizar el resto');
                return null;
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Update resto error:', error);
            return null;
        }
    },

    async getOptionStyles(): Promise<Record<string, Array<{ id: string; label: string; value: string }>> | null> {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/macros/style-options`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("authToken")}`
                }
            });

            if (!response.ok) {
                console.error('Error al obtener opciones de estilos');
                return null;
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get option styles error:', error);
            return null;
        }
    }
};
