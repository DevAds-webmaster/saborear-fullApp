import type { Cart } from "../types/cart";
import type { Resto } from "../types";
import { formatCurrency } from "./cart";

export const buildWhatsAppMessage = (cart: Cart): string => {
  const currency = cart.meta?.currency ?? "ARS";
  const header = `Pedido para ${cart.meta?.restoName ?? "mi restaurante"}`;
  const lines = cart.items.map((it) => {
    const line = `- ${it.quantity} x ${it.title} — ${formatCurrency(it.unitPrice, currency)}`;
    return it.note ? `${line}\n  Nota: ${it.note}` : line;
  });
  const totals = `\nTotal: ${formatCurrency(cart.totals.total, currency)}`;

  const hasCustomerData =
    !!cart.meta?.customerName || !!cart.meta?.table || !!cart.meta?.orderType || !!cart.meta?.address || !!cart.meta?.phone;

  const customer = hasCustomerData
    ? `\n\nDatos:\n${
        cart.meta?.customerName ? `Nombre: ${cart.meta.customerName}\n` : ""
      }${cart.meta?.table ? `Mesa: ${cart.meta.table}\n` : ""}${
        cart.meta?.orderType ? `Tipo: ${cart.meta.orderType}\n` : ""
      }${cart.meta?.address ? `Dirección: ${cart.meta.address}\n` : ""}${
        cart.meta?.phone ? `Tel: ${cart.meta.phone}\n` : ""
      }`.trimEnd()
    : "";

  return [header, ...lines, totals, customer].filter(Boolean).join("\n");
};

export const buildWhatsAppLink = (phoneE164: string, message: string) => {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phoneE164}?text=${encoded}`;
};

export const normalizePhoneForWa = (input: string): string => {
  // El endpoint wa.me exige número en formato internacional sin "+"
  // Eliminamos todo lo que no sean dígitos y removemos prefijo 00 si viene así.
  const digits = input.replace(/\D/g, "");
  return digits.replace(/^00/, "");
};

export const buildWhatsAppLinkFromResto = (resto: Resto | null | undefined, message: string): string | null => {
  const raw = resto?.phone;
  if (!raw) return null;
  const e164Digits = normalizePhoneForWa(raw);
  if (!e164Digits) return null;
  return buildWhatsAppLink(e164Digits, message);
};

