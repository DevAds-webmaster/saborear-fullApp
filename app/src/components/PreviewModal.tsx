import { useEffect, useRef, useState } from "react";
import { Move, X } from "lucide-react";
import { useResto } from "../contexts/RestoContext";

interface PreviewModalProps {
  open: boolean;
  onClose?: () => void;
  mode?: "modal" | "embedded";
  className?: string;
}

export function PreviewModal({ open, onClose, mode = "modal", className = "" }: PreviewModalProps) {
  const [selectedFormat, setSelectedFormat] = useState("smartphone");
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { restoPreview } = useResto();
  const isEmbedded = mode === "embedded";

  const formatSizes = {
    smartphone: { width: "375px", height: "667px" },
    tablet: { width: "768px", height: "1024px" },
    desktop: { width: "1200px", height: "800px" },
  };

  const handleDragStart = (clientX: number, clientY: number, ev?: { preventDefault?: () => void }) => {
    if (isEmbedded) return;
    ev?.preventDefault?.();
    if (!modalRef.current) return;
    const rect = modalRef.current.getBoundingClientRect();
    setDragOffset({ x: clientX - rect.left, y: clientY - rect.top });
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging || isEmbedded) return;

    const applyPosition = (clientX: number, clientY: number) => {
      if (!modalRef.current) return;
      modalRef.current.style.left = `${clientX - dragOffset.x}px`;
      modalRef.current.style.top = `${clientY - dragOffset.y}px`;
      modalRef.current.style.transform = "none";
    };

    const onMouseMove = (e: MouseEvent) => applyPosition(e.clientX, e.clientY);
    const onMouseUp = () => setIsDragging(false);

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      e.preventDefault();
      const t = e.touches[0];
      applyPosition(t.clientX, t.clientY);
    };
    const onTouchEnd = () => setIsDragging(false);

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd);
    document.addEventListener("touchcancel", onTouchEnd);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [isDragging, dragOffset, isEmbedded]);

  useEffect(() => {
    if (!open || !restoPreview) return;
    try {
      localStorage.setItem("saborear_preview", JSON.stringify(restoPreview));
    } catch {}
    try {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "preview:update", data: restoPreview },
        window.location.origin
      );
    } catch {}
  }, [open, restoPreview]);

  const handleIframeLoad = () => {
    if (!restoPreview) return;
    try {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "preview:update", data: restoPreview },
        window.location.origin
      );
    } catch {}
  };

  const previewUrl = `/preview/${restoPreview?.slug || ""}`;

  if (!open) return null;

  const previewFrame = (
    <div className={isEmbedded ? "h-[75vh]" : "p-4"} style={isEmbedded ? undefined : { height: "calc(90vh - 200px)" }}>
      <div
        className={`border-2 border-gray-300 rounded-lg overflow-hidden mx-auto ${isEmbedded ? "h-full" : ""}`}
        style={{
          width: formatSizes[selectedFormat as keyof typeof formatSizes].width,
          height: isEmbedded ? "100%" : "100%",
          maxWidth: "100%",
        }}
      >
        <iframe
          ref={iframeRef}
          src={previewUrl}
          title="Vista previa"
          className="w-full h-full"
          style={{ border: "0" }}
          onLoad={handleIframeLoad}
        />
      </div>
    </div>
  );

  if (isEmbedded) {
    return (
      <div className={`bg-white rounded-lg border border-gray-300 shadow-sm ${className}`}>
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Formato de visualización: (Sin Carrito Activado)</h3>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="format"
                value="smartphone"
                checked={selectedFormat === "smartphone"}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">Smartphone</span>
            </label>
            <label className="hidden sm:flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="format"
                value="tablet"
                checked={selectedFormat === "tablet"}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">Tablet</span>
            </label>
            <label className="hidden xl:flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="format"
                value="desktop"
                checked={selectedFormat === "desktop"}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">Desktop</span>
            </label>
          </div>
        </div>
        {previewFrame}
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 pointer-events-none ${className}`}>
      <div
        ref={modalRef}
        className="absolute bg-white rounded-lg shadow-2xl border-2 border-gray-300 pointer-events-auto"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "fit-content",
          minWidth: "400px",
          maxHeight: "90vh",
          overflow: "hidden",
        }}
      >
        <div
          className="cursor-move touch-none flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg select-none"
          onMouseDown={(e) => handleDragStart(e.clientX, e.clientY, e)}
          onTouchStart={(e) => {
            const t = e.touches[0];
            if (!t) return;
            handleDragStart(t.clientX, t.clientY, e);
          }}
          style={{ touchAction: "none" }}
          title="Arrastrar para mover"
        >
          <div className="flex items-center gap-2">
            <div className="p-1 hover:bg-gray-200 rounded transition-colors">
              <Move className="w-4 h-4 text-gray-500" />
            </div>
            <span className="font-semibold text-gray-700">Vista Previa</span>
          </div>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors touch-manipulation"
            title="Cerrar"
            type="button"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Formato de visualización: (Sin Carrito Activado)</h3>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="format"
                value="smartphone"
                checked={selectedFormat === "smartphone"}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">Smartphone</span>
            </label>
            <label className="hidden sm:flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="format"
                value="tablet"
                checked={selectedFormat === "tablet"}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">Tablet</span>
            </label>
            <label className="hidden xl:flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="format"
                value="desktop"
                checked={selectedFormat === "desktop"}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">Desktop</span>
            </label>
          </div>
        </div>

        {previewFrame}
      </div>
    </div>
  );
}

