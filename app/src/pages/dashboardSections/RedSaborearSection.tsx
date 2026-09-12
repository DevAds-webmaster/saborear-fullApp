import { useCallback, useEffect, useState } from "react";
import type { Config, Resto } from "../../types";
import { useResto } from "../../contexts/RestoContext";
import { DashboardSaveButtons } from "../../components/DashboardSaveButtons";
import { SectionTitleWithHelp } from "../../components/SectionTitleWithHelp";
import {
  GooglePlacesLocationSection,
  type GooglePlacesLocationPayload,
  DEFAULT_APPEAR_ON_RED_SABORE_AR,
  DEFAULT_SEARCH_RADIUS_KM,
} from "../../components/GooglePlacesLocationSection";

/** Reemplazar cuando esté disponible el video tutorial de Red Saborear. */
const RED_SABOREAR_SECTION_VIDEO_URL = "";

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

function mergeDraftLocation(
  resto: Resto,
  locationPayload: GooglePlacesLocationPayload
): Resto["location"] {
  if (locationPayload.selectedLocation != null) {
    return {
      ...locationPayload.selectedLocation,
      references: locationPayload.locationReferences.trim() || undefined,
      appearOnRedSaboreAr: locationPayload.appearOnRedSaboreAr,
      searchRadiusKm: locationPayload.searchRadiusKm,
    };
  }
  return resto.location;
}

export default function RedSaborearSection() {
  const { resto, setRestoPreview, updateResto, btnSaveEnabled, setBtnSaveEnabled } = useResto();
  const [localDescription, setLocalDescription] = useState<string>(resto?.config?.description ?? "");
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
    setLocalDescription(resto?.config?.description ?? "");
    setLocationPayload({
      selectedLocation: resto?.location ?? null,
      locationReferences: resto?.location?.references ?? "",
      appearOnRedSaboreAr: resto?.location?.appearOnRedSaboreAr ?? DEFAULT_APPEAR_ON_RED_SABORE_AR,
      searchRadiusKm: resto?.location?.searchRadiusKm ?? DEFAULT_SEARCH_RADIUS_KM,
    });
  }, [resto]);

  useEffect(() => {
    if (!resto) return;

    const mergedDraftLocation = mergeDraftLocation(resto, locationPayload);
    const mergedConfig: Config = {
      ...(resto.config as Config),
      description: localDescription,
    };

    setRestoPreview((prev) => ({
      ...(prev || resto),
      location: mergedDraftLocation,
      config: mergedConfig,
    }));

    const base = JSON.stringify({
      location: normalizeLocationDraft(resto.location),
      description: resto.config?.description ?? "",
    });
    const next = JSON.stringify({
      location: normalizeLocationDraft(mergedDraftLocation),
      description: localDescription,
    });
    setBtnSaveEnabled(base !== next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localDescription, locationPayload]);

  const handleSave = async () => {
    if (!resto) return;
    const resConfirm = confirm("Una vez guardado los cambios ya no podrás deshacer esta acción.");
    if (!resConfirm) return;

    const mergedDraftLocation = mergeDraftLocation(resto, locationPayload);
    const updated = await updateResto(resto._id, {
      location: mergedDraftLocation,
      config: {
        ...(resto.config as Config),
        description: localDescription,
      },
    } as Partial<Resto>);

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

    setLocalDescription(resto.config?.description ?? "");
    setLocationPayload({
      selectedLocation: resto.location ?? null,
      locationReferences: resto.location?.references ?? "",
      appearOnRedSaboreAr: resto.location?.appearOnRedSaboreAr ?? DEFAULT_APPEAR_ON_RED_SABORE_AR,
      searchRadiusKm: resto.location?.searchRadiusKm ?? DEFAULT_SEARCH_RADIUS_KM,
    });
    setLocationSectionEpoch((n) => n + 1);
  };

  return (
    <div className="p-4">
      <SectionTitleWithHelp
        title="Red Saborear"
        videoUrl={RED_SABOREAR_SECTION_VIDEO_URL}
      />

      <div className="my-6 flex">
        <DashboardSaveButtons enabled={btnSaveEnabled} onReset={handleReset} onSave={handleSave} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
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
              htmlIdPrefix="red-location"
              title=""
              description=""
              onChange={handleLocationChange}
            />
          </section>
        )}

        <section className="border rounded-lg p-4 md:col-span-2">
          <h2 className="font-semibold mb-1">Descripción RED Sabore.ar</h2>
          <p className="text-sm text-gray-600 mb-2">
            Esta descripción es la que se verá en la RED Sabore.ar, describiendo tu casa de comidas. Máximo 100 caracteres.
          </p>
          <textarea
            value={localDescription}
            onChange={(e) => setLocalDescription(e.target.value.slice(0, 100))}
            maxLength={100}
            rows={3}
            className="w-full border rounded px-3 py-2 text-sm resize-y min-h-[4rem]"
            placeholder="Ej.: Pastas caseras y pizzas a la piedra."
          />
          <p className="text-xs text-gray-500 mt-1">{localDescription.length}/100</p>
        </section>
      </div>
    </div>
  );
}
