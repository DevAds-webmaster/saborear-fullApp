
import { useResto } from "../contexts/RestoContext";
import { QRCodeCanvas } from "qrcode.react";
import { useRef, useState, useEffect } from "react";
import { Copy as CopyIcon } from "lucide-react";
import { useReactToPrint } from 'react-to-print';


export const QRSection = ({cart}:{cart:boolean}) =>{

    const {resto} = useResto();
    const hostURL = import.meta.env.VITE_MENU_PUBLIC_URL;
    
    const fullURL = `${hostURL}/${resto?.slug}${cart ? '?cart=true' : ''}`;
    const logoUrl = resto?.config?.srcImgLogoDashboard?.secure_url || resto?.config?.srcImgLogo?.secure_url;

    const componenteRef = useRef<HTMLDivElement>(null);
    const printRef = useRef<HTMLDivElement>(null);
    const [printModalOpen, setPrintModalOpen] = useState(false);
    const [layout, setLayout] = useState<'1x1' | '2x3'>('1x1');
    const [withLogo, setWithLogo] = useState<boolean>(false);
    const [copiedToast, setCopiedToast] = useState<string | null>(null);
    const handleCopyUrl = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            await navigator.clipboard.writeText(fullURL);
            setCopiedToast('URL copiada al portapapeles');
            setTimeout(() => setCopiedToast(null), 5000);
        } catch (err) {
            setCopiedToast('No se pudo copiar la URL');
            setTimeout(() => setCopiedToast(null), 5000);
        }
    };

    const handleDownloadPng = async () => {
        try {
            const root = componenteRef.current;
            if (!root) throw new Error("No hay componente para exportar");

            const qrCanvas = root.querySelector("canvas") as HTMLCanvasElement | null;
            if (!qrCanvas) throw new Error("No se encontró el canvas del QR");

            // Exportamos el render del QR (y opcionalmente el logo) a un PNG
            const OUTPUT_SIZE = 2160;
            const size = OUTPUT_SIZE;
            const out = document.createElement("canvas");
            out.width = size;
            out.height = size;
            const ctx = out.getContext("2d");
            if (!ctx) throw new Error("No se pudo crear el contexto 2D");

            // Fondo blanco (evita transparencias raras)
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, size, size);

            // Pintamos el QR (canvas fuente)
            ctx.drawImage(qrCanvas, 0, 0, size, size);

            // Si está activo, compositamos el logo centrado como en el overlay
            if (withLogo && logoUrl) {
                const circleSize = size * 0.28; // igual que el overlay (28%)
                const circleRadius = circleSize / 2;
                const centerX = size / 2;
                const centerY = size / 2;

                // círculo blanco
                ctx.save();
                ctx.beginPath();
                ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fillStyle = "#ffffff";
                ctx.fill();
                ctx.restore();

                // logo dentro del círculo (80%)
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.src = logoUrl;
                await img.decode();

                const logoSize = circleSize * 0.8;
                ctx.drawImage(
                    img,
                    centerX - logoSize / 2,
                    centerY - logoSize / 2,
                    logoSize,
                    logoSize
                );
            }

            const dataUrl = out.toDataURL("image/png");
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = `qr-${resto?.slug ?? "menu"}.png`;
            document.body.appendChild(a);
            a.click();
            a.remove();

            setCopiedToast("PNG descargado");
            setTimeout(() => setCopiedToast(null), 5000);
        } catch (err) {
            setCopiedToast("No se pudo generar el PNG");
            setTimeout(() => setCopiedToast(null), 5000);
        }
    };


    const handlePrint = useReactToPrint({
        contentRef: printRef, // imprimimos el layout A4 del modal
        documentTitle: "QRMenu",
      });

    const QRWithOverlay = ({ size }: { size?: number }) => {
        const wrapperRef = useRef<HTMLDivElement>(null);
        const [autoSize, setAutoSize] = useState<number>(size ?? 0);
    
        useEffect(() => {
            if (size && size > 0) {
                setAutoSize(size);
                return;
            }
            const el = wrapperRef.current;
            if (!el) return;
            const ro = new ResizeObserver((entries) => {
                const w = Math.floor(entries[0].contentRect.width);
                setAutoSize(w);
            });
            ro.observe(el);
            return () => ro.disconnect();
        }, [size]);
    
        const finalSize = size && size > 0 ? size : (autoSize || 100);
    
        return (
            <div
                ref={wrapperRef}
                className="qr-wrapper relative inline-block content-center"
                style={{
                    width: size && size > 0 ? size : '100%',
                    height: 'auto',              // antes 100%
                    maxHeight: '100%',
                    aspectRatio: '1 / 1',
                }}
            >
                <QRCodeCanvas
                    value={fullURL}
                    size={finalSize}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                    includeMargin={true}
                    className="cursor-pointer"
                    onClick={() => window.open(fullURL, "_blank")}
                    style={{ width: '100%', height: 'auto' }}   // clave: que el canvas siga al contenedor
                />
    
                {withLogo && logoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ pointerEvents: 'none' }}>
                        {/* círculo = 28% del lado del contenedor, siempre centrado */}
                        <div style={{ backgroundColor: '#ffffff', borderRadius: 9999, width: '28%', aspectRatio: '1 / 1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={logoUrl} alt="logo" style={{ width: '80%', height: '80%', objectFit: 'contain', borderRadius: 9999 }} />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const closeModalAfterPrint = async () => {
        await handlePrint();
        // pequeño delay para dejar iniciar el diálogo de impresión
        setTimeout(() => setPrintModalOpen(false), 300);
    };

    const getGridSpec = (key: '1x1' | '2x3') => {
        switch (key) {
            case '1x1': return { cols: 1, rows: 1 };
            case '2x3': return { cols: 2, rows: 3 };
        }
    };

    return(
       
    <div className="flex sm:flex-row flex-col items-center justify-center sm:items-start sm:justify-start"  >
        <div ref={componenteRef}>
            <QRWithOverlay size={200} />
        </div>
        <div className="flex flex-col  p-5 justify-center space-y-4">
            <div className="flex border-2 rounded-lg p-2 items-center gap-2">
                <span className="font-sans italic text-blue-500">Copy URL:&nbsp;&nbsp;</span>
                <a href={fullURL} onClick={handleCopyUrl} className="flex flex-col md:flex-row items-center gap-2 text-blue-600 hover:underline">
                    <CopyIcon size={30} />
                    <span className="break-all">
                        {fullURL}
                    </span>
                </a>
            </div>
            <div className="flex flex-row gap-2 justify-center">
                <div>
                    <button 
                        type="button" 
                        className=" bg-gray-400 hover:bg-gray-200 px-4 py-2"
                        onClick={() => setPrintModalOpen(true)}
                    >
                        🖨️ Imprimir QR
                    </button>
                </div>
                <div>
                    <button
                        type="button"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2"
                        onClick={handleDownloadPng}
                    >
                        ⬇️ Descargar PNG
                    </button>
                </div>
            </div>
            
        </div>

        {printModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                <div className="bg-white rounded-md shadow-xl w-full max-w-4xl mx-4 h-[90vh]">
                    <div className="px-4 py-3 border-b flex items-center justify-between">
                        <h2 className="font-semibold">Imprimir QR - Configuración A4</h2>
                        <button onClick={() => setPrintModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                    </div>

                    <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-y-auto sm:overflow-y-hidden" style={{ maxHeight: '70vh' }}>
                        <div className="space-y-3">
                            <div className="font-medium">Formato de grilla</div>
                            <label className="flex items-center gap-2">
                                <input type="radio" name="qr-layout" value="1x1" checked={layout==='1x1'} onChange={() => setLayout('1x1')} />
                                <span>1 x 1</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="radio" name="qr-layout" value="2x3" checked={layout==='2x3'} onChange={() => setLayout('2x3')} />
                                <span>2 x 3</span>
                            </label>
                            <label className="flex items-center gap-2 pt-2">
                                <input type="checkbox" checked={withLogo} onChange={(e) => setWithLogo(e.target.checked)} />
                                <span>Logo al centro</span>
                            </label>
                            <div className="text-xs text-gray-500 pt-2">Se imprimirá en tamaño A4 con márgenes moderados.</div>
                        </div>

                        <div className="lg:col-span-2" style={{ overflowY: 'auto', height: '70vh' }}>
                            {/* Área imprimible (preview + print target) */}
                            <div ref={printRef} className="print-page bg-white mx-auto w-full h-full" style={{ padding: '10mm' }}>
                                {/* Estilo de página para impresión */}
                                <style>
                                    {`@page { size: A4; margin: 0; }
                                    @media print {
                                        html, body { margin: 0 !important; padding: 0 !important; }
                                        .print-page {
                                        width: calc(210mm - 2mm);     /* ~1% menos de ancho */
                                        height: calc(297mm - 2mm);    /* ~1% menos de alto */
                                        padding: 10mm;
                                        box-sizing: border-box;
                                        border: 0 !important;
                                        }
                                        .qr-wrapper canvas { width: 100% !important; height: 100% !important; }
                                    }`}
                                </style>
                                {(() => {
                                    const { cols, rows } = getGridSpec(layout);
                                    const total = cols * rows;
                                    const center = total === 1; // solo 1 QR

                                    return (
                                        <div
                                        className={`w-full h-full grid gap-4 ${center ? 'place-items-center' : ''}`}
                                        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
                                        >
                                        {Array.from({ length: total }).map((_, idx) => (
                                            <div key={idx} className="flex w-full h-full items-center justify-center p-2">
                                            <QRWithOverlay />
                                            </div>
                                        ))}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    <div className="px-4 py-3 border-t flex justify-end gap-2">
                        <button onClick={() => setPrintModalOpen(false)} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancelar</button>
                        <button onClick={closeModalAfterPrint} className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">Imprimir</button>
                    </div>
                </div>
            </div>
        )}
        {copiedToast && (
            <div className="fixed bottom-4 right-4 bg-black text-white text-sm px-4 py-2 rounded shadow-lg opacity-90">
                {copiedToast}
            </div>
        )}
    </div>
    );
}
