import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Link,
  Eye
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { useResto } from "../contexts/RestoContext"; 
import Interface from "../publicPage/Inteface.layout";
import Container from "../publicPage/Container.layout";

export default function TopBar() {
    const {user} = useAuth();
    const {resto} = useResto();
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
            onClick={()=> Navigate('/app/'+resto?.slug)}
        >
            Menu Público &nbsp; <Link/>
        </button>
    </div>
     {/* Modal */}
     <PreviewModal
        open={modalShow}
        onClose={() => setModalShow(false)}
        slug={resto?.slug}
        />
    </>
}


function PreviewModal({ open, onClose}:any) {
    if (!open) return null;


    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose} // Cierra al hacer click fuera
      >
        <div 
          className="w-[50vw] h-[60vh] bg-white overflow-auto" 
          onClick={(e)=>{
            e.stopPropagation();
          }}>
          <Container mode="preview">
            <Interface mode="preview"/>
          </Container>
        </div>
      </div>
    );
  }