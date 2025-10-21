import React, { useState } from "react";
import {
  LayoutGrid,
  Wrench,
  PaintRoller,
  DollarSign,
  BarChart3,
  Menu,
  LogOut,
  Bolt ,
  Soup 
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useResto } from "../contexts/RestoContext"; 

export default function DashboardNav({ active, onChange }:any) {
  const [open, setOpen] = useState(false);

  
  const {btnSaveEnabled,setBtnSaveEnabled} = useResto();

  const items = [
    { id: "home", label: "Home", icon: <LayoutGrid size={20} /> },
    { id: "menu", label: "Gestión de Menú", icon: <Soup  size={20} /> },
    { id: "visual", label: "Personalización Visual", icon: <PaintRoller size={20} /> },
    { id: "payments", label: "Suscripción y Pagos", icon: <DollarSign size={20} /> },
    { id: "stats", label: "Estadísticas", icon: <BarChart3 size={20} /> },
    { id: "config", label: "Configuracion", icon: <Bolt  size={20} /> },
  ];

  const { logout } = useAuth();

  return (
    <>
      {/* Mobile button */}
      <button
        className="lg:hidden p-3 absolute top-4 left-4 bg-gray-200 rounded-md"
        onClick={() => setOpen(!open)}
      >
        <Menu />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-20 max-h-full w-64 bg-white shadow-lg transform 
        ${open ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 transition-transform duration-200`}
      >
        <div className="flex flex-col items-center py-6">
          <div className="h-20 w-32 bg-gray-200 rounded flex items-center justify-center">
            Logo
          </div>
        </div>

        <nav className="px-4 space-y-2 h-full">
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
