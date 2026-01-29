import { type Resto } from '../types';

export const restoService = {
    async getRestoBySlug(restoSlug: string | undefined): Promise<Resto | null> {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/resto/slug/${restoSlug}`,{
                headers: {
                    'ngrok-skip-browser-warning': 'true',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
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
}

