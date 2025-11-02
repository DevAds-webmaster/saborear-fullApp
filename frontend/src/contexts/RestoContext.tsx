import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
  } from "react";

import { type Resto,type RestoContextType, type StyleOptionsMap } from "../types/index";
import { restoService } from "../services/resto";

const RestoContext = createContext<RestoContextType | undefined>(undefined);

export const useResto = (): RestoContextType => {
    const context = useContext(RestoContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an RestoProvider");
    }
    return context;
};

 // Props del provider
 interface RestoProviderProps {
    children: ReactNode;
  }

  export const RestoProvider: React.FC<RestoProviderProps> = ({ children }) => {
    const [resto, setResto] = useState<Resto | null>(null);
    const [restoPreview,setRestoPreview] = useState<Resto | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [slug, setSlug] = useState<string| null>('');
    const [id, setId] = useState<string>('');
    const [btnSaveEnabled, setBtnSaveEnabled] = useState(false);


    const getStylesOptions = async (): Promise<StyleOptionsMap | null> => {
        const res = await restoService.getOptionStyles();
        return res as StyleOptionsMap | null;
    };

    
    const getResto = async ( ) => {
        const res = await restoService.getRestoById(id);
        setResto(res);
        setRestoPreview(res);
        setIsLoading(false);
    };
    

    const updateResto = async (restoId: string, restoData: Partial<Resto>) =>  {  
        setIsLoading(true);
        const res = await restoService.updateResto(restoId,restoData);
        setResto(res);
        setIsLoading(false);
        return res;
    }

    return (
        <RestoContext.Provider value={{ resto, setResto, isLoading, slug,setSlug, updateResto,getResto,id,setId,btnSaveEnabled, setBtnSaveEnabled,restoPreview,setRestoPreview, getStylesOptions }}>
            {children}
        </RestoContext.Provider>
    );
};