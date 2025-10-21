import React, {
    createContext,
    useContext,
    useState,
    type ReactNode,
  } from "react";

import { type Resto,type PublicContextType } from "../types/index";

const PublicContext = createContext<PublicContextType | undefined>(undefined);

export const usePublic = (): PublicContextType => {
    const context = useContext(PublicContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an RestoProvider");
    }
    return context;
};

 // Props del provider
 interface PublicProviderProps {
    children: ReactNode;
  }

  export const PublicProvider: React.FC<PublicProviderProps> = ({ children }) => {
    const [resto, setResto] = useState<Resto | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [slug, setSlug] = useState<string| null>('');
    const [bgImage, setBgImage] = useState<string | undefined>("");

 



    return (
        <PublicContext.Provider 
            value={{ resto,
                     setResto,
                     loading,
                     setLoading,
                     setSlug,
                     slug,
                     bgImage,
                     setBgImage}}
        >
            {children}
        </PublicContext.Provider>
    );
};