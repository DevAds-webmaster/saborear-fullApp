
import { type StaffUser, type User } from '../types';

export const authService = {
  async login(usuario: string, password: string): Promise<{ user: User; token: string } | null> {
    try {
      // Call the login edge function
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Accept': 'application/json',
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
          'ngrok-skip-browser-warning': 'true',
          'Accept': 'application/json',
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

  // Devuelve los IDs de staff del admin autenticado
  async getStaff(): Promise<StaffUser[] | null> {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/get-staff`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("authToken")}`,        // usa el token del admin
        },
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.staff as StaffUser[];
    } catch (error) {
      console.error('Get staff error:', error);
      return null;
    }
  },

  // Crea un staff con username/password (email opcional)
  async registerStaff(
    payload: { username: string; password: string; }
  ): Promise<{ id: string; username: string; role: string; resto: string } | null> {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/register-staff`, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("authToken")}`,        // usa el token del admin
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.staff; // { id, username, role, resto }
    } catch (error) {
      console.error('Register staff error:', error);
      return null;
    }
  },
  async deleteStaff(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/delete-staff`, {
        method: 'DELETE',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("authToken")}`,        // usa el token del admin
        },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) return false;
      return true;
    } catch (error) {
      console.error('Delete staff error:', error);
      return false;
    }
  },
  async changePasswordStaff(id: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/reset-password-staff`, {
        method: 'PUT',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("authToken")}`,        // usa el token del admin
        },
        body: JSON.stringify({ id, password }),
      });
      if (!response.ok) return false;
      return true;
    } catch (error) {
      console.error('Change password staff error:', error);
      return false;
    }
  }
};