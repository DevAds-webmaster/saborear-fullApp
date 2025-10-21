import React from "react";
import { QRSection } from "../../components/QRSection";

const HomeSection: React.FC = ()=> {
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Panel Principal</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow col-span-2">
          <h2 className="font-semibold">Menú QR y enlace público</h2>
          <QRSection/>
        </div>
        <div className="p-4 bg-white rounded shadow col-span-1">
          <h2 className="font-semibold">Estado de suscripción</h2>
          <p>Plan actual y vencimiento.</p>
        </div>
        <div className="p-4 bg-white rounded shadow col-span-3">
          <h2 className="font-semibold">Últimos cambios</h2>
          <p>Lista de modificaciones recientes.</p>
        </div>
      </div>
    </div>
  );
}

export default  HomeSection;