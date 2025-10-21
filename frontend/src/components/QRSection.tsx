
import { useResto } from "../contexts/RestoContext";
import { QRCodeCanvas } from "qrcode.react";
import React, { useRef } from "react";
import { useReactToPrint } from 'react-to-print';


export const QRSection = () =>{

    const {resto} = useResto();
    const hostURL = window.location.origin;
    
    const fullURL = `${hostURL}/app/${resto?.slug}`;

    const componenteRef = useRef<HTMLDivElement>(null);


    const handlePrint = useReactToPrint({
        contentRef: componenteRef, // ✅ usar contentRef en lugar de content()
        documentTitle: "QRMenu",
      });

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
            <div className="flex border-2 rounded-lg p-2">
                <span className="font-sans italic text-blue-500">URL:&nbsp;&nbsp;</span>
                <a href={fullURL}>
                    {fullURL}
                </a>
            </div>
            <div>
                <button 
                    type="button" 
                    className=" bg-gray-400 hover:bg-gray-200 px-4 py-2"
                    onClick={handlePrint}
                >
                    🖨️ Imprimir QR
                </button>
            </div>
        </div>
    </div>
    );
}
