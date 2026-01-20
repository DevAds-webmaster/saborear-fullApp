import type { Dish } from "../types";
import type { Cart, CartItem } from "../types/cart";

export const getUnitPrice = (dish: Dish) => {
  const hasDiscount = typeof dish.discountPrice === "number" && dish.discountPrice > 0 && dish.discountPrice < dish.price;
  return hasDiscount ? dish.discountPrice : dish.price;
};

export const formatCurrency = (value: number, currency = "ARS", locale = "es-AR") =>
  new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);

export const computeTotals = (items: Array<{ unitPrice: number; quantity: number }>, deliveryFee: number) => {
  const subtotal = items.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
  const total = subtotal + deliveryFee;
  return { subtotal, total, deliveryFee };
};

export const addToCart = (cart: Cart, dish: Dish, quantity = 1, note?: string): Cart => {
  if (!dish.available) return cart;
  const unitPrice = getUnitPrice(dish);
  const index = cart.items.findIndex((i) => i.dishId === dish._id && i.note === note);

  let items: CartItem[] = [...cart.items];
  if (index >= 0) {
    const current = items[index];
    items[index] = { ...current, quantity: current.quantity + quantity };
  } else {
    items.push({
      dishId: dish._id,
      title: dish.title,
      unitPrice,
      quantity,
      note,
    });
  }
  const totals = computeTotals(items, cart.totals.deliveryFee);
  return { ...cart, items, totals };
};

export const updateQty = (cart: Cart, dishId: string, quantity: number, note?: string): Cart => {
  const items = cart.items
    .map((i) => (i.dishId === dishId && i.note === note ? { ...i, quantity } : i))
    .filter((i) => i.quantity > 0);
  const totals = computeTotals(items, cart.totals.deliveryFee);
  return { ...cart, items, totals };
};

export const removeItem = (cart: Cart, dishId: string, note?: string): Cart => {
  const items = cart.items.filter((i) => !(i.dishId === dishId && i.note === note));
  const totals = computeTotals(items, cart.totals.deliveryFee);
  return { ...cart, items, totals };
};

export const clearCart = (cart: Cart): Cart => ({
  ...cart,
  items: [],
  totals: { subtotal: 0, total: 0, deliveryFee: 0 },
});

export const loadCart = (slug: string): Cart => {
  const raw = typeof window !== "undefined" ? localStorage.getItem(`cart:${slug}`) : null;
  return raw ? JSON.parse(raw) : { items: [], totals: { subtotal: 0, total: 0, deliveryFee: 0 }, meta: { restoSlug: slug } };
};

export const saveCart = (slug: string, cart: Cart) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(`cart:${slug}`, JSON.stringify(cart));
  }
};

