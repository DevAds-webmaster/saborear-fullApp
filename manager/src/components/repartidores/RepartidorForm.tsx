import { useState } from "react";
import type { Repartidor, UbicacionRepartidor } from "../../types";
import { repartidoresService } from "../../services/repartidores";
import UbicacionMapPicker from "./UbicacionMapPicker";

const MIN_RADIO_KM = 0.5;
const MAX_RADIO_KM = 100;
const DEFAULT_RADIO_KM = 5;

function clampRadio(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_RADIO_KM;
  return Math.min(MAX_RADIO_KM, Math.max(MIN_RADIO_KM, value));
}

type Props = {
  /** Si viene, el formulario edita ese repartidor; si no, crea uno nuevo. */
  initial?: Repartidor | null;
  onSaved: (rep: Repartidor, message: string) => void;
  onCancel: () => void;
};

export default function RepartidorForm({ initial, onSaved, onCancel }: Props) {
  const [nombre, setNombre] = useState(initial?.nombre ?? "");
  const [dni, setDni] = useState(initial?.dni ?? "");
  const [telefono, setTelefono] = useState(initial?.telefono ?? "");
  const [ubicacion, setUbicacion] = useState<UbicacionRepartidor | null>(initial?.ubicacion ?? null);
  const [radioKm, setRadioKm] = useState<number>(initial?.radio_km ?? DEFAULT_RADIO_KM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEdit = Boolean(initial?._id);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const dniLimpio = dni.replace(/[.\s-]/g, "");
    if (!nombre.trim() || !telefono.trim()) {
      setError("Completá nombre y teléfono.");
      return;
    }
    if (!/^\d{7,9}$/.test(dniLimpio)) {
      setError("El DNI debe tener entre 7 y 9 dígitos.");
      return;
    }
    if (!ubicacion) {
      setError("Marcá la ubicación del repartidor en el mapa.");
      return;
    }

    const payload = {
      nombre: nombre.trim(),
      dni: dniLimpio,
      telefono: telefono.trim(),
      ubicacion,
      radio_km: clampRadio(radioKm),
    };

    try {
      setSaving(true);
      const rep = isEdit
        ? await repartidoresService.update(initial!._id, payload)
        : await repartidoresService.create(payload);
      onSaved(rep, isEdit ? "Repartidor actualizado" : "Repartidor creado");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white rounded-lg border p-4">
      <h2 className="text-lg font-semibold mb-3">{isEdit ? `Editar repartidor: ${initial!.nombre}` : "Nuevo repartidor"}</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-600" htmlFor="rep-nombre">Nombre</label>
            <input
              id="rep-nombre"
              className="border rounded px-3 py-2"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre y apellido"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-600" htmlFor="rep-dni">DNI</label>
            <input
              id="rep-dni"
              className="border rounded px-3 py-2"
              inputMode="numeric"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              placeholder="Sin puntos"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-600" htmlFor="rep-telefono">Teléfono</label>
            <input
              id="rep-telefono"
              className="border rounded px-3 py-2"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej: +54 9 11 1234-5678"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-600" htmlFor="rep-radio">Radio de aparición (km)</label>
          <div className="flex max-w-[18rem] items-center gap-2">
            <input
              id="rep-radio"
              className="border rounded px-3 py-2 min-w-0 flex-1"
              type="number"
              step={0.5}
              min={MIN_RADIO_KM}
              max={MAX_RADIO_KM}
              value={radioKm}
              onChange={(e) => setRadioKm(Number(e.target.value))}
              onBlur={() => setRadioKm((v) => clampRadio(v))}
            />
            <button
              type="button"
              className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              disabled={radioKm <= MIN_RADIO_KM}
              onClick={() => setRadioKm((v) => clampRadio(v - 0.5))}
              aria-label="Restar medio kilómetro al radio"
            >
              −
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              disabled={radioKm >= MAX_RADIO_KM}
              onClick={() => setRadioKm((v) => clampRadio(v + 0.5))}
              aria-label="Sumar medio kilómetro al radio"
            >
              +
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Los restaurantes dentro de este radio verán al repartidor. Entre {MIN_RADIO_KM} y {MAX_RADIO_KM} km.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-600">Ubicación GPS</span>
          <UbicacionMapPicker value={ubicacion} radioKm={clampRadio(radioKm)} onChange={setUbicacion} />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
            disabled={saving}
          >
            {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear repartidor"}
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            disabled={saving}
            onClick={onCancel}
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}
