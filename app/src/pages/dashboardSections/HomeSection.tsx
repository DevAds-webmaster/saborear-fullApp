import React, { useEffect, useState } from "react";
import { QRSection } from "../../components/QRSection";
import { PrintMenuModal } from "../../components/PrintMenuModal.tsx";
import { useResto } from "../../contexts/RestoContext";
import { mpCheckAccess } from "../../services/mercadoPago";

const HomeSection: React.FC = ()=> {
  const { id: restoId } = useResto();
  const [loading, setLoading] = useState<boolean>(false);
  const [printMenuModalOpen, setPrintMenuModalOpen] = useState<boolean>(false);
  useEffect(() => {
    const fetchStatus = async () => {
      if (!restoId) return;
      try {
        setLoading(true);
        await mpCheckAccess(restoId);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    void fetchStatus();
  }, [restoId]);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Panel Principal</h1>
      <div className="grid grid-cols-3 gap-4 grid-rows-2">
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
        <div id="subscription-status" className="p-4 bg-white rounded shadow col-span-full md:col-start-3 md:col-span-1 md:row-start-1 md:row-span-1">
          <h2 className="font-semibold">Estado de suscripción</h2>
          {loading ? (
            <p className="text-sm text-gray-500">Cargando estado…</p>
          ) : (
            <div className="text-sm">
              <p>
                <span className="text-gray-500">Estado:</span>{" "}
                <span className="text-green-600">
                  Activo
                </span>
              </p>
              <p className="mt-1">
                <span className="text-gray-500">Próximo débito:</span>{" "}
                <span> No Aplica</span>
              </p>
            </div>
          )}
        </div>
        <div id="print-menu" className="p-4 bg-white rounded shadow col-start-1 col-span-full md:col-start-3 md:col-span-1 ">
          <h2 className="font-semibold">Imprimir Menú Papel</h2>
          <p className="text-sm text-gray-500 mb-2">Imprime tu menu en formato papel A4 si lo necesitas.</p>
          <button className="bg-gray-400 hover:bg-gray-200 px-4 py-2 my-4" onClick={() => setPrintMenuModalOpen(true)}>
          🖨️ Imprimir Menú
          </button>
          {printMenuModalOpen && <PrintMenuModal onClose={() => setPrintMenuModalOpen(false)} />}
        </div>
      </div>
    </div>
  );
}

export default  HomeSection;