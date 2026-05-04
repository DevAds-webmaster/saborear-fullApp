import { useCallback, useEffect, useState } from "react";
import { TriangleAlert } from "lucide-react";
import type { Resto, Config, SignedImage } from "../../types";
import { useResto } from "../../contexts/RestoContext";
import { getImageKitAuth, uploadToImageKit } from "../../services/media";
import { DashboardSaveButtons } from "../../components/DashboardSaveButtons";
import { SectionTitleWithHelp } from "../../components/SectionTitleWithHelp";
import {
  GooglePlacesLocationSection,
  type GooglePlacesLocationPayload,
  DEFAULT_APPEAR_ON_RED_SABORE_AR,
  DEFAULT_SEARCH_RADIUS_KM,
} from "../../components/GooglePlacesLocationSection";

function normalizeLocationDraft(loc: Resto["location"] | null | undefined) {
  if (!loc?.formattedAddress) return null;
  return {
    formattedAddress: loc.formattedAddress,
    lat: loc.lat,
    lng: loc.lng,
    placeId: loc.placeId,
    references: loc.references,
    appearOnRedSaboreAr: loc.appearOnRedSaboreAr ?? DEFAULT_APPEAR_ON_RED_SABORE_AR,
    searchRadiusKm: loc.searchRadiusKm ?? DEFAULT_SEARCH_RADIUS_KM,
  };
}

export default function ConfigSection() {
  const { resto, restoPreview, setRestoPreview, updateResto, btnSaveEnabled, setBtnSaveEnabled } = useResto();
  const [localName, setLocalName] = useState<string>(resto?.name || "");
  const [localConfig, setLocalConfig] = useState<Config | undefined>(resto?.config);
  const [localSlug, setLocalSlug] = useState<string>(resto?.slug || "");
  const [slugChangeConfirmed, setSlugChangeConfirmed] = useState<boolean>(false);
  const [locationPayload, setLocationPayload] = useState<GooglePlacesLocationPayload>({
    selectedLocation: resto?.location ?? null,
    locationReferences: resto?.location?.references ?? "",
    appearOnRedSaboreAr: resto?.location?.appearOnRedSaboreAr ?? DEFAULT_APPEAR_ON_RED_SABORE_AR,
    searchRadiusKm: resto?.location?.searchRadiusKm ?? DEFAULT_SEARCH_RADIUS_KM,
  });
  const [locationSectionEpoch, setLocationSectionEpoch] = useState(0);

  const handleLocationChange = useCallback((p: GooglePlacesLocationPayload) => {
    setLocationPayload(p);
  }, []);

  useEffect(() => {
    setLocalConfig(resto?.config);
    setLocalName(resto?.name || "");
    setLocalSlug(resto?.slug || "");
    setLocationPayload({
      selectedLocation: resto?.location ?? null,
      locationReferences: resto?.location?.references ?? "",
      appearOnRedSaboreAr: resto?.location?.appearOnRedSaboreAr ?? DEFAULT_APPEAR_ON_RED_SABORE_AR,
      searchRadiusKm: resto?.location?.searchRadiusKm ?? DEFAULT_SEARCH_RADIUS_KM,
    });
  }, [resto]);

  useEffect(() => {
    if (!resto) return;
    const mergedDraftLocation =
      locationPayload.selectedLocation != null
        ? {
            ...locationPayload.selectedLocation,
            references: locationPayload.locationReferences.trim() || undefined,
            appearOnRedSaboreAr: locationPayload.appearOnRedSaboreAr,
            searchRadiusKm: locationPayload.searchRadiusKm,
          }
        : resto.location;

    setRestoPreview((prev) => ({
      ...(prev || resto),
      name: localName,
      config: localConfig || (resto.config as Config),
      slug: localSlug,
      location: mergedDraftLocation,
    }));

    const base = JSON.stringify({
      name: resto.name,
      slug: resto.slug,
      config: resto.config,
      location: normalizeLocationDraft(resto.location),
    });
    const nextDraftLocation =
      locationPayload.selectedLocation != null
        ? {
            ...locationPayload.selectedLocation,
            references: locationPayload.locationReferences.trim() || undefined,
            appearOnRedSaboreAr: locationPayload.appearOnRedSaboreAr,
            searchRadiusKm: locationPayload.searchRadiusKm,
          }
        : resto.location ?? null;
    const next = JSON.stringify({
      name: localName,
      slug: localSlug,
      config: localConfig,
      location: normalizeLocationDraft(nextDraftLocation),
    });
    setBtnSaveEnabled(base !== next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localConfig, localSlug, localName, locationPayload]);

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
    setLocationPayload({
      selectedLocation: resto.location ?? null,
      locationReferences: resto.location?.references ?? "",
      appearOnRedSaboreAr: resto.location?.appearOnRedSaboreAr ?? DEFAULT_APPEAR_ON_RED_SABORE_AR,
      searchRadiusKm: resto.location?.searchRadiusKm ?? DEFAULT_SEARCH_RADIUS_KM,
    });
    setLocationSectionEpoch((n) => n + 1);
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
      <SectionTitleWithHelp
        title="Configuración"
        videoUrl="https://youtu.be/cBkuvHm-Or8"
      />

      <div className="my-6 flex">
        <DashboardSaveButtons enabled={btnSaveEnabled} onReset={handleReset} onSave={handleSave} />
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
          <p className="text-xs text-gray-500 mb-2">Es el identificador unico para acceder a tu menu</p>
          <input
            type="text"
            value={localSlug}
            onChange={(e) => {
              const next = e.target.value;
              if (!slugChangeConfirmed) {
                const ok = confirm("Estás a punto de cambiar el SLUG. Esto modificará la URL pública y el QR. Si ya imprimiste códigos QR, dejarán de ser útiles. ¿Deseas continuar?");
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

        {/* Ubicación */}
        {resto && (
          <section className="border rounded-lg p-4 md:col-span-2">
            <h2 className="font-semibold mb-1 text-gray-900">Ubicación</h2>
            <p className="text-sm text-gray-600 mb-3">
              Completá la dirección y, si querés, una referencia para ubicar mejor la casa de comidas.
            </p>
            <GooglePlacesLocationSection
              variant="dashboard"
              mapVisible={true}
              syncKey={`${resto._id}-${locationSectionEpoch}`}
              initialLocation={resto.location}
              htmlIdPrefix="cfg-location"
              title=""
              description=""
              onChange={handleLocationChange}
            />
          </section>
        )}

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

        {/* Descripción RED */}
        <section className="border rounded-lg p-4 md:col-span-2">
          <h2 className="font-semibold mb-1">Descripción RED Sabore.ar</h2>
          <p className="text-sm text-gray-600 mb-2">
            Esta descripción es la que se verá en la RED Sabore.ar, describiendo tu casa de comidas. Máximo 100 caracteres.
          </p>
          <textarea
            value={localConfig?.description ?? ""}
            onChange={(e) => {
              const v = e.target.value.slice(0, 100);
              setLocalConfig((prev) => ({ ...(prev as Config), description: v }));
            }}
            maxLength={100}
            rows={3}
            className="w-full border rounded px-3 py-2 text-sm resize-y min-h-[4rem]"
            placeholder="Ej.: Pastas caseras y pizzas a la piedra."
          />
          <p className="text-xs text-gray-500 mt-1">
            {(localConfig?.description ?? "").length}/100
          </p>
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

        {/* Template LayOut */}
        <section className="border rounded-lg p-4 md:col-span-2">
          <h2 className="font-semibold mb-2">Plantilla del menú público</h2>
          <p className="text-sm text-gray-600 mb-3">
            Define cómo se navega el menú: todo en una sola página con scroll o una página por categoría.
          </p>
          <select
            value={localConfig?.template ?? "single-page"}
            onChange={(e) =>
              setLocalConfig((prev) => ({ ...(prev as Config), template: e.target.value }))
            }
            className="w-full max-w-md border rounded px-3 py-2 bg-white"
          >
            <option value="single-page">Una sola página (single-page)</option>
            <option value="multi-page">Multi página (multi-page)</option>
          </select>
        </section>
      </div>
    </div>
  );
}
