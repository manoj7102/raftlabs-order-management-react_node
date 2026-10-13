import { Leaf, Plus } from "lucide-react";
import type { MenuItem } from "../api";
import { money } from "../formatMoney";
import { DishImage } from "./DishImage";
import { QuantityControl } from "./QuantityControl";

export function MenuCard({
  item,
  quantity,
  onIncrease,
  onDecrease,
}: {
  item: MenuItem;
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
}) {
  return (
    <article className="menu-card">
      <div className="menu-card__image">
        <DishImage item={item} />
      </div>
      <div className="menu-card__body">
        <div className="menu-card__title-row">
          <h3>{item.name}</h3>
          <span className="menu-card__price">{money(item.price)}</span>
        </div>
        <p>{item.description}</p>
        <div className="menu-card__bottom">
          <span className="menu-card__fresh">
            <Leaf size={14} aria-hidden="true" /> Freshly made
          </span>
          {quantity > 0 ? (
            <QuantityControl
              name={item.name}
              quantity={quantity}
              onDecrease={onDecrease}
              onIncrease={onIncrease}
              compact
            />
          ) : (
            <button
              className="add-button"
              type="button"
              onClick={onIncrease}
              aria-label={`Add ${item.name} to cart`}
            >
              <Plus size={18} strokeWidth={2.5} aria-hidden="true" /> Add
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
