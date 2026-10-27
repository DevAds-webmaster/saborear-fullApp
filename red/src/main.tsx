import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import ComplaintPage from "./ComplaintPage.tsx";
import InstallPrompt from "./InstallPrompt.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <InstallPrompt />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/reclamos" element={<ComplaintPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
