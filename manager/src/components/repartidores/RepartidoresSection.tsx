import { Fragment, useEffect, useState } from "react";
import type { Repartidor } from "../../types";
import { repartidoresService } from "../../services/repartidores";
import RepartidorForm from "./RepartidorForm";

type FormState = { mode: "create" } | { mode: "edit"; rep: Repartidor } | null;

function estrellas(calif: number): string {
  const n = Math.max(0, Math.min(5, Math.round(calif)));
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function formatFecha(fecha: string | null): string {
  if (!fecha) return "—";
  const d = new Date(fecha);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-AR");
}

const byNombre = (a: Repartidor, b: Repartidor) => a.nombre.localeCompare(b.nombre, "es");

export default function RepartidoresSection() {
  const [repartidores, setRepartidores] = useState<Repartidor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState<FormState>(null);
  const [expandedId, setExpandedId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      setRepartidores(await repartidoresService.list());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onSaved = (rep: Repartidor, message: string) => {
    setRepartidores((prev) => [...prev.filter((r) => r._id !== rep._id), rep].sort(byNombre));
    setForm(null);
    setError("");
    setSuccess(message);
  };

  const onDelete = async (rep: Repartidor) => {
    const detalle =
      rep.cantidad === 0
        ? ""
        : rep.cantidad === 1
          ? " También se borra su calificación."
          : ` También se borran sus ${rep.cantidad} calificaciones.`;
    const ok = window.confirm(`¿Eliminar a ${rep.nombre}?${detalle}`);
    if (!ok) return;
    try {
      setDeletingId(rep._id);
      setError("");
      const message = await repartidoresService.remove(rep._id);
      setRepartidores((prev) => prev.filter((r) => r._id !== rep._id));
      if (form?.mode === "edit" && form.rep._id === rep._id) setForm(null);
      setSuccess(message);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeletingId("");
    }
  };

  return (
    <>
      {form && (
        <RepartidorForm
          key={form.mode === "edit" ? form.rep._id : "nuevo"}
          initial={form.mode === "edit" ? form.rep : null}
          onSaved={onSaved}
          onCancel={() => setForm(null)}
        />
      )}

      <section className="bg-white rounded-lg border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h2 className="text-lg font-semibold">Repartidores ({repartidores.length})</h2>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
              onClick={() => void load()}
              disabled={loading}
            >
              {loading ? "Cargando..." : "Recargar"}
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
              onClick={() => {
                setSuccess("");
                setForm({ mode: "create" });
              }}
            >
              Nuevo repartidor
            </button>
          </div>
        </div>

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        {success && <p className="mb-3 text-sm text-green-700">{success}</p>}

        {!loading && repartidores.length === 0 ? (
          <p className="text-sm text-gray-600">Todavía no hay repartidores cargados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-3">Nombre</th>
                  <th className="py-2 pr-3">DNI</th>
                  <th className="py-2 pr-3">Teléfono</th>
                  <th className="py-2 pr-3">Zona</th>
                  <th className="py-2 pr-3">Radio</th>
                  <th className="py-2 pr-3">Calificación</th>
                  <th className="py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {repartidores.map((rep) => {
                  const expanded = expandedId === rep._id;
                  return (
                    <Fragment key={rep._id}>
                      <tr className="border-b align-top">
                        <td className="py-2 pr-3 font-medium">{rep.nombre}</td>
                        <td className="py-2 pr-3">{rep.dni}</td>
                        <td className="py-2 pr-3 whitespace-nowrap">{rep.telefono}</td>
                        <td className="py-2 pr-3 max-w-xs">
                          {rep.ubicacion?.direccion || (
                            <span className="text-gray-500">
                              {rep.ubicacion?.lat?.toFixed(5)}, {rep.ubicacion?.lon?.toFixed(5)}
                            </span>
                          )}
                        </td>
                        <td className="py-2 pr-3 whitespace-nowrap">{rep.radio_km} km</td>
                        <td className="py-2 pr-3 whitespace-nowrap">
                          {rep.cantidad ? (
                            <>
                              <span className="text-amber-500">{estrellas(rep.promedio)}</span>{" "}
                              {rep.promedio.toFixed(1)} ({rep.cantidad})
                            </>
                          ) : (
                            <span className="text-gray-500">Sin votos</span>
                          )}
                        </td>
                        <td className="py-2">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                              disabled={!rep.cantidad}
                              onClick={() => setExpandedId(expanded ? "" : rep._id)}
                            >
                              {expanded ? "Ocultar" : "Ver calificaciones"}
                            </button>
                            <button
                              type="button"
                              className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                              onClick={() => {
                                setSuccess("");
                                setForm({ mode: "edit", rep });
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                              disabled={deletingId === rep._id}
                              onClick={() => void onDelete(rep)}
                            >
                              {deletingId === rep._id ? "Eliminando..." : "Eliminar"}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expanded && (
                        <tr className="border-b bg-gray-50">
                          <td colSpan={7} className="p-3">
                            <ul className="space-y-2">
                              {[...rep.calificaciones]
                                .sort((a, b) => String(b.fecha ?? "").localeCompare(String(a.fecha ?? "")))
                                .map((c) => (
                                  <li key={c.id_resto} className="rounded border bg-white p-2">
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                      <span className="font-medium">
                                        {c.resto_nombre ?? "Resto eliminado"}
                                        {c.resto_slug && <span className="text-gray-500 font-normal"> ({c.resto_slug})</span>}
                                      </span>
                                      <span className="text-amber-500">{estrellas(c.calif)}</span>
                                      <span className="text-xs text-gray-500">{formatFecha(c.fecha)}</span>
                                    </div>
                                    <p className="mt-1 text-gray-700">
                                      {c.observacion || <span className="text-gray-400">Sin observación</span>}
                                    </p>
                                  </li>
                                ))}
                            </ul>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
