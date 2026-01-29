import React, {
    createContext,
    useContext,
    useState,
    type ReactNode,
  } from "react";

import { type Resto,type RestoContextType, type StyleOptionsMap, type ThemeOptions } from "../types/index";
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

    const getThemeOptions = async (): Promise<ThemeOptions | null> => {
        const res = await restoService.getThemeOptions();
        return res as ThemeOptions | null;
    };

    
    const getResto = async ( ) => {
        const res = await restoService.getRestoById(id);
        setResto(res);
        setRestoPreview(res);
        setIsLoading(false);
    };
    

    const updateResto = async (restoId: string, restoData: Partial<Resto>) =>  {  
        setIsLoading(true);
        // Asegurar que TypeScript detecte el uso de los parámetros
        const id = restoId;
        const data = restoData;
        const res = await restoService.updateResto(id, data);
        setResto(res);
        setIsLoading(false);
        return res;
    }

    return (
        <RestoContext.Provider value={{ resto, setResto, isLoading, slug,setSlug, updateResto,getResto,id,setId,btnSaveEnabled, setBtnSaveEnabled,restoPreview,setRestoPreview, getStylesOptions, getThemeOptions }}>
            {children}
        </RestoContext.Provider>
    );
};