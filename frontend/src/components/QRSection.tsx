
import { useResto } from "../contexts/RestoContext";
import { QRCodeCanvas } from "qrcode.react";
import { useRef, useState } from "react";
import { Copy as CopyIcon } from "lucide-react";
import { useReactToPrint } from 'react-to-print';


export const QRSection = () =>{

    const {resto} = useResto();
    const hostURL = window.location.origin;
    
    const fullURL = `${hostURL}/app/${resto?.slug}`;

    const componenteRef = useRef<HTMLDivElement>(null);
    const printRef = useRef<HTMLDivElement>(null);
    const [printModalOpen, setPrintModalOpen] = useState(false);
    const [layout, setLayout] = useState<'1x1' | '2x3'>('1x1');
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


    const handlePrint = useReactToPrint({
        contentRef: printRef, // imprimimos el layout A4 del modal
        documentTitle: "QRMenu",
      });

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
       
    <div className="flex"  >
        <div ref={componenteRef}>
            <QRCodeCanvas
                value={fullURL}
                size={200} // tamaño del QR
                bgColor="#ffffff"
                fgColor="#000000"
                level="H" // nivel de corrección de errores (L, M, Q, H)
                includeMargin={true}
                className="cursor-pointer"
                onClick={() => window.open(fullURL, "_blank")}
            />
        </div>
        <div className="flex flex-col  p-5 justify-center space-y-4">
            <div className="flex border-2 rounded-lg p-2 items-center gap-2">
                <span className="font-sans italic text-blue-500">URL:&nbsp;&nbsp;</span>
                <a href={fullURL} onClick={handleCopyUrl} className="flex items-center gap-2 text-blue-600 hover:underline">
                    <CopyIcon size={16} />
                    {fullURL}
                </a>
            </div>
            <div>
                <button 
                    type="button" 
                    className=" bg-gray-400 hover:bg-gray-200 px-4 py-2"
                    onClick={() => setPrintModalOpen(true)}
                >
                    🖨️ Imprimir QR
                </button>
            </div>
        </div>

        {printModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                <div className="bg-white rounded-md shadow-xl w-full max-w-4xl mx-4 h-[90vh]">
                    <div className="px-4 py-3 border-b flex items-center justify-between">
                        <h2 className="font-semibold">Imprimir QR - Configuración A4</h2>
                        <button onClick={() => setPrintModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                    </div>

                    <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="space-y-3">
                            <div className="font-medium">Formato de grilla</div>
                            <label className="flex items-center gap-2">
                                <input type="radio" name="qr-layout" value="1x1" checked={layout==='1x1'} onChange={() => setLayout('1x1')} />
                                <span>1 x 1</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="radio" name="qr-layout" value="2x6" checked={layout==='2x3'} onChange={() => setLayout('2x3')} />
                                <span>2 x 3</span>
                            </label>
                            <div className="text-xs text-gray-500 pt-2">Se imprimirá en tamaño A4 con márgenes moderados.</div>
                        </div>

                        <div className="lg:col-span-2" style={{ overflowY: 'auto', height: '70vh' }}>
                            {/* Área imprimible (preview + print target) */}
                            <div ref={printRef} className="border bg-white mx-auto" style={{ padding: '10mm' }}>
                                {/* Estilo de página para impresión */}
                                <style>
                                    {`@page { size: A4; width: 210mm; height: 297mm;}`}
                                </style>
                                {(() => {
                                    const { cols, rows } = getGridSpec(layout);
                                    const total = cols * rows;
                                    return (
                                        <div
                                            className="w-full h-full grid gap-4"
                                            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
                                        >
                                            {Array.from({ length: total }).map((_, idx) => (
                                                <div key={idx} className="flex items-center justify-center p-2">
                                                    <QRCodeCanvas
                                                        value={fullURL}
                                                        size={256}
                                                        bgColor="#ffffff"
                                                        fgColor="#000000"
                                                        level="H"
                                                        includeMargin={true}
                                                        style={{ width: '100%', height: 'auto' }}
                                                    />
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
