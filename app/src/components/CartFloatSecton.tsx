import { useEffect, useMemo, useState } from "react";
import type { Resto } from "../types";
import type { Cart, CartItem } from "../types/cart";
import { loadCart, saveCart, updateQty, removeItem, formatCurrency, computeTotals } from "../utils/cart";

interface CartFloatSectonProps {
  open: boolean;
  onClose: () => void;
  resto: Resto | null;
  handleSend: () => void;
}

export const CartFloatSecton: React.FC<CartFloatSectonProps> = ({ open, onClose, resto, handleSend }) => {
  const slug = resto?.slug || "";
  const currency = "ARS";
  const [cart, setCart] = useState<Cart>(() => loadCart(slug));
  const [customerName, setCustomerName] = useState<string>("");
  const [orderType, setOrderType] = useState<"local" | "retiro" | "delivery" | undefined>(undefined);
  const [address, setAddress] = useState<string>("");

  useEffect(() => {
    setCart(loadCart(slug));
  }, [slug, open]);

  useEffect(() => {
    setCustomerName(cart.meta?.customerName || "");
    setOrderType(cart.meta?.orderType);
    setAddress(cart.meta?.address || "");
  }, [cart]);

  const isEmpty = useMemo(() => cart.items.length === 0, [cart.items]);

  const onChangeQty = (item: CartItem, nextQty: number) => {
    const next = updateQty(cart, item.dishId, nextQty, item.note);
    setCart(next);
    if (slug) saveCart(slug, next);
  };

  const onRemove = (item: CartItem) => {
    const next = removeItem(cart, item.dishId, item.note);
    setCart(next);
    if (slug) saveCart(slug, next);
  };

  const onChangeNote = (index: number, nextNote: string) => {
    const items = [...cart.items];
    const current = items[index];
    if (!current) return;
    items[index] = { ...current, note: nextNote };
    const totals = computeTotals(items);
    const next = { ...cart, items, totals };
    setCart(next);
    if (slug) saveCart(slug, next);
  };

  const onChangeMeta = (field: "customerName" | "orderType" | "address", value: string) => {
    const nextMeta = {
      ...(cart.meta || {}),
      [field]: field === "orderType" ? (value as any) : value,
    };
    const next = { ...cart, meta: nextMeta };
    setCart(next);
    if (slug) saveCart(slug, next);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-xl  flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Tu pedido</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-black">Cerrar</button>
        </div>
        <div className="flex-1 overflow-auto p-4 shadow-inner shadow-md shadow-black/50 bg-gray-100">
          {isEmpty ? (
            <div className="text-center text-gray-500 mt-10">El carrito está vacío</div>
          ) : (
            <ul className="space-y-4">
              {cart.items.map((it, idx) => (
                <li key={idx} className="flex items-start justify-between gap-3 border-b pb-3 bg-white border-gray-300 border-2 rounded-md p-2">
                  <div className="flex-1">
                    <div className="font-medium">{it.title}</div>
                    <input
                      type="text"
                      value={it.note || ""}
                      onChange={(e) => onChangeNote(idx, e.target.value)}
                      className="mt-2 w-full border rounded px-2 py-1 text-sm"
                      placeholder="Aclaración (sin sal, s/cebolla, etc.)"
                    />
                    <div className="text-sm text-gray-700 mt-1">{formatCurrency(it.unitPrice, currency)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      aria-label="Decrementar"
                      className="px-2 py-1 border rounded"
                      onClick={() => onChangeQty(it, Math.max(0, it.quantity - 1))}
                    >
                      -
                    </button>
                    <span className="w-6 text-center">{it.quantity}</span>
                    <button
                      aria-label="Incrementar"
                      className="px-2 py-1 border rounded"
                      onClick={() => onChangeQty(it, it.quantity + 1)}
                    >
                      +
                    </button>
                    <button
                      aria-label="Eliminar"
                      className="px-2 py-1 border rounded text-red-600"
                      onClick={() => onRemove(it)}
                    >
                      x
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Datos del cliente y tipo de pedido */}
        <div className="p-4 border-t space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nombre del cliente</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                onChangeMeta("customerName", e.target.value);
              }}
              className="w-full border rounded px-3 py-2"
              placeholder="Ej: Juan Pérez"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Tipo de pedido</label>
            <select
              value={orderType || ""}
              onChange={(e) => {
                const v = e.target.value as "local" | "retiro" | "delivery";
                setOrderType(v);
                onChangeMeta("orderType", v);
              }}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Seleccionar...</option>
              <option value="local">Consumir en el local</option>
              <option value="retiro">Retiro en el local</option>
              <option value="delivery">Delivery</option>
            </select>
          </div>

          {orderType === "delivery" && (
            <div>
              <label className="block text-sm text-gray-600 mb-1">Dirección</label>
              <input
                type="text"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  onChangeMeta("address", e.target.value);
                }}
                className="w-full border rounded px-3 py-2"
                placeholder="Calle, número, piso/depto"
              />
            </div>
          )}
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-600">Total</span>
            <span className="font-semibold">{formatCurrency(cart.totals.total, currency)}</span>
          </div>
          <button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded font-medium disabled:opacity-50"
            disabled={isEmpty}
            onClick={handleSend}
          >
            Enviar por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};


