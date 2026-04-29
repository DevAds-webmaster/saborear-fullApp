import { useEffect,useState } from 'react'
import { Link } from 'react-router-dom'

// Importing styles
import type { Config, Style } from '../types';
import { getDishImageUrl } from '../services/media';
import { useResto } from '../contexts/RestoContext';
import { usePublic } from '../contexts/PublicContext';
import { ArrowLeft } from 'lucide-react';


export function Header ( {mode}:{mode:string} ) {
    const {resto,restoPreview} =useResto();
    const [option, setOption] = useState<Config | undefined>();
    const [style, setStyle] = useState<Style | undefined>();
    
    // Importing logo and slogan from dataConfig
    const [logoImage, setLogoImage] = useState<string | undefined>("");
    const [sloganText, setSloganText] = useState<string | undefined>("");

    const [buttonTop, setButtonTop] = useState(150); // Estado para la posición 'top' del botón
    const initialTop = 150; // Posición 'top' inicial deseada
    const scrollOffset = 140; // Cuánto quieres que se mueva hacia arriba al hacer scroll

    const handleScroll = () => {
        const scrollY = window.scrollY; // Cuántos píxeles se ha desplazado la ventana
        // Calcula la nueva posición 'top'.
        // Si el scroll supera un cierto umbral, haz que el botón suba un poco.
        // Puedes ajustar 'initialTop - scrollOffset' para que no suba demasiado.
        const newTop = Math.max(initialTop - scrollY , initialTop - scrollOffset); // Ajusta el 0.1 para la velocidad

        setButtonTop(newTop);
    };

    useEffect(()=>{
        if(mode === 'preview') {
            setOption(restoPreview?.config);
            setStyle(restoPreview?.style);
        }
        else{
            setOption(resto?.config);
            setStyle(resto?.style);
        }
    },[resto,restoPreview])

    useEffect(() => {
        if(mode === 'preview'){
            setLogoImage(restoPreview?.config?.srcImgLogo?.secure_url);
            setSloganText(restoPreview?.config?.slogan);
        }else{
            setLogoImage(option?.srcImgLogo?.secure_url);
            setSloganText(option?.slogan);
        }

        // Agregar el listener de scroll al cargar el componente
        // y eliminarlo al desmontar el componente
        window.addEventListener('scroll', handleScroll);
        return () => {
        window.removeEventListener('scroll', handleScroll);
       };
    }, [option]);


    const { selectedCategoryName, triggerMultiPageBack } = usePublic();
    const isMultiPage = option?.template === "multi-page";
    const showBackButton = isMultiPage && !!selectedCategoryName;

    return (
    <>
        <div className="w-full z-50 ">
        {/* Header Section */}
            <header className={style?.headerStyles.container}>
                <div className='sm:flex hidden flex-row my-auto px-5 py-1 text-2xl'>
                    <div className='flex flex-col sm:flex-row w-full justify-between items-center'>
                        <div className="place-self-center  object-cover rounded-md">
                            {logoImage && (
                                <img src={getDishImageUrl(option?.srcImgLogo, 192)}  className="h-24"/>
                            )}
                        </div>
                        {(sloganText && sloganText.length > 0) &&
                            <h1 className={'sm:mr-auto sm:pl-5 '+style?.headerStyles.sloganStyle}>{sloganText}</h1>
                        } 
                    </div>
                    <div className='flex text-right flex-row w-full my-auto justify-end'>
                        {
                            option?.headerOptions.enableFacebookBtn && 
                            <a className='w-[30px] mx-4 text-lg mb-2 sm:mb-0' href={option?.headerOptions.enableFacebookLink} target="_blank" rel="noopener noreferrer">
                                <img src={'/assets/social/fb.png'} className='w-8 h-8'/>
                            </a>
                        }
                        {
                            option?.headerOptions.enableInstagramBtn && 
                            <a className='w-[30px] mx-4 text-lg mb-2 sm:mb-0' href={option?.headerOptions.enableInstagramLink} target="_blank" rel="noopener noreferrer">
                                <img src={'/assets/social/ins.png'} className='w-8 h-8'/>
                            </a>
                        }
                        {
                            option?.headerOptions.enableXBtn && 
                            <a className='w-[30px] mx-4 text-lg' href={option?.headerOptions.enableXLink} target="_blank" rel="noopener noreferrer">
                                <img src={'/assets/social/x.png'} className='w-8 h-8'/>
                            </a>
                        }
                       
                    </div>
                </div>
                <div className='flex sm:hidden flex-row my-auto px-5 py-1 text-2xl'>
                    <div className='flex flex-col sm:flex-row w-full justify-between items-center'>
                        <Link  to={'/'} className="place-self-center  object-cover rounded-md">
                            {logoImage && (
                                <img src={getDishImageUrl(option?.srcImgLogo, 192)}  className="h-24"/>
                            )}
                        </Link>
                    </div>
                    <div className='flex flex-col w-full space-y-2 justify-center'>
                        {(sloganText && sloganText.length > 0) &&
                                <h1 className={'sm:mr-auto sm:pl-5 '+style?.headerStyles.sloganStyle}>{sloganText}</h1>
                        } 
                        <div className='flex flex-row w-full my-auto justify-around'>
                            {
                                option?.headerOptions.enableFacebookBtn && 
                                <a className='w-[30px] mx-4 text-lg mb-2 sm:mb-0' href={option?.headerOptions.enableFacebookLink} target="_blank" rel="noopener noreferrer">
                                    <img src={'/assets/social/fb.png'} className='w-6 h-6'/>
                                </a>
                            }
                            {
                                option?.headerOptions.enableInstagramBtn && 
                                <a className='w-[30px] mx-4 text-lg mb-2 sm:mb-0' href={option?.headerOptions.enableInstagramLink} target="_blank" rel="noopener noreferrer">
                                    <img src={'/assets/social/ins.png'} className='w-6 h-6'/>
                                </a>
                            }
                            {
                                option?.headerOptions.enableXBtn && 
                                <a className='w-[30px] mx-4 text-lg' href={option?.headerOptions.enableXLink} target="_blank" rel="noopener noreferrer">
                                    <img src={'/assets/social/x.png'} className='w-6 h-6'/>
                                </a>
                            }
                        
                        </div>
                    </div>
                    
                </div>
            </header>
            {showBackButton && (
                <button
                type="button"
                onClick={triggerMultiPageBack}
                style={{ zIndex: 60, top: `${buttonTop}px`, padding: 20 }}
                className="fixed left-4 ml-0 flex items-center justify-center rounded-full bg-white text-gray-900 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.22),0_10px_28px_rgba(0,0,0,0.38)] transition-[colors,box-shadow] duration-300 hover:bg-gray-300 hover:shadow-[0_6px_16px_rgba(0,0,0,0.28),0_14px_36px_rgba(0,0,0,0.45)] animate-float"
                aria-label="Volver"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
            )}
        </div>
    </>
    
        
    );
}

