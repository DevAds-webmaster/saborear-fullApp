import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useResto } from "../../contexts/RestoContext";
import { mpCheckAccess, mpGetSubscribeLink } from "../../services/mercadoPago";

export default function PaymentsSection() {
  const { user, isLoading } = useAuth();
  const { id: restoId } = useResto();
  const [checking, setChecking] = useState(false);
  const [subAllow, setSubAllow] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);


  const refreshAccess = async () => {
    if (!restoId) return;
    try {
      setChecking(true);
      setError(null);
      const { allow } = await mpCheckAccess(restoId);
      setSubAllow(allow);
    } catch (e) {
      setError("No se pudo verificar el estado de suscripción");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (restoId) void refreshAccess();
  }, [restoId]);

  const goToSubscription = async () => {
    if (!user || !restoId) return;
    try {
      setChecking(true);
      setError(null);
      const res = await mpGetSubscribeLink(restoId, user.email);
      if (res.init_point) {
        window.location.href = res.init_point;
        return;
      }
      setError("No se pudo obtener el link de suscripción");
    } catch (e) {
      setError("No se pudo obtener el link de suscripción");
    } finally {
      setChecking(false);
    }
  };

  if (isLoading) {
    return <div className="p-4">Cargando...</div>;
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Suscripción y Pagos</h1>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      <div className="mb-4">
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
          onClick={goToSubscription}
          disabled={!user || !restoId || checking || subAllow === true}
        >
          Suscribirme
        </button>
      </div>
      <p className="mb-4">
        Estado:{" "}
        <span className={subAllow ? "text-green-600" : "text-gray-700"}>
          {subAllow === null ? "Desconocido" : subAllow ? "Activo" : "Inactivo"}
        </span>
      </p>

      <div className="flex gap-2">
        <button
          className="px-4 py-2 rounded border disabled:opacity-50"
          onClick={refreshAccess}
          disabled={!restoId || checking}
        >
          Revisar estado
        </button>
      </div>
    </div>
  );
}