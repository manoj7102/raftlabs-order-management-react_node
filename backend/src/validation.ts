import type { CartItem, Customer, MenuItem, OrderStatus } from "./types";
import { ORDER_STATUSES } from "./types";

export class ValidationError extends Error {
  constructor(
    message: string,
    readonly field: string,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredText(
  value: unknown,
  field: string,
  min: number,
  max: number,
): string {
  if (typeof value !== "string") {
    throw new ValidationError(`${field} is required.`, field);
  }

  const text = value.trim();
  if (text.length < min || text.length > max) {
    throw new ValidationError(
      `${field} must be between ${min} and ${max} characters.`,
      field,
    );
  }
  return text;
}

export function parseOrderRequest(
  body: unknown,
  menu: readonly MenuItem[],
): { customer: Customer; items: CartItem[] } {
  if (!isRecord(body)) {
    throw new ValidationError("An order body is required.", "body");
  }
  if (!isRecord(body.customer)) {
    throw new ValidationError("Customer details are required.", "customer");
  }

  if (typeof body.customer.phone !== "string") {
    throw new ValidationError(
      "customer.phone must contain exactly 10 digits.",
      "customer.phone",
    );
  }

  const customer: Customer = {
    name: requiredText(body.customer.name, "customer.name", 2, 100),
    address: requiredText(body.customer.address, "customer.address", 5, 300),
    phone: body.customer.phone.trim(),
  };
  if (!/^[0-9]{10}$/.test(customer.phone)) {
    throw new ValidationError(
      "customer.phone must contain exactly 10 digits.",
      "customer.phone",
    );
  }

  if (
    !Array.isArray(body.items) ||
    body.items.length < 1 ||
    body.items.length > 25
  ) {
    throw new ValidationError(
      "items must contain between 1 and 25 menu items.",
      "items",
    );
  }

  const menuIds = new Set(menu.map((item) => item.id));
  const seenIds = new Set<string>();
  const items: CartItem[] = body.items.map(
    (rawItem: unknown, index: number) => {
      const field = `items[${index}]`;
      if (!isRecord(rawItem)) {
        throw new ValidationError(`${field} must be an object.`, field);
      }
      if (
        typeof rawItem.menuItemId !== "string" ||
        !menuIds.has(rawItem.menuItemId)
      ) {
        throw new ValidationError(
          `${field}.menuItemId must match an available menu item.`,
          `${field}.menuItemId`,
        );
      }
      if (seenIds.has(rawItem.menuItemId)) {
        throw new ValidationError(
          `${field}.menuItemId is duplicated.`,
          `${field}.menuItemId`,
        );
      }
      if (
        typeof rawItem.quantity !== "number" ||
        !Number.isInteger(rawItem.quantity) ||
        rawItem.quantity < 1 ||
        rawItem.quantity > 99
      ) {
        throw new ValidationError(
          `${field}.quantity must be an integer between 1 and 99.`,
          `${field}.quantity`,
        );
      }

      seenIds.add(rawItem.menuItemId);
      return { menuItemId: rawItem.menuItemId, quantity: rawItem.quantity };
    },
  );

  return { customer, items };
}

export function parseStatusRequest(body: unknown): OrderStatus {
  if (
    !isRecord(body) ||
    typeof body.status !== "string" ||
    !ORDER_STATUSES.some((status) => status === body.status)
  ) {
    throw new ValidationError(
      `status must be one of: ${ORDER_STATUSES.join(", ")}.`,
      "status",
    );
  }
  return body.status as OrderStatus;
}
