import type { Cart } from "../types/cart";
import type { Resto } from "../types";
import { formatCurrency } from "./cart";

export const buildWhatsAppMessage = (cart: Cart): string => {
  const currency = cart.meta?.currency ?? "ARS";

  // Construir partes reutilizables
  const header = `Pedido para ${cart.meta?.restoName ?? "mi restaurante"}`;
  const itemsText = cart.items
    .map((it) => {
      const line = `- ${it.quantity} x ${it.title} — ${formatCurrency(it.unitPrice, currency)}`;
      return it.note ? `${line}\n  Nota: ${it.note}` : line;
    })
    .join("\n");
  const totalText = `${formatCurrency(cart.totals.total, currency)}`;
  const subtotalText = `${formatCurrency(cart.totals.subtotal, currency)}`;
  const deliveryFeeText = `${formatCurrency(cart.totals.deliveryFee, currency)}`;

  // Si hay plantilla configurada en el Resto, úsala con reemplazo de TAGS
  const template = cart.meta?.cartTemplate?.trim();
  if (template && template.length > 0) {
    const replacements: Record<string, string> = {
      restoName: cart.meta?.restoName ?? "mi restaurante",
      items: itemsText,
      subTotal: cart.meta?.orderType === "delivery" ? subtotalText : "-",
      deliveryFee: cart.meta?.orderType === "delivery" ? deliveryFeeText : "-",
      total: totalText,
      customerName: cart.meta?.customerName ?? "",
      table: cart.meta?.table ?? "",
      orderType: cart.meta?.orderType ?? "",
      address: cart.meta?.address ?? "",
      phone: cart.meta?.phone ?? "",
    };
    return template.replace(/\{(\w+)\}/g, (_, key: string) => replacements[key] ?? "");
  }

  // Fallback: mensaje por defecto
  const totalData =
  `${cart.totals.subtotal && cart.meta?.orderType === "delivery" ? `\nSubtotal: ${subtotalText}` : ""
  }${cart.totals.deliveryFee && cart.meta?.orderType === "delivery" ? `\nPrecio Delivery: ${deliveryFeeText}` : ""
  }${cart.totals.total? `\nTotal: ${totalText}` : ""}`.trimEnd();

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

  const headerAndItems = [header, itemsText].filter(Boolean).join("\n");
  return [headerAndItems, totalData, customer].filter(Boolean).join("\n");
};


export const buildWhatsAppLink = (phoneE164: string, message: string) => {
  const normalized = (message ?? "").normalize("NFC"); // fija emojis/acentos
  const encoded = encodeURIComponent(normalized);      // UTF-8 para wa.me
  //return `https://wa.me/${phoneE164}?text=${encoded}`;
  // Alternativa si algún navegador da problemas:
  return `https://api.whatsapp.com/send?phone=${phoneE164}&text=${encoded}`;
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

