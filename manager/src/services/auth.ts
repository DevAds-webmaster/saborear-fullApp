export type AuthUser = {
  id: string;
  email: string;
};

const STORAGE_KEY = "manager.auth.session";

interface StoredSession {
  access_token: string;
  refresh_token: string;
  /** epoch ms */
  expires_at: number;
  user: AuthUser;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: { id: string; email?: string };
}

let refreshTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<(user: AuthUser | null) => void>();

function getBaseUrl(): string {
  const u = import.meta.env.VITE_SUPABASE_URL;
  return typeof u === "string" ? u.replace(/\/+$/, "") : "";
}

function getAnonKey(): string {
  const k = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return typeof k === "string" ? k : "";
}

function mapUser(u: { id: string; email?: string }): AuthUser {
  return { id: u.id, email: u.email ?? "" };
}

function clearRefreshTimer(): void {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

function notifyListeners(user: AuthUser | null): void {
  listeners.forEach((cb) => {
    try {
      cb(user);
    } catch {
      // ignore listener errors
    }
  });
}

async function readErrorMessage(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const j = JSON.parse(text) as Record<string, unknown>;
    const msg =
      (typeof j.error_description === "string" && j.error_description) ||
      (typeof j.msg === "string" && j.msg) ||
      (typeof j.message === "string" && j.message) ||
      (typeof j.error === "string" && j.error);
    if (msg) return msg;
  } catch {
    // ignore JSON parse
  }
  return text || `Error HTTP ${res.status}`;
}

function scheduleAutoRefresh(expiresInSeconds: number): void {
  clearRefreshTimer();
  const delayMs = Math.max((expiresInSeconds - 60) * 1000, 1000);
  refreshTimer = setTimeout(() => {
    void (async () => {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      let session: StoredSession;
      try {
        session = JSON.parse(raw) as StoredSession;
      } catch {
        return;
      }
      const ok = await refreshWithToken(session.refresh_token);
      if (!ok) {
        clearStoredSession();
        notifyListeners(null);
      }
    })();
  }, delayMs);
}

function persistFromTokenResponse(data: TokenResponse): void {
  const expiresIn = data.expires_in ?? 3600;
  const expires_at = Date.now() + expiresIn * 1000;
  const user = mapUser(data.user);
  const session: StoredSession = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at,
    user,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  scheduleAutoRefresh(expiresIn);
  notifyListeners(user);
}

function clearStoredSession(): void {
  clearRefreshTimer();
  localStorage.removeItem(STORAGE_KEY);
}

async function refreshWithToken(refresh_token: string): Promise<boolean> {
  const base = getBaseUrl();
  const anon = getAnonKey();
  if (!base || !anon) return false;

  const res = await fetch(`${base}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: {
      apikey: anon,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token }),
  });
  if (!res.ok) return false;
  const data = (await res.json()) as TokenResponse;
  if (!data.access_token || !data.refresh_token || !data.user) return false;
  persistFromTokenResponse(data);
  return true;
}

async function signIn(email: string, password: string): Promise<AuthUser> {
  const base = getBaseUrl();
  const anon = getAnonKey();
  if (!base || !anon) {
    throw new Error("Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env");
  }

  const res = await fetch(`${base}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: anon,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  const data = (await res.json()) as TokenResponse;
  if (!data.access_token || !data.refresh_token || !data.user) {
    throw new Error("Respuesta de login inválida");
  }
  persistFromTokenResponse(data);
  return mapUser(data.user);
}

async function signOut(): Promise<void> {
  const base = getBaseUrl();
  const anon = getAnonKey();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw && base && anon) {
    try {
      const session = JSON.parse(raw) as StoredSession;
      await fetch(`${base}/auth/v1/logout`, {
        method: "POST",
        headers: {
          apikey: anon,
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });
    } catch {
      // seguir y borrar sesión local
    }
  }
  clearStoredSession();
  notifyListeners(null);
}

async function getSession(): Promise<AuthUser | null> {
  if (typeof localStorage === "undefined") return null;
  const base = getBaseUrl();
  const anon = getAnonKey();
  if (!base || !anon) return null;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  let session: StoredSession;
  try {
    session = JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
  if (!session.access_token || !session.refresh_token) {
    clearStoredSession();
    return null;
  }

  const skewMs = 60_000;
  if (session.expires_at - Date.now() < skewMs) {
    const ok = await refreshWithToken(session.refresh_token);
    if (!ok) {
      clearStoredSession();
      return null;
    }
    const raw2 = localStorage.getItem(STORAGE_KEY);
    if (!raw2) return null;
    try {
      session = JSON.parse(raw2) as StoredSession;
    } catch {
      return null;
    }
  }

  const remainingSec = Math.max(0, Math.floor((session.expires_at - Date.now()) / 1000));
  scheduleAutoRefresh(remainingSec);
  return session.user;
}

function onAuthChange(cb: (user: AuthUser | null) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export const authService = {
  signIn,
  signOut,
  getSession,
  onAuthChange,
};
