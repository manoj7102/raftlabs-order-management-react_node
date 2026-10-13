import { Minus, Plus } from "lucide-react";

export function QuantityControl({
  name,
  quantity,
  onDecrease,
  onIncrease,
  compact = false,
}: {
  name: string;
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={`quantity-control${compact ? " quantity-control--compact" : ""}`}
      aria-label={`${name} quantity`}
    >
      <button
        type="button"
        onClick={onDecrease}
        aria-label={`Remove one ${name}`}
      >
        <Minus size={15} strokeWidth={2.5} />
      </button>
      <span aria-live="polite">{quantity}</span>
      <button
        type="button"
        onClick={onIncrease}
        disabled={quantity >= 99}
        aria-label={`Add one more ${name}`}
      >
        <Plus size={15} strokeWidth={2.5} />
      </button>
    </div>
  );
}
