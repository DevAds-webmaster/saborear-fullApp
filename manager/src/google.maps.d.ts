export {};

/** Subconjunto tipado de la API JS de Google Maps usado por el manager. */
declare global {
  namespace GMaps {
    type LatLngLiteral = { lat: number; lng: number };

    interface LatLng {
      lat(): number;
      lng(): number;
    }

    interface MapMouseEvent {
      latLng?: LatLng | null;
    }

    interface MapsEventListener {
      remove(): void;
    }

    interface LatLngBounds {
      getCenter(): LatLng;
    }

    interface Map {
      fitBounds(bounds: LatLngBounds, padding?: number): void;
      addListener(event: string, handler: (e: MapMouseEvent) => void): MapsEventListener;
    }

    interface Marker {
      setPosition(position: LatLngLiteral): void;
      setMap(map: Map | null): void;
      addListener(event: string, handler: (e: MapMouseEvent) => void): MapsEventListener;
    }

    interface Circle {
      setCenter(center: LatLngLiteral): void;
      setRadius(radius: number): void;
      setMap(map: Map | null): void;
      getBounds(): LatLngBounds | null;
    }

    interface AutocompletePrediction {
      description: string;
      place_id: string;
    }

    interface AutocompleteService {
      getPlacePredictions(
        request: { input: string; types?: string[] },
        callback: (predictions: AutocompletePrediction[] | null, status: string) => void,
      ): void;
    }

    interface PlaceResult {
      formatted_address?: string;
      geometry?: { location?: LatLng };
    }

    interface PlacesService {
      getDetails(
        request: { placeId: string; fields: string[] },
        callback: (place: PlaceResult | null, status: string) => void,
      ): void;
    }

    interface GeocoderResult {
      formatted_address?: string;
    }

    interface Geocoder {
      geocode(
        request: { location: LatLngLiteral },
        callback: (results: GeocoderResult[] | null, status: string) => void,
      ): void;
    }

    interface Namespace {
      Map: new (el: HTMLElement, opts: Record<string, unknown>) => Map;
      Marker: new (opts: { position: LatLngLiteral; map: Map; draggable?: boolean }) => Marker;
      Circle: new (opts: Record<string, unknown>) => Circle;
      Geocoder: new () => Geocoder;
      event: { clearInstanceListeners(instance: object): void };
      places: {
        AutocompleteService: new () => AutocompleteService;
        PlacesService: new (attrContainer: HTMLElement) => PlacesService;
        PlacesServiceStatus: { OK: string };
      };
    }
  }

  interface Window {
    google?: { maps: GMaps.Namespace };
  }
}
