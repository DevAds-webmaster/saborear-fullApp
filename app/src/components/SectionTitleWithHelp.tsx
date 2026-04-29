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

export function SectionTitleWithHelp({ title, videoUrl }: SectionTitleWithHelpProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const embedUrl = toEmbedUrl(videoUrl);

  return (
    <>
      <div className="flex items-center mb-4 gap-3">
        <h1 className="text-xl font-bold title-section">{title}</h1>
        <button
          type="button"
          onClick={() => setIsHelpOpen(true)}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          <CircleQuestionMark size={16} />
          Ayuda
        </button>
      </div>

      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-3xl rounded-lg bg-white shadow-lg">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-lg font-semibold">Ayuda de seccion: {title}</h2>
              <button
                type="button"
                onClick={() => setIsHelpOpen(false)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Cerrar ayuda"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4">
              <div className="aspect-video w-full overflow-hidden rounded-md border">
                <iframe
                  className="h-full w-full"
                  src={embedUrl}
                  title={`Ayuda de seccion: ${title}`}
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
