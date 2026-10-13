export const ORDER_STATUSES = [
  "Received",
  "Preparing",
  "Out for Delivery",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

export interface Customer {
  name: string;
  address: string;
  phone: string;
}

export interface CartItem {
  menuItemId: string;
  quantity: number;
}

export interface OrderItem extends CartItem {
  name: string;
  price: number;
  image: string;
  lineTotal: number;
}

export interface Order {
  id: string;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}
