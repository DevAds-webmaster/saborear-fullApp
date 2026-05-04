import { useMemo, useState } from "react";
import { authService } from "../services/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const envError = useMemo(() => {
    if (!import.meta.env.VITE_SUPABASE_URL?.trim()) return "Falta VITE_SUPABASE_URL en .env";
    if (!import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()) return "Falta VITE_SUPABASE_ANON_KEY en .env";
    return "";
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Completá email y contraseña.");
      return;
    }
    if (envError) return;
    try {
      setLoading(true);
      await authService.signIn(email.trim(), password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-center mb-1">Manager — Sabore.ar</h1>
          <p className="text-sm text-gray-600 text-center mb-6">Iniciá sesión para continuar</p>
          <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">Email</label>
              <input
                className="border rounded px-3 py-2 w-full"
                type="email"
                autoComplete="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || !!envError}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">Contraseña</label>
              <input
                className="border rounded px-3 py-2 w-full"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || !!envError}
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
              disabled={loading || !!envError}
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
          {envError && <p className="mt-4 text-sm text-red-600 font-medium">{envError}</p>}
          {error && !envError && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
