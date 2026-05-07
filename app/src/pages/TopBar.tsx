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
    <div className="sticky top-0 p-2 z-40 flex flex-row  bg-white shadow-lg rounded-lg border-gray-400 border mb-5  px-2 w-[90%] ml-auto lg:w-full lg:ml-0">
        <div className="grid grid-cols-2  gap-2  text-left self-center">
            <span className="font-bold">Usuario:</span>
            <span className="font-bold">{user?.username}</span>
            <span className="font-bold">Rol:</span>
            <span className={` px-2 py-1 rounded-md text-sm  justify-self-center ${user?.role === "admin" ? "text-white bg-green-500" : "text-white bg-gray-500"}`}>{user?.role}</span>
        </div>
        <div className="flex-1 h-auto"></div>
        <div className="w-[2px] h-[fill-available] bg-gray-200 self-center mx-2"></div>
        <button
            type="button"
            title={modalShow ? "Cerrar vista previa" : "Vista previa"}
            className="flex bg-gray-500 hover:bg-gray-400 text-white px-4 py-2 h-fit sm:ml-auto rounded-md self-center"
            onClick={() => setModalShow((open) => !open)}
        >
            <span className="hidden md:block" >Vista Previa &nbsp;</span> {modalShow ? <Eye aria-hidden /> : <EyeClosed aria-hidden />}
        </button>
        <div className="flex flex-col space-y-2 ">
          <button 
              title='Menu Público Sin Carrito' 
              className="flex bg-blue-500 hover:bg-blue-400 text-white text-sm px-4 py-1 h-fit ml-2 rounded-md" 
              onClick={()=> {
                  if(btnSaveEnabled){
                      const res = confirm("Tienes cambios sin guardar, estas seguro de salir de esta seccion?Tus cambios se perderán");
                      if(!res) return;
                      setBtnSaveEnabled(false);
                  }
                  window.location.href = `${import.meta.env.VITE_MENU_PUBLIC_URL}/${resto?.slug}`;
              }}
          >
              <span className="hidden md:block" >Menu Público Sin Carrito &nbsp;</span> <Link/>
          </button>
          <button 
              title='Menu Público Con Carrito' 
              className="flex bg-blue-500 hover:bg-blue-400 text-white text-sm px-4 py-1 h-fit ml-2 rounded-md" 
              onClick={()=> {
                  window.location.href = `${import.meta.env.VITE_MENU_PUBLIC_URL}/${resto?.slug}?cart=true`;
              }}
          >
              <span className="hidden md:block" >Menu Público con Carrito &nbsp;</span> <ShoppingCart/>
          </button>
        </div>
    </div>
     {/* Modal */}
     <PreviewModal
        open={modalShow}
        onClose={() => setModalShow(false)}
        />
    </>
}