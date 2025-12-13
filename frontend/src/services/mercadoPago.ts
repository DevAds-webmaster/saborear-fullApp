// Crear suscripción en MP con token de tarjeta (vinculada a restoId como external_reference)
export const mpCreateSubscription = async (
  userId: string,
  restoId: string,
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
    body: JSON.stringify({ userId, restoId, cardToken, ...options })
  });
  if (!resp.ok) throw new Error("Error creando suscripción");
  return await resp.json() as { init_point?: string; id?: string };
};

// Verificar si el RESTO tiene acceso (estado de suscripción) consultando por restoId
export const mpCheckAccess = async (restoId: string) => {
  const url = `${import.meta.env.VITE_BACKEND_URL}/mp/check-access/${restoId}`;
  const resp = await fetch(url, {
    headers: {
      'ngrok-skip-browser-warning': 'true',
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("authToken") || ""}`
    }
  });
  if (!resp.ok) return { allow: false };
  return await resp.json() as { allow: boolean; status?: string; next_payment_date?: string | null };
};

// Obtener link de suscripción (plan) para redirigir al usuario
export const mpGetSubscribeLink = async (restoId: string, email?: string) => {
  const q = email ? `?email=${encodeURIComponent(email)}` : "";
  const url = `${import.meta.env.VITE_BACKEND_URL}/mp/subscribe-link/${restoId}${q}`;
  const resp = await fetch(url, {
    headers: {
      'ngrok-skip-browser-warning': 'true',
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("authToken") || ""}`
    }
  });
  if (!resp.ok) throw new Error("No se pudo obtener el link de suscripción");
  return await resp.json() as { init_point?: string; id?: string };
};



