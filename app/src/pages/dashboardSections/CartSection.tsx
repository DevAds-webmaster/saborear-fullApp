import { useEffect, useMemo, useRef, useState } from "react";
import { useResto } from "../../contexts/RestoContext";
import type { Resto } from "../../types";
import { DollarSignIcon, Phone } from "lucide-react";
import { DashboardSaveButtons } from "../../components/DashboardSaveButtons";

export default function CartSection() {
  const { resto, updateResto, btnSaveEnabled, setBtnSaveEnabled, restoPreview, setRestoPreview } = useResto();
  const [localPhone, setLocalPhone] = useState<string>(resto?.phone || "");
  const [localDeliveryFee, setLocalDeliveryFee] = useState<number>(resto?.cart_settings?.deliveryFee || 0);
  const [localCartTemplate, setLocalCartTemplate] = useState<string>(resto?.cart_settings?.template || "");
  const defaultOrderTypes = useMemo(
    () => [
      { type: "delivery" as const, enabled: true },
      { type: "local" as const, enabled: true },
      { type: "retiro" as const, enabled: true },
    ],
    []
  );
  const [localOrderTypes, setLocalOrderTypes] = useState<Array<{ type: "delivery" | "local" | "retiro"; enabled: boolean }>>(
    resto?.cart_settings?.orderTypes?.length ? resto.cart_settings.orderTypes : defaultOrderTypes
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    setLocalPhone(resto?.phone || "");
    setLocalCartTemplate(resto?.cart_settings?.template || "");
    setLocalDeliveryFee(resto?.cart_settings?.deliveryFee || 0);
    setLocalOrderTypes(resto?.cart_settings?.orderTypes?.length ? resto.cart_settings.orderTypes : defaultOrderTypes);
  }, [resto]);

  useEffect(() => {
    if (!resto) return;
    // Mantener un preview consistente
    setRestoPreview({
      ...(restoPreview || resto),
      phone: localPhone,
      cart_settings: { template: localCartTemplate, deliveryFee: localDeliveryFee, orderTypes: localOrderTypes },
    } as Resto);
    // Habilitar guardar si hay cambios
    const base = JSON.stringify({
      phone: resto.phone || "",
      cart_settings: {
        template: resto.cart_settings?.template || "",
        deliveryFee: resto.cart_settings?.deliveryFee || 0,
        orderTypes: resto.cart_settings?.orderTypes || defaultOrderTypes,
      },
    });
    const next = JSON.stringify({
      phone: localPhone || "",
      cart_settings: { template: localCartTemplate || "", deliveryFee: localDeliveryFee, orderTypes: localOrderTypes },
    });
    setBtnSaveEnabled(base !== next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localPhone, localCartTemplate, localDeliveryFee, localOrderTypes]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.value = localCartTemplate ;
    }
  }, [localCartTemplate]);

  const handleSave = async () => {
    if (!resto) return;
    const ok = confirm("¿Guardar los cambios?");
    if (!ok) return;
    const updated = await updateResto(resto._id, {
      phone: localPhone,
      cart_settings: { template: localCartTemplate, deliveryFee: localDeliveryFee, orderTypes: localOrderTypes },
    } as Partial<Resto>);
    if (updated) {
      alert("Cambios guardados correctamente ✅");
      setBtnSaveEnabled(false);
    } else {
      alert("Error al guardar los cambios ❌");
    }
  };

  const handleReset = () => {
    if (!resto) return;
    const res = confirm("Se reestablecerán los valores al último estado guardado.");
    if (!res) return;
    setLocalPhone(resto.phone || "");
    setLocalCartTemplate(resto.cart_settings?.template || "");
    setLocalDeliveryFee(resto.cart_settings?.deliveryFee || 0);
    setLocalOrderTypes(resto.cart_settings?.orderTypes?.length ? resto.cart_settings.orderTypes : defaultOrderTypes);
  };

  const buildWhatsAppMessageExample = (template: string) => {
    return template.replace('{restoName}', resto?.name || 'Mi Restaurante')
    .replaceAll('{items}', '1 x Griega — $14,00\n  Nota: Sin Sal\n1 x Flan Casero — $5,00\n1 x Spaghetti Bolognese — $14,99\n  Nota: Sin Cebolla')
    .replaceAll('{total}', '$43,99')
    .replaceAll('{customerName}', 'John Doe')
    .replaceAll('{orderType}', 'delivery')
    .replaceAll('{address}', 'Calle 123, Ciudad')
    .replaceAll('{phone}', '+5491122334455')
    .replaceAll('{subTotal}', '$33,99')
    .replaceAll('{deliveryFee}', '$10,00');
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Carrito y WhatsApp</h1>
      <p className="text-gray-600 mb-4">Edita el carrito de whatsapp para poder recibir pedidos de manera mas facil y precisa.</p>
      <div className="my-6 flex">
        <DashboardSaveButtons enabled={btnSaveEnabled} onReset={handleReset} onSave={handleSave} />
      </div>
      <section className="border rounded-lg p-4 w-full">
        <h2 className="font-semibold mb-2">Número de WhatsApp del Resto</h2>
        <label className="text-sm text-gray-600 mb-1 inline-block">Teléfono (formato internacional preferido)</label>
        <div className="flex items-center gap-2">
          <Phone size={18} className="text-gray-500" />
          <input
            type="tel"
            value={localPhone}
            onChange={(e) => setLocalPhone(e.target.value)}
            className="flex-1 border rounded px-3 py-2"
            placeholder="Ej: +5491122334455"
            maxLength={15}
            style={{ maxWidth: "200px" }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Se recomienda formato E.164: sin espacios ni guiones. Ej: +5491122334455
        </p>
        <br />
        <h2 className="font-semibold mb-2">Precio extra por delivery</h2>
        <label className="text-sm text-gray-600 mb-1 inline-block">Si el valor es 0, no se aplicará ningún extra.</label>
        <div className="flex items-center gap-2 mb-2 w-full">
          <DollarSignIcon size={18} className="text-gray-500" />
          <input
            type="number"
            value={localDeliveryFee}
            onChange={(e) => setLocalDeliveryFee(Number(e.target.value))}
            className="border rounded px-3 py-2 w-20"
          />
        </div>
        <br />
        <h2 className="font-semibold mb-2">Tipos de pedido habilitados</h2>
        <div className="flex flex-col gap-2">
          {["delivery", "local", "retiro"].map((t) => {
            const enabled = localOrderTypes.find((o) => o.type === t)?.enabled ?? true;
            return (
              <label key={t} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => {
                    const exists = localOrderTypes.find((o) => o.type === t);
                    if (exists) {
                      setLocalOrderTypes(localOrderTypes.map((o) => (o.type === t ? { ...o, enabled: e.target.checked } : o)));
                    } else {
                      setLocalOrderTypes([...localOrderTypes, { type: t as any, enabled: e.target.checked }]);
                    }
                  }}
                />
                {t === "local" ? "Consumir en el local" : t === "retiro" ? "Retiro en el local" : "Delivery"}
              </label>
            );
          })}
        </div>
        <br />
        <h2 className="font-semibold mb-2">Plantilla del Carrito</h2>
        <p className="text-sm text-gray-600 mb-2">
          Es el formato del mensaje que nos notificara el pedido realizado por el cliente.
        </p>
        <div className="flex flex-col md:flex-row gap-2 min-h-40">
          <div className="flex flex-col gap-2 w-full md:w-1/2">
            <label className="text-xs text-gray-500 mb-1 inline-block">Plantilla del Carrito</label>
            <textarea
              rows={10}
              value={localCartTemplate}
              onChange={(e) => setLocalCartTemplate(e.target.value)}
              ref={textareaRef}
              className="flex-1 border rounded px-3 py-2"
              placeholder={`Pedido para {restoName}
{items}


Subtotal: {subTotal}
Precio Delivery: {deliveryFee}
Total: {total}

Datos:
Nombre: {customerName}
Tipo: {orderType}
Dirección: {address}
Tel: {phone}`}
            />
          </div>

          <div className="w-full md:w-1/2"> 
            <label className="text-xs text-gray-500 mb-1 inline-block">Previsualización del mensaje en WhatsApp</label>
            <div className="border rounded px-3 py-2 bg-gray-200">
              { buildWhatsAppMessageExample(localCartTemplate).split('\n').map((line, index) => (
                <>
                  <span key={index}>{line}</span>
                  <br />
                </>
              ))}
            </div>
          </div>
        </div>


        <ul className="text-xs text-gray-500 mt-2">
          <li><strong>{'{customerName}'}</strong> es el nombre del cliente.</li>
          <li><strong>{'{orderType}'}</strong> es el tipo de pedido.(local, retiro, delivery)</li>
          <li><strong>{'{address}'}</strong> es la dirección de entrega.</li>
          <li><strong>{'{phone}'}</strong> es el número de teléfono del cliente.</li>
          <li><strong>{'{items}'}</strong> es el listado de items del pedido.</li>
          <li><strong>{'{total}'}</strong> es el total del pedido.</li>
          <li><strong>{'{subTotal}'}</strong> es el subtotal del pedido.</li>
          <li><strong>{'{deliveryFee}'}</strong> es el precio delivery del pedido.</li>
        </ul>
      </section>
    </div>
  );
}


