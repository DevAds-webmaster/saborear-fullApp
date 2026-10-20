import { useCallback, useEffect, useRef, useState } from "react";
import type { UbicacionRepartidor } from "../../types";

type PlaceSuggestion = { description: string; placeId: string };

type Props = {
  value: UbicacionRepartidor | null;
  radioKm: number;
  onChange: (value: UbicacionRepartidor) => void;
};

const SCRIPT_ID = "google-maps-places-sdk";
/** Centro inicial cuando todavía no hay punto elegido (Buenos Aires). */
const DEFAULT_CENTER = { lat: -34.6037, lng: -58.3816 };

const gmaps = () => window.google?.maps;

export default function UbicacionMapPicker({ value, radioKm, onChange }: Props) {
  const [query, setQuery] = useState(value?.direccion ?? "");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [ready, setReady] = useState(Boolean(gmaps()?.places));
  const [error, setError] = useState("");
  const [loadingDetails, setLoadingDetails] = useState(false);

  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<GMaps.Map | null>(null);
  const markerRef = useRef<GMaps.Marker | null>(null);
  const circleRef = useRef<GMaps.Circle | null>(null);
  const autocompleteRef = useRef<GMaps.AutocompleteService | null>(null);
  const placesRef = useRef<GMaps.PlacesService | null>(null);
  const geocoderRef = useRef<GMaps.Geocoder | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const lat = value?.lat;
  const lon = value?.lon;
  const direccion = value?.direccion;

  useEffect(() => {
    if (gmaps()?.places) {
      setReady(true);
      return;
    }
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError("Falta VITE_GOOGLE_MAPS_API_KEY en manager/.env");
      return;
    }

    const onReady = () => {
      if (gmaps()?.places) {
        setReady(true);
        setError("");
      } else {
        setError("No se pudo inicializar Google Maps.");
      }
    };

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", onReady);
      return () => existing.removeEventListener("load", onReady);
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
    script.addEventListener("load", onReady);
    script.addEventListener("error", () => setError("Falló la carga de Google Maps."));
    document.head.appendChild(script);
    return () => script.removeEventListener("load", onReady);
  }, []);

  /** Punto elegido con clic o arrastre: intenta resolver la dirección por geocodificación inversa. */
  const moverPunto = useCallback((newLat: number, newLon: number) => {
    onChangeRef.current({ lat: newLat, lon: newLon });
    setQuery("");
    setSuggestions([]);
    const maps = gmaps();
    if (!maps) return;
    if (!geocoderRef.current) geocoderRef.current = new maps.Geocoder();
    geocoderRef.current.geocode({ location: { lat: newLat, lng: newLon } }, (results, status) => {
      if (status !== "OK" || !results?.length) return;
      const dir = String(results[0].formatted_address || "").trim();
      if (!dir) return;
      onChangeRef.current({ lat: newLat, lon: newLon, direccion: dir });
      setQuery(dir);
    });
  }, []);

  useEffect(() => {
    const maps = gmaps();
    if (!ready || !maps || !mapElRef.current || mapRef.current) return;
    const map = new maps.Map(mapElRef.current, {
      center: DEFAULT_CENTER,
      zoom: 11,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });
    map.addListener("click", (e) => {
      if (e.latLng) moverPunto(e.latLng.lat(), e.latLng.lng());
    });
    mapRef.current = map;

    return () => {
      if (markerRef.current) {
        maps.event.clearInstanceListeners(markerRef.current);
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
      maps.event.clearInstanceListeners(map);
      mapRef.current = null;
    };
  }, [ready, moverPunto]);

  useEffect(() => {
    const map = mapRef.current;
    const maps = gmaps();
    if (!ready || !map || !maps) return;

    if (lat === undefined || lon === undefined) {
      markerRef.current?.setMap(null);
      circleRef.current?.setMap(null);
      return;
    }

    const position = { lat, lng: lon };
    if (!markerRef.current) {
      markerRef.current = new maps.Marker({ position, map, draggable: true });
      markerRef.current.addListener("dragend", (e) => {
        if (e.latLng) moverPunto(e.latLng.lat(), e.latLng.lng());
      });
    } else {
      markerRef.current.setPosition(position);
      markerRef.current.setMap(map);
    }

    const radiusM = Math.max(0, radioKm) * 1000;
    if (!circleRef.current) {
      circleRef.current = new maps.Circle({
        map,
        center: position,
        radius: radiusM,
        strokeColor: "#4f46e5",
        strokeOpacity: 0.9,
        strokeWeight: 2,
        fillColor: "#6366f1",
        fillOpacity: 0.12,
        clickable: false,
      });
    } else {
      circleRef.current.setCenter(position);
      circleRef.current.setRadius(radiusM);
      circleRef.current.setMap(map);
    }

    const bounds = circleRef.current.getBounds();
    if (bounds) map.fitBounds(bounds, 16);
  }, [ready, lat, lon, radioKm, moverPunto]);

  useEffect(() => {
    const maps = gmaps();
    if (!ready || !maps) return;
    const q = query.trim();
    if (q.length < 3 || q === direccion) {
      setSuggestions([]);
      return;
    }
    if (!autocompleteRef.current) {
      autocompleteRef.current = new maps.places.AutocompleteService();
    }
    const service = autocompleteRef.current;
    const timeoutId = window.setTimeout(() => {
      service.getPlacePredictions({ input: q, types: ["geocode"] }, (predictions, status) => {
        if (status !== maps.places.PlacesServiceStatus.OK || !predictions) {
          setSuggestions([]);
          return;
        }
        setSuggestions(predictions.slice(0, 6).map((p) => ({ description: p.description, placeId: p.place_id })));
      });
    }, 250);
    return () => window.clearTimeout(timeoutId);
  }, [query, ready, direccion]);

  const seleccionarSugerencia = (s: PlaceSuggestion) => {
    const maps = gmaps();
    if (!maps?.places) return;
    if (!placesRef.current) {
      placesRef.current = new maps.places.PlacesService(document.createElement("div"));
    }
    setLoadingDetails(true);
    placesRef.current.getDetails({ placeId: s.placeId, fields: ["formatted_address", "geometry"] }, (place, status) => {
      setLoadingDetails(false);
      const location = place?.geometry?.location;
      if (status !== maps.places.PlacesServiceStatus.OK || !location) {
        setError("No se pudieron obtener los detalles de la dirección.");
        return;
      }
      const dir = String(place?.formatted_address || s.description || "").trim();
      onChange({ lat: location.lat(), lon: location.lng(), direccion: dir });
      setQuery(dir);
      setSuggestions([]);
      setError("");
    });
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="Buscar dirección o barrio de la zona de reparto"
          value={query}
          disabled={!ready || loadingDetails}
          onChange={(e) => setQuery(e.target.value)}
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full rounded border bg-white shadow divide-y max-h-56 overflow-auto">
            {suggestions.map((s) => (
              <li key={s.placeId}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                  onClick={() => seleccionarSugerencia(s)}
                >
                  {s.description}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {!ready && !error && <p className="text-xs text-gray-500">Cargando Google Maps...</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="relative w-full h-72 rounded border bg-gray-100 overflow-hidden">
        <div ref={mapElRef} className="absolute inset-0" role="img" aria-label="Mapa de la zona del repartidor" />
      </div>
      <p className="text-xs text-gray-500">
        Buscá una dirección o hacé clic en el mapa para marcar el punto. Podés arrastrar el marcador para ajustarlo.
      </p>
      {lat !== undefined && lon !== undefined && (
        <p className="text-xs text-gray-700">
          Coordenadas: {lat.toFixed(6)}, {lon.toFixed(6)}
          {direccion ? ` · ${direccion}` : ""}
        </p>
      )}
    </div>
  );
}
