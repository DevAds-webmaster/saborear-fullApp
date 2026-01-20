import { useEffect, useState } from "react";
import { TriangleAlert } from "lucide-react";
import type { Resto, Config, SignedImage } from "../../types";
import { useResto } from "../../contexts/RestoContext";
import { getImageKitAuth, uploadToImageKit } from "../../services/media";

export default function ConfigSection() {
  const { resto, restoPreview, setRestoPreview, updateResto, btnSaveEnabled, setBtnSaveEnabled } = useResto();
  const [localName, setLocalName] = useState<string>(resto?.name || "");
  const [localConfig, setLocalConfig] = useState<Config | undefined>(resto?.config);
  const [localSlug, setLocalSlug] = useState<string>(resto?.slug || "");
  const [slugChangeConfirmed, setSlugChangeConfirmed] = useState<boolean>(false);

  useEffect(() => {
    setLocalConfig(resto?.config);
    setLocalName(resto?.name || "");
    setLocalSlug(resto?.slug || "");
  }, [resto]);

  useEffect(() => {
    if (!resto) return;
    // Actualizar preview
    setRestoPreview({ ...(restoPreview || resto), name: localName, config: localConfig || (resto.config as Config), slug: localSlug });
    // Activar/desactivar botón de guardar por diffs en slug/config
    const base = JSON.stringify({ name: resto.name, slug: resto.slug, config: resto.config });
    const next = JSON.stringify({ name: localName, slug: localSlug, config: localConfig });
    setBtnSaveEnabled(base !== next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localConfig, localSlug, localName]);

  const handleSave = async () => {
    if (!resto) return;
    const resConfirm = confirm("Una vez guardado los cambios ya no podrás deshacer esta acción.");
    if (!resConfirm) return;
    const updated = await updateResto(resto._id, restoPreview || {} as Partial<Resto>);
    if (updated) {
      alert("Cambios guardados correctamente ✅");
      setBtnSaveEnabled(false);
    } else {
      alert("Error al guardar los cambios ❌");
    }
  };

  const handleReset = () => {
    if (!resto) return;
    const res = confirm("Se reestablecerán los valores al último estado guardado.");
    if (!res) return;
    setLocalName(resto.name || "");
    setLocalConfig(resto.config);
    setLocalSlug(resto.slug);
  };

  const uploadImage = async (file: File): Promise<{ secure_url: string; public_id: string; width?: number; height?: number; format?: string } | null> => {
    try {
      const auth = await getImageKitAuth();
      const r = await uploadToImageKit(file, auth);
      return { secure_url: r.url, public_id: r.fileId, width: r.width, height: r.height, format: r.fileType };
    } catch {
      alert('Error subiendo imagen');
      return null;
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Configuración</h1>

      <div className="my-4 flex gap-3">
        <button onClick={handleReset} className="bg-yellow-400 px-4 py-2 rounded">Reestablecer</button>
        <button
          onClick={handleSave}
          disabled={!btnSaveEnabled}
          className={`px-4 py-2 rounded ${btnSaveEnabled ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}
        >
          Guardar Cambios
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Resto Name */}
        <section className="border rounded-lg p-4 md:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="font-semibold">Nombre del Restaurante</h2>
          </div>
          <input
            type="text"
            value={localName}
            onChange={(e) => {
              const next = e.target.value;
              setLocalName(next);
            }}
            className="w-full border rounded px-3 py-2"
            placeholder="Nombre del Restaurante"
          />
          <p className="text-xs text-gray-500 mt-1">Este nombre será visulizado en la plantilla del carrito de whatsapp.</p>
        </section>

        {/* Slug */}
        <section className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="font-semibold">Slug</h2>
            <TriangleAlert className="text-red-600" size={18} />
          </div>
          <input
            type="text"
            value={localSlug}
            onChange={(e) => {
              const next = e.target.value;
              if (!slugChangeConfirmed) {
                const ok = confirm("Estás a punto de cambiar el SLUG. Esto modificará la URL pública y el QR. Si ya imprimiste QR, dejarán de funcionar. ¿Deseas continuar?");
                if (!ok) return;
                setSlugChangeConfirmed(true);
              }
              setLocalSlug(next);
            }}
            className="w-full border rounded px-3 py-2"
            placeholder="mi-resto-slug"
          />
          <p className="text-xs text-gray-500 mt-1">Usado en la URL pública y QR: <strong>{import.meta.env.VITE_MENU_PUBLIC_URL}/{'{slug}'}</strong></p>
        </section>

        {/* Slogan */}
        <section className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Slogan</h2>
          <input
            type="text"
            value={localConfig?.slogan || ''}
            onChange={(e) => setLocalConfig((prev) => ({ ...(prev as Config), slogan: e.target.value }))}
            className="w-full border rounded px-3 py-2"
            placeholder="El mejor sabor de la ciudad"
          />
        </section>

        {/* Logo */}
        <section className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Logo (srcImgLogo)</h2>
          <div className="flex items-center gap-3 sm:flex-row flex-col">
            {localConfig?.srcImgLogo?.secure_url ? (
              <img src={localConfig.srcImgLogo.secure_url} className="w-20 h-20 object-cover rounded border" />
            ) : (
              <div className="w-20 h-20 rounded border bg-gray-100 flex items-center justify-center text-xs text-gray-400">Sin logo</div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const img = await uploadImage(f);
                if (!img) return;
                setLocalConfig((prev) => ({ ...(prev as Config), srcImgLogo: img as SignedImage }));
              }}
              className="text-sm"
            />
          </div>
        </section>

        {/* Fondo */}
        <section className="border rounded-lg p-4 flex flex-row gap-2">
          <div>
            <h2 className="font-semibold mb-2">Fondo con imagen</h2>
            <div className="flex items-center gap-3 sm:flex-row flex-col">
              {localConfig?.srcImgBackground?.secure_url ? (
                <img src={localConfig.srcImgBackground.secure_url} className="w-20 h-20 object-cover rounded border" />
              ) : (
                <div className="w-20 h-20 rounded border bg-gray-100 flex items-center justify-center text-xs text-gray-400">Sin fondo</div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const img = await uploadImage(f);
                  if (!img) return;
                  setLocalConfig((prev) => ({ ...(prev as Config), srcImgBackground: img as SignedImage }));
                }}
                className="text-sm"
              />
            </div>
          </div>
          <div>
            <h2 className="font-semibold mb-2">Fondo color sólido</h2>
            <input
              type="checkbox"
              checked={localConfig?.flgSolidBackground}
              onChange={(e) => setLocalConfig((prev) => ({ ...(prev as Config), flgSolidBackground: e.target.checked }))}
            />
          </div>
        </section>

        {/* Toggles y delay */}
        <section className="border rounded-lg p-4 md:col-span-2 hidden">
          <h2 className="font-semibold mb-2">Parámetros de Modales</h2>
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!localConfig?.paramModalsEnable}
                onChange={(e) => setLocalConfig((prev) => ({ ...(prev as Config), paramModalsEnable: e.target.checked }))}
              />
              Habilitar Modales por Parámetros (paramModalsEnable)
            </label>

            <div>
              <label className="text-sm text-gray-600">Delay (ms) (paramModalsDelay)</label>
              <input
                type="number"
                value={localConfig?.paramModalsDelay ?? 0}
                onChange={(e) => setLocalConfig((prev) => ({ ...(prev as Config), paramModalsDelay: Number(e.target.value || 0) }))}
                className="ml-2 w-40 border rounded px-3 py-2"
                placeholder="1000"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
