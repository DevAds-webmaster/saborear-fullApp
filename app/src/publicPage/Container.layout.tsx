// Importing components
import {Header} from './Header.layout';
import { useEffect,useState } from 'react';

// Importing React Router
import { Outlet , useParams ,useLocation, useNavigate } from 'react-router-dom';

import { useResto } from '../contexts/RestoContext';
import { usePublic } from '../contexts/PublicContext.tsx';
import { useAuth } from '../contexts/AuthContext';


import { restoService } from "../services/resto";


import { ParamModal } from './modal.component';
import type { Config ,Style, Resto} from '../types/index.ts';
import { getDishImageUrl } from '../services/media';
import { CartFloatSecton } from '../components/CartFloatSecton.tsx';
import { loadCart, saveCart, clearCart } from '../utils/cart';
import { buildWhatsAppMessage } from '../utils/whatsapp';
import { ShoppingCart } from 'lucide-react';



export default function Container ({mode, cart=false,children}:any) {
    const {setResto, resto,setRestoPreview,restoPreview} =useResto();
    const [option, setOption] = useState<Config | undefined>();
    const [_style, setStyle] = useState<Style | undefined>();

    const {setResto: setPublicResto, setBgImage, bgImage, loading, setLoading, getRestoWhatsAppLink} = usePublic();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showCart, setShowCart] = useState<boolean>(false);
    const [cartCount, setCartCount] = useState<number>(0);

    const [modalData ,setModalData] = useState<any>(null);

    const { slug } = useParams();
    const location = useLocation();
    const pParamModal = getParamValue('paramModal', location);
    
    useEffect(() => {
        if(mode ==="preview"){
            const fecthRestoPreview =async ()=>{
                // Try to load preview data from localStorage (sent by TopBar iframe opener)
                let cached: any = null;
                try { cached = JSON.parse(localStorage.getItem('saborear_preview') || 'null'); } catch {}
                if (cached) {
                    setRestoPreview(cached);
                    setPublicResto(cached);
                } else {
                    setRestoPreview(restoPreview);
                    setPublicResto(resto || null);
                }
                setLoading(false);
                const cfg = (cached?.config || resto?.config);
                if (cfg?.paramModalsEnable && pParamModal) {
                    setTimeout(()=>handleModal((cached?.params || resto?.params)?.find((x: any)=> x.name === pParamModal)), cfg?.paramModalsDelay);
                }
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
        if (mode === 'preview') {
            setOption(restoPreview?.config);
            setStyle(restoPreview?.style);
        } else {
            setOption(resto?.config);
            setStyle(resto?.style);
        }
    },[resto, restoPreview]);

    // Escucha mensajes del padre (TopBar -> iframe) para actualizar preview en vivo
    useEffect(() => {
        if (mode !== 'preview') return;
        const handler = (ev: MessageEvent) => {
            // Asegura mismo origen; ajusta si usas otro dominio en desarrollo
            if (ev.origin !== window.location.origin) return;
            const payload = (ev as MessageEvent<any>).data;
            if (payload?.type === 'preview:update') {
                const next = payload.data;
                try { localStorage.setItem('saborear_preview', JSON.stringify(next)); } catch {}
                setRestoPreview(next);
                setPublicResto(next);
            }
        };
        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, [mode, setRestoPreview, setPublicResto]);
    
    useEffect(() => {
        const url = option?.srcImgBackground ? getDishImageUrl(option.srcImgBackground, 1600) : undefined;
        setBgImage(url);
    }, [option]);

    // Función para manejar el modal
    const handleModal = (data:any) => {
      if(option?.optionsConfig.enableParamModals)
            setModalData(data || null);
    };
  
    const currentResto: Resto | null = mode === 'preview' ? (restoPreview || null) : (resto || null);

    const handleSend = () => {
      const r = currentResto;
      if (!r) return;
      const slug = r.slug || '';
      const cartState = loadCart(slug);
      const msg = buildWhatsAppMessage({
        ...cartState,
        meta: {
          ...cartState.meta,
          restoName: r.name,
          restoSlug: r.slug,
          cartTemplate: r?.cart_settings?.template,
          currency: "ARS",
        },
      });
      const url = getRestoWhatsAppLink?.(msg);
      if (url) {
        const emptied = clearCart(cartState);
        saveCart(slug, emptied);
        try { window.dispatchEvent(new Event('cart:updated')); } catch {}
        window.open(url, "_blank");
      }
    };

    useEffect(() => {
      const r = currentResto;
      if (!r) return;
      const c = loadCart(r.slug || '');
      const count = c.items.reduce((acc, it) => acc + it.quantity, 0);
      setCartCount(count);
    }, [currentResto, showCart]);

    useEffect(() => {
      const handler = () => {
        const r = currentResto;
        if (!r) return;
        const c = loadCart(r.slug || '');
        const count = c.items.reduce((acc, it) => acc + it.quantity, 0);
        setCartCount(count);
      };
      window.addEventListener('cart:updated', handler as EventListener);
      return () => window.removeEventListener('cart:updated', handler as EventListener);
    }, [currentResto]);

    if (loading) {
        return (
        <div className="flex items-center justify-center min-h-screen bg-gray-500">
            <span className="loader"></span>
        </div>
        );
    }
    
    return (
      <>
        {mode !== 'preview' && user && (
          <div className="w-full bg-indigo-600 text-white">
            <div className="max-w-7xl mx-auto py-2 flex justify-center">
              <button
                onClick={() => navigate('/')}
                className="bg-white text-indigo-700 px-4 py-2 rounded font-medium shadow hover:bg-gray-100"
                title="Volver al dashboard"
              >
                Volver al dashboard
              </button>
            </div>
          </div>
        )}
        <div 
        className={currentResto?.config?.flgSolidBackground?
            "min-h-screen bg-cover bg-center bg-no-repeat bg-fixed "+currentResto?.style?.colorBackground
          :
            "min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
        }

        style={!currentResto?.config?.flgSolidBackground ? 
          { backgroundImage: bgImage ? `url(${bgImage})` : undefined }
        :
          {}
        }>
            <Header mode={mode} />
            <Outlet/>
            {children}
          {cart && (
            <>
              <button
                id='btn-cart'
                type="button"
                className="fixed bottom-5 right-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg px-5 py-3 font-semibold flex items-center gap-2"
                onClick={() => setShowCart(true)}
                aria-label="Ver carrito"
              >
                <ShoppingCart size={20} />
                <span>{cartCount}</span>
              </button>
              <CartFloatSecton
                open={showCart}
                onClose={() => setShowCart(false)}
                resto={currentResto}
                handleSend={handleSend}
              />
            </>
          )}
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
function getParamValue(paramName: string, location: ReturnType<typeof useLocation>) {
    const queryParams = new URLSearchParams(location.search);
    const res = queryParams.get(paramName);
    return res ? res : null;
}