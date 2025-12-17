import React, { useEffect, useState } from "react";
import { QRSection } from "../../components/QRSection";
import { useResto } from "../../contexts/RestoContext";
import { mpCheckAccess } from "../../services/mercadoPago";

const HomeSection: React.FC = ()=> {
  const { id: restoId } = useResto();
  const [subStatus, setSubStatus] = useState<string | null>(null);
  const [nextCharge, setNextCharge] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!restoId) return;
      try {
        setLoading(true);
        const res = await mpCheckAccess(restoId);
        setSubStatus(res.status ?? (res.allow ? "authorized" : "inactive"));
        setNextCharge(res.next_payment_date ?? null);
      } catch {
        setSubStatus(null);
        setNextCharge(null);
      } finally {
        setLoading(false);
      }
    };
    void fetchStatus();
  }, [restoId]);

  const renderNextCharge = () => {
    if (!nextCharge) return "—";
    const d = new Date(nextCharge);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString();
  };

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
        <div id="subscription-status" className="p-4 bg-white rounded shadow col-span-full md:col-start-3 md:col-span-1 md:row-start-1 md:row-span-2">
          <h2 className="font-semibold">Estado de suscripción</h2>
          {loading ? (
            <p className="text-sm text-gray-500">Cargando estado…</p>
          ) : (
            <div className="text-sm">
              <p>
                <span className="text-gray-500">Estado:</span>{" "}
                <span className={subStatus === "authorized" ? "text-green-600" : "text-gray-800"}>
                  {subStatus ?? "Desconocido"}
                </span>
              </p>
              <p className="mt-1">
                <span className="text-gray-500">Próximo débito:</span>{" "}
                <span>{renderNextCharge()}</span>
              </p>
            </div>
          )}
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