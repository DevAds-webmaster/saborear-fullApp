import React, { useState , useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Link,
  Eye,
  X,
  Move
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { useResto } from "../contexts/RestoContext";

export default function TopBar() {
    const {user} = useAuth();
    const {resto, btnSaveEnabled, setBtnSaveEnabled} = useResto();
    const Navigate = useNavigate();
    const [modalShow,setModalShow] = useState(false);

    return <>
    <div className="flex bg-white h-20 shadow-lg rounded-lg border-gray-400 border mb-5 items-center px-2">
        <div>
            <p><span className="font-bold">Usuario:</span>&nbsp;&nbsp;{user?.username}</p>
            <p><span className="font-bold">Email:</span>&nbsp;&nbsp;{user?.email}</p>
        </div>
        <button 
            title='Vista Previa' 
            className="flex bg-gray-500 hover:bg-gray-400 text-white px-4 py-2 h-fit ml-auto rounded-md" 
            onClick={()=>setModalShow(true)}
        >
            VistaPrevia &nbsp; <Eye/>
        </button>
        <button 
            title='Menu Público' 
            className="flex bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 h-fit ml-2 rounded-md" 
            onClick={()=> {
                if(btnSaveEnabled){
                    const res = confirm("Tienes cambios sin guardar, estas seguro de salir de esta seccion?Tus cambios se perderán");
                    if(!res) return;
                    setBtnSaveEnabled(false);
                }
                Navigate('/app/'+resto?.slug)
            }}
        >
            Menu Público &nbsp; <Link/>
        </button>
    </div>
     {/* Modal */}
     <PreviewModal
        open={modalShow}
        onClose={() => setModalShow(false)}
        />
    </>
}


function PreviewModal({ open, onClose }: any) {
  const [selectedFormat, setSelectedFormat] = useState('smartphone');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const {restoPreview} = useResto();

  const formatSizes = {
    smartphone: { width: '375px', height: '667px' },
    tablet: { width: '768px', height: '1024px' },
    desktop: { width: '1200px', height: '800px' }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!modalRef.current) return;
    const rect = modalRef.current.getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !modalRef.current) return;
    modalRef.current.style.left = `${e.clientX - dragOffset.x}px`;
    modalRef.current.style.top = `${e.clientY - dragOffset.y}px`;
    modalRef.current.style.transform = 'none';
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (!isDragging) return;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Sincroniza datos de preview: guarda en localStorage y envía por postMessage sin recargar el iframe
  useEffect(() => {
    if (open && restoPreview) {
      try {
        localStorage.setItem('saborear_preview', JSON.stringify(restoPreview));
      } catch {}
      // Intentar enviar actualización en vivo al iframe
      try {
        iframeRef.current?.contentWindow?.postMessage(
          { type: 'preview:update', data: restoPreview },
          window.location.origin
        );
      } catch {}
    }
  }, [open, restoPreview]);

  // Al cargar el iframe, enviar el estado actual para asegurar sincronización inicial
  const handleIframeLoad = () => {
    if (!restoPreview) return;
    try {
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'preview:update', data: restoPreview },
        window.location.origin
      );
    } catch {}
  };

  const previewUrl = `/preview/${restoPreview?.slug || ''}`;

  if (!open) return null; 
 

    return (
        <div
            className="fixed inset-0 z-50 pointer-events-none"
        >
            <div 
                ref={modalRef}
                className="absolute bg-white rounded-lg shadow-2xl border-2 border-gray-300 pointer-events-auto"
                style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 'fit-content',
                    minWidth: '400px',
                    maxHeight: '90vh',
                    overflow: 'hidden'
                }}
            >
                {/* Header with drag handle and close button */}
                <div 
                    className="cursor-move flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg"
                    onMouseDown={handleMouseDown}
                    title="Arrastrar para mover">
                    <div className="flex items-center gap-2">
                        <div className=" p-1 hover:bg-gray-200 rounded transition-colors">
                            <Move className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="font-semibold text-gray-700">Vista Previa</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        title="Cerrar"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Format selector */}
                <div className="p-4 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Formato de visualización:</h3>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="format"
                                value="smartphone"
                                checked={selectedFormat === 'smartphone'}
                                onChange={(e) => setSelectedFormat(e.target.value)}
                                className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm text-gray-700">📱 Smartphone</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="format"
                                value="tablet"
                                checked={selectedFormat === 'tablet'}
                                onChange={(e) => setSelectedFormat(e.target.value)}
                                className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm text-gray-700">📱 Tablet</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="format"
                                value="desktop"
                                checked={selectedFormat === 'desktop'}
                                onChange={(e) => setSelectedFormat(e.target.value)}
                                className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm text-gray-700">💻 Desktop</span>
                        </label>
                    </div>
                </div>

                {/* Preview content (Container + Interface in preview mode) */}
                <div className="p-4" style={{ height: 'calc(90vh - 200px)' }}>
                    <div 
                        className="border-2 border-gray-300 rounded-lg overflow-hidden mx-auto"
                        style={{
                            width: formatSizes[selectedFormat as keyof typeof formatSizes].width,
                            height: '100%',
                            maxWidth: '100%'
                        }}
                    >
                    <iframe
                      ref={iframeRef}
                      src={previewUrl}
                      title="Vista previa"
                      className="w-full h-full"
                      style={{ border: '0' }}
                      onLoad={handleIframeLoad}
                    />
                    </div>
                </div>
            </div>
        </div>
    );
}