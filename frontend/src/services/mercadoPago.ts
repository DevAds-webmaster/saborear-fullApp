// Crear suscripción en MP con token de tarjeta
export const mpCreateSubscription = async (
  userId: string,
  cardToken: string,
  options?: Partial<{
    mode: "plan" | "direct";
    amount: number;
    currency_id: string;
    frequency: number;
    frequency_type: string;
  }>
) => {
  const url = `${import.meta.env.VITE_BACKEND_URL}/mp/subscribe`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      'ngrok-skip-browser-warning': 'true',
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("authToken") || ""}`
    },
    body: JSON.stringify({ userId, cardToken, ...options })
  });
  if (!resp.ok) throw new Error("Error creando suscripción");
  return await resp.json() as { init_point?: string; id?: string };
};

// Verificar si el usuario tiene acceso a la aplicación
export const mpCheckAccess = async (userId: string) => {
  const url = `${import.meta.env.VITE_BACKEND_URL}/mp/check-access/${userId}`;
  const resp = await fetch(url, {
    headers: {
      'ngrok-skip-browser-warning': 'true',
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("authToken") || ""}`
    }
  });
  if (!resp.ok) return { allow: false };
  return await resp.json() as { allow: boolean };
};



