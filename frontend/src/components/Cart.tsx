import { ArrowRight, ShoppingBag } from "lucide-react";
import type { MenuItem } from "../api";
import { money } from "../formatMoney";
import { DishImage } from "./DishImage";
import { QuantityControl } from "./QuantityControl";

export interface CartLine {
  item: MenuItem;
  quantity: number;
}

export function Cart({
  lines,
  total,
  onAdjust,
  onCheckout,
}: {
  lines: CartLine[];
  total: number;
  onAdjust: (id: string, change: number) => void;
  onCheckout: () => void;
}) {
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <div className="cart-card">
      <div className="cart-card__header">
        <div className="cart-heading-icon">
          <ShoppingBag size={21} aria-hidden="true" />
        </div>
        <div>
          <h2>Your order</h2>
          <p>
            {count
              ? `${count} ${count === 1 ? "item" : "items"} in your bag`
              : "Your bag is waiting"}
          </p>
        </div>
      </div>

      {lines.length ? (
        <>
          <div className="cart-items" aria-live="polite">
            {lines.map(({ item, quantity }) => (
              <div className="cart-item" key={item.id}>
                <div className="cart-item__image">
                  <DishImage item={item} />
                </div>
                <div className="cart-item__content">
                  <h3>{item.name}</h3>
                  <p>{money(item.price)}</p>
                  <QuantityControl
                    name={item.name}
                    quantity={quantity}
                    onDecrease={() => onAdjust(item.id, -1)}
                    onIncrease={() => onAdjust(item.id, 1)}
                    compact
                  />
                </div>
                <strong>{money(item.price * quantity)}</strong>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <div>
              <span>Subtotal</span>
              <strong>{money(total)}</strong>
            </div>
            <p>Delivery details are confirmed at checkout.</p>
            <button
              className="button button--primary button--full"
              type="button"
              onClick={onCheckout}
            >
              Continue to checkout <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </>
      ) : (
        <div className="cart-empty">
          <div className="cart-empty__art">
            <ShoppingBag size={38} strokeWidth={1.4} aria-hidden="true" />
          </div>
          <h3>Nothing in your bag yet</h3>
          <p>Discover something delicious and add it to your order.</p>
          <a href="#menu" className="text-link">
            Explore the menu <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      )}
    </div>
  );
}
