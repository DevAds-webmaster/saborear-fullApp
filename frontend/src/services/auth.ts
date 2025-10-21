
import { type User } from '../types';

export const authService = {
  async login(usuario: string, password: string): Promise<{ user: User; token: string } | null> {
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

  async verifyToken(token: string): Promise<User | null> {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_BACKEND_KEY}`,
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  },
};