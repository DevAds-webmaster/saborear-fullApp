import { useEffect, useState } from "react";
import { authService } from "../../services/auth";
import type { StaffUser } from "../../types";

export default function StaffSection() {
  const [loading, setLoading] = useState<boolean>(true);
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Carga automática de staff al abrir la sección
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      const result = await authService.getStaff();
      if (result) {
        setStaff(result);
      } else {
        setError("No se pudo obtener el listado de staff");
      }
      setLoading(false);
    };
    load();
  }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Usuario y contraseña son obligatorios");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    const created = await authService.registerStaff({ username, password });
    if (!created) {
      setError("No se pudo crear el usuario staff");
    } else {
      setSuccess(`Usuario ${created.username} creado`);
      setStaff((prev) => [...prev, created]);
      setUsername("");
      setPassword("");
      setShowForm(false);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-bold mb-4">Usuarios del staff</h1>

      <div className="mb-4">
        <button
          className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
          onClick={() => setShowForm((s) => !s)}
        >
          {showForm ? "Cancelar" : "Agregar usuario staff"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={onCreate} className="mb-6 border rounded p-4 space-y-3 bg-white">
          <div className="flex flex-col">
            <label className="text-sm mb-1">Usuario</label>
            <input
              className="border rounded px-3 py-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="usuario"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm mb-1">Contraseña</label>
            <input
              className="border rounded px-3 py-2"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="contraseña"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
            >
              {saving ? "Creando..." : "Crear staff"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-green-700 text-sm">{success}</p>}
        </form>
      )}

      <div className="border rounded bg-white">
        <div className="px-4 py-2 border-b font-medium">Listado de staff
          <br />
          <span className="text-sm text-gray-500">Los usuarios staff pueden acceder solo a la seccion Home y Gestionar el Menu</span>
        </div>
        
        {loading ? (
          <div className="p-4 text-sm text-gray-500">Cargando...</div>
        ) : staff.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">No hay usuarios staff aún.</div>
        ) : (
          <ul className="divide-y">
            {staff.map((staff) => (
              <li key={staff.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-sm font-medium">Usuario: {staff.username}</div>
                  <div className="text-xs text-gray-500">Rol: {staff.role}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                    onClick={async () => {
                      const password = prompt("Ingrese la nueva contraseña para el usuario staff")
                      if(password){
                        const data = await authService.changePasswordStaff(staff.id, password);
                        if(data){
                          alert("Contraseña cambiada correctamente");
                        } else {
                          alert("Error al cambiar la contraseña");
                        }
                      }
                    }}
                  >
                    Cambiar contraseña
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                    onClick={async () => {
                      const res = confirm("Estas seguro de querer eliminar este usuario staff?")
                      if(res){
                        const data = await authService.deleteStaff(staff.id);
                        if(data){
                          setStaff((prev) => prev.filter((s) => s.id !== staff.id));
                          alert("Usuario staff eliminado correctamente");
                        } else {
                          alert("Error al eliminar el usuario staff");
                        }
                      }
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
