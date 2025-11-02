
import LandingPage from './pages/Landing';
import Dashboard from './pages/Dashboard.tsx';

import Container from './publicPage/Container.layout';
import Interface from './publicPage/Inteface.layout';
import {CategorySection} from './publicPage/Category.section.tsx';

import { AuthProvider } from './contexts/AuthContext';
import { RestoProvider } from './contexts/RestoContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PublicProvider } from './contexts/PublicContext.tsx';

import * as AppCSS from './App.css';


const AppContent: React.FC = () => {
  const enableMultiPage:boolean = true;


  return( <>
            <Router>
              <div className="flex flex-col">
                <Routes>
                  <Route index path="/" element={<LandingPage/>} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/app/:slug" element={<Container mode="public"/>} >
                    <Route index element={<Interface mode="public"/>} />
                  </Route>
                  <Route path="/preview/:slug" element={<Container mode="preview"/>} >
                    <Route index element={<Interface mode="preview"/>} />
                  </Route>
                </Routes>
              </div>
            </Router>
          </>);

};

function App() {
  return (
      <PublicProvider>
        <RestoProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </RestoProvider>
      </PublicProvider>
  );
}

export default App
