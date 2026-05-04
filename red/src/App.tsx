import { useCallback, useEffect, useMemo, useState } from "react";
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
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/45 px-4 py-6"
      onClick={onClose}
      role="presentation"
    >
      <section
        className="z-50 w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900">Términos y condiciones</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-stone-600 hover:bg-stone-100"
          >
            Cerrar
          </button>
        </div>

        <div className="space-y-2 text-sm text-stone-700">
          <p>
            Sabore.ar no se responsabiliza por la calidad, disponibilidad, stock ni veracidad de
            menús, precios, promociones, imágenes o descripciones publicadas por cada local.
          </p>
          <p>
            Cada casa de comidas es responsable de sus tiempos de entrega o retiro, estado de los
            productos, atención al cliente y cumplimiento de sus condiciones comerciales.
          </p>
          <p>
            Los reclamos enviados mediante esta plataforma se registran para seguimiento y pueden
            ser derivados al local correspondiente.
          </p>
          <p>El uso de la plataforma implica la aceptación de estos términos.</p>
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClaim}
            className="rounded-lg border border-amber-600 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50"
          >
            Envíanos tu reclamo
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
            "Si niegas el acceso a la ubicación, no podremos mostrarte las casas de comidas cercanas. Si querés permitir el acceso, podés hacerlo en la configuración de tu navegador."
          );
        } else if (geoErr.code === geoErr.POSITION_UNAVAILABLE) {
          setError("No se pudo determinar tu ubicación.");
        } else {
          setError("No pudimos acceder a tu ubicación. Si no te aparece la opción para permitirla, abrí esta web en un navegador externo (Chrome, Edge u otro): desde el menú del navegador embebido elegí “Abrir en el navegador” o similar y volvé a intentar.");
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

  return (
    <>
      <div className="mx-auto flex h-screen w-full max-w-xl flex-col px-4 py-4">
        <header className="shrink-0">
          <div className="flex items-start gap-3 items-center">
            <img
              src="/img/favicon_XL.png"
              alt="Sabore.ar"
              className="h-12 w-12 shrink-0 object-contain"
              width={48}
              height={48}
            />
            <div className="text-left">
              <p className="text-[11px] font-medium uppercase tracking-widest text-amber-700">
                Sabore.ar
              </p>
              <h1 className="text-2xl font-bold leading-none tracking-tight text-stone-900">RED</h1>
            </div>
            <p className="text-center whitespace-normal text-sm  text-stone-600">
                Encontrá casas de comidas adheridas cerca de donde estás. 
                <br />
                Hacé pedidos por WhatsApp para delivery, retiro o consumo en el local.
            </p>
          </div>

          <button
            type="button"
            onClick={searchNearby}
            disabled={loading}
            className="mt-3 w-full rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Buscando…" : "Buscar casas de comidas cercanas"}
          </button>
        </header>

        <main className="mt-4 min-h-0 flex-1">
          <section className="flex h-full min-h-0 flex-col rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
            {error ? (
              <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </p>
            ) : null}

            {items && items.length === 0 && !loading ? (
              <p className="px-2 py-4 text-center text-sm text-stone-600">
                No hay locales en RED dentro de tu zona. Probá más tarde o desde otro lugar.
              </p>
            ) : null}

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              {items && items.length > 0 ? (
                <ul className="flex flex-col gap-3">
                  {items.map((it) => (
                    <li key={it.slug}>
                      <button
                        type="button"
                        onClick={() => openMenu(it.slug)}
                        className="flex w-full gap-4 rounded-xl border border-stone-200 bg-stone-50 p-4 text-left transition hover:border-amber-300 hover:bg-white"
                      >
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                          {it.logoUrl ? (
                            <img
                              src={it.logoUrl}
                              alt=""
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-xl font-bold text-stone-400">
                              {it.name.slice(0, 1).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0">
                            <h2 className="truncate font-semibold text-stone-900">{it.name}</h2>
                            <span className="shrink-0 text-sm text-amber-700">
                              {it.distanceKm} km
                            </span>
                          </div>
                          {it.description ? (
                            <p className="mt-2 text-base font-medium leading-snug text-stone-800">
                              {it.description}
                            </p>
                          ) : null}
                          {it.address || it.references ? (
                            <div className="mt-2 space-y-1 text-xs leading-snug text-stone-600">
                              {it.address ? <p>{it.address}</p> : null}
                              {it.references ? (
                                <p>
                                  <span className="text-stone-500">Ref.: </span>
                                  {it.references}
                                </p>
                              ) : null}
                            </div>
                          ) : null}
                          <p className="mt-2 text-xs font-medium text-amber-700">Ver menú digital →</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>
        </main>

        <footer className="mt-3 shrink-0 text-center">
          <button
            type="button"
            onClick={handleJoinNetworkClick}
            className="text-xs text-stone-600 underline decoration-dotted underline-offset-2 hover:text-stone-800"
          >
            ¿Vendés comidas y te querés unir a nuestra red? Hacé click aquí
          </button>
          <div className="mt-2">
            <button
              type="button"
              onClick={() => setIsTermsOpen(true)}
              className="text-xs font-medium text-amber-700 underline underline-offset-2 hover:text-amber-800"
            >
              Términos y condiciones
            </button>
          </div>
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
