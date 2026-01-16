import Container from './publicPage/Container.layout';
import Interface from './publicPage/Inteface.layout';

import { RestoProvider } from './contexts/RestoContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PublicProvider } from './contexts/PublicContext.tsx';

import './App.css';


const AppContent: React.FC = () => {
  return( <>
            <Router>
              <div className="flex flex-col">
                <Routes>
                  <Route path="/:slug" element={<Container mode="public"/>} >
                    <Route index element={<Interface mode="public"/> } />
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
          <AppContent />
        </RestoProvider>
      </PublicProvider>
  );
}

export default App

