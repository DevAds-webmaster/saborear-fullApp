import { useCallback, useEffect, useState } from "react";
import { Share, Smartphone, X } from "lucide-react";

const STORAGE_KEY = "red_pwa_install_dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    nav.standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches
  );
}

function isIosDevice(): boolean {
  const ua = window.navigator.userAgent;
  const iOS = /iphone|ipad|ipod/i.test(ua);
  const iPadOs = window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1;
  return iOS || iPadOs;
}

function isMobileDevice(): boolean {
  return (
    isIosDevice() ||
    /android|webos|mobile/i.test(window.navigator.userAgent) ||
    window.matchMedia("(max-width: 768px)").matches
  );
}

export default function InstallPrompt() {
  const [open, setOpen] = useState(false);
  const [ios, setIos] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      return;
    }
    if (!isMobileDevice()) return;

    setIos(isIosDevice());
    setOpen(true);

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
      setOpen(false);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return;
    setInstalling(true);
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") {
        try {
          localStorage.setItem(STORAGE_KEY, "1");
        } catch {
          /* ignore */
        }
        setOpen(false);
      }
    } finally {
      setInstalling(false);
      setDeferred(null);
    }
  }, [deferred]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-4 py-6 sm:items-center"
      onClick={dismiss}
      role="presentation"
    >
      <section
        className="z-50 w-full max-w-md rounded-2xl border border-neutral-100 bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-labelledby="pwa-install-title"
        aria-modal="true"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#06373A] ring-1 ring-black/10">
              <img src="/img/icon-192.png" alt="" className="h-12 w-12 object-cover" width={48} height={48} />
            </span>
            <div>
              <h2 id="pwa-install-title" className="text-lg font-bold tracking-tight text-neutral-900">
                Agregá Red Sabore.ar a tu inicio
              </h2>
              <p className="mt-0.5 text-sm text-neutral-500">Acceso directo en tu celular</p>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-800"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        {ios ? (
          <div className="space-y-3 text-sm leading-relaxed text-neutral-600">
            <p>En iPhone o iPad el navegador no instala solo. Hacé esto una vez:</p>
            <ol className="list-decimal space-y-2 pl-5">
              <li className="flex items-start gap-2">
                <Share className="mt-0.5 h-4 w-4 shrink-0 text-[#06373A]" strokeWidth={2.2} aria-hidden />
                <span>Tocá el botón <strong>Compartir</strong> (el cuadrado con la flecha).</span>
              </li>
              <li>Elegí <strong>Agregar a pantalla de inicio</strong>.</li>
              <li>Confirmá el nombre <strong>Red Sabore.ar</strong>.</li>
            </ol>
          </div>
        ) : (
          <div className="space-y-2 text-sm leading-relaxed text-neutral-600">
            <p>
              Instalá el acceso directo para abrir la red de comidas como una app, sin pasar por el navegador.
            </p>
            {!deferred ? (
              <p>
                Si Chrome no muestra el aviso, abrí el menú de tres puntos y tocá{" "}
                <strong>Instalar app</strong> o <strong>Agregar a la pantalla de inicio</strong>.
              </p>
            ) : null}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={dismiss}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
          >
            Ahora no
          </button>
          {!ios ? (
            <button
              type="button"
              onClick={deferred ? install : dismiss}
              disabled={installing}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFC107] px-4 py-2.5 text-sm font-bold text-[#06373A] shadow-sm transition hover:bg-[#E6AC00] active:scale-[0.98] disabled:opacity-60"
            >
              <Smartphone className="h-4 w-4" strokeWidth={2.2} aria-hidden />
              {installing ? "Instalando…" : deferred ? "Agregar a inicio" : "Entendido"}
            </button>
          ) : (
            <button
              type="button"
              onClick={dismiss}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFC107] px-4 py-2.5 text-sm font-bold text-[#06373A] shadow-sm transition hover:bg-[#E6AC00] active:scale-[0.98]"
            >
              Entendido
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
