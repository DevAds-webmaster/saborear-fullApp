import React from "react";
import { QRSection } from "../../components/QRSection";

const HomeSection: React.FC = ()=> {
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Panel Principal</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow col-span-full md:col-span-2">
          <h2 className="font-semibold">Menú QR y enlace público (Sin Carrito WhatsApp)</h2>
          <p className="text-sm text-gray-500 mb-2">Ideal para mostrar en el local o en una mesa</p>
          <QRSection cart={false}/>
        </div>
        <div className="p-4 bg-white rounded shadow col-span-full md:col-span-2">
          <h2 className="font-semibold">Menú QR y enlace público (Con Carrito WhatsApp)</h2>
          <p className="text-sm text-gray-500 mb-2">Ideal para mostrar en redes sociales y publicidad para pedidos</p>
          <QRSection cart={true}/>
        </div>
        <div className="p-4 bg-white rounded shadow col-span-full md:col-start-3 md:col-span-1 md:row-start-1 md:row-span-2">
          <h2 className="font-semibold">Estado de suscripción</h2>
          <p>Plan actual y vencimiento.</p>
        </div>
        <div className="p-4 bg-white rounded shadow col-span-3 hidden">
          <h2 className="font-semibold">Últimos cambios</h2>
          <p>Lista de modificaciones recientes.</p>
        </div>
      </div>
    </div>
  );
}

export default  HomeSection;