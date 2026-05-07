import { useCallback, useEffect, useMemo, useState } from "react";
import { ChefHat, MapPin, MapPinSearch, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export type RedNearbyItem = {
  slug: string;
  name: string;
  logoUrl: string | null;
  address: string;
  references: string | null;
  description: string | null;
  distanceKm: number;
};

function trimBase(url: string): string {
  return url.replace(/\/+$/, "");
}

function formatDistanceKm(km: number): string {
  return `${new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(km)} km`;
}

function ResultsSkeleton() {
  return (
    <ul className="flex flex-col gap-3" aria-hidden>
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          className="flex animate-pulse items-center gap-3 rounded-2xl bg-neutral-100 p-4"
        >
          <div className="h-[72px] w-[72px] shrink-0 rounded-xl bg-neutral-200" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-3/5 max-w-[180px] rounded bg-neutral-200" />
            <div className="h-3 w-2/5 max-w-[120px] rounded bg-neutral-200/80" />
            <div className="h-3 w-1/4 max-w-[64px] rounded bg-neutral-200/70" />
          </div>
          <div className="h-10 w-10 shrink-0 rounded-full bg-neutral-200" />
        </li>
      ))}
    </ul>
  );
}

function TermsModal({
  open,
  onClose,
  onClaim,
}: {
  open: boolean;
  onClose: () => void;
  onClaim: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/45 px-4 py-6 transition-opacity"
      onClick={onClose}
      role="presentation"
    >
      <section
        className="z-50 w-full max-w-lg rounded-2xl border border-neutral-100 bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold tracking-tight text-neutral-900">
            Términos y condiciones
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
          >
            Cerrar
          </button>
        </div>

        <div className="space-y-3 text-sm leading-relaxed text-neutral-600">
          <p>
            Sabore.ar no se responsabiliza por la calidad, disponibilidad, stock ni veracidad de
            menús, precios, promociones, imágenes o descripciones publicadas por cada local.
          </p>
          <p>
            Cada casa de comidas es responsable de sus tiempos de entrega o retiro, estado de los
            productos, atención al cliente y cumplimiento de sus condiciones comerciales.
          </p>
          <p>
            Las quejas o sugerencias enviadas mediante esta plataforma se registran para seguimiento y pueden
            ser derivados al local correspondiente.
          </p>
          <p>El uso de la plataforma implica la aceptación de estos términos.</p>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-neutral-100 pt-5">
          <button
            type="button"
            onClick={onClaim}
            className="rounded-xl border-2 border-[#FFC107] bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm transition hover:bg-[#FFC107]/15 active:scale-[0.98]"
          >
            Envíanos tu queja o sugerencia
          </button>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<RedNearbyItem[] | null>(null);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  const apiBase = useMemo(() => trimBase(import.meta.env.VITE_PUBLIC_API_URL ?? ""), []);
  const menuBase = useMemo(() => trimBase(import.meta.env.VITE_URL_MENU ?? ""), []);
  const adhesionUrl = useMemo(() => trimBase(import.meta.env.VITE_RED_ADHESION_URL ?? ""), []);

  useEffect(() => {
    if (!navigator.permissions?.query) return;

    let cancelled = false;
    let removeListener: (() => void) | undefined;

    navigator.permissions
      .query({ name: "geolocation" })
      .then((status) => {
        if (cancelled) return;
        const onChange = () => {
          if (status.state === "granted") {
            setError((prevErr) => {
              const p = prevErr?.toLowerCase() ?? "";
              return p.includes("deneg") || p.includes("permiso") || p.includes("permitir")
                ? null
                : prevErr;
            });
          }
        };
        status.addEventListener("change", onChange);
        removeListener = () => status.removeEventListener("change", onChange);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      removeListener?.();
    };
  }, []);

  const searchNearby = useCallback(() => {
    setError(null);
    setItems(null);

    if (!apiBase) {
      setError("Falta configurar VITE_PUBLIC_API_URL.");
      return;
    }
    if (!menuBase) {
      setError("Falta configurar VITE_URL_MENU.");
      return;
    }
    if (!navigator.geolocation) {
      setError("Tu navegador no permite geolocalización.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const url = `${apiBase}/resto/red/nearby?lat=${encodeURIComponent(String(latitude))}&lng=${encodeURIComponent(String(longitude))}`;
          const res = await fetch(url);
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            const msg = typeof body.error === "string" ? body.error : `Error ${res.status}`;
            throw new Error(msg);
          }
          const data = (await res.json()) as RedNearbyItem[];
          setItems(Array.isArray(data) ? data : []);
        } catch (e) {
          setError(e instanceof Error ? e.message : "No se pudo obtener la lista.");
        } finally {
          setLoading(false);
        }
      },
      (geoErr) => {
        setLoading(false);
        if (geoErr.code === geoErr.PERMISSION_DENIED) {
          setError(
            "Si niegas el acceso a la ubicación, no podremos mostrarte las casas de comidas cercanas. Si querés permitir el acceso, podés hacerlo en la configuración de tu navegador.",
          );
        } else if (geoErr.code === geoErr.POSITION_UNAVAILABLE) {
          setError("No se pudo determinar tu ubicación.");
        } else {
          setError(
            "No pudimos acceder a tu ubicación. Si no te aparece la opción para permitirla, abrí esta web en un navegador externo (Chrome, Edge u otro): desde el menú del navegador embebido elegí “Abrir en el navegador” o similar y volvé a intentar.",
          );
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }, [apiBase, menuBase]);

  const openMenu = (slug: string) => {
    window.location.href = `${menuBase}/${encodeURIComponent(slug)}?cart=true`;
  };

  const handleJoinNetworkClick = () => {
    if (!adhesionUrl) {
      setError("Falta configurar VITE_RED_ADHESION_URL.");
      return;
    }
    window.open(adhesionUrl, "_blank", "noopener,noreferrer");
  };

  const showInitialEmpty = items === null && !loading && !error;
  const showResultsHeading = items !== null;

  return (
    <>
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col sm:px-4 py-6">
        <header className="shrink-0">
          <div className="flex items-start gap-3">
            <div
              className="-rotate-[8deg] flex h-14 w-14 shrink-0 items-center justify-center "
              aria-hidden
            >
              <img
                src="/img/favicon_XL.png"
                alt=""
                className="h-14 w-14 object-contain drop-shadow-sm "
                width={52}
                height={52}
              />
            </div>
            <div className="min-w-0 flex-1 pt-1 text-left">
              <p className="text-3xl font-bold tracking-tight text-[#06373A]">Sabore.ar</p>
              <p className="mt-1 text-[10px] font-bold uppercase leading-[1.15] tracking-[0.14em] text-[#06373A]">
                La red de comida de tu barrio
              </p>
            </div>
          </div>
        </header>

        <div
          className="mt-6 shrink-0 rounded-3xl bg-[#06373A] px-6 py-7 pb-10 shadow-xl shadow-black/20 ring-1 ring-black/15 sm:px-8 sm:py-8 sm:pb-11"
          style={{ backgroundColor: "#06373A" }}
        >
          <h1 className="flex flex-row items-center gap-2 text-2xl font-bold leading-snug tracking-tight text-white">
            <span className="wrap">Descubrí opciones cerca tuyo</span>
            <MapPin
              className="h-7 w-7 shrink-0 text-[#FFC107]"
              strokeWidth={2.25}
              aria-hidden
            />
          </h1>
          <p className="mt-4 max-w-[19rem] text-[15px] font-normal leading-relaxed text-white/95">
            Apoyá a emprendedores gastronómicos de tu barrio
          </p>
        </div>

        <div className="relative z-10 -mt-7 shrink-0 px-1">
          <div className="rounded-[1.75rem] bg-white/95 p-5 shadow-lg shadow-black/10 ring-1 ring-orange-950/10 backdrop-blur-[2px]">
            <button
              type="button"
              onClick={searchNearby}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-[#FFC107] px-5 py-4 text-base font-extrabold tracking-tight text-[#06373A] shadow-lg shadow-amber-900/15 ring-1 ring-black/10 transition-all hover:bg-[#E6AC00] hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
            >
              <MapPinSearch className="h-6 w-6 shrink-0 text-[#06373A]" strokeWidth={2.25} aria-hidden />
              {loading ? "Buscando…" : "Buscar casas de comidas cercanas"}
            </button>
          </div>
        </div>

        <main className="mt-6 flex min-h-0 flex-1 flex-col">
          <section className="flex min-h-[280px] flex-col p-5 ">
            {showResultsHeading ? (
              <h2 className="mb-4 text-lg font-extrabold tracking-tight text-[#06373A]">
                Negocios cerca tuyo
              </h2>
            ) : null}

            {error ? (
              <div
                className="mb-4 rounded-xl border border-red-100 bg-red-50/90 px-4 py-3 text-sm leading-relaxed text-red-900"
                role="alert"
              >
                {error}
              </div>
            ) : null}

            {loading ? (
              <div className="flex flex-col gap-2">
                <ResultsSkeleton />
              </div>
            ) : null}

            {showInitialEmpty ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF8F0] text-neutral-400 shadow-inner ring-1 ring-orange-950/10">
                  <ChefHat className="h-9 w-9" strokeWidth={1.75} aria-hidden />
                </div>
                <p className="text-base font-semibold tracking-tight text-neutral-800">
                  Todavía no buscaste negocios cercanos
                </p>
                <p className="mt-2 max-w-[260px] text-sm leading-relaxed text-neutral-500">
                  Tocá el botón amarillo para usar tu ubicación y ver locales adheridos en tu zona.
                </p>
              </div>
            ) : null}

            {!loading && items && items.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <MapPin
                  className="mb-3 h-10 w-10 text-neutral-300"
                  strokeWidth={2}
                  aria-hidden
                />
                <p className="text-sm font-medium leading-relaxed text-neutral-600">
                  No hay locales en RED dentro de tu zona. Probá más tarde o desde otro lugar.
                </p>
              </div>
            ) : null}

            {!loading && items && items.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {items.map((it) => (
                  <li key={it.slug}>
                    <button
                      type="button"
                      onClick={() => openMenu(it.slug)}
                      aria-label={`Pedir en ${it.name} — abrir menú`}
                      className="group flex w-full items-center gap-3 rounded-2xl border border-orange-950/[0.06] bg-white p-4 text-left shadow-md shadow-black/[0.06] transition-all hover:border-orange-950/10 hover:shadow-lg active:scale-[0.99]"
                    >
                      <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-black/5">
                        {it.logoUrl ? (
                          <img
                            src={it.logoUrl}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-neutral-400">
                            {it.name.slice(0, 1).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold tracking-tight text-neutral-900">
                          {it.name}
                        </p>
                        {it.description ? (
                          <p className="mt-1 line-clamp-2 text-sm leading-snug text-neutral-500">
                            {it.description}
                          </p>
                        ) : it.address ? (
                          <p className="mt-1 truncate text-xs text-neutral-400">{it.address}</p>
                        ) : null}
                        <p className="mt-1.5 text-sm text-neutral-500">
                          {formatDistanceKm(it.distanceKm)}
                        </p>
                      </div>
                      <span
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFC107] text-[#06373A] shadow-md shadow-amber-900/20 ring-2 ring-white transition group-hover:scale-105 group-hover:bg-[#E6AC00]"
                        aria-hidden
                      >
                        <ShoppingCart
                          className="h-6 w-6 fill-[#06373A] text-[#06373A]"
                          strokeWidth={2.2}
                        />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        </main>

        <footer className="mt-8 shrink-0 space-y-3 pb-4 text-center">
          <button
            type="button"
            onClick={handleJoinNetworkClick}
            className="block w-full text-xs leading-relaxed text-neutral-500 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-700"
          >
            ¿Vendés comidas y te querés unir a nuestra red? Hacé click aquí
          </button>
          <button
            type="button"
            onClick={() => setIsTermsOpen(true)}
            className="text-xs font-medium text-neutral-400 transition hover:text-neutral-600"
          >
            Términos y condiciones
          </button>
        </footer>
      </div>

      <TermsModal
        open={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
        onClaim={() => {
          setIsTermsOpen(false);
          navigate("/reclamos");
        }}
      />
    </>
  );
}
