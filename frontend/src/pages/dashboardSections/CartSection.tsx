import React, { useEffect, useState } from "react";
import { useResto } from "../../contexts/RestoContext";
import type { Resto } from "../../types";
import { Phone } from "lucide-react";

export default function CartSection() {
  const { resto, updateResto, btnSaveEnabled, setBtnSaveEnabled, restoPreview, setRestoPreview } = useResto();
  const [localPhone, setLocalPhone] = useState<string>(resto?.phone || "");

  useEffect(() => {
    setLocalPhone(resto?.phone || "");
  }, [resto]);

  useEffect(() => {
    if (!resto) return;
    // Mantener un preview consistente
    setRestoPreview({ ...(restoPreview || resto), phone: localPhone } as Resto);
    // Habilitar guardar si hay cambios
    const base = JSON.stringify({ phone: resto.phone || "" });
    const next = JSON.stringify({ phone: localPhone || "" });
    setBtnSaveEnabled(base !== next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localPhone]);

  const handleSave = async () => {
    if (!resto) return;
    const ok = confirm("¿Guardar el número de WhatsApp?");
    if (!ok) return;
    const updated = await updateResto(resto._id, { phone: localPhone } as Partial<Resto>);
    if (updated) {
      alert("Número de WhatsApp guardado ✅");
      setBtnSaveEnabled(false);
    } else {
      alert("Error al guardar ❌");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Carrito y WhatsApp</h1>

      <section className="border rounded-lg p-4 max-w-xl">
        <h2 className="font-semibold mb-2">Número de WhatsApp del Resto</h2>
        <label className="text-sm text-gray-600 mb-1 inline-block">Teléfono (formato internacional preferido)</label>
        <div className="flex items-center gap-2">
          <Phone size={18} className="text-gray-500" />
          <input
            type="tel"
            value={localPhone}
            onChange={(e) => setLocalPhone(e.target.value)}
            className="flex-1 border rounded px-3 py-2"
            placeholder="Ej: +5491122334455"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Se recomienda formato E.164: sin espacios ni guiones. Ej: +5491122334455
        </p>

        <div className="mt-4">
          <button
            onClick={handleSave}
            disabled={!btnSaveEnabled}
            className={`px-4 py-2 rounded ${btnSaveEnabled ? "bg-green-600 text-white" : "bg-gray-300 text-gray-600"}`}
          >
            Guardar
          </button>
        </div>
      </section>
    </div>
  );
}


