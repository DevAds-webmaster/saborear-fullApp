import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { mpCreateSubscription, mpCheckAccess } from "../../services/mercadoPago";

export default function PaymentsSection() {
  const { user, isLoading } = useAuth();
  const [checking, setChecking] = useState(false);
  const [subAllow, setSubAllow] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mp, setMp] = useState<any>(null);
  const [cardForm, setCardForm] = useState<any>(null);

  const refreshAccess = async () => {
    if (!user) return;
    try {
      setChecking(true);
      setError(null);
      const { allow } = await mpCheckAccess(user.id);
      setSubAllow(allow);
    } catch (e) {
      setError("No se pudo verificar el estado de suscripción");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (user) void refreshAccess();
  }, [user]);

  // Inicializa MercadoPago y el CardForm
  useEffect(() => {
    if (!mp && (window as any).MercadoPago && import.meta.env.VITE_MP_PUBLIC_KEY) {
      const instance = new (window as any).MercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY, { locale: "es-AR" });
      setMp(instance);
    }
  }, [mp]);

  useEffect(() => {

    if (mp && !cardForm) {
      // Crear el formulario de tarjeta para tokenización
      const instance = mp.cardForm({
        amount: "0",
        autoMount: true,
        form: {
          id: "form-checkout",
          cardholderName: { id: "form-checkout__cardholderName" },
          cardholderEmail: { id: "form-checkout__cardholderEmail" },
          cardNumber: { id: "form-checkout__cardNumber" },
          cardExpirationDate: { id: "form-checkout__cardExpirationDate" },
          securityCode: { id: "form-checkout__securityCode" },
          identificationType: { id: "form-checkout__identificationType" },
          identificationNumber: { id: "form-checkout__identificationNumber" },
          issuer: { id: "form-checkout__issuer" },
          installments: { id: "form-checkout__installments" },
        },
        callbacks: {
          onFormMounted: (error: any) => {
            if (error) console.error("onFormMounted error", error);
          },
          onSubmit: (event: any) => {
            event.preventDefault();
          },
          onFetching: (_resource: any) => {
            // opcional
          },
        },
      });
      setCardForm(instance);
    }
  }, [mp, cardForm]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    try {
      setChecking(true);
      setError(null);
      if (!cardForm) {
        throw new Error("Formulario de tarjeta no inicializado");
      }
      const data = cardForm.getCardFormData();
      const token: string | undefined = data?.token;
      if (!token) {
        throw new Error("No se pudo obtener el token de la tarjeta");
      }
      // Log: prefijo del token y timestamp (para comparar con backend)
      console.log("[MP][front] card_token_id prefix:", token.slice(0, 8), "ts:", new Date().toISOString());
      const res = await mpCreateSubscription(user.id, token);
      if (res.init_point) {
        window.location.href = res.init_point;
        return;
      }
      await refreshAccess();
    } catch (e) {
      setError("No se pudo iniciar la suscripción");
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

      {/* Formulario de tarjeta para tokenización */}
      <form id="form-checkout" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <input id="form-checkout__cardholderName" className="border p-2 rounded" placeholder="Nombre en la tarjeta" />
        <input id="form-checkout__cardholderEmail" className="border p-2 rounded" placeholder="Email" type="email" />
        <input id="form-checkout__cardNumber" className="border p-2 rounded md:col-span-2" placeholder="Número de tarjeta" />
        <input id="form-checkout__cardExpirationDate" className="border p-2 rounded" placeholder="MM/YY" />
        <input id="form-checkout__securityCode" className="border p-2 rounded" placeholder="CVV" />
        <select id="form-checkout__identificationType" className="border p-2 rounded"></select>
        <input id="form-checkout__identificationNumber" className="border p-2 rounded" placeholder="Documento" />
        <select id="form-checkout__issuer" className="border p-2 rounded"></select>
        <select id="form-checkout__installments" className="border p-2 rounded"></select>
        <div className="md:col-span-2">
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
            disabled={!user || checking || subAllow === true}
          >
            Suscribirme
          </button>
        </div>
      </form>
      <p className="mb-4">
        Estado:{" "}
        <span className={subAllow ? "text-green-600" : "text-gray-700"}>
          {subAllow === null ? "Desconocido" : subAllow ? "Activo" : "Inactivo"}
        </span>
      </p>

      <div className="flex gap-2">
        <button
          className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50"
          onClick={async () => {
            if (!user) return;
            try {
              setChecking(true);
              setError(null);
              if (!cardForm) throw new Error("Formulario de tarjeta no inicializado");
              const data = cardForm.getCardFormData();
              const token: string | undefined = data?.token;
              if (!token) throw new Error("No se pudo obtener el token de la tarjeta");
              console.log("[MP][front][direct] card_token_id prefix:", token.slice(0, 8), "ts:", new Date().toISOString());
              const res = await mpCreateSubscription(user.id, token, {
                mode: "direct",
                amount: 100,
                currency_id: "ARS",
                frequency: 1,
                frequency_type: "months",
              });
              if (res.init_point) {
                window.location.href = res.init_point;
                return;
              }
              await refreshAccess();
            } catch (e) {
              setError("No se pudo iniciar la suscripción (direct)");
            } finally {
              setChecking(false);
            }
          }}
          disabled={!user || checking || subAllow === true}
        >
          Suscribirme (sin plan)
        </button>
        <button
          className="px-4 py-2 rounded border disabled:opacity-50"
          onClick={refreshAccess}
          disabled={!user || checking}
        >
          Revisar estado
        </button>
      </div>
    </div>
  );
}