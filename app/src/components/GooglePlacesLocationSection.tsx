import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { RestoLocation } from "../types";

type PlaceSuggestion = { description: string; placeId: string };

export const DEFAULT_APPEAR_ON_RED_SABORE_AR = true;
export const DEFAULT_SEARCH_RADIUS_KM = 3;
export const MIN_SEARCH_RADIUS_KM = 0.5;
export const MAX_SEARCH_RADIUS_KM = 100;

export type GooglePlacesLocationPayload = {
  selectedLocation: RestoLocation | null;
  locationReferences: string;
  appearOnRedSaboreAr: boolean;
  searchRadiusKm: number;
};

type Props = {
  variant: "onboarding" | "dashboard";
  /** Si es false, se libera el mapa y las refs internas (p. ej. onboarding cuando step !== 1). */
  mapVisible: boolean;
  /** Cambiar cuando debe reaplicarse `initialLocation` desde servidor (p. ej. resto._id). */
  syncKey: string;
  initialLocation?: RestoLocation | null;
  htmlIdPrefix: string;
  title?: string;
  description?: string;
  /** Callback ante cualquier cambio de ubicación confirmada o referencias. */
  onChange?: (payload: GooglePlacesLocationPayload) => void;
};

function clampSearchRadiusKm(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_SEARCH_RADIUS_KM;
  return Math.min(MAX_SEARCH_RADIUS_KM, Math.max(MIN_SEARCH_RADIUS_KM, value));
}

function serializeRestoLocation(loc: RestoLocation | null | undefined): string {
  if (!loc) return "null";
  return JSON.stringify({
    formattedAddress: loc.formattedAddress,
    lat: loc.lat,
    lng: loc.lng,
    placeId: loc.placeId,
    references: loc.references,
    appearOnRedSaboreAr: loc.appearOnRedSaboreAr ?? DEFAULT_APPEAR_ON_RED_SABORE_AR,
    searchRadiusKm: loc.searchRadiusKm ?? DEFAULT_SEARCH_RADIUS_KM,
  });
}

export function GooglePlacesLocationSection({
  variant,
  mapVisible,
  syncKey,
  initialLocation,
  htmlIdPrefix,
  title = "Ubicación",
  description = "Completá la dirección y, si querés, una referencia para ubicar mejor la casa de comidas.",
  onChange,
}: Props) {
  const [locationQuery, setLocationQuery] = useState("");
  const [locationReferences, setLocationReferences] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<PlaceSuggestion[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<RestoLocation | null>(null);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesReady, setPlacesReady] = useState(false);
  const [placesError, setPlacesError] = useState<string | null>(null);
  const [appearOnRedSaboreAr, setAppearOnRedSaboreAr] = useState(DEFAULT_APPEAR_ON_RED_SABORE_AR);
  const [searchRadiusKm, setSearchRadiusKm] = useState(DEFAULT_SEARCH_RADIUS_KM);

  const placesServiceRef = useRef<any>(null);
  const autocompleteServiceRef = useRef<any>(null);
  const locationMapElRef = useRef<HTMLDivElement | null>(null);
  const locationMapRef = useRef<any>(null);
  const locationMarkerRef = useRef<any>(null);
  const locationCircleRef = useRef<any>(null);

  const prevSyncSigRef = useRef<string>("");
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const tearDownMap = useCallback(() => {
    const circle = locationCircleRef.current;
    if (circle) {
      circle.setMap(null);
      locationCircleRef.current = null;
    }
    const marker = locationMarkerRef.current;
    if (marker && window.google?.maps?.event) {
      window.google.maps.event.clearInstanceListeners(marker);
      marker.setMap(null);
      locationMarkerRef.current = null;
    }
    const map = locationMapRef.current;
    if (map && window.google?.maps?.event) {
      window.google.maps.event.clearInstanceListeners(map);
      locationMapRef.current = null;
    }
    const el = locationMapElRef.current;
    if (el) el.innerHTML = "";
  }, []);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
    if (!apiKey) {
      setPlacesError("Ocurrió un error al inicializar Google Places.");
      return;
    }

    if (window.google?.maps?.places) {
      setPlacesReady(true);
      return;
    }

    const scriptId = "google-maps-places-sdk";
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    const onReady = () => {
      if (window.google?.maps?.places) {
        setPlacesReady(true);
        setPlacesError(null);
      } else {
        setPlacesError("No se pudo inicializar Google Places.");
      }
    };

    if (existing) {
      existing.addEventListener("load", onReady);
      return () => existing.removeEventListener("load", onReady);
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
    script.addEventListener("load", onReady);
    script.addEventListener("error", () => setPlacesError("Falló la carga de Google Places."));
    document.head.appendChild(script);
    return () => script.removeEventListener("load", onReady);
  }, []);

  const applyServerLocation = useCallback((loc: RestoLocation | null | undefined) => {
    if (loc?.formattedAddress) {
      const refs = loc.references ?? "";
      setLocationQuery(loc.formattedAddress);
      setLocationReferences(refs);
      setSelectedLocation({
        formattedAddress: loc.formattedAddress,
        lat: loc.lat,
        lng: loc.lng,
        placeId: loc.placeId,
        references: refs.trim() || undefined,
      });
      setAppearOnRedSaboreAr(loc.appearOnRedSaboreAr ?? DEFAULT_APPEAR_ON_RED_SABORE_AR);
      setSearchRadiusKm(clampSearchRadiusKm(loc.searchRadiusKm ?? DEFAULT_SEARCH_RADIUS_KM));
      setLocationSuggestions([]);
      setPlacesError(null);
    } else {
      setLocationQuery("");
      setLocationReferences("");
      setSelectedLocation(null);
      setAppearOnRedSaboreAr(DEFAULT_APPEAR_ON_RED_SABORE_AR);
      setSearchRadiusKm(DEFAULT_SEARCH_RADIUS_KM);
      setLocationSuggestions([]);
    }
  }, []);

  useEffect(() => {
    const sig = `${syncKey}:${serializeRestoLocation(initialLocation ?? null)}`;
    if (prevSyncSigRef.current === sig) return;
    prevSyncSigRef.current = sig;
    applyServerLocation(initialLocation ?? null);
  }, [syncKey, initialLocation, applyServerLocation]);

  useLayoutEffect(() => {
    onChangeRef.current?.({
      selectedLocation,
      locationReferences,
      appearOnRedSaboreAr,
      searchRadiusKm,
    });
  }, [selectedLocation, locationReferences, appearOnRedSaboreAr, searchRadiusKm]);

  const getAutocompleteService = useCallback(() => {
    if (!window.google?.maps?.places) return null;
    if (!autocompleteServiceRef.current) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
    }
    return autocompleteServiceRef.current;
  }, []);

  const getPlacesService = useCallback(() => {
    if (!window.google?.maps?.places) return null;
    if (!placesServiceRef.current) {
      placesServiceRef.current = new window.google.maps.places.PlacesService(document.createElement("div"));
    }
    return placesServiceRef.current;
  }, []);

  useEffect(() => {
    if (!placesReady) return;
    const query = locationQuery.trim();
    if (query.length < 3) {
      setLocationSuggestions([]);
      return;
    }
    const service = getAutocompleteService();
    if (!service) return;

    const timeoutId = window.setTimeout(() => {
      service.getPlacePredictions(
        { input: query, types: ["address"] },
        (predictions: any[] | null, status: string) => {
          if (status !== window.google.maps.places.PlacesServiceStatus.OK || !predictions) {
            setLocationSuggestions([]);
            return;
          }
          setLocationSuggestions(
            predictions.slice(0, 6).map((p: any) => ({
              description: p.description,
              placeId: p.place_id,
            })),
          );
        },
      );
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [locationQuery, placesReady, getAutocompleteService]);

  const hasMapCoords = selectedLocation?.lat != null && selectedLocation?.lng != null;

  useEffect(() => {
    if (!placesReady || !mapVisible || !window.google?.maps || !hasMapCoords) {
      tearDownMap();
      return;
    }

    const el = locationMapElRef.current;
    if (!el || locationMapRef.current) return;

    const maps = window.google.maps;
    const lat = selectedLocation!.lat!;
    const lng = selectedLocation!.lng!;
    const center = { lat, lng };

    const map = new maps.Map(el, {
      center,
      zoom: 17,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });
    locationMapRef.current = map;

    locationMarkerRef.current = new maps.Marker({
      position: center,
      map,
    });

    return () => {
      tearDownMap();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- crear/destruir solo ante coords globalmente visibles; el marcador se actualiza en otro efecto
  }, [placesReady, mapVisible, hasMapCoords, tearDownMap]);

  useEffect(() => {
    if (!locationMapRef.current || !locationMarkerRef.current || !hasMapCoords) return;
    const lat = selectedLocation!.lat!;
    const lng = selectedLocation!.lng!;
    locationMapRef.current.setCenter({ lat, lng });
    locationMarkerRef.current.setPosition({ lat, lng });
  }, [selectedLocation?.lat, selectedLocation?.lng, hasMapCoords]);

  useEffect(() => {
    const map = locationMapRef.current;
    if (!map || !hasMapCoords || !window.google?.maps || !mapVisible) return;

    const lat = selectedLocation!.lat!;
    const lng = selectedLocation!.lng!;
    const maps = window.google.maps;

    if (!appearOnRedSaboreAr) {
      if (locationCircleRef.current) {
        locationCircleRef.current.setMap(null);
        locationCircleRef.current = null;
      }
      map.setCenter({ lat, lng });
      map.setZoom(17);
      return;
    }

    const radiusM = clampSearchRadiusKm(searchRadiusKm) * 1000;

    if (!locationCircleRef.current) {
      locationCircleRef.current = new maps.Circle({
        map,
        center: { lat, lng },
        radius: radiusM,
        strokeColor: "#b45309",
        strokeOpacity: 0.92,
        strokeWeight: 2,
        fillColor: "#f59e0b",
        fillOpacity: 0.14,
        clickable: false,
      });
    } else {
      locationCircleRef.current.setCenter({ lat, lng });
      locationCircleRef.current.setRadius(radiusM);
      locationCircleRef.current.setMap(map);
    }

    const bounds = locationCircleRef.current.getBounds?.();
    if (bounds) {
      map.fitBounds(bounds, 16);
    }
  }, [
    hasMapCoords,
    mapVisible,
    appearOnRedSaboreAr,
    searchRadiusKm,
    selectedLocation?.lat,
    selectedLocation?.lng,
  ]);

  const selectPlaceSuggestion = useCallback(
    (suggestion: PlaceSuggestion) => {
      const service = getPlacesService();
      if (!service) {
        setPlacesError("Google Places no está disponible.");
        return;
      }
      setPlacesLoading(true);
      service.getDetails(
        {
          placeId: suggestion.placeId,
          fields: ["formatted_address", "geometry", "place_id"],
        },
        (place: any, status: string) => {
          setPlacesLoading(false);
          if (status !== window.google.maps.places.PlacesServiceStatus.OK || !place?.geometry?.location) {
            setPlacesError("No se pudieron obtener los detalles de la dirección.");
            return;
          }
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const formattedAddress = (place.formatted_address || suggestion.description || "").trim();
          if (!formattedAddress) {
            setPlacesError("Google no devolvió una dirección válida.");
            return;
          }
          setSelectedLocation({
            formattedAddress,
            lat,
            lng,
            placeId: place.place_id || suggestion.placeId,
            references: locationReferences.trim() || undefined,
          });
          setLocationQuery(formattedAddress);
          setLocationSuggestions([]);
          setPlacesError(null);
        },
      );
    },
    [getPlacesService, locationReferences],
  );

  const isOnboarding = variant === "onboarding";
  const wrapperClass = isOnboarding
    ? "rounded-xl border border-amber-500/70 bg-amber-200/35 p-4 space-y-4"
    : "rounded-lg border border-gray-200 bg-gray-50/80 p-4 space-y-4";
  const titleClass = isOnboarding ? "font-semibold text-amber-950" : "font-semibold text-gray-900";
  const descClass = isOnboarding ? "text-xs text-amber-900/70 mt-1" : "text-xs text-gray-600 mt-1";
  const labelClass = "block text-sm font-medium text-gray-800 mb-1.5";
  const inputClass = isOnboarding
    ? "w-full rounded-xl border border-amber-400 bg-white px-3 py-2.5 text-gray-900 placeholder:text-amber-900/45 focus:border-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-600/35 disabled:bg-amber-100/50"
    : "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/30 disabled:bg-gray-100";
  const radiusStepBtnClass = isOnboarding
    ? "shrink-0 rounded-xl border border-amber-400 bg-white px-3 py-2.5 text-base font-semibold leading-none text-gray-900 tabular-nums hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
    : "shrink-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-base font-semibold leading-none text-gray-900 tabular-nums hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white";
  const hintClass = isOnboarding ? "text-xs text-amber-900/70 mt-1.5" : "text-xs text-gray-500 mt-1.5";
  const suggestWrapperClass = isOnboarding
    ? "mt-2 rounded-xl border border-amber-300 bg-white shadow-sm divide-y divide-amber-100 max-h-56 overflow-auto"
    : "mt-2 rounded-lg border border-gray-200 bg-white shadow-sm divide-y divide-gray-100 max-h-56 overflow-auto";
  const suggestBtnClass = isOnboarding
    ? "w-full text-left px-3 py-2.5 text-sm text-gray-900 hover:bg-amber-100/60"
    : "w-full text-left px-3 py-2.5 text-sm text-gray-900 hover:bg-gray-100";

  const redSaboreSubtitleClass = isOnboarding
    ? "text-sm text-amber-950/90 leading-snug"
    : "text-sm text-gray-700 leading-snug";

  const mapAsideLabelClass = isOnboarding ? "text-xs font-medium text-amber-950" : "text-xs font-medium text-gray-700";
  const mapShellClass = isOnboarding
    ? "relative w-full flex-1 min-h-[260px] lg:min-h-[280px] rounded-lg border border-green-200 bg-green-100/80 overflow-hidden"
    : "relative w-full flex-1 min-h-[260px] lg:min-h-[280px] rounded-lg border border-gray-200 bg-gray-100 overflow-hidden";

  const showHeadingBlock = Boolean(title.trim()) || Boolean(description.trim());
  const showMapPlaceholder = !mapVisible || !hasMapCoords;

  return (
    <div className={wrapperClass}>
      {showHeadingBlock && (
        <div>
          {title.trim() ? <h3 className={titleClass}>{title}</h3> : null}
          {description.trim() ? <p className={descClass}>{description}</p> : null}
        </div>
      )}
      <div className="space-y-3">
        <p className={redSaboreSubtitleClass}>
          Esta configuración es fundamental para figurar en la{" "}
          <strong className="font-semibold">RED Sabore.ar</strong> y para que vecinos y clientes cercanos puedan encontrarte sin vueltas.
        </p>
        <div
          className={`rounded-lg border p-3 space-y-3 ${
            isOnboarding ? "border-amber-400/60 bg-white/50" : "border-gray-200 bg-white"
          }`}
        >
          <label className={`flex items-start gap-2.5 cursor-pointer ${hasMapCoords ? "" : "opacity-60"}`}>
            <input
              type="checkbox"
              id={`${htmlIdPrefix}-red-visible`}
              checked={appearOnRedSaboreAr}
              disabled={!hasMapCoords}
              onChange={(e) => setAppearOnRedSaboreAr(e.target.checked)}
              className="mt-1 rounded border-gray-300 text-amber-700 focus:ring-amber-600 disabled:cursor-not-allowed"
            />
            <span className={`text-sm ${isOnboarding ? "text-amber-950" : "text-gray-800"}`}>
              Aparezco en la RED Sabore.ar
            </span>
          </label>
          <div className={hasMapCoords ? "" : "opacity-60"}>
            <label className={labelClass} htmlFor={`${htmlIdPrefix}-radius-km`}>
              Radio de aparición en búsquedas (km)
            </label>
            <div className="flex max-w-[18rem] items-center gap-2">
              <input
                id={`${htmlIdPrefix}-radius-km`}
                type="number"
                readOnly
                step={0.5}
                min={MIN_SEARCH_RADIUS_KM}
                max={MAX_SEARCH_RADIUS_KM}
                disabled={!hasMapCoords}
                value={searchRadiusKm}
                className={`min-w-0 flex-1 cursor-default ${inputClass}`}
              />
              <button
                type="button"
                disabled={!hasMapCoords || searchRadiusKm <= MIN_SEARCH_RADIUS_KM}
                onClick={() => setSearchRadiusKm((v) => clampSearchRadiusKm(v - 0.5))}
                className={radiusStepBtnClass}
                aria-label="Restar medio kilómetro al radio"
              >
                −
              </button>
              <button
                type="button"
                disabled={!hasMapCoords || searchRadiusKm >= MAX_SEARCH_RADIUS_KM}
                onClick={() => setSearchRadiusKm((v) => clampSearchRadiusKm(v + 0.5))}
                className={radiusStepBtnClass}
                aria-label="Sumar medio kilómetro al radio"
              >
                +
              </button>
            </div>
            <p className={hintClass}>
              Distancia máxima a la que tu local puede aparecer cuando la gente busca cerca. Entre {MIN_SEARCH_RADIUS_KM} y {MAX_SEARCH_RADIUS_KM} km.
            </p>
          </div>
          {!hasMapCoords && (
            <p className={`${hintClass} text-amber-900/80 ${isOnboarding ? "" : "text-gray-600"}`}>
              Confirmá primero una dirección en el mapa para habilitar estas opciones.
            </p>
          )}
        </div>
        <label className={labelClass} htmlFor={`${htmlIdPrefix}-address`}>
          Dirección de la casa de comidas
        </label>
        <div className="grid gap-4 lg:grid-cols-2 lg:gap-6 lg:items-stretch">
          <div className="min-w-0 flex flex-col gap-2">
            <input
              id={`${htmlIdPrefix}-address`}
              value={locationQuery}
              onChange={(e) => {
                setLocationQuery(e.target.value);
                setSelectedLocation(null);
              }}
              disabled={!placesReady || placesLoading}
              className={inputClass}
              placeholder="Busca y selecciona una dirección real"
            />
            {!placesReady && !placesError && <p className={hintClass}>Cargando Google Places…</p>}
            {placesError && <p className={`${hintClass} text-red-700`}>{placesError}</p>}
            {locationSuggestions.length > 0 && (
              <ul className={suggestWrapperClass}>
                {locationSuggestions.map((suggestion) => (
                  <li key={suggestion.placeId}>
                    <button type="button" onClick={() => selectPlaceSuggestion(suggestion)} className={suggestBtnClass}>
                      {suggestion.description}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className={`${hintClass} mb-0`}>Elegí una dirección de las sugerencias para confirmarla y verla en el mapa.</p>
          </div>
          <div className="flex flex-col gap-1.5 min-h-[280px] lg:min-h-[340px]">
            <div>
              <p className={mapAsideLabelClass}>Vista previa en el mapa</p>
              <p className={`${descClass} !mt-0`}>Podés ampliar el mapa a pantalla completa si lo necesitás.</p>
            </div>
            <div className={mapShellClass}>
              <div
                ref={locationMapElRef}
                className="absolute inset-0 w-full h-full"
                role="img"
                aria-label={
                  mapVisible && hasMapCoords
                    ? appearOnRedSaboreAr
                      ? "Mapa con ubicación, marcador y área de visibilidad en RED Sabore.ar"
                      : "Mapa con la ubicación confirmada del local"
                    : "Área de previsualización del mapa"
                }
              />
              {!showMapPlaceholder && hasMapCoords && appearOnRedSaboreAr && (
                <div className="absolute top-2 left-2 z-[2] pointer-events-none max-w-[calc(100%-1rem)]">
                  <span
                    className={`inline-block rounded-md px-2 py-1 text-[11px] font-semibold shadow-sm border ${
                      isOnboarding
                        ? "bg-amber-50/95 text-amber-950 border-amber-400/70"
                        : "bg-white/95 text-gray-900 border-gray-300/90"
                    }`}
                  >
                    Visibilidad en Red Sabore.ar
                  </span>
                </div>
              )}
              {showMapPlaceholder && (
                <div
                  className={`absolute inset-0 z-[1] flex items-center justify-center px-3 text-center pointer-events-none ${
                    isOnboarding ? "bg-amber-50/90 text-amber-900/75" : "bg-white/85 text-gray-500"
                  }`}
                >
                  <p className="text-xs leading-snug">
                    {!mapVisible
                      ? "Volvé al paso «Datos» para ver el mapa de la ubicación."
                      : "Elegí una dirección de la lista para verla aquí."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        {selectedLocation && (
          <div className="rounded-xl border border-green-300 bg-green-50 p-3 text-sm text-green-900">
            <p className="font-medium">Dirección confirmada</p>
            <p>{selectedLocation.formattedAddress}</p>
            {selectedLocation.references && <p>Referencia: {selectedLocation.references}</p>}
            <p className="text-xs mt-1">
              Coordenadas: {selectedLocation.lat?.toFixed(6)}, {selectedLocation.lng?.toFixed(6)}
            </p>
          </div>
        )}
        <p className={hintClass}>
          La dirección seleccionada será la fuente de verdad textual del local y se guardará con coordenadas para mapas.
        </p>
      </div>
      <div>
        <label className={labelClass} htmlFor={`${htmlIdPrefix}-references`}>
          Referencia adicional (opcional)
        </label>
        <input
          id={`${htmlIdPrefix}-references`}
          value={locationReferences}
          onChange={(e) => {
            const next = e.target.value;
            setLocationReferences(next);
            setSelectedLocation((prev) => (prev ? { ...prev, references: next.trim() || undefined } : prev));
          }}
          className={inputClass}
          placeholder="Ej: Timbre B, puerta verde, frente a la plaza"
        />
        <p className={hintClass}>Agrega datos para ubicar mejor el local (timbre, piso, puerta o alguna característica).</p>
      </div>
    </div>
  );
}
