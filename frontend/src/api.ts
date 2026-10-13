export type OrderStatus = "Received" | "Preparing" | "Out for Delivery";

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

export interface OrderItem {
  menuItemId: string;
  quantity: number;
  name?: string;
  price?: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  customer: Customer;
  createdAt: string;
}

export interface CreatedOrder extends Order {
  accessToken: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiErrorBody {
  error?: string;
  message?: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(
  /\/$/,
  "",
);

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
  } catch {
    throw new Error(
      "We could not connect right now. Please check your connection and try again.",
    );
  }

  if (!response.ok) {
    let body: ApiErrorBody | null = null;
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      // A plain-text or empty server response still gets a useful message.
    }
    throw new ApiError(
      body?.error || body?.message || "Something went wrong. Please try again.",
      response.status,
    );
  }

  return (await response.json()) as T;
}

export function fetchMenu(signal?: AbortSignal) {
  return request<MenuItem[]>("/api/menu", { signal });
}

export function createOrder(customer: Customer, items: OrderItem[]) {
  return request<CreatedOrder>("/api/orders", {
    method: "POST",
    body: JSON.stringify({ customer, items }),
  });
}

export function fetchOrder(id: string, accessToken: string) {
  return request<Order>(`/api/orders/${encodeURIComponent(id)}`, {
    headers: { "X-Order-Token": accessToken },
  });
}
