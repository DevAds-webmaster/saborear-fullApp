import { useCallback, useEffect, useState } from "react";
import { Bike, MapPin, Phone, X } from "lucide-react";
import { useResto } from "../contexts/RestoContext";
import { repartidoresService } from "../services/repartidores";
import type { RepartidorCercano } from "../types";
import StarRating from "./StarRating";

const MAX_OBSERVACION = 500;

type Props = {
  /** Solo para admins: lleva a la sección donde se configura la ubicación del local. */
  onConfigurarUbicacion?: () => void;
};

export default function RepartidoresFloatBar({ onConfigurarUbicacion }: Props) {
  const { resto, id } = useResto();
  const restoId = resto?._id || id;

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sinUbicacion, setSinUbicacion] = useState(false);
  const [repartidores, setRepartidores] = useState<RepartidorCercano[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!restoId) return;
    setLoading(true);
    setError("");
    try {
      const data = await repartidoresService.getCercanos(restoId);
      setSinUbicacion(data.sinUbicacion);
      setRepartidores(data.repartidores);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [restoId]);

  useEffect(() => {
    if (open) void cargar();
    else setEditandoId(null);
  }, [open, cargar]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!restoId) return null;

  const onGuardado = (actualizado: RepartidorCercano) => {
    setRepartidores((prev) => prev.map((r) => (r._id === actualizado._id ? actualizado : r)));
    setEditandoId(null);
  };

  return (
    <>
      <div className="fixed bottom-4 inset-x-0 lg:left-64 z-40 flex justify-center pointer-events-none px-4">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-gray-200 bg-white/95 backdrop-blur px-2 py-2 shadow-lg">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            aria-haspopup="dialog"
            aria-expanded={open}
          >
            <Bike size={20} />
            Repartidores
          </button>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="repartidores-title"
            className="flex max-h-[85vh] w-full flex-col rounded-t-2xl bg-white shadow-xl sm:max-w-lg sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
              <div>
                <h2 id="repartidores-title" className="text-lg font-semibold text-gray-900">
                  Repartidores Recomendados
                </h2>
                <p className="text-xs text-gray-500">Repartidores que trabajan en la zona de tu local.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-3">
              {loading ? (
                <div className="py-10 text-center">
                  <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  <p className="text-sm text-gray-600">Cargando repartidores...</p>
                </div>
              ) : error ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-red-600">{error}</p>
                  <button
                    type="button"
                    onClick={() => void cargar()}
                    className="mt-3 rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                  >
                    Reintentar
                  </button>
                </div>
              ) : sinUbicacion ? (
                <div className="py-8 text-center">
                  <MapPin className="mx-auto mb-2 text-gray-400" size={28} />
                  <p className="text-sm text-gray-700">
                    Configurá la ubicación de tu local para ver los repartidores de tu zona.
                  </p>
                  {onConfigurarUbicacion ? (
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        onConfigurarUbicacion();
                      }}
                      className="mt-3 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Configurar ubicación
                    </button>
                  ) : (
                    <p className="mt-1 text-xs text-gray-500">
                      Pedile al administrador que la configure en la sección Red Saborear.
                    </p>
                  )}
                </div>
              ) : repartidores.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-600">
                  Todavía no hay repartidores recomendados en tu zona.
                </p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {repartidores.map((rep) => (
                    <RepartidorItem
                      key={rep._id}
                      rep={rep}
                      restoId={restoId}
                      editando={editandoId === rep._id}
                      onEditar={() => setEditandoId(rep._id)}
                      onCancelar={() => setEditandoId(null)}
                      onGuardado={onGuardado}
                    />
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

type ItemProps = {
  rep: RepartidorCercano;
  restoId: string;
  editando: boolean;
  onEditar: () => void;
  onCancelar: () => void;
  onGuardado: (actualizado: RepartidorCercano) => void;
};

function RepartidorItem({ rep, restoId, editando, onEditar, onCancelar, onGuardado }: ItemProps) {
  const [calif, setCalif] = useState(rep.miCalificacion?.calif ?? 0);
  const [observacion, setObservacion] = useState(rep.miCalificacion?.observacion ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editando) return;
    setCalif(rep.miCalificacion?.calif ?? 0);
    setObservacion(rep.miCalificacion?.observacion ?? "");
    setError("");
  }, [editando, rep.miCalificacion]);

  const guardar = async () => {
    if (calif < 1) {
      setError("Elegí entre 1 y 5 estrellas.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const actualizado = await repartidoresService.calificar(rep._id, restoId, calif, observacion.trim());
      onGuardado(actualizado);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <li className="py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-gray-900">{rep.nombre}</p>
          <a
            href={`tel:${rep.telefono.replace(/[^\d+]/g, "")}`}
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            <Phone size={14} />
            {rep.telefono}
          </a>
          <div className="mt-1 flex items-center gap-2">
            <StarRating value={rep.promedio} size={16} />
            <span className="text-xs text-gray-500">
              {rep.cantidad
                ? `${rep.promedio.toFixed(1)} (${rep.cantidad} voto${rep.cantidad === 1 ? "" : "s"})`
                : "Sin calificaciones"}
            </span>
          </div>
          {rep.miCalificacion && !editando && (
            <p className="mt-1 text-xs text-gray-500">Tu calificación: {rep.miCalificacion.calif}/5</p>
          )}
        </div>
        {!editando && (
          <button
            type="button"
            onClick={onEditar}
            className="shrink-0 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            {rep.miCalificacion ? "Editar mi calificación" : "Calificar"}
          </button>
        )}
      </div>

      {editando && (
        <div className="mt-3 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p className="text-sm font-medium text-gray-800">Tu calificación</p>
          <StarRating value={calif} onChange={setCalif} size={26} />
          <textarea
            value={observacion}
            onChange={(e) => setObservacion(e.target.value.slice(0, MAX_OBSERVACION))}
            rows={3}
            placeholder="Observación (opcional): puntualidad, trato, cuidado del pedido..."
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/30"
          />
          <p className="text-right text-[11px] text-gray-400">
            {observacion.length}/{MAX_OBSERVACION} · Solo la ve el equipo de Sabore.ar
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancelar}
              disabled={saving}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-white disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => void guardar()}
              disabled={saving}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
