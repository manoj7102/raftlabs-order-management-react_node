import { afterEach, describe, expect, it, vi } from "vitest";
import { MENU } from "../src/menu";
import { OrderStore } from "../src/order-store";

describe("automatic order updates", () => {
  afterEach(() => vi.useRealTimers());

  it("progresses through the three supported statuses on a clock", async () => {
    vi.useFakeTimers();
    const store = new OrderStore(MENU, {
      preparingMs: 1_000,
      outForDeliveryMs: 2_000,
    });
    const order = store.createOrder(
      { name: "Aarav Sharma", address: "12 Park Street", phone: "9876543210" },
      [{ menuItemId: "margherita-pizza", quantity: 1 }],
    );

    expect(store.getOrder(order.id)?.status).toBe("Received");
    await vi.advanceTimersByTimeAsync(999);
    expect(store.getOrder(order.id)?.status).toBe("Received");
    await vi.advanceTimersByTimeAsync(1);
    expect(store.getOrder(order.id)?.status).toBe("Preparing");
    await vi.advanceTimersByTimeAsync(1_000);
    expect(store.getOrder(order.id)?.status).toBe("Out for Delivery");
    store.dispose();
  });

  it("does not let a delayed timer undo a manual status change", async () => {
    vi.useFakeTimers();
    const store = new OrderStore(MENU, {
      preparingMs: 1_000,
      outForDeliveryMs: 2_000,
    });
    const order = store.createOrder(
      { name: "Aarav Sharma", address: "12 Park Street", phone: "9876543210" },
      [{ menuItemId: "margherita-pizza", quantity: 1 }],
    );

    expect(store.updateStatus(order.id, "Preparing").kind).toBe("ok");
    await vi.advanceTimersByTimeAsync(1_000);
    expect(store.getOrder(order.id)?.status).toBe("Preparing");
    expect(store.updateStatus(order.id, "Out for Delivery").kind).toBe("ok");
    await vi.advanceTimersByTimeAsync(1_000);
    expect(store.getOrder(order.id)?.status).toBe("Out for Delivery");
    store.dispose();
  });

  it("removes an order and cancels its automatic status updates", async () => {
    vi.useFakeTimers();
    const store = new OrderStore(MENU, {
      preparingMs: 1_000,
      outForDeliveryMs: 2_000,
    });
    const order = store.createOrder(
      { name: "Aarav Sharma", address: "12 Park Street", phone: "9876543210" },
      [{ menuItemId: "margherita-pizza", quantity: 1 }],
    );

    expect(vi.getTimerCount()).toBe(2);
    expect(store.deleteOrder(order.id)).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
    expect(store.getOrder(order.id)).toBeUndefined();
    expect(store.listOrders()).toEqual([]);
    expect(store.deleteOrder(order.id)).toBe(false);
    expect(store.updateStatus(order.id, "Preparing")).toEqual({
      kind: "not-found",
    });

    await vi.advanceTimersByTimeAsync(2_000);
    expect(store.getOrder(order.id)).toBeUndefined();
    store.dispose();
  });
});
