
import { useEffect,useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import Login from './Login';

import DashboardNav from "./DashboardNav";
import TopBar from "./TopBar"
import HomeSection from "./dashboardSections/HomeSection";
import MenuSection from "./dashboardSections/MenuSection";
import VisualSection from "./dashboardSections/VisualSection";
import CartSection from "./dashboardSections/CartSection.tsx";
import ConfigSection from "./dashboardSections/ConfigSection.tsx";
import PaymentsSection from "./dashboardSections/PaymentsSection";
import StatsSection from "./dashboardSections/StatsSection";
import { useAuth } from '../contexts/AuthContext';
import { useResto } from '../contexts/RestoContext';

function Dashboard (){
    const [currentView, setCurrentView] = useState<'home' | 'menu' | 'visual'| 'cart'| 'payments'| 'stats' | 'config'> ('home');
    const { user, isLoading } = useAuth();
    const {resto ,updateResto ,id, setId,getResto, btnSaveEnabled} = useResto();
    const [searchParams] = useSearchParams();


    useEffect(()=>{
      const viewParam = searchParams.get('view');
      const allowed = ['home','menu','visual','cart','payments','stats','config'] as const;
      type View = typeof allowed[number];
      const isView = (v: string): v is View => (allowed as readonly string[]).includes(v);

      if(viewParam && isView(viewParam)){
        setCurrentView(viewParam);
      }else{
        setCurrentView('home');
      }
    },[user, searchParams]) // vista por defecto de todos los usuarios o según ?view=

    useEffect(()=>{
      if(user){
        console.log("Log - user",user);
        console.log('useEffect1')
        if(user?.restos.length){
          console.log('useEffect2')
          setId(user?.restos[0]);
        }
      }
    },[user])

    useEffect(()=>{
      getResto();
    },[id])

    // Bloquear cierre/recarga/navegación si hay cambios sin guardar
    useEffect(() => {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (btnSaveEnabled) {
          e.preventDefault();
          return false;
        }else{
          return true;
        }
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [btnSaveEnabled]);

    const renderSection = () => {
        switch (currentView) {
          case "home":
            return <HomeSection />;
          case "menu":
            return <MenuSection resto={resto} updateResto={updateResto} />;
          case "visual":
            return <VisualSection  resto={resto} updateResto={updateResto} />;
          case "cart":
            return <CartSection />;
          case "payments":
            return <PaymentsSection />;
          case "stats":
            return <StatsSection />;
          case "config":
            return <ConfigSection />;
          default:
            return <HomeSection />;
        }
    };

    if (isLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      );
    }


    if(!user)
        return <Login/>;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
          {/* Sidebar */}
          <DashboardNav active={currentView} onChange={setCurrentView} />
    
          {/* Main content */}
          <main className="flex-1 h-full p-6 overflow-y-auto">
            {/*Top Bar*/}
            <TopBar/>
            {renderSection()}
          </main>
        </div>
      );
}

export default Dashboard;