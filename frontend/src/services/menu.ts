import { type User } from '../types';


export const authService ={
    async getMenu(usuario: string, password: string): Promise<{ user: User; token: string } | null> {
        try {
          // Call the login edge function
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_BACKEND_KEY}`,
            },
            body: JSON.stringify({ username: usuario, password: password }),
          });
    
          if (!response.ok) {
            return null;
          }
    
          const data = await response.json();
          return data;
        } catch (error) {
          console.error('Login error:', error);
          return null;
        }
      },
};