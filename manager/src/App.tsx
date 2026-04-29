import { Fragment, useEffect, useMemo, useState } from "react";
import { orphanImagesService } from "./services/orphanImages";
import type { ImageKitOrphanFile } from "./services/orphanImages";
import { usersService } from "./services/users";
import type { ManagerUser, RegisterPayload, UpdateUserPayload } from "./types";

function orphanDisplayName(f: ImageKitOrphanFile): string {
  const n = f.name?.trim();
  if (n) return n;
  const fp = f.filePath?.trim();
  if (!fp) return "(sin nombre)";
  const segs = fp.split("/").filter(Boolean);
  const last = segs.length ? segs[segs.length - 1] : "";
  try {
    return decodeURIComponent(last).trim() || "(sin nombre)";
  } catch {
    return last.trim() || "(sin nombre)";
  }
}

const initialForm: RegisterPayload = {
  username: "",
  email: "",
  password: "",
  registerRole: "admin",
  resto: "",
};

/** Id de resto mostrado: restos[0] si existe, si no resto */
function visibleRestoId(u: ManagerUser): string {
  if (u.primaryRestoId) return u.primaryRestoId;
  if (Array.isArray(u.restos) && u.restos.length > 0) return u.restos[0];
  return u.resto || "";
}

export default function App() {
  const [users, setUsers] = useState<ManagerUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [form, setForm] = useState<RegisterPayload>(initialForm);
  const [editingUserId, setEditingUserId] = useState<string>("");
  const [editForm, setEditForm] = useState<UpdateUserPayload>({
    username: "",
    email: "",
    role: "admin",
    resto: "",
  });

  const [orphans, setOrphans] = useState<ImageKitOrphanFile[]>([]);
  const [detectLoading, setDetectLoading] = useState(false);
  const [purgeLoading, setPurgeLoading] = useState(false);
  const [orphanSectionError, setOrphanSectionError] = useState("");
  const [purgeResultMessage, setPurgeResultMessage] = useState("");
  const [detectionDone, setDetectionDone] = useState(false);

  const envError = useMemo(() => {
    if (!import.meta.env.VITE_BACKEND_URL) return "Falta VITE_BACKEND_URL en .env";
    if (!import.meta.env.VITE_BACKEND_KEY) return "Falta VITE_BACKEND_KEY en .env";
    return "";
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await usersService.getUsers();
      setUsers(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const onChange = (key: keyof RegisterPayload, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.username || !form.email || !form.password) {
      setError("Completa username, email y password.");
      return;
    }
    if (form.registerRole === "staff" && !form.resto?.trim()) {
      setError("Para rol Staff el resto ObjectId es obligatorio.");
      return;
    }

    try {
      setSaving(true);
      const message =
        form.registerRole === "staff"
          ? await usersService.registerStaff({
              username: form.username,
              password: form.password,
              email: form.email,
              resto: form.resto!.trim(),
            })
          : await usersService.registerAdmin({
              username: form.username,
              email: form.email,
              password: form.password,
              resto: form.resto,
            });
      setSuccess(message);
      setForm(initialForm);
      await loadUsers();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (user: ManagerUser) => {
    setEditingUserId(user.id);
    setEditForm({
      username: user.username,
      email: user.email,
      role: user.role,
      resto: visibleRestoId(user) || "",
    });
  };

  const cancelEdit = () => {
    setEditingUserId("");
    setEditForm({
      username: "",
      email: "",
      role: "admin",
      resto: "",
    });
  };

  const submitEdit = async () => {
    if (!editingUserId) return;
    setError("");
    setSuccess("");
    if (!editForm.username || !editForm.email || !editForm.resto) {
      setError("Para editar: username, email y resto son obligatorios.");
      return;
    }
    try {
      setSaving(true);
      const message = await usersService.updateUser(editingUserId, editForm);
      setSuccess(message);
      cancelEdit();
      await loadUsers();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const resetPassword = async (user: ManagerUser) => {
    const password = prompt(`Nueva contraseña para ${user.username}`);
    if (!password) return;
    setError("");
    setSuccess("");
    try {
      setSaving(true);
      const message = await usersService.resetUserPassword(user.id, password);
      setSuccess(message);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const orphanListText = useMemo(
    () =>
      orphans
        .map((o) => {
          const name = orphanDisplayName(o);
          const bytes = o.size != null ? String(o.size) : "—";
          return `${name} | ${o.fileId} | ${bytes} bytes`;
        })
        .join("\n"),
    [orphans]
  );

  const orphanTotalBytes = useMemo(
    () => orphans.reduce((acc, o) => acc + (typeof o.size === "number" ? o.size : 0), 0),
    [orphans]
  );

  const orphanTotalKbDisplay = useMemo(
    () => (orphanTotalBytes / 1024).toLocaleString(undefined, { maximumFractionDigits: 2 }),
    [orphanTotalBytes]
  );

  const runDetectOrphans = async () => {
    setOrphanSectionError("");
    setPurgeResultMessage("");
    try {
      setDetectLoading(true);
      const data = await orphanImagesService.detectOrphanImages();
      setOrphans(data.orphans);
      setDetectionDone(true);
    } catch (err) {
      setOrphanSectionError((err as Error).message);
      setOrphans([]);
      setDetectionDone(false);
    } finally {
      setDetectLoading(false);
    }
  };

  const runPurgeOrphans = async () => {
    if (!detectionDone) return;
    if (
      !window.confirm(
        "¿Eliminar permanentemente las imágenes huérfanas en ImageKit? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }
    setOrphanSectionError("");
    setPurgeResultMessage("");
    try {
      setPurgeLoading(true);
      const data = await orphanImagesService.purgeOrphanImages();
      const deletedN = data.deleted.length;
      const errN = data.errors.length;
      let msg = `Eliminadas ${deletedN} imagen(es).`;
      if (errN > 0) {
        msg += ` Fallaron ${errN}: ${data.errors.map((e) => e.fileId).join(", ")}`;
      }
      setPurgeResultMessage(msg);
      setOrphans([]);
      setDetectionDone(false);
    } catch (err) {
      setOrphanSectionError((err as Error).message);
    } finally {
      setPurgeLoading(false);
    }
  };

  const groupedUsers = useMemo(() => {
    const map = new Map<string, ManagerUser[]>();
    for (const u of users) {
      const key = visibleRestoId(u) || "__sin_resto__";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(u);
    }
    const entries = Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
    return entries.map(([groupKey, list]) => {
      const sorted = [...list].sort((a, b) => {
        if (a.role === "admin" && b.role !== "admin") return -1;
        if (a.role !== "admin" && b.role === "admin") return 1;
        return a.username.localeCompare(b.username);
      });
      const groupSlug =
        sorted.find((x) => x.role === "admin" && x.slug)?.slug ||
        sorted.find((x) => x.slug)?.slug ||
        "";
      return { groupKey, groupSlug, users: sorted };
    });
  }, [users]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="bg-white rounded-lg border p-4">
          <h1 className="text-2xl font-bold">ManagerV1 - Sabore.ar</h1>
          <p className="text-sm text-gray-600">
            Admin usa <code className="text-xs bg-gray-100 px-1 rounded">POST /auth/register</code>
            ; Staff usa <code className="text-xs bg-gray-100 px-1 rounded">POST /auth/register-staff</code>{" "}
            (resto obligatorio).
          </p>
          {envError && (
            <p className="mt-2 text-sm text-red-600 font-medium">{envError}</p>
          )}
        </header>

        <section className="bg-white rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-3">Crear usuario</h2>
          <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-3">
            <input
              className="border rounded px-3 py-2"
              placeholder="username"
              value={form.username}
              onChange={(e) => onChange("username", e.target.value)}
            />
            <input
              className="border rounded px-3 py-2"
              type="email"
              placeholder="email"
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
            />
            <input
              className="border rounded px-3 py-2"
              type="password"
              placeholder="password"
              value={form.password}
              onChange={(e) => onChange("password", e.target.value)}
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">Rol a registrar</label>
              <select
                className="border rounded px-3 py-2"
                value={form.registerRole}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    registerRole: e.target.value as "admin" | "staff",
                  }))
                }
              >
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs text-gray-600">
                Resto ObjectId
                {form.registerRole === "staff" ? (
                  <span className="text-red-600 font-medium"> (obligatorio para Staff)</span>
                ) : (
                  <span> (opcional para Admin)</span>
                )}
              </label>
              <input
                className="border rounded px-3 py-2"
                placeholder={
                  form.registerRole === "staff"
                    ? "ObjectId del restaurante (requerido)"
                    : "ObjectId del restaurante (opcional)"
                }
                value={form.resto ?? ""}
                onChange={(e) => onChange("resto", e.target.value)}
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <button
                type="submit"
                className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                disabled={saving || !!envError}
              >
                {saving ? "Guardando..." : "Registrar usuario"}
              </button>
              <button
                type="button"
                onClick={() => void loadUsers()}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                disabled={loading}
              >
                Refrescar listado
              </button>
            </div>
          </form>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          {success && <p className="mt-3 text-sm text-green-700">{success}</p>}
        </section>

        <section className="bg-white rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-3">Usuarios ({users.length})</h2>
          {loading ? (
            <p className="text-sm text-gray-500">Cargando...</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-gray-500">No hay usuarios para mostrar.</p>
          ) : (
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-3">Username</th>
                    <th className="py-2 pr-3">Email</th>
                    <th className="py-2 pr-3">Rol</th>
                    <th className="py-2 pr-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedUsers.map(({ groupKey, groupSlug, users: groupList }) => (
                    <Fragment key={groupKey}>
                      <tr className="bg-gray-200 border-b">
                        <td colSpan={4} className="py-2 px-3 text-xs font-semibold text-gray-800">
                          {groupKey === "__sin_resto__" ? (
                            <span>Sin resto asignado</span>
                          ) : (
                            <span>
                              Resto ID: <code className="bg-gray-300/80 px-1 rounded">{groupKey}</code>
                              {groupSlug ? (
                                <span className="ml-2">
                                  · slug: <code className="bg-gray-300/80 px-1 rounded">{groupSlug}</code>
                                </span>
                              ) : null}
                            </span>
                          )}
                        </td>
                      </tr>
                      {groupList.map((user) => (
                        <tr
                          key={user.id}
                          className={`border-b last:border-b-0 ${user.role === "admin" ? "bg-gray-100" : ""}`}
                        >
                          <td className="py-2 pr-3">
                            {editingUserId === user.id ? (
                              <input
                                className="border rounded px-2 py-1"
                                value={editForm.username}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, username: e.target.value }))}
                              />
                            ) : (
                              user.username
                            )}
                          </td>
                          <td className="py-2 pr-3">
                            {editingUserId === user.id ? (
                              <input
                                className="border rounded px-2 py-1"
                                value={editForm.email}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                              />
                            ) : (
                              user.email
                            )}
                          </td>
                          <td className="py-2 pr-3">
                            {editingUserId === user.id ? (
                              <select
                                className="border rounded px-2 py-1"
                                value={editForm.role}
                                onChange={(e) =>
                                  setEditForm((prev) => ({ ...prev, role: e.target.value as "admin" | "staff" }))
                                }
                              >
                                <option value="admin">admin</option>
                                <option value="staff">staff</option>
                              </select>
                            ) : (
                              user.role
                            )}
                          </td>
                          <td className="py-2 pr-3">
                            <div className="flex flex-col gap-2 items-start">
                              {editingUserId === user.id ? (
                                <input
                                  className="border rounded px-2 py-1 w-full max-w-xs text-xs"
                                  placeholder="Resto ObjectId"
                                  value={editForm.resto}
                                  onChange={(e) => setEditForm((prev) => ({ ...prev, resto: e.target.value }))}
                                />
                              ) : null}
                              <div className="flex items-center gap-2 flex-wrap">
                              {editingUserId === user.id ? (
                                <>
                                  <button
                                    type="button"
                                    className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                                    onClick={() => void submitEdit()}
                                    disabled={saving}
                                  >
                                    Guardar
                                  </button>
                                  <button
                                    type="button"
                                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                                    onClick={cancelEdit}
                                    disabled={saving}
                                  >
                                    Cancelar
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                                    onClick={() => startEdit(user)}
                                    disabled={saving}
                                  >
                                    Editar
                                  </button>
                                  <button
                                    type="button"
                                    className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                                    onClick={() => void resetPassword(user)}
                                    disabled={saving}
                                  >
                                    Reset Password
                                  </button>
                                </>
                              )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="bg-white rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-3">Depuración de imágenes no utilizadas</h2>
          <p className="text-sm text-gray-600 mb-3">
            Usa la carpeta de upload de ImageKit y las referencias en restos. Requiere{" "}
            <code className="text-xs bg-gray-100 px-1 rounded">BACKEND_KEY</code> en el servidor y{" "}
            <code className="text-xs bg-gray-100 px-1 rounded">VITE_BACKEND_KEY</code> en este manager.
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              type="button"
              className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
              disabled={!!envError || detectLoading || purgeLoading}
              onClick={() => void runDetectOrphans()}
            >
              {detectLoading ? "Detectando..." : "Detectar imágenes huérfanas"}
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              disabled={!detectionDone || !!envError || detectLoading || purgeLoading}
              onClick={() => void runPurgeOrphans()}
            >
              {purgeLoading ? "Eliminando..." : "Eliminar imágenes huérfanas"}
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-3 mb-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">Archivos huérfanos (última detección)</label>
              <input
                className="border rounded px-3 py-2 bg-gray-50 text-sm"
                readOnly
                value={detectionDone ? String(orphans.length) : "—"}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">Total aproximado a liberar (KB, bytes ÷ 1024)</label>
              <input
                className="border rounded px-3 py-2 bg-gray-50 text-sm"
                readOnly
                value={detectionDone ? orphanTotalKbDisplay : "—"}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-600">Listado (nombre | id | peso en bytes)</label>
            <textarea
              className="border rounded px-3 py-2 w-full font-mono text-xs bg-gray-50 min-h-[160px]"
              readOnly
              rows={10}
              value={detectionDone ? orphanListText : ""}
              placeholder={detectionDone ? "" : "Ejecutá primero la detección para ver el listado."}
            />
          </div>
          {orphanSectionError && (
            <p className="mt-3 text-sm text-red-600">{orphanSectionError}</p>
          )}
          {purgeResultMessage && (
            <p className="mt-3 text-sm text-green-700">{purgeResultMessage}</p>
          )}
        </section>
      </div>
    </div>
  );
}
