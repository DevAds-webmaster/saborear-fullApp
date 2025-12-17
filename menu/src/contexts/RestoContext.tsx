import React, {
    createContext,
    useContext,
    useState,
    type ReactNode,
  } from "react";

import { type Resto,type RestoContextType } from "../types/index";

const RestoContext = createContext<RestoContextType | undefined>(undefined);

export const useResto = (): RestoContextType => {
    const context = useContext(RestoContext);
    if (context === undefined) {
        throw new Error("useResto must be used within an RestoProvider");
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

    const getStylesOptions = async (): Promise<any> => {
        return null;
    };

    const getThemeOptions = async (): Promise<any> => {
        return null;
    };

    
    const getResto = async ( ) => {
        setIsLoading(false);
    };
    

    const updateResto = async (restoId: string, restoData: Partial<Resto>) =>  {  
        setIsLoading(true);
        setIsLoading(false);
        return null;
    }

    return (
        <RestoContext.Provider value={{ resto, setResto, isLoading, slug,setSlug, updateResto,getResto,id,setId,btnSaveEnabled, setBtnSaveEnabled,restoPreview,setRestoPreview, getStylesOptions, getThemeOptions }}>
            {children}
        </RestoContext.Provider>
    );
};

