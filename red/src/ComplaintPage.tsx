import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";

type ComplaintForm = {
  customerName: string;
  restaurantName: string;
  customerEmail: string;
  customerPhone: string;
  details: string;
};

const initialForm: ComplaintForm = {
  customerName: "",
  restaurantName: "",
  customerEmail: "",
  customerPhone: "",
  details: "",
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function ComplaintPage() {
  const [form, setForm] = useState<ComplaintForm>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const webhookUrl = import.meta.env.VITE_RECLAMOS_WEBHOOK_URL?.trim() ?? "";
  const webhookKey = import.meta.env.VITE_RECLAMOS_WEBHOOK_KEY?.trim() ?? "";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.customerName.trim() || !form.restaurantName.trim() || !form.details.trim()) {
      setError("Completá nombre, local y descargo.");
      return;
    }
    if (!form.customerEmail.trim() || !isValidEmail(form.customerEmail.trim())) {
      setError("Ingresá un email válido.");
      return;
    }
    if (!webhookUrl) {
      setError("Falta configurar VITE_RECLAMOS_WEBHOOK_URL.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customerName: form.customerName.trim(),
        restaurantName: form.restaurantName.trim(),
        customerEmail: form.customerEmail.trim(),
        customerPhone: form.customerPhone.trim() || null,
        details: form.details.trim(),
        source: "red-web",
        createdAt: new Date().toISOString(),
      };

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": webhookKey },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Error ${response.status}`);

      setSuccess("Reclamo enviado correctamente. Gracias por escribirnos.");
      setForm(initialForm);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? `No se pudo enviar el reclamo (${submitError.message}).`
          : "No se pudo enviar el reclamo.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-4 py-6">
      <header className="mb-5">
        <Link to="/" className="text-sm font-medium text-amber-700 hover:underline">
          ← Volver a RED
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-stone-900">Envíanos tu reclamo</h1>
        <p className="mt-2 text-sm text-stone-600">
          Completá este formulario para que podamos revisar tu situación y hacer el seguimiento.
        </p>
      </header>

      <main className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-stone-800">Nombre del cliente*</span>
            <input
              value={form.customerName}
              onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 outline-none focus:border-amber-500"
              type="text"
              required
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-stone-800">Nombre del local*</span>
            <input
              value={form.restaurantName}
              onChange={(e) => setForm((prev) => ({ ...prev, restaurantName: e.target.value }))}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 outline-none focus:border-amber-500"
              type="text"
              required
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-stone-800">Email del cliente*</span>
            <input
              value={form.customerEmail}
              onChange={(e) => setForm((prev) => ({ ...prev, customerEmail: e.target.value }))}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 outline-none focus:border-amber-500"
              type="email"
              required
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-stone-800">Teléfono del cliente</span>
            <input
              value={form.customerPhone}
              onChange={(e) => setForm((prev) => ({ ...prev, customerPhone: e.target.value }))}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 outline-none focus:border-amber-500"
              type="tel"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-stone-800">Descargo*</span>
            <textarea
              value={form.details}
              onChange={(e) => setForm((prev) => ({ ...prev, details: e.target.value }))}
              className="min-h-28 w-full rounded-lg border border-stone-300 px-3 py-2 outline-none focus:border-amber-500"
              required
            />
          </label>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {success}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-amber-600 px-4 py-2.5 font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Enviando..." : "Enviar reclamo"}
          </button>
        </form>
      </main>
    </div>
  );
}
