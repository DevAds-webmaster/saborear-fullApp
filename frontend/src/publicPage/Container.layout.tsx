// Importing components
import {Header} from './Header.layout';
import { useEffect,useState } from 'react';

// Importing React Router
import { Outlet , useParams ,useLocation } from 'react-router-dom';

import { useResto } from '../contexts/RestoContext';
import { usePublic } from '../contexts/PublicContext.tsx';


import { restoService } from "../services/resto";


import { ParamModal } from './modal.component';
import type { Config ,Style} from '../types/index.ts';



export default function Container ({mode,children}:any) {
    const {setResto, resto,setRestoPreview,restoPreview} =useResto();
    const [option, setOption] = useState<Config | undefined>();
    const [style, setStyle] = useState<Style | undefined>();

    const {setResto: setPublicResto, setBgImage, bgImage, loading, setLoading} = usePublic();

    const pParamModal= getParamValue('paramModal');
    const [modalData ,setModalData] = useState<any>(null);

    const { slug } = useParams();
    useEffect(() => {
        if(mode ==="preview"){
            const fecthRestoPreview =async ()=>{
                setRestoPreview(restoPreview );
                setPublicResto(resto || null); 
                setLoading(false);
                option?.paramModalsEnable && pParamModal && setTimeout(()=>handleModal(resto?.params.find((x)=> x.name === pParamModal)), option?.paramModalsDelay);
                console.log("restoPreview",resto)
            }
            fecthRestoPreview();

        }
        else{
            const fecthResto =async ()=>{
                const res = await restoService.getRestoBySlug(slug)
                setResto(res || null);
                setPublicResto(res || null); // También guardar en PublicContext
                setLoading(false);
                option?.paramModalsEnable && pParamModal && setTimeout(()=>handleModal(res?.params.find((x)=> x.name === pParamModal)), option?.paramModalsDelay);
                console.log("resto",res)
            }
            fecthResto();
        }
            

    }, []);
    
    useEffect(()=>{
        setOption(resto?.config);
        setStyle(resto?.style);
    },[resto]);
    
    useEffect(() => {
        // Imagen de fondo personalizable (ejemplo fijo, puedes adaptarlo a un input)
        setBgImage(option?.srcImgBackground);
    }, [option]);

    // Función para manejar el modal
    const handleModal = (data:any) => {
      if(option?.optionsConfig.enableParamModals)
            setModalData(data || null);
    };
  

    if (loading) {
        return (
        <div className="flex items-center justify-center min-h-screen bg-gray-500">
            <span className="loader"></span>
        </div>
        );
    }

    return (
      <>
        <div className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
              style={{ backgroundImage: `url(/${bgImage})`}}>
            <Header />
            <Outlet/>
            {children}
        </div>
        {/* Modal */}
        <ParamModal
        open={!!modalData}
        onClose={() => setModalData(null)}
        {...modalData}
        />
      </>
    );
}

// Function to get a specific query parameter value from the URL
export function getParamValue(paramName:string) {
    const location = useLocation(); // Get location object from React Router, or use window.location if not using Router
    const queryParams = new URLSearchParams(location.search); // Parse the query string
    const res = queryParams.get(paramName);
    return res ? res : null;
}