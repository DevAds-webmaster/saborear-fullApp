import type { ManagerUser, RegisterPayload, UpdateUserPayload } from "../types";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const backendKey = import.meta.env.VITE_BACKEND_KEY;

if (!backendUrl || !backendKey) {
  console.warn("Faltan VITE_BACKEND_URL o VITE_BACKEND_KEY en manager/.env");
}

export const usersService = {
  async getUsers(): Promise<ManagerUser[]> {
    const response = await fetch(`${backendUrl}/auth/users`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${backendKey}`,
      },
    });

    if (!response.ok) {
      throw new Error("No se pudo obtener el listado de usuarios");
    }

    const data = await response.json();
    return Array.isArray(data.users) ? data.users : [];
  },

  async registerAdmin(payload: Pick<RegisterPayload, "username" | "email" | "password" | "resto">): Promise<string> {
    const body: Record<string, string> = {
      username: payload.username,
      email: payload.email,
      password: payload.password,
    };
    if (payload.resto?.trim()) {
      body.resto = payload.resto.trim();
    }

    const response = await fetch(`${backendUrl}/auth/register`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${backendKey}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.message || "No se pudo registrar el usuario");
    }

    return data?.message || "Usuario registrado";
  },

  async registerStaff(payload: {
    username: string;
    password: string;
    email: string;
    resto: string;
  }): Promise<string> {
    const response = await fetch(`${backendUrl}/auth/register-staff`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${backendKey}`,
      },
      body: JSON.stringify({
        username: payload.username,
        password: payload.password,
        email: payload.email || undefined,
        resto: payload.resto.trim(),
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.message || "No se pudo registrar el staff");
    }

    return data?.message || "Staff creado";
  },

  async updateUser(userId: string, payload: UpdateUserPayload): Promise<string> {
    const response = await fetch(`${backendUrl}/auth/users/${userId}`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${backendKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.message || "No se pudo actualizar el usuario");
    }

    return data?.message || "Usuario actualizado";
  },

  async resetUserPassword(userId: string, password: string): Promise<string> {
    const response = await fetch(`${backendUrl}/auth/users/${userId}/password`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${backendKey}`,
      },
      body: JSON.stringify({ password }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.message || "No se pudo resetear la contraseña");
    }

    return data?.message || "Contraseña reseteada";
  },
};
