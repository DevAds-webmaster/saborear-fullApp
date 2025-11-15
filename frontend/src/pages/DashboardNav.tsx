import React, { useState, useRef } from "react";
import {
  LayoutGrid,
  PaintRoller,
  DollarSign,
  BarChart3,
  Menu,
  LogOut,
  Bolt ,
  Soup,
  X,
  Edit
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useResto } from "../contexts/RestoContext"; 
import { getDishImageUrl, getCloudinarySignature, uploadSignedToCloudinary } from "../services/media";
import type { SignedImage, Resto, Config } from "../types";

export default function DashboardNav({ active, onChange }:any) {
  const [open, setOpen] = useState(false);
  const [isHoveringLogo, setIsHoveringLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  
  const {btnSaveEnabled,setBtnSaveEnabled, resto, updateResto} = useResto();

  const items = [
    { id: "home", label: "Home", icon: <LayoutGrid size={20} /> },
    { id: "menu", label: "Gestión de Menú", icon: <Soup  size={20} /> },
    { id: "visual", label: "Personalización Visual", icon: <PaintRoller size={20} /> },
    { id: "payments", label: "Suscripción y Pagos", icon: <DollarSign size={20} /> },
    { id: "stats", label: "Estadísticas", icon: <BarChart3 size={20} /> },
    { id: "config", label: "Configuracion", icon: <Bolt  size={20} /> },
  ];

  const { logout } = useAuth();

  const uploadImage = async (file: File): Promise<SignedImage | null> => {
    try {
      const sig = await getCloudinarySignature();
      const r = await uploadSignedToCloudinary(file, sig);
      return { 
        secure_url: r.secure_url, 
        public_id: r.public_id, 
        width: r.width, 
        height: r.height, 
        format: r.format 
      };
    } catch {
      alert('Error subiendo imagen');
      return null;
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !resto) return;
    
    const img = await uploadImage(file);
    if (!img) return;

    // Actualizar el resto con la nueva imagen
    const updatedConfig : Config | undefined = {
      ...resto.config,
      srcImgLogoDashboard: img as SignedImage
    };

    const updatedResto : Resto | undefined = {
      ...resto,
      config: updatedConfig
    };

    if(!updatedResto) return;
    const updated = await updateResto(resto._id, updatedResto);

    if (updated) {
      alert("Logo actualizado correctamente ✅");
    } else {
      alert("Error al actualizar el logo ❌");
    }

    // Limpiar el input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      {/* Mobile button */}
      {!open && (
        <button
          className="lg:hidden p-3 absolute top-4 left-4 bg-gray-200 rounded-md z-30"
          onClick={() => setOpen(!open)}
        >
          <Menu />
        </button>
      )}

      {/* Overlay oscuro al 50% - solo visible en mobile cuando el menú está abierto */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-20 h-full w-64 bg-white shadow-lg transform 
        ${open ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 transition-transform duration-200 flex flex-col`}
      >
        {/* Botón de cierre - solo visible en mobile */}
        <button
          className="lg:hidden absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-30"
          onClick={() => setOpen(false)}
          aria-label="Cerrar menú"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center py-6 flex-shrink-0">
          <div 
            className="relative h-full w-32 rounded flex items-center justify-center bg-white group cursor-pointer"
            onMouseEnter={() => setIsHoveringLogo(true)}
            onMouseLeave={() => setIsHoveringLogo(false)}
            onClick={() => fileInputRef.current?.click()}
          >
            {resto?.config?.srcImgLogoDashboard?.secure_url ? (
              <img
                src={getDishImageUrl(resto.config.srcImgLogoDashboard, 256)}
                alt="Logo"
                className="max-h-full max-w-32 object-contain"
              />
            ) : (
              <div className="h-20 w-32 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                Sin logo
              </div>
            )}
            {/* Overlay con icono de edición */}
            {isHoveringLogo && (
              <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                <Edit className="text-white" size={24} />
              </div>
            )}
            {/* Input file oculto */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>
        </div>

        <nav className="px-4 space-y-2 flex-1 overflow-y-auto">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if(btnSaveEnabled){
                  const res = confirm("Tienes cambios sin guardar, estas seguro de salir de esta seccion?Tus cambios se perderán");
                  if(res){
                    setBtnSaveEnabled(false);
                    onChange(item.id);
                    setOpen(false);
                  }
                }
                else{
                  onChange(item.id);
                  setOpen(false);
                }
              }}
              className={`flex items-center justify-between w-full p-3 rounded-md 
                text-sm font-medium transition 
                ${active === item.id ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"}`}
            >
              {item.label}
              {item.icon}
            </button>
          ))}
          <button
            onClick={() => {
              logout();
              setOpen(false);
            }}
            className="flex items-center justify-between w-full p-3 mt-full rounded-md text-sm font-medium transition text-gray-700 hover:bg-gray-100"
          >
            Cerrar Sesión
            <LogOut />
          </button>
        </nav>
      </aside>
    </>
  );
}
