import { useEffect, useState } from "react";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import { authService, type AuthUser } from "./services/auth";

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const off = authService.onAuthChange(setUser);
    void authService.getSession().then((u) => {
      setUser(u);
      setChecking(false);
    });
    return off;
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-100 text-gray-600">
        Cargando...
      </div>
    );
  }
  if (!user) return <Login />;
  return <Dashboard user={user} onLogout={() => authService.signOut()} />;
}
