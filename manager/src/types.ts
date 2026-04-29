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
