import { useState } from "react";
import { CircleQuestionMark, X } from "lucide-react";

interface SectionTitleWithHelpProps {
  title: string;
  videoUrl: string;
}

function toEmbedUrl(url: string): string {
  if (url.includes("youtube.com/embed/")) return url;

  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      const videoId = parsed.pathname.replace("/", "");
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const videoId = parsed.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
  } catch {
    return url;
  }

  return url;
}

const helpBtnClass =
  "inline-flex shrink-0 items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100";

export type SectionVideoHelpButtonProps = {
  videoUrl: string;
  /** Texto del botón (p. ej. "Ayuda" en dashboard, "Video tutorial" en onboarding). */
  buttonLabel?: string;
  /** Título del encabezado del modal. */
  modalTitle: string;
  /** `title` del iframe (accesibilidad). Por defecto coincide con `modalTitle`. */
  iframeTitle?: string;
  /** `aria-label` del botón cerrar del modal. */
  closeAriaLabel?: string;
};

/** Botón que abre un modal con el video de YouTube embebido (mismo patrón que las secciones del dashboard). */
export function SectionVideoHelpButton({
  videoUrl,
  buttonLabel = "Video tutorial",
  modalTitle,
  iframeTitle,
  closeAriaLabel = "Cerrar",
}: SectionVideoHelpButtonProps) {
  const [open, setOpen] = useState(false);
  const embedUrl = toEmbedUrl(videoUrl);
  const frameTitle = iframeTitle ?? modalTitle;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={helpBtnClass}>
        <CircleQuestionMark size={16} aria-hidden />
        {buttonLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-3xl rounded-lg bg-white shadow-lg">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-lg font-semibold">{modalTitle}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label={closeAriaLabel}
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4">
              <div className="aspect-video w-full overflow-hidden rounded-md border">
                <iframe
                  className="h-full w-full"
                  src={embedUrl}
                  title={frameTitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function SectionTitleWithHelp({ title, videoUrl }: SectionTitleWithHelpProps) {
  const modalTitle = `Ayuda de sección: ${title}`;

  return (
    <div className="mb-4 flex items-center gap-3">
      <h1 className="title-section text-xl font-bold">{title}</h1>
      <SectionVideoHelpButton
        videoUrl={videoUrl}
        buttonLabel="Ayuda"
        modalTitle={modalTitle}
        iframeTitle={modalTitle}
        closeAriaLabel="Cerrar ayuda"
      />
    </div>
  );
}
