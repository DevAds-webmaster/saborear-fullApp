export interface ManagerUser {
  id: string;
  username: string;
  email: string;
  role: "admin" | "staff";
  restos: string[];
  resto: string | null;
  /** Id del resto visible: restos[0] si existe, si no user.resto */
  primaryRestoId?: string;
  /** Slug del resto principal (viene del backend con populate) */
  slug?: string;
  my_staff: string[];
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  /** Admin → /register; Staff → /register-staff (resto obligatorio) */
  registerRole: "admin" | "staff";
  /** Admin: opcional. Staff: obligatorio */
  resto?: string;
}

export interface UpdateUserPayload {
  username: string;
  email: string;
  role: "admin" | "staff";
  resto: string;
}

export interface UbicacionRepartidor {
  lat: number;
  lon: number;
  direccion?: string;
}

export interface CalificacionRepartidor {
  id_resto: string;
  /** null si el resto fue eliminado */
  resto_nombre: string | null;
  resto_slug: string | null;
  calif: number;
  observacion: string;
  fecha: string | null;
}

export interface Repartidor {
  _id: string;
  nombre: string;
  dni: string;
  telefono: string;
  ubicacion: UbicacionRepartidor;
  radio_km: number;
  /** Promedio 1..5 con un decimal; 0 si no tiene votos */
  promedio: number;
  cantidad: number;
  calificaciones: CalificacionRepartidor[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RepartidorPayload {
  nombre: string;
  dni: string;
  telefono: string;
  ubicacion: UbicacionRepartidor;
  radio_km: number;
}
