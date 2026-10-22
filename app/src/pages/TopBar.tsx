import { useState } from "react";
import {
  Link,
  Eye,
  EyeClosed,
  ShoppingCart,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { useResto } from "../contexts/RestoContext";
import { PreviewModal } from "../components/PreviewModal";

export default function TopBar() {
    const {user} = useAuth();
    const {resto, btnSaveEnabled, setBtnSaveEnabled} = useResto();
    const [modalShow,setModalShow] = useState(false);

    return <>
    <div className="sticky top-0 z-40 mb-5 flex h-12 w-[calc(100%-3rem)] items-center gap-2 rounded-lg border border-gray-400 bg-white px-2 shadow-lg -translate-y-2 ml-12 lg:h-auto lg:w-full lg:translate-y-0 lg:ml-0 lg:items-stretch lg:px-3 lg:py-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 lg:grid lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center lg:gap-x-2 lg:gap-y-1">
            <span className="hidden font-bold lg:inline">Usuario:</span>
            <span className="truncate font-bold" title={user?.username}>{user?.username}</span>
            <span className="hidden font-bold lg:inline">Rol:</span>
            <span className={`shrink-0 rounded-md px-2 py-0.5 text-sm text-white lg:justify-self-start lg:py-1 ${user?.role === "admin" ? "bg-green-500" : "bg-gray-500"}`}>{user?.role}</span>
        </div>
        <div className="hidden w-px self-stretch bg-gray-200 sm:block lg:mx-1"></div>
        <div className="flex shrink-0 items-center gap-1.5 lg:items-center lg:gap-2">
        <button
            type="button"
            title={modalShow ? "Cerrar vista previa" : "Vista previa"}
            className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-500 text-white hover:bg-gray-400 lg:h-auto lg:w-auto lg:px-4 lg:py-2"
            onClick={() => setModalShow((open) => !open)}
        >
            <span className="hidden lg:inline">Vista Previa &nbsp;</span>
            {modalShow ? <Eye aria-hidden size={18} /> : <EyeClosed aria-hidden size={18} />}
        </button>
        <div className="flex items-center gap-1.5 lg:flex-col lg:items-stretch lg:gap-0 lg:space-y-2">
          <button 
              title='Menu Público Sin Carrito' 
              className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-500 text-sm text-white hover:bg-blue-400 lg:h-auto lg:w-auto lg:px-4 lg:py-1" 
              onClick={()=> {
                  if(btnSaveEnabled){
                      const res = confirm("Tienes cambios sin guardar, estas seguro de salir de esta seccion?Tus cambios se perderán");
                      if(!res) return;
                      setBtnSaveEnabled(false);
                  }
                  window.location.href = `${import.meta.env.VITE_MENU_PUBLIC_URL}/${resto?.slug}`;
              }}
          >
              <span className="hidden lg:inline">Menu Público Sin Carrito &nbsp;</span>
              <Link size={18}/>
          </button>
          <button 
              title='Menu Público Con Carrito' 
              className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-500 text-sm text-white hover:bg-blue-400 lg:h-auto lg:w-auto lg:px-4 lg:py-1" 
              onClick={()=> {
                  window.location.href = `${import.meta.env.VITE_MENU_PUBLIC_URL}/${resto?.slug}?cart=true`;
              }}
          >
              <span className="hidden lg:inline">Menu Público con Carrito &nbsp;</span>
              <ShoppingCart size={18}/>
          </button>
        </div>
        </div>
    </div>
     {/* Modal */}
     <PreviewModal
        open={modalShow}
        onClose={() => setModalShow(false)}
        />
    </>
}
