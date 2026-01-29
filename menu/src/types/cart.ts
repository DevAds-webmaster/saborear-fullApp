export interface CartItem {
  dishId: string;
  title: string;
  unitPrice: number;
  quantity: number;
  note?: string;
}

export interface CartTotals {
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export interface CartMeta {
  restoName?: string;
  restoSlug?: string;
  currency?: string;
  customerName?: string;
  cartTemplate?: string;
  table?: string;
  orderType?: "local" | "retiro" | "delivery";
  address?: string;
  phone?: string;
}

export interface Cart {
  items: CartItem[];
  totals: CartTotals;
  meta?: CartMeta;
}

