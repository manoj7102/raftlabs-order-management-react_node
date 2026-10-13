import { randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { MENU } from "./menu";
import {
  ORDER_STATUSES,
  type CartItem,
  type Customer,
  type MenuItem,
  type Order,
  type OrderStatus,
} from "./types";

export interface AutoAdvanceDelays {
  preparingMs: number;
  outForDeliveryMs: number;
}

export type StatusUpdateResult =
  | { kind: "ok"; order: Order }
  | { kind: "not-found" }
  | { kind: "invalid-transition"; currentStatus: OrderStatus };

export type CreatedOrder = Order & { accessToken: string };

const DEFAULT_DELAYS: AutoAdvanceDelays = {
  preparingMs: 10_000,
  outForDeliveryMs: 25_000,
};

function copyOrder(order: Order): Order {
  return {
    ...order,
    customer: { ...order.customer },
    items: order.items.map((item) => ({ ...item })),
  };
}

export class OrderStore {
  private readonly orders = new Map<string, Order>();
  private readonly accessTokens = new Map<string, string>();
  private readonly timers = new Map<string, NodeJS.Timeout[]>();
  private readonly menuById: Map<string, MenuItem>;
  private readonly autoAdvance: AutoAdvanceDelays | false;

  constructor(
    menu: readonly MenuItem[] = MENU,
    autoAdvance: AutoAdvanceDelays | false = DEFAULT_DELAYS,
  ) {
    if (
      autoAdvance !== false &&
      (!Number.isFinite(autoAdvance.preparingMs) ||
        !Number.isFinite(autoAdvance.outForDeliveryMs) ||
        autoAdvance.preparingMs < 0 ||
        autoAdvance.outForDeliveryMs <= autoAdvance.preparingMs)
    ) {
      throw new Error(
        "Automatic status delays must be non-negative and ordered.",
      );
    }

    this.menuById = new Map(menu.map((item) => [item.id, item]));
    this.autoAdvance = autoAdvance;
  }

  createOrder(customer: Customer, cart: CartItem[]): CreatedOrder {
    const items = cart.map(({ menuItemId, quantity }) => {
      // The HTTP layer validates IDs before calling this method.
      const menuItem = this.menuById.get(menuItemId);
      if (!menuItem) {
        throw new Error(`Unknown menu item: ${menuItemId}`);
      }

      return {
        menuItemId,
        quantity,
        name: menuItem.name,
        price: menuItem.price,
        image: menuItem.image,
        lineTotal: (Math.round(menuItem.price * 100) * quantity) / 100,
      };
    });

    const totalCents = items.reduce(
      (sum, item) => sum + Math.round(item.lineTotal * 100),
      0,
    );
    const now = new Date().toISOString();
    const order: Order = {
      id: randomUUID(),
      customer: { ...customer },
      items,
      subtotal: totalCents / 100,
      total: totalCents / 100,
      status: "Received",
      createdAt: now,
      updatedAt: now,
    };

    const accessToken = randomBytes(32).toString("base64url");
    this.orders.set(order.id, order);
    this.accessTokens.set(order.id, accessToken);
    this.scheduleAutomaticUpdates(order.id);
    return { ...copyOrder(order), accessToken };
  }

  verifyOrderToken(id: string, suppliedToken: string | undefined): boolean {
    const expectedToken = this.accessTokens.get(id);
    if (!expectedToken || !suppliedToken) return false;

    const expected = Buffer.from(expectedToken);
    const supplied = Buffer.from(suppliedToken);
    return (
      expected.length === supplied.length && timingSafeEqual(expected, supplied)
    );
  }

  getOrder(id: string): Order | undefined {
    const order = this.orders.get(id);
    return order && copyOrder(order);
  }

  deleteOrder(id: string): boolean {
    const deleted = this.orders.delete(id);
    if (deleted) {
      this.accessTokens.delete(id);
      this.clearScheduledUpdates(id);
    }
    return deleted;
  }

  listOrders(): Order[] {
    return Array.from(this.orders.values(), copyOrder).reverse();
  }

  updateStatus(id: string, status: OrderStatus): StatusUpdateResult {
    const order = this.orders.get(id);
    if (!order) {
      return { kind: "not-found" };
    }

    const currentIndex = ORDER_STATUSES.indexOf(order.status);
    const nextIndex = ORDER_STATUSES.indexOf(status);

    if (nextIndex === currentIndex) {
      return { kind: "ok", order: copyOrder(order) };
    }

    if (nextIndex !== currentIndex + 1) {
      return { kind: "invalid-transition", currentStatus: order.status };
    }

    order.status = status;
    order.updatedAt = new Date().toISOString();
    if (status === "Out for Delivery") this.clearScheduledUpdates(id);
    return { kind: "ok", order: copyOrder(order) };
  }

  dispose(): void {
    for (const id of this.timers.keys()) this.clearScheduledUpdates(id);
  }

  private clearScheduledUpdates(id: string): void {
    for (const timer of this.timers.get(id) ?? []) clearTimeout(timer);
    this.timers.delete(id);
  }

  private scheduleAutomaticUpdates(id: string): void {
    if (this.autoAdvance === false) return;

    const schedule = (status: OrderStatus, delayMs: number): NodeJS.Timeout => {
      const timer = setTimeout(() => {
        // A manual update may already have moved the order ahead. The regular
        // transition rule prevents these timers from moving it backwards.
        this.updateStatus(id, status);
      }, delayMs);
      timer.unref?.();
      return timer;
    };

    this.timers.set(id, [
      schedule("Preparing", this.autoAdvance.preparingMs),
      schedule("Out for Delivery", this.autoAdvance.outForDeliveryMs),
    ]);
  }
}
