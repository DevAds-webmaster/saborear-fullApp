import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
  } from "react";

  import { type User,type AuthContextType } from "../types/index";
  import { authService } from "../services/auth.ts";
  
  // El contexto acepta AuthContextType o undefined
  const AuthContext = createContext<AuthContextType | undefined>(undefined);
  
  // Hook personalizado
  export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
      throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
  };
  
  // Props del provider
  interface AuthProviderProps {
    children: ReactNode;
  }
  
  export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
  
    useEffect(() => {
      const token = localStorage.getItem("authToken");
      if (token) {
        authService.verifyToken(token).then((userData: User | null) => {
          if (userData) {
            setUser(userData);
          } else {
            localStorage.removeItem("authToken");
          }
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    }, []);
  
    const login = async (usuario: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      try {
        const result = await authService.login(usuario, password);
        if (result) {
          setUser(result.user);
          localStorage.setItem("authToken", result.token);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Login failed:", error);
        return false;
      } finally {
        setIsLoading(false);
      }
    };
  
    const logout = (): void => {
      setUser(null);
      localStorage.removeItem("authToken");
    };
  
    return (
      <AuthContext.Provider value={{ user, login, logout, isLoading }}>
        {children}
      </AuthContext.Provider>
    );
  };
  